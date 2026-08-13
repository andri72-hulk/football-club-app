// Ricrea l'API window.storage usata dall'app (originariamente fornita dall'ambiente
// artifact di Claude) appoggiandosi al localStorage del browser.
// Nota: qui non esiste più il concetto di dato "condiviso" tra più utenti (shared=true):
// il localStorage è sempre e solo locale al browser/dispositivo su cui gira l'app.
// Il prefisso distingue comunque i dati "personali" da quelli "condivisi" per compatibilità,
// ma entrambi restano salvati nello stesso browser.

function prefixedKey(key, shared) {
  return `${shared ? "shared" : "personal"}::${key}`;
}

const storagePolyfill = {
  async get(key, shared = false) {
    const raw = localStorage.getItem(prefixedKey(key, shared));
    if (raw === null) {
      throw new Error(`Storage key not found: ${key}`);
    }
    return { key, value: raw, shared: !!shared };
  },

  async set(key, value, shared = false) {
    try {
      localStorage.setItem(prefixedKey(key, shared), value);
      return { key, value, shared: !!shared };
    } catch (e) {
      throw new Error("Storage set failed: " + (e?.message || "quota exceeded"));
    }
  },

  async delete(key, shared = false) {
    localStorage.removeItem(prefixedKey(key, shared));
    return { key, deleted: true, shared: !!shared };
  },

  async list(prefix = "", shared = false) {
    const fullPrefix = prefixedKey(prefix, shared);
    const keys = Object.keys(localStorage)
      .filter((k) => k.startsWith(fullPrefix))
      .map((k) => k.slice(shared ? "shared::".length : "personal::".length));
    return { keys, prefix, shared: !!shared };
  },
};

if (typeof window !== "undefined") {
  window.storage = storagePolyfill;
}

export default storagePolyfill;
