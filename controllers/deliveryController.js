// // Very minimal delivery controller with assignment flow stub

// // const { findAvailableDrivers } = require('../models/driverModel');
// const { pool } = require('../config/db');

// async function assignDriver(req, res, next) {
//   try {
//     const { orderId } = req.params;
//     // find available driver
//     const drivers = await findAvailableDrivers();
//     if (!drivers || drivers.length === 0) return res.status(503).json({ error: 'No drivers available' });

//     const driver = drivers[0];

//     const r = await pool.query('INSERT INTO deliveries (order_id, driver_id, status, started_at) VALUES ($1,$2,$3,$4) RETURNING *', [orderId, driver.id, 'assigned', new Date()]);
//     // mark driver on_trip
//     await pool.query('UPDATE drivers SET status = $1 WHERE id = $2', ['on_trip', driver.id]);

//     res.json({ delivery: r.rows[0] });
//   } catch (err) { next(err); }
// }

// async function updateLocation(req, res, next) {
//   try {
//     const { driverId } = req.params;
//     const { lat, lng } = req.body;
//     // store/update driver location (requires PostGIS or simple lat/lng field)
//     await pool.query('UPDATE drivers SET current_location = POINT($1,$2) WHERE id = $3', [lng, lat, driverId]);
//     res.json({ ok: true });
//   } catch (err) { next(err); }
// }

// module.exports = { assignDriver, updateLocation };
