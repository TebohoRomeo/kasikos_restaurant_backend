import { pool } from '../config/db.js';
import { transferToConnectedAccount } from '../config/stripe.js';

export async function requestWithdrawal(req, res, next){
  try {
    const { restaurantId, amount, currency='usd', method='manual_bank', destinationDetails, connectedAccountId } = req.body;
    const r = (await pool.query('SELECT * FROM restaurants WHERE id=$1',[restaurantId])).rows[0];
    if (!r) return res.status(404).json({ error:'Restaurant not found' });
    if (r.owner_id !== req.user.id) return res.status(403).json({ error:'Forbidden' });
    const insert = await pool.query('INSERT INTO withdrawals (owner_id, restaurant_id, amount, currency, method, destination_details, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [req.user.id, restaurantId, amount, currency, method, destinationDetails || null, 'pending']);
    const w = insert.rows[0];
    if (method === 'stripe_connect' && connectedAccountId) {
      try {
        const transfer = await transferToConnectedAccount(amount, currency, connectedAccountId);
        await pool.query('UPDATE withdrawals SET status=$1, provider_payout_id=$2, processed_at=NOW() WHERE id=$3', ['processing', transfer.id, w.id]);
      } catch(err){
        console.error('stripe transfer failed', err);
      }
    }
    return res.status(201).json({ withdrawal: w });
  } catch(err){ next(err); }
}

export async function listWithdrawals(req, res, next){
  try {
    const items = (await pool.query('SELECT * FROM withdrawals WHERE owner_id=$1 ORDER BY requested_at DESC',[req.user.id])).rows;
    return res.json({ withdrawals: items });
  } catch(err){ next(err); }
}
