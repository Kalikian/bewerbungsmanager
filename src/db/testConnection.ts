import pool from './db.js';

async function testDb() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('DB-Verbindung erfolgreich:', result.rows[0]);
  } catch (err) {
    console.error('DB-Verbindung FEHLGESCHLAGEN:', err);
  }
}

testDb();
