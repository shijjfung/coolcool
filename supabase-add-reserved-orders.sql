-- 添加保留訂單排序表（用於先取單機制）
-- 在 Supabase Dashboard > SQL Editor 中執行此腳本

-- 保留訂單排序表
CREATE TABLE IF NOT EXISTS reserved_orders (
  id BIGSERIAL PRIMARY KEY,
  form_id BIGINT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- 客戶端 session ID（用於識別客戶）
  order_number INTEGER NOT NULL, -- 分配的排序號
  reserved_at TIMESTAMPTZ DEFAULT NOW(), -- 保留時間
  order_token TEXT, -- 如果已提交訂單，存儲訂單 token
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(form_id, session_id) -- 每個表單每個客戶只能有一個保留
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_reserved_orders_form_id ON reserved_orders(form_id);
CREATE INDEX IF NOT EXISTS idx_reserved_orders_session_id ON reserved_orders(session_id);
CREATE INDEX IF NOT EXISTS idx_reserved_orders_reserved_at ON reserved_orders(reserved_at);

-- 建立清理過期保留的函數（5分鐘過期）
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS void AS $$
BEGIN
  DELETE FROM reserved_orders
  WHERE reserved_at < NOW() - INTERVAL '5 minutes'
    AND order_token IS NULL; -- 只刪除未提交的保留
END;
$$ LANGUAGE plpgsql;

