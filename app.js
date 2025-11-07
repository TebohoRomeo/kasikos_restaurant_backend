require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const authRoutes = require('./src/routes/authRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const { apiLimiter } = require('./src/middleware/rateLimit.js');

const errorHandler = require('./src/middleware/errorMiddleware');

const app = express();

// parse JSON bodies (except for payment webhooks which expect raw)
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(cookieParser());
app.use(apiLimiter);
app.use(morgan('dev'));

// Stripe webhook route must use raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// serve uploads in dev; in production use CDN
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// health
app.get('/health', (req, res) => res.json({ ok: true }));
// error handler (last)
app.use(errorHandler);

module.exports = app;
