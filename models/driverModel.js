const { pool } = require('../config/db');

async function createDriver(userId, vehicleInfo) {
  const res = await pool.query(
    `INSERT INTO drivers (user_id, vehicle_info, status) VALUES ($1,$2,$3) RETURNING *`,
    [userId, vehicleInfo || null, 'offline']
  );
  return res.rows[0];
}

async function findAvailableDrivers() {
  const res = await pool.query(`SELECT * FROM drivers WHERE status = 'available'`);
  return res.rows;
}

module.exports = { createDriver, findAvailableDrivers };
