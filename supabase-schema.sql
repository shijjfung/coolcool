-- Supabase 資料庫表結構
-- 在 Supabase Dashboard > SQL Editor 中執行此腳本

-- 1. 表單設定表
CREATE TABLE IF NOT EXISTS forms (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  fields JSONB NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  order_deadline TIMESTAMPTZ,
  report_generated INTEGER DEFAULT 0,
  report_generated_at TIMESTAMPTZ,
  deleted INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  form_token TEXT UNIQUE NOT NULL
);

-- 2. 訂單表
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  form_id BIGINT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT,
  order_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  order_token TEXT UNIQUE NOT NULL
);

-- 3. 系統設定表
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_forms_form_token ON forms(form_token);
CREATE INDEX IF NOT EXISTS idx_forms_deleted ON forms(deleted);
CREATE INDEX IF NOT EXISTS idx_orders_form_id ON orders(form_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_token ON orders(order_token);

-- 建立 updated_at 自動更新觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 啟用 Row Level Security (RLS) - 可選，如果需要更嚴格的安全控制
-- ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE settings ENABLE ROW LEVEL SECURITY;


