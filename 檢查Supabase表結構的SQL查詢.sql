-- ========================================
-- Supabase 資料庫表結構檢查 SQL 查詢
-- 在 Supabase Dashboard > SQL Editor 中執行
-- ========================================

-- 1. 檢查所有表是否存在
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('forms', 'orders', 'settings', 'reserved_orders') 
    THEN '✅ 存在' 
    ELSE '❌ 不存在' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('forms', 'orders', 'settings', 'reserved_orders')
ORDER BY table_name;

-- 2. 檢查 forms 表的所有欄位
SELECT 
  column_name as "欄位名稱",
  data_type as "資料類型",
  is_nullable as "可為空",
  CASE 
    WHEN column_name IN ('id', 'name', 'fields', 'deadline', 'form_token', 
                         'order_deadline', 'order_limit', 'pickup_time',
                         'report_generated', 'report_generated_at',
                         'deleted', 'deleted_at', 'created_at')
    THEN '✅ 必要欄位'
    ELSE '⚠️ 額外欄位'
  END as "狀態"
FROM information_schema.columns
WHERE table_name = 'forms'
ORDER BY ordinal_position;

-- 3. 檢查 orders 表的所有欄位（重點檢查 items_summary）
SELECT 
  column_name as "欄位名稱",
  data_type as "資料類型",
  is_nullable as "可為空",
  CASE 
    WHEN column_name = 'items_summary' THEN '⚠️ 重要：必須存在'
    WHEN column_name IN ('id', 'form_id', 'order_data', 'order_token', 
                         'created_at', 'updated_at')
    THEN '✅ 必要欄位'
    ELSE '📋 其他欄位'
  END as "狀態"
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 4. 檢查 orders 表是否有 items_summary 欄位（詳細檢查）
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ items_summary 欄位存在'
    ELSE '❌ items_summary 欄位不存在，需要執行 ALTER TABLE 添加'
  END as "檢查結果",
  COUNT(*) as "欄位數量"
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'items_summary';

-- 5. 如果 items_summary 欄位不存在，執行以下語句添加：
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS items_summary JSONB;

-- 6. 檢查 settings 表的所有欄位
SELECT 
  column_name as "欄位名稱",
  data_type as "資料類型",
  is_nullable as "可為空"
FROM information_schema.columns
WHERE table_name = 'settings'
ORDER BY ordinal_position;

-- 7. 檢查表之間的關聯（外鍵）
SELECT
  tc.table_name as "子表",
  kcu.column_name as "外鍵欄位",
  ccu.table_name as "父表",
  ccu.column_name as "父表欄位"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 8. 檢查索引
SELECT
  tablename as "表名",
  indexname as "索引名稱",
  indexdef as "索引定義"
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('forms', 'orders', 'settings', 'reserved_orders')
ORDER BY tablename, indexname;

