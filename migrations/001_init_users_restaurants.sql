-- users & restaurants base
CREATE TABLE IF NOT EXISTS kasikos_owners (
  id SERIAL PRIMARY KEY,
  fristname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
--   phone VARCHAR(50),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kasikos_restaurants (
  id SERIAL PRIMARY KEY,
  owner_id INT REFERENCES kasikos_owner(id) ON DELETE CASCADE,
  store_name VARCHAR(150) NOT NULL,
  logo_url TEXT,
  logo_key TEXT,
  cover_url TEXT,
  cover_key TEXT,
  module_type VARCHAR(50),
  address TEXT,
  vat_percent NUMERIC(5,2),
  opening_time TIME,
  created_at TIMESTAMP DEFAULT NOW()
);
