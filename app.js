import dotenv from 'dotenv';
dotenv.config();
import express, { json, urlencoded, raw,  } from 'express'; // static
import { static as serveStaticMiddleware } from 'express';
// import serveStatic from 'serve-static';
import { join } from 'path';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/authRoutes.js';
import menuRoutes from './src/routes/menuRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import { apiLimiter } from './src/middleware/rateLimit.js';

import errorHandler from './src/middleware/errorMiddleware.js';

// const serveStaticMiddleware = serveStatic(root, options);

const app = express();

// parse JSON bodies (except for payment webhooks which expect raw)
app.use(json({ limit: '50kb' }));
app.use(urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(cookieParser());
app.use(apiLimiter);
app.use(morgan('dev'));

// Stripe webhook route must use raw body
app.use('/api/payments/webhook', raw({ type: 'application/json' }));

// serve uploads in dev; in production use CDN
// app.use('/uploads', static(join(process.cwd(), 'uploads')));

app.use('/uploads', serveStaticMiddleware(join(process.cwd(), 'uploads')));
app.use(serveStaticMiddleware(join(process.cwd(), 'public')));

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/payments', paymentRoutes);
// app.use('/api/reviews', reviewRoutes);

// health
app.get('/health', (req, res) => res.json({ ok: true }));
// error handler (last)
app.use(errorHandler);

export default app;
