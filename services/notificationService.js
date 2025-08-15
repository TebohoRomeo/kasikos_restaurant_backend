/**
 * notificationService:
 * - stubbed: in production integrate with FCM / APNs / Twilio / email provider.
 */
const { pool } = require('../config/db');

async function notifyUser(userId, title, body, payload = {}) {
  // store notification
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, payload) VALUES ($1,$2,$3,$4,$5)`,
    [userId, 'generic', title, body, payload]
  );
  // TODO: push / SMS
}

async function notifyRestaurantNewOrder({ restaurantId, orderId }) {
  // find restaurant owner
  const r = await pool.query('SELECT owner_id FROM restaurants WHERE id = $1', [restaurantId]);
  if (!r.rows[0]) return;
  const ownerId = r.rows[0].owner_id;
  await notifyUser(ownerId, 'New order received', `Order #${orderId} was placed`, { orderId });
}

module.exports = { notifyUser, notifyRestaurantNewOrder };
