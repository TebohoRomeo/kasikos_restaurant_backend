import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';

export async function updateProfile(req, res, next){
  try {
    const { firstname, lastname, email, phone } = req.body;
    const check = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (check.rows[0] && check.rows[0].id !== req.user.id) return res.status(409).json({ error:'Email already in use' });
    const upd = await pool.query('UPDATE users SET firstname=$1, lastname=$2, email=$3, phone=$4 WHERE id=$5 RETURNING id, firstname, lastname, email, phone', [firstname, lastname, email, phone || null, req.user.id]);
    return res.json({ user: upd.rows[0] });
  } catch(err){ next(err); }
}

export async function changePassword(req, res, next){
  try {
    const { currentPassword, newPassword } = req.body;
    const user = (await pool.query('SELECT id, password_hash FROM users WHERE id=$1',[req.user.id])).rows[0];
    if (!user) return res.status(404).json({ error:'User not found' });
    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) return res.status(401).json({ error:'Current password incorrect' });
    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.user.id]);
    await pool.query('DELETE FROM refresh_tokens WHERE user_id=$1', [req.user.id]);
    return res.json({ ok:true });
  } catch(err){ next(err); }
}
