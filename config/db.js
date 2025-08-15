// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL
// });

// module.exports = pool;




const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  host: 'db.xsiixlvjgwcdlwvnlotp.supabase.co', // explicitly set host
  port: 5432,                                   // explicitly set port
  // Add this line to force IPv4 lookup
  keepAlive: true,

  // optionally tune pool size etc
  // max: 20,
  // idleTimeoutMillis: 30000
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

// import postgres from 'postgres'

// const connectionString = process.env.DATABASE_URL
// const sql = postgres(connectionString)

// export default sql