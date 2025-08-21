/**
 * Simple migration runner: runs SQL files in /migrations directory in alphabetical order.
 * For production use a migration tool (Flyway, Liquibase, Knex, Umzug, etc.)
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function run() {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  const client = await pool.connect();
  try {
    for (const f of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, f), 'utf8');
      console.log('Running', f);
      await client.query(sql);
    }
    console.log('Migrations finished');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();
