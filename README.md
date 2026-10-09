# Court Scout Pro

PWA per lo scouting di pallacanestro a bordo campo (iPad). Funziona offline, non richiede server: tutti i dati sono salvati sul dispositivo (IndexedDB).

## Pubblicazione (GitHub Pages)
1. Repository → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Ogni push sul branch `main` avvia `.github/workflows/deploy-pages.yml`, che compila `frontend/` e pubblica la build.
3. Indirizzo: `https://<utente>.github.io/<repository>/`

## Installazione su iPad
1. Apri l'indirizzo in **Safari** (con connessione, la prima volta).
2. Condividi → **Aggiungi alla schermata Home**.
3. Apri l'app dall'icona: da quel momento funziona anche offline.

## Dati e backup
- I dati restano solo sull'iPad. Usa **Esporta backup** (file JSON, salvabile in File/iCloud) e **Importa backup** per ripristinarli. L'importazione unisce i dati: le partite con lo stesso id vengono sovrascritte.

## Sviluppo locale
```
cd frontend
yarn install
yarn start        # sviluppo
yarn build        # build di produzione in frontend/build
```
