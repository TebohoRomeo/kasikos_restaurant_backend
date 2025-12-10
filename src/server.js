import app from '../app.js';
import dotenv from 'dotenv';
import { pool } from '../src/config/db.js';
dotenv.config();

const PORT = process.env.PORT || 3000;

(async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('DB Connected:', res.rows[0]);
    res.json({ time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB connection failed' });
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();

