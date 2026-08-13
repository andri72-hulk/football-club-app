// Ricrea l'API window.storage usata dall'app (originariamente fornita dall'ambiente
// artifact di Claude) appoggiandosi a IndexedDB del browser invece che a localStorage.
//
// Perché IndexedDB e non localStorage: localStorage accetta in genere solo 5-10 MB
// totali per sito, un limite facile da superare quando l'app salva foto giocatori,
// immagini degli esercizi e documenti del Dossier (tutti codificati come testo).
// IndexedDB non ha questo limite stretto (in pratica centinaia di MB o più, a
// seconda dello spazio libero sul dispositivo), quindi è la scelta corretta per
// un'app che conserva file multimediali insieme ai dati.
//
// Nota: non esiste più il concetto di dato "condiviso" tra più utenti (shared=true):
// il browser è sempre e solo locale al dispositivo su cui gira l'app. Il prefisso
// distingue comunque i dati "personali" da quelli "condivisi" per compatibilità,
// ma entrambi restano salvati nello stesso browser.

const DB_NAME = "football-club-db";
const STORE_NAME = "kv";
const TIMEOUT_MS = 6000;

// Evita che un'operazione IndexedDB bloccata (es. per policy del browser,
// modalità privata, estensioni che interferiscono) resti sospesa per sempre
// senza mai risolversi né fallire: dopo TIMEOUT_MS restituisce un errore chiaro.
function withTimeout(promise, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout: "${label}" non ha risposto entro ${TIMEOUT_MS / 1000} secondi. Il browser potrebbe bloccare IndexedDB (modalità privata, policy aziendale, estensioni).`));
    }, TIMEOUT_MS);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

function openDB() {
  return withTimeout(
    new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("IndexedDB non disponibile in questo browser"));
        return;
      }
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE_NAME)) {
          req.result.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("Impossibile aprire il database locale"));
      req.onblocked = () => reject(new Error("Apertura del database bloccata: chiudi eventuali altre schede con questa stessa app aperte e riprova."));
    }),
    "apertura database"
  );
}

function fullKey(key, shared) {
  return `${shared ? "shared" : "personal"}::${key}`;
}

const storagePolyfill = {
  async get(key, shared = false) {
    const db = await openDB();
    return withTimeout(
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(fullKey(key, shared));
        req.onsuccess = () => {
          if (req.result === undefined) {
            reject(new Error(`Storage key not found: ${key}`));
          } else {
            resolve({ key, value: req.result, shared: !!shared });
          }
        };
        req.onerror = () => reject(req.error || new Error("Lettura fallita"));
      }),
      "lettura dati"
    );
  },

  async set(key, value, shared = false) {
    const db = await openDB();
    return withTimeout(
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(value, fullKey(key, shared));
        tx.oncomplete = () => resolve({ key, value, shared: !!shared });
        tx.onerror = () => reject(new Error("Storage set failed: " + (tx.error?.message || "errore sconosciuto")));
        tx.onabort = () => reject(new Error("Storage set failed: transazione interrotta (" + (tx.error?.message || "quota superata?") + ")"));
      }),
      "scrittura dati"
    );
  },

  async delete(key, shared = false) {
    const db = await openDB();
    return withTimeout(
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(fullKey(key, shared));
        tx.oncomplete = () => resolve({ key, deleted: true, shared: !!shared });
        tx.onerror = () => reject(tx.error || new Error("Eliminazione fallita"));
      }),
      "eliminazione dati"
    );
  },

  async list(prefix = "", shared = false) {
    const db = await openDB();
    return withTimeout(
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).getAllKeys();
        req.onsuccess = () => {
          const fp = fullKey(prefix, shared);
          const stripLen = (shared ? "shared::" : "personal::").length;
          const keys = req.result
            .filter((k) => typeof k === "string" && k.startsWith(fp))
            .map((k) => k.slice(stripLen));
          resolve({ keys, prefix, shared: !!shared });
        };
        req.onerror = () => reject(req.error || new Error("Elenco chiavi fallito"));
      }),
      "elenco chiavi"
    );
  },
};

if (typeof window !== "undefined") {
  window.storage = storagePolyfill;
}

export default storagePolyfill;
