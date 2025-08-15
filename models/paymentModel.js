const { pool } = require('../config/db');

async function createPaymentRecord({ orderId, provider, providerPaymentId, amount, currency, status }, client = null) {
  const q = `INSERT INTO payments (order_id, provider, provider_payment_id, amount, currency, status)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  const executor = client ? client.query.bind(client) : pool.query.bind(pool);
  const res = await executor(q, [orderId, provider || null, providerPaymentId || null, amount, currency || 'USD', status || 'pending']);
  return res.rows[0];
}

async function updatePaymentStatus(paymentId, status) {
  const res = await pool.query('UPDATE payments SET status = $1 WHERE id = $2 RETURNING *', [status, paymentId]);
  return res.rows[0];
}

module.exports = { createPaymentRecord, updatePaymentStatus };
