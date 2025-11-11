# Supabase 設定確認與修復

## 📊 檢查結果分析

根據您的檢查結果：

### ✅ 已完成的設定

1. **`.env.local` 檔案存在**
2. **`DATABASE_TYPE=supabase` 已設定**
3. **Supabase URL 和 Anon Key 已設定**

### ⚠️ 發現的問題

**缺少 `SUPABASE_SERVICE_ROLE_KEY`**

這可能導致：
- Supabase 無法正常寫入資料
- 某些功能無法使用
- 系統可能回退到 SQLite

## 🔧 修復步驟

### 步驟 1：取得 SERVICE_ROLE_KEY

1. **前往 Supabase Dashboard**
   - 網址：https://supabase.com/dashboard
   - 登入您的帳號

2. **選擇您的專案**
   - 專案名稱應該包含：`ceazouzwbvcfwudcbbnk`

3. **前往 API 設定**
   - 左側選單：**Settings** > **API**

4. **找到 service_role key**
   - 在 "Project API keys" 區塊
   - 找到 **`service_role`**（secret）
   - 點擊眼睛圖示顯示
   - **複製完整的 key**

### 步驟 2：添加到 .env.local

1. **打開 `.env.local` 檔案**

2. **添加 SERVICE_ROLE_KEY**：
```env
NEXT_PUBLIC_SUPABASE_URL=https://ceazouzwbvcfwudcbbnk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYXpvdXp3YnZjZnd1ZGNiYm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2OTU4NjYsImV4cCI6MjA3ODI3MTg2Nn0.0ayBcCJyPFtQbVBqF-nKvKQDmHoVshTpzszQSPVXEb0
SUPABASE_SERVICE_ROLE_KEY=您的service_role_key（從Supabase複製）
DATABASE_TYPE=supabase
```

3. **儲存檔案**

### 步驟 3：確認 Supabase 資料表

1. **前往 Supabase Dashboard**
2. **點擊左側選單的 "SQL Editor"**
3. **檢查是否有以下資料表**：
   - `forms`
   - `orders`
   - `settings`

4. **如果沒有，執行 SQL**：
   - 點擊 "New query"
   - 打開 `supabase-schema.sql` 檔案
   - 複製內容到 SQL Editor
   - 點擊 "Run" 執行

### 步驟 4：重新啟動伺服器

1. **停止目前的伺服器**（如果正在運行）
2. **重新啟動**：
   ```bash
   npm run dev
   ```
3. **檢查啟動訊息**：
   - 應該沒有 Supabase 相關錯誤
   - 如果有錯誤，檢查 `.env.local` 設定

## 🎯 確認是否成功切換

### 方法 1：查看伺服器啟動訊息

啟動伺服器時，如果看到 Supabase 相關錯誤，表示設定有問題。

### 方法 2：測試建立表單

1. 開啟管理頁面
2. 建立一個測試表單
3. 如果成功 → Supabase 正常運作
4. 如果失敗 → 檢查錯誤訊息

### 方法 3：檢查 Supabase Dashboard

1. 前往 Supabase Dashboard
2. 點擊 "Table Editor"
3. 查看是否有資料
4. 如果有新建立的表單資料 → Supabase 正常運作

## 📝 關於 orders.db 檔案

### 為什麼還存在？

`orders.db` 檔案是舊的 SQLite 資料庫，可能包含：
- 之前測試的資料
- 備份資料

### 可以刪除嗎？

**可以，但建議先備份**：

1. **如果確定不再使用 SQLite**：
   - 可以刪除 `orders.db`
   - 或重新命名為 `orders.db.backup`

2. **如果還想保留**：
   - 可以保留作為備份
   - 不影響 Supabase 的使用

## ⚠️ 重要提醒

### 資料不會自動遷移

- **SQLite 的資料不會自動轉移到 Supabase**
- 如果需要遷移資料，需要手動匯入

### 如果切換後無法使用

1. **檢查 `.env.local` 設定**
2. **確認 Supabase 資料表已建立**
3. **確認 SERVICE_ROLE_KEY 正確**
4. **重新啟動伺服器**

## 🎉 完成後

完成上述步驟後，您的系統就會：
- ✅ 使用 Supabase（雲端資料庫）
- ✅ 可以跨裝置同步
- ✅ 手機和電腦可以共用資料
- ✅ 資料安全備份在雲端

## 📚 相關檔案

- `supabase-schema.sql` - Supabase 資料表結構
- `lib/db-supabase.ts` - Supabase 資料庫操作
- `lib/supabase.ts` - Supabase 客戶端設定

如有問題，請參考上述步驟或聯繫技術支援。

