const { pool } = require('../config/db');

async function createReview(req, res, next) {
  try {
    const userId = req.user.id;
    const { restaurantId } = req.params;
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Invalid rating' });

    const r = await pool.query('INSERT INTO reviews (restaurant_id, user_id, rating, comment) VALUES ($1,$2,$3,$4) RETURNING *',
      [restaurantId, userId, rating, comment]);
    res.status(201).json(r.rows[0]);
  } catch (err) { next(err); }
}

async function listReviews(req, res, next) {
  try {
    const { restaurantId } = req.params;
    const r = await pool.query('SELECT * FROM reviews WHERE restaurant_id = $1 ORDER BY created_at DESC', [restaurantId]);
    res.json(r.rows);
  } catch (err) { next(err); }
}

module.exports = { createReview, listReviews };
