const { getClient } = require('../config/db');
const menuItemModel = require('../models/menuItemModel');
const { createOrder, addOrderItem, getOrderById } = require('../models/orderModel');
const { createPaymentRecord } = require('../models/paymentModel');
const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');

/**
 * Place an order.
 * Expected body:
 * {
 *   restaurantId,
 *   items: [{ menuItemId, quantity }],
 *   deliveryAddress,
 *   paymentMethod // e.g. 'stripe'
 * }
 *
 * This implementation snapshots menu item prices and runs inside a DB transaction.
 */
async function placeOrder(req, res, next) {
  const client = await getClient();
  try {
    const userId = req.user.id;
    const { restaurantId, items, deliveryAddress, currency, paymentMethod } = req.body;

    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      client.release();
      return res.status(400).json({ error: 'Invalid order payload' });
    }

    await client.query('BEGIN');

    let total = 0;
    const lineItems = [];

    // snapshot prices
    for (const it of items) {
      const menuItem = (await menuItemModel.findByMenu(it.menuId || 0)).find(mi => mi.id === Number(it.menuItemId));
      // fallback: query single menu item
      let item;
      if (!menuItem) {
        const resItem = await client.query('SELECT * FROM menu_items WHERE id = $1 FOR SHARE', [it.menuItemId]);
        item = resItem.rows[0];
      } else item = menuItem;
      if (!item) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(400).json({ error: `Menu item ${it.menuItemId} not found` });
      }

      const qty = Number(it.quantity || 1);
      const unitPrice = Number(item.price);
      const totalPrice = unitPrice * qty;
      total += totalPrice;
      lineItems.push({ menuItemId: item.id, name: item.name, unitPrice, quantity: qty, totalPrice });
    }

    // create payment record (status pending)
    const paymentRecord = await createPaymentRecord({
      orderId: null,
      provider: paymentMethod,
      providerPaymentId: null,
      amount: total,
      currency: currency || 'USD',
      status: 'pending'
    }, client);

    // create order
    const order = await createOrder({
      restaurantId,
      userId,
      totalAmount: total,
      currency: currency || 'USD',
      status: 'pending',
      deliveryAddress,
      paymentId: paymentRecord.id
    }, client);

    // add order items
    for (const li of lineItems) {
      await addOrderItem(order.id, li, client);
    }

    // perform payment (this is a placeholder; you should use a payment provider)
    const paymentResult = await paymentService.charge({ amount: total, currency: currency || 'USD', paymentMethod, orderId: order.id });

    // update payment record status via service
    await client.query('UPDATE payments SET provider_payment_id=$1, status=$2 WHERE id=$3', [paymentResult.providerPaymentId || null, paymentResult.status, paymentRecord.id]);

    // if payment succeeded, update order status
    const newStatus = paymentResult.status === 'paid' ? 'accepted' : 'pending';
    await client.query('UPDATE orders SET status = $1 WHERE id = $2', [newStatus, order.id]);

    await client.query('COMMIT');
    client.release();

    // notify restaurant asynchronously (do not block)
    notificationService.notifyRestaurantNewOrder({ restaurantId, orderId: order.id }).catch(console.error);

    const fullOrder = await getOrderById(order.id);
    return res.status(201).json({ order: fullOrder, payment: paymentResult });
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    client.release();
    next(err);
  }
}

async function getOrder(req, res, next) {
  try {
    const { id } = req.params;
    const order = await getOrderById(id);
    if (!order) return res.status(404).json({ error: 'Not found' });
    return res.json(order);
  } catch (err) { next(err); }
}

module.exports = { placeOrder, getOrder };
