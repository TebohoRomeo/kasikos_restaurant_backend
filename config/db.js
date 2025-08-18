const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  host: 'db.nrxjixidnqbgvehvxbxq.supabase.co', // explicitly set host
  port: 5432,                                   // explicitly set port
  // Add this line to force IPv4 lookup
  keepAlive: true,
  // optionally tune pool size etc
  max: 15,
  idleTimeoutMillis: 30000
});

async function getClient() {
  const client = await pool.connect();
  console.log(client, 'connecting to client');
  
  return client;
}

module.exports = {
  pool,
  getClient
};
