const { updatePaymentStatus } = require('../models/paymentModel');

/**
 * Webhook endpoint to receive provider updates.
 * e.g. POST /api/payments/webhook
 */
export async function webhook(req, res, next) {
  // This is provider-specific. Validate signature/header before processing.
  try {
    const event = req.body;
    // parse and update payments accordingly
    // Example:
    const paymentId = event.data.object.id; // provider-specific
    await updatePaymentStatus(paymentId, 'paid');
    res.status(200).json({ ok: true });
  } catch (err) { next(err); }
}

// module.exports = { webhook };
