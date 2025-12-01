const { pool } = require('../config/db.js');
const { hashToken } = require('../utils/token.js');

export async function verifyEmail(req, res, next){
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token missing' });
    const tokenHash = hashToken(token);
    const row = await pool.query('SELECT * FROM email_verification_tokens WHERE token_hash=$1 AND used=false AND expires_at > NOW()', [tokenHash]);
    const record = row.rows[0];
    if (!record) return res.status(400).json({ error: 'Invalid or expired token' });
    await pool.query('UPDATE email_verification_tokens SET used=true WHERE id=$1', [record.id]);
    await pool.query('UPDATE users SET verified=true WHERE id=$1', [record.user_id]);
    return res.json({ message: 'Email verified successfully' });
  } catch(err){ next(err); }
}
