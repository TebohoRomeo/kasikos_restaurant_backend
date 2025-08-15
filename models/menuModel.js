const { pool } = require('../config/db');

async function createMenu(restaurantId, title, description, client = null) {
  const q = `INSERT INTO menus (restaurant_id, title, description) VALUES ($1,$2,$3) RETURNING *`;
  const executor = client ? client.query.bind(client) : pool.query.bind(pool);
  const res = await executor(q, [restaurantId, title, description]);
  return res.rows[0];
}

async function findByRestaurant(restaurantId) {
  const res = await pool.query('SELECT * FROM menus WHERE restaurant_id = $1', [restaurantId]);
  return res.rows;
}

module.exports = { createMenu, findByRestaurant };
