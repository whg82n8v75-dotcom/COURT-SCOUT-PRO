# Basket Scout Sheet Pro — PRD

## Problema originale
L'utente ha incollato un'app HTML monofile "Basket Scout Sheet Pro" (scouting basket in italiano). Va ricostruita in React + FastAPI + MongoDB, restando fedele all'originale e correggendone i bug, con restyling per tablet, storico partite/roster, report AI, nomi squadra casa/ospiti modificabili e supporto alle partite fuori casa.

## Architettura
- Backend FastAPI (`/app/backend/server.py`): CRUD matches, CRUD rosters, `POST /api/matches/{id}/analysis` in streaming SSE (Claude claude-sonnet-5-5 tramite Emergent LLM key), BaseDocument/PyObjectId
- Frontend React: `/` (storico + roster + nuova partita), `/match/:id` (tab Scouting Live / Report / Dati partita). Salvataggio automatico con debounce 600ms
- Statistiche derivate dagli eventi (`lib/stats.js`): ogni tiro, tiro libero e canestro avversario salva i giocatori in campo in quel momento

## Implementato (2026-06)
- Tabellone con nomi squadra modificabili e interruttore In casa / Fuori casa che scambia i lati
- Roster di 20 giocatori con stato in campo/panchina, badge 5/5, pallini falli, segnale di esclusione a 5 falli
- Campo cliccabile (segnato/sbagliato, colori per quarto), riconoscimento del tiro da 3 allineato alla linea disegnata
- Tiri liberi segnati e sbagliati, contatori delle statistiche, correzione manuale del +/-
- Punti avversari da +1/+2/+3, annullamento globale dell'ultima azione
- Report: boxscore con totali e FG%, mappa tiri filtrabile per quarto, grafico punti per giocatore, parziali per quarto (noi e avversari), analisi AI, esportazione PDF tramite stampa
- Roster salvabili e riutilizzabili nelle nuove partite; azzeramento della partita

## Bug corretti rispetto all'originale
- Il +/- ora è calcolato sui giocatori in campo al momento dell'azione (annullare dopo un cambio non lo altera più)
- Il riconoscimento del tiro da 3 ora corrisponde all'arco disegnato
- Il "-" sui tiri liberi non altera più il +/- e i tiri liberi sbagliati vengono registrati
- I punti per quarto includono i tiri liberi
- Nomi squadra separati (prima venivano ricavati spezzando il testo su "vs")

## Backlog
- P1: minuti giocati / tempo dei cambi, valutazione (VAL)
- P1: statistiche cumulative stagionali per giocatore
- P2: guardia contro la sovrascrittura con più schede aperte, scorciatoie da tastiera
