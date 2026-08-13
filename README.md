# Football Club Manager — Progetto Mister

Questo è il progetto scaricabile della tua app di gestione società calcistica,
pronto per essere pubblicato su un hosting reale (fuori dall'artifact di Claude).

## Cosa è cambiato rispetto alla versione artifact

- Il salvataggio ora usa il **localStorage del browser** invece del servizio di
  storage di Claude. Questo significa:
  - ✅ Nessun più errore "Storage set failed" imprevedibile.
  - ✅ Funziona anche da app mobile/browser dedicato, non solo su Claude web/desktop.
  - ⚠️ **I dati restano legati al singolo browser/dispositivo**: non si
    sincronizzano automaticamente tra PC e smartphone. Per portare i dati da un
    dispositivo all'altro continua a usare **Esporta Dati → Esporta JSON** e poi
    **Importa JSON** sull'altro dispositivo, esattamente come facevi prima.
  - La modalità "condivisa" con lo staff non ha più senso allo stesso modo:
    resta nel codice ma, non essendoci più un servizio centrale, i dati "condivisi"
    restano comunque solo nel tuo browser finché non li esporti/importi altrove.

## Passaggi per pubblicarlo online

### 1. Testalo in locale (facoltativo ma consigliato)

Se hai Node.js installato sul tuo computer:

```bash
npm install
npm run dev
```

Si apre un indirizzo tipo `http://localhost:5173` dove puoi provare l'app
esattamente come farà chi la userà online.

### 2. Crea un account GitHub (se non ce l'hai già)

Vai su [github.com](https://github.com) e registrati gratuitamente.

### 3. Crea un nuovo repository

Dalla dashboard GitHub: **New repository** → dagli un nome (es. `football-club-app`)
→ crealo (pubblico o privato, come preferisci).

### 4. Carica questi file su GitHub

Puoi trascinare tutti i file e le cartelle di questo progetto direttamente nella
pagina del repository (**Add file → Upload files** su github.com), oppure usare Git
da terminale se preferisci:

```bash
git init
git add .
git commit -m "Prima versione"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/football-club-app.git
git push -u origin main
```

### 5. Crea un account Vercel

Vai su [vercel.com](https://vercel.com) e registrati scegliendo **Continue with GitHub**,
così i due account restano collegati automaticamente.

### 6. Importa il progetto su Vercel

Dalla dashboard Vercel: **Add New Project** → seleziona il repository appena
creato. Vercel riconosce automaticamente che è un progetto Vite e propone da
solo i comandi di build corretti (`npm run build`, cartella di output `dist`).

### 7. Avvia il deploy

Premi **Deploy** e attendi 1-2 minuti. Otterrai un indirizzo del tipo
`https://football-club-app.vercel.app`, valido subito e con HTTPS incluso.

### 8. Condividi il link

Basta inviare l'indirizzo `.vercel.app` allo staff. Ogni volta che carichi nuove
modifiche su GitHub, Vercel ripubblica automaticamente la nuova versione in
pochi minuti.

## Prima di iniziare a usarlo "sul serio"

Se avevi già dati importanti nell'artifact originale su Claude, esportali da lì
(**Esporta Dati → Esporta JSON**) e poi importali in questa nuova versione
(**Esporta Dati → Importa JSON**) una volta pubblicata, così parti dagli stessi
dati invece che da zero.
