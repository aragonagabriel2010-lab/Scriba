# Scriba

App web autonoma per le schede di D&D al tavolo. Non usa Base44.

- `npm run dev` avvia il server (`server/index.js`, porta 3001) e Vite.
- I tavoli stanno in `server/data/tables.json`.
- Il client parla col server via socket.io, con il proxy di Vite.
- Niente account: codice del tavolo e token in localStorage.
