CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  color       TEXT NOT NULL DEFAULT '#6366f1',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id          SERIAL PRIMARY KEY,
  amount      NUMERIC(14, 2) NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  note        TEXT,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON transactions(category_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);

CREATE TABLE IF NOT EXISTS budget_limits (
  id          SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL UNIQUE REFERENCES categories(id) ON DELETE CASCADE,
  amount      NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
  period      TEXT NOT NULL DEFAULT 'monthly',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO categories (name, color) VALUES
  ('Groceries',     '#10b981'),
  ('Utilities',     '#f59e0b'),
  ('Entertainment', '#8b5cf6'),
  ('Transport',     '#06b6d4'),
  ('Other',         '#6366f1')
ON CONFLICT (name) DO NOTHING;
