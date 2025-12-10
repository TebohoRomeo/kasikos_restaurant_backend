import { pool } from '../config/db.js';

/**
 * createOrder: must be called inside a transaction
 * client: pg client instance with BEGIN already called
 * orderData: { restaurantId, userId, totalAmount, currency, deliveryAddress, paymentId }
 */
export async function createOrder(orderData, client) {
  const q = `INSERT INTO orders (restaurant_id, user_id, total_amount, currency, status, delivery_address, payment_id)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
  const params = [
    orderData.restaurantId,
    orderData.userId,
    orderData.totalAmount,
    orderData.currency || 'ZAR',
    orderData.status || 'pending',
    orderData.deliveryAddress || null,
    orderData.paymentId || null
  ];
  const res = await client.query(q, params);
  return res.rows[0];
}

export async function addOrderItem(orderId, item, client) {
  const q = `INSERT INTO order_items (order_id, menu_item_id, name, unit_price, quantity, total_price)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  const res = await client.query(q, [
    orderId,
    item.menuItemId || null,
    item.name,
    item.unitPrice,
    item.quantity,
    item.totalPrice
  ]);
  return res.rows[0];
}

export async function getOrderById(orderId) {
  const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (!orderRes.rows[0]) return null;
  const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
  const order = orderRes.rows[0];
  order.items = itemsRes.rows;
  return order;
}

export async function updateOrderStatus(orderId, status) {
  const res = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, orderId]);
  return res.rows[0];
}