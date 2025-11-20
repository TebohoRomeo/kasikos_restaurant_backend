-- 001_init.sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phones VARCHAR(50),
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'owner',
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  owner_id INT REFERENCES users(id) ON DELETE CASCADE,
  store_name VARCHAR(150) NOT NULL,
  logo_url TEXT,
  logo_key TEXT,
  cover_url TEXT,
  cover_key TEXT,
  module_type VARCHAR(50),
  address TEXT,
  latitude TEXT,
  longitude TEXT,
  vat_percent NUMERIC(5,2),
  opening_time TIME,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'ZAR',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  token_hash TEXT NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE IF NOT EXISTS withdrawal_status AS ENUM ('pending','processing','paid','rejected','cancelled');

CREATE TABLE IF NOT EXISTS withdrawals (
  id SERIAL PRIMARY KEY,
  owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id INT REFERENCES restaurants(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  method VARCHAR(50) NOT NULL,
  destination_details JSONB,
  status withdrawal_status DEFAULT 'pending',
  provider_payout_id VARCHAR(255),
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(100),
  provider_payment_id VARCHAR(255),
  amount NUMERIC(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE IF NOT EXISTS order_status AS ENUM ('pending','accepted','preparing','ready','picked_up','delivering','delivered','cancelled');

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  restaurant_id INT REFERENCES restaurants(id),
  user_id INT REFERENCES users(id),
  total_amount NUMERIC(10,2),
  currency VARCHAR(10) DEFAULT 'ZAR',
  status order_status DEFAULT 'pending',
  delivery_address TEXT,
  latitude TEXT,
  longitude TEXT,
  payment_id INT REFERENCES payments(id),
  created_at TIMESTAMP DEFAULT NOW()
);
