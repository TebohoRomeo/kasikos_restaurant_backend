const { verify } = require('../utils/jwt');
const { pool } = require('../config/db');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = verify(token);
    // fetch minimal user info if needed
    const { rows } = await pool.query('SELECT id, full_name, email FROM kasikos_owner WHERE id = $1', [payload.id]);
    if (!rows[0]) return res.status(401).json({ error: 'Invalid token' });
    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// for endpoints that require the user to be an owner of a restaurant
async function requireRestaurantOwner(req, res, next) {
  // assume req.user already set
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  // get restaurant for the user
  const { rows } = await pool.query('SELECT id FROM restaurants WHERE owner_id = $1', [req.user.id]);
  if (!rows[0]) return res.status(403).json({ error: 'Requires restaurant owner role' });
  req.user.restaurant_id = rows[0].id;
  next();
}

module.exports = { requireAuth, requireRestaurantOwner };
