const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db.js');

(async function run(){
  const migrDir = path.join(process.cwd(), 'migrations');
  const files = fs.existsSync(migrDir) ? fs.readdirSync(migrDir).filter(f=>f.endsWith('.sql')).sort() : [];
  const client = await pool.connect();
  try {
    for(const f of files){
      const sql = fs.readFileSync(path.join(migrDir, f), 'utf8');
      console.log('Running', f);
      await client.query(sql);
    }
    console.log('Migrations complete');
  } catch(err) {
    console.error('Migration error', err);
  } finally {
    client.release();
    process.exit(0);
  }
})();
