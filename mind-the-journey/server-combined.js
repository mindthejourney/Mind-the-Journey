// server-combined.js
const next = require('next');
const express = require('express');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

async function start() {
  await nextApp.prepare();

  // App principale che useremo per Next + mount delle rotte API
  const app = express();

  // -- Monta l'app Express del backend (assicurati di avere modificato backend/server.js
  //    per non fare app.listen quando viene require())
  const backendApp = require('./backend/server'); // questo ora deve solo restituire `app`
  // Se backendApp è un express app, montalo così:
  app.use(backendApp);

  // Serve tutte le pagine Next (static/dynamic)
  app.all('*', (req, res) => handle(req, res));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Combined Next + API server listening on port ${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start combined server', err);
  process.exit(1);
});
