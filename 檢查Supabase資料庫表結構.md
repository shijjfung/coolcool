# 檢查 Supabase 資料庫表結構

## 方法 1：在 Supabase Dashboard 中查看（最簡單）

### 步驟 1：登入 Supabase Dashboard
1. 前往 https://supabase.com/dashboard
2. 登入您的帳號
3. 選擇您的專案

### 步驟 2：查看表結構
1. 在左側選單中，點擊 **"Table Editor"**（表編輯器）
2. 您應該會看到以下表：
   - ✅ `forms` - 表單設定表
   - ✅ `orders` - 訂單表
   - ✅ `settings` - 系統設定表
   - ✅ `reserved_orders` - 保留訂單表（如果已建立）

### 步驟 3：檢查表欄位
點擊每個表，檢查是否有以下欄位：

#### `forms` 表應包含：
- `id` (bigint, primary key)
- `name` (text)
- `fields` (jsonb)
- `deadline` (timestamptz)
- `order_deadline` (timestamptz)
- `order_limit` (integer)
- `pickup_time` (text)
- `report_generated` (integer)
- `report_generated_at` (timestamptz)
- `deleted` (integer)
- `deleted_at` (timestamptz)
- `created_at` (timestamptz)
- `form_token` (text, unique)

#### `orders` 表應包含：
- `id` (bigint, primary key)
- `form_id` (bigint, foreign key)
- `customer_name` (text)
- `customer_phone` (text)
- `order_data` (jsonb)
- `items_summary` (jsonb) ⚠️ **重要：這個欄位必須存在**
- `client_ip` (text)
- `user_agent` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- `order_token` (text, unique)

#### `settings` 表應包含：
- `key` (text, primary key)
- `value` (text)
- `updated_at` (timestamptz)

#### `reserved_orders` 表應包含（可選）：
- `id` (bigint, primary key)
- `form_id` (bigint, foreign key)
- `session_id` (text)
- `order_number` (integer)
- `reserved_at` (timestamptz)
- `order_token` (text)

---

## 方法 2：使用 SQL Editor 查詢

### 步驟 1：開啟 SQL Editor
1. 在 Supabase Dashboard 左側選單中，點擊 **"SQL Editor"**
2. 點擊 **"New query"**（新查詢）

### 步驟 2：執行查詢語句
複製以下 SQL 語句並執行：

```sql
-- 檢查所有表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('forms', 'orders', 'settings', 'reserved_orders')
ORDER BY table_name;
```

**預期結果**：應該返回 4 行（或至少 3 行，如果沒有 `reserved_orders` 表）

### 步驟 3：檢查 orders 表的 items_summary 欄位
```sql
-- 檢查 orders 表是否有 items_summary 欄位
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'items_summary';
```

**預期結果**：應該返回 1 行，顯示 `items_summary` 欄位存在且類型為 `jsonb`

---

## 方法 3：如果表不存在，執行 SQL 腳本

### 步驟 1：開啟 SQL Editor
1. 在 Supabase Dashboard 左側選單中，點擊 **"SQL Editor"**
2. 點擊 **"New query"**（新查詢）

### 步驟 2：執行完整 SQL 腳本
1. 打開專案中的 `supabase-complete-schema.sql` 檔案
2. 複製整個檔案內容
3. 貼到 SQL Editor 中
4. 點擊 **"Run"**（執行）按鈕

### 步驟 3：確認執行成功
執行後應該會看到：
- ✅ "Success. No rows returned" 或類似的成功訊息
- ❌ 如果有錯誤，會顯示具體的錯誤訊息

---

## 常見問題

### Q: 如果表已經存在，執行腳本會出錯嗎？
A: 不會！`supabase-complete-schema.sql` 使用了 `CREATE TABLE IF NOT EXISTS`，所以如果表已存在，會跳過建立步驟。

### Q: 如何檢查是否有遺漏的欄位？
A: 執行以下 SQL 查詢：

```sql
-- 檢查 forms 表的所有欄位
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'forms'
ORDER BY ordinal_position;

-- 檢查 orders 表的所有欄位
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
```

### Q: 如果缺少 `items_summary` 欄位怎麼辦？
A: 執行以下 SQL 語句：

```sql
-- 添加 items_summary 欄位到 orders 表
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS items_summary JSONB;
```

---

## 快速檢查清單

- [ ] 登入 Supabase Dashboard
- [ ] 在 Table Editor 中看到 `forms` 表
- [ ] 在 Table Editor 中看到 `orders` 表
- [ ] 在 Table Editor 中看到 `settings` 表
- [ ] 檢查 `orders` 表有 `items_summary` 欄位
- [ ] 如果缺少任何表或欄位，執行 `supabase-complete-schema.sql`

---

## 需要幫助？

如果遇到任何問題：
1. 檢查 Supabase Dashboard 的錯誤訊息
2. 確認您有專案的管理權限
3. 檢查 SQL 語句是否有語法錯誤
4. 查看 Supabase 的日誌（Logs）查看詳細錯誤

