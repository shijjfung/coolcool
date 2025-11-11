-- 為現有的 orders 表添加新欄位
-- 在 Supabase Dashboard > SQL Editor 中執行此腳本

-- 添加 client_ip 欄位（如果不存在）
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS client_ip TEXT;

-- 添加 user_agent 欄位（如果不存在）
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 完成後，現有的訂單這些欄位會是 NULL
-- 新的訂單會自動記錄 IP 和設備資訊

