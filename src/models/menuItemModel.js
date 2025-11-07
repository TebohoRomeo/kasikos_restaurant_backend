const { pool } = require('../config/db');

async function createMenuItem({ menuId, name, description, price, currency, imageUrl }, client = null) {
  const q = `INSERT INTO menu_items (menu_id, name, description, price, currency, image_url)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  const executor = client ? client.query.bind(client) : pool.query.bind(pool);
  const res = await executor(q, [menuId, name, description, price, currency || 'USD', imageUrl || null]);
  return res.rows[0];
}

async function findByMenu(menuId) {
  const res = await pool.query('SELECT * FROM menu_items WHERE menu_id = $1', [menuId]);
  return res.rows;
}

module.exports = { createMenuItem, findByMenu };
