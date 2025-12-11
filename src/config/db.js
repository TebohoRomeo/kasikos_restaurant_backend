import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 15,
  idleTimeoutMillis: 30000,
  keepAlive: true,
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
