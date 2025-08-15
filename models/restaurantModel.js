const { pool } = require('../config/db');

async function createRestaurant({
  ownerId,
  storeName,
  logoUrl,
  logoKey,
  coverUrl,
  coverKey,
  moduleType,
  address,
  vat
}, client = null) {
  const q = `
    INSERT INTO restaurants
      (owner_id, store_name, logo_url, logo_key, cover_url, cover_key, module_type, address, vat_percent)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, store_name, module_type, address, logo_url, cover_url, created_at
  `;
  const params = [
    ownerId,
    storeName,
    logoUrl,
    logoKey,
    coverUrl,
    coverKey,
    moduleType,
    address,
    vat || null
  ];
  const executor = client ? client.query.bind(client) : pool.query.bind(pool);
  const res = await executor(q, params);
  return res.rows[0];
}

async function getByOwnerId(ownerId) {
  const res = await pool.query('SELECT * FROM restaurants WHERE owner_id = $1', [ownerId]);
  return res.rows[0];
}

module.exports = { createRestaurant, getByOwnerId };
