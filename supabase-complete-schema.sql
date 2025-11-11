-- ========================================
-- Supabase 完整資料庫結構（整合版）
-- 在 Supabase Dashboard > SQL Editor 中執行此腳本
-- ========================================

-- 1. 表單設定表
CREATE TABLE IF NOT EXISTS forms (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  fields JSONB NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  order_deadline TIMESTAMPTZ,
  order_limit INTEGER,
  pickup_time TEXT,
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
  items_summary JSONB,
  client_ip TEXT,
  user_agent TEXT,
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

-- 4. 保留訂單排序表（用於先取單機制）
CREATE TABLE IF NOT EXISTS reserved_orders (
  id BIGSERIAL PRIMARY KEY,
  form_id BIGINT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  order_number INTEGER NOT NULL,
  reserved_at TIMESTAMPTZ DEFAULT NOW(),
  order_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(form_id, session_id)
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_forms_form_token ON forms(form_token);
CREATE INDEX IF NOT EXISTS idx_forms_deleted ON forms(deleted);
CREATE INDEX IF NOT EXISTS idx_orders_form_id ON orders(form_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_token ON orders(order_token);
CREATE INDEX IF NOT EXISTS idx_reserved_orders_form_id ON reserved_orders(form_id);
CREATE INDEX IF NOT EXISTS idx_reserved_orders_session_id ON reserved_orders(session_id);
CREATE INDEX IF NOT EXISTS idx_reserved_orders_reserved_at ON reserved_orders(reserved_at);

-- 建立 updated_at 自動更新觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 如果觸發器已存在，先刪除再建立
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 建立清理過期保留的函數（5分鐘過期）
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS void AS $$
BEGIN
  DELETE FROM reserved_orders
  WHERE reserved_at < NOW() - INTERVAL '5 minutes'
    AND order_token IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 如果資料庫已存在，使用以下語句添加新欄位
-- ========================================

-- 添加 client_ip 和 user_agent 到 orders 表（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'client_ip') THEN
    ALTER TABLE orders ADD COLUMN client_ip TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'user_agent') THEN
    ALTER TABLE orders ADD COLUMN user_agent TEXT;
  END IF;
END $$;

-- 添加 order_limit 到 forms 表（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'forms' AND column_name = 'order_limit') THEN
    ALTER TABLE forms ADD COLUMN order_limit INTEGER;
  END IF;
END $$;

       -- 添加 pickup_time 到 forms 表（如果不存在）
       DO $$
       BEGIN
         IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'forms' AND column_name = 'pickup_time') THEN
           ALTER TABLE forms ADD COLUMN pickup_time TEXT;
         END IF;
       END $$;

       -- 添加 items_summary 到 orders 表（如果不存在）
       DO $$
       BEGIN
         IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'orders' AND column_name = 'items_summary') THEN
           ALTER TABLE orders ADD COLUMN items_summary JSONB;
         END IF;
       END $$;

