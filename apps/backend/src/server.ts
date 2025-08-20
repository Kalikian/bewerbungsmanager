import app from './app.js';
import type { Server } from 'http';
import pool from './db/db.js';

const PORT = Number(process.env.PORT ?? 3000);

const server: Server = app.listen(PORT, () => {
  console.log(`Bewerbungsmanager läuft auf Port ${PORT}`);
});

// Graceful shutdown on SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\nSIGINT received — shutting down gracefully...');

  // Stop accepting new connections and wait for existing ones to finish
  server.close(async (err?: Error) => {
    if (err) {
      console.error('Error while closing HTTP server:', err);
      process.exit(1);
    }
    console.log('HTTP server closed');
    // Close database connections
    try {
      await pool.end();
      console.log('DB connections closed (no new connections).');
    } catch (e) {
      console.error('Error closing DB connections:', e);
    }
    process.exit(0);
  });

  // Safety net: force exit if something still hangs (timer does not keep event loop alive)
  setTimeout(() => {
    console.warn('Forcing process exit (timeout).');
    process.exit(0);
  }, 1000).unref();
});
