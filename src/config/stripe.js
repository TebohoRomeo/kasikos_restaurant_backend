const Stripe = require('stripe');
import dotenv from 'dotenv';
dotenv.config();

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });

export async function transferToConnectedAccount(amount, currency, connectedAccountId) {
  return stripe.transfers.create({
    amount: Math.round(Number(amount) * 100),
    currency,
    destination: connectedAccountId
  });
}
