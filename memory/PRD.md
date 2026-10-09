# Court Scout Pro — PRD

## Problema originale
App HTML "Basket Scout Sheet Pro" ricostruita in React. Poi l'utente ha chiesto di renderla autonoma e gratuita: una PWA su GitHub Pages da usare solo su iPad, offline, con dati locali in IndexedDB, analisi automatica locale e backup JSON. Backend e MongoDB vanno rimossi.

## Architettura (attuale)
- Solo frontend React (CRA/craco), `homepage: "."` e HashRouter, così funziona in qualsiasi sottocartella di GitHub Pages
- `lib/db.js`: IndexedDB tramite idb-keyval (DB `court-scout-pro`, store `kv`, chiavi `m:<id>` e `r:<id>`), esportazione/importazione e `navigator.storage.persist`
- `lib/analysis.js`: analisi tattica in italiano generata da regole sulle statistiche
- `public/sw.js`: service worker che salva in cache tutti i file elencati in asset-manifest; rete con fallback alla cache (timeout 4s) per la pagina principale, cache prima della rete per gli altri file; si aggiorna da solo quando l'app è online
- `public/manifest.json` + icone + meta Apple; font (@fontsource) e immagine principale inclusi nella build
- `.github/workflows/deploy-pages.yml`: a ogni push su main rimuove i pacchetti di sviluppo Emergent, compila e pubblica su Pages

## Implementato
- 2026-06: MVP full-stack (tabellone, roster, campo, statistiche, +/-, report, analisi AI)
- 2026-06: conversione in PWA offline; backend/MongoDB/LLM rimossi; backup JSON (Web Share su iPad o download); analisi locale; verificati una build come in CI e il funzionamento offline con service worker attivo

## Da fare / note
- Pubblicazione su GitHub Pages da verificare da parte dell'utente (push + Settings → Pages → Source: GitHub Actions)
- P2: scelta tra "sostituisci" e "unisci" all'importazione; minuti giocati; statistiche stagionali
