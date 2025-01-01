-- Create ENUMs
CREATE TYPE pricing_plan_interval AS ENUM ('day', 'week', 'month', 'year');
CREATE TYPE pricing_type AS ENUM ('one_time', 'recurring');
CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'unpaid',
  'paused'
);

-- Create products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  active BOOLEAN DEFAULT true,
  image TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create prices table
CREATE TABLE prices (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id),
  active BOOLEAN DEFAULT true,
  currency TEXT,
  type pricing_type,
  unit_amount BIGINT,
  interval pricing_plan_interval,
  interval_count INTEGER,
  trial_period_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  status subscription_status,
  metadata JSONB,
  price_id TEXT REFERENCES prices(id),
  quantity INTEGER,
  cancel_at_period_end BOOLEAN,
  created TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read-only access to active products"
  ON products FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Allow public read-only access to active prices"
  ON prices FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Allow users to read own customer data"
  ON customers FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Allow users to read own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_prices_product_id ON prices(product_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_price_id ON subscriptions(price_id);
CREATE INDEX idx_customers_stripe_customer_id ON customers(stripe_customer_id);