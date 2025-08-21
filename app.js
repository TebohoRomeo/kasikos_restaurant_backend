require('dotenv').config();
const express = require('express');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
// const deliveryRoutes = require('./routes/deliveryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// parse JSON bodies (except for payment webhooks which expect raw)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploads in dev; in production use CDN
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
// app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// health
app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('DB Time:', res.rows[0]);
    res.json({ time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB connection failed' });
  }
});
// error handler (last)
app.use(errorHandler);

module.exports = app;
