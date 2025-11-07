# Restaurant Backend (Production-ready scaffold)

This project scaffold includes:
- JWT auth with refresh tokens, email verification, password reset
- Menu CRUD, restaurant profile, withdrawals with Stripe Connect hooks
- Postgres via Docker, migrations, Nodemailer for emails
- Security middlewares (helmet, rate limit), validation ready points
- Docker + docker-compose, GitHub Actions CI

## Quick start
1. Copy `.env.example` to `.env` and fill values (DB, SMTP, JWT, Stripe).
2. Bring up Postgres and app:
   ```
   docker compose up --build
   ```
3. Run migrations:
   ```
   npm run migrate
   ```
4. Test endpoints with Postman.

## Notes
- Configure SMTP credentials for email flows.
- Set `COOKIE_SECURE=true` and use HTTPS in production.
- Replace JWT secrets with securely generated values.
