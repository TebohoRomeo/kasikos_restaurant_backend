import { Pool } from "pg";
import dotenv from 'dotenv';
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  host: "dpg-d2ioo33uibrs73a3cb90-a.oregon-postgres.render.com", // explicitly set host
  port: 5432, // explicitly set port
  // Add this line to force IPv4 lookup
  keepAlive: true,
  // optionally tune pool size etc
  max: 15,
  idleTimeoutMillis: 30000,
});

export async function getClient() {
  const client = await pool.connect();
  console.log(client, "connecting to client");

  return client;
}

// export default {
//   pool,
//   getClient,
// };
