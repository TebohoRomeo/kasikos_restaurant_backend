const { stripe } = require('../config/stripe.js');
const { pool } = require('../config/db.js');

export async function webhook(req, res){
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch(err) {
    console.error('stripe webhook error', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    try {
      await pool.query('INSERT INTO payments (provider, provider_payment_id, amount, currency, status) VALUES ($1,$2,$3,$4,$5)', ['stripe', pi.id, pi.amount_received/100.0, pi.currency, 'succeeded']);
    } catch(err){ console.error('db store payment error', err); }
  }
  res.json({ received: true });
}
