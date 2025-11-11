-- 添加取貨時間欄位到 forms 表
-- 在 Supabase Dashboard > SQL Editor 中執行此腳本

-- 添加 pickup_time 欄位到 forms 表
ALTER TABLE forms
ADD COLUMN IF NOT EXISTS pickup_time TEXT;

