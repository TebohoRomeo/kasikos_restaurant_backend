/**
 * paymentService:
 * This is a stubbed service. Replace with Stripe/PayPal logic.
 *
 * charge({ amount, currency, paymentMethod, orderId })
 * returns { status: 'paid'|'failed'|'pending', providerPaymentId }
 */

async function charge({ amount, currency, paymentMethod, orderId }) {
  // In production, create a payment intent with Stripe and return the intent id and status.
  // For now, we simulate success.
  return {
    status: 'paid',
    providerPaymentId: `simulated_${Date.now()}`
  };
}

module.exports = { charge };
