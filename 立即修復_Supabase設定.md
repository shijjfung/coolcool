# 立即修復 Supabase 設定

## 🚨 目前狀態

根據檢查結果：

### ✅ 已設定
- `DATABASE_TYPE=supabase` ✅
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅

### ❌ 缺少（重要！）
- `SUPABASE_SERVICE_ROLE_KEY` ❌ **必須添加**

## ⚠️ 問題說明

**沒有 SERVICE_ROLE_KEY 會導致**：
- Supabase 無法寫入資料
- 無法建立表單
- 無法儲存訂單
- 系統可能無法正常運作

## 🔧 立即修復步驟

### 步驟 1：取得 SERVICE_ROLE_KEY（5 分鐘）

1. **開啟瀏覽器**，前往：
   ```
   https://supabase.com/dashboard
   ```

2. **登入您的帳號**

3. **選擇您的專案**
   - 專案 URL 應該包含：`ceazouzwbvcfwudcbbnk`

4. **前往 API 設定**
   - 左側選單點擊 **Settings**（設定）
   - 點擊 **API**

5. **找到 service_role key**
   - 在 "Project API keys" 區塊
   - 找到 **`service_role`** 這一列
   - 右側有眼睛圖示 👁️，點擊顯示
   - **複製完整的 key**（很長的一串字元）

### 步驟 2：添加到 .env.local（2 分鐘）

1. **打開 `.env.local` 檔案**
   - 位置：`E:\下單庫存管理\.env.local`
   - 可以用記事本或任何文字編輯器打開

2. **添加 SERVICE_ROLE_KEY**
   
   在檔案最後添加一行：
   ```env
   SUPABASE_SERVICE_ROLE_KEY=您剛才複製的service_role_key
   ```

3. **完整內容應該是**：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://ceazouzwbvcfwudcbbnk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYXpvdXp3YnZjZnd1ZGNiYm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2OTU4NjYsImV4cCI6MjA3ODI3MTg2Nn0.0ayBcCJyPFtQbVBqF-nKvKQDmHoVshTpzszQSPVXEb0
   DATABASE_TYPE=supabase
   SUPABASE_SERVICE_ROLE_KEY=您的service_role_key（貼上這裡）
   ```

4. **儲存檔案**（Ctrl+S）

### 步驟 3：確認 Supabase 資料表（5 分鐘）

1. **在 Supabase Dashboard 中**
   - 點擊左側選單的 **"Table Editor"**

2. **檢查是否有以下資料表**：
   - ✅ `forms` - 表單資料
   - ✅ `orders` - 訂單資料
   - ✅ `settings` - 系統設定

3. **如果沒有資料表**：
   - 點擊左側選單的 **"SQL Editor"**
   - 點擊 **"New query"**
   - 打開專案中的 `supabase-schema.sql` 檔案
   - 複製全部內容
   - 貼上到 SQL Editor
   - 點擊 **"Run"** 執行
   - 應該會看到 "Success" 訊息

### 步驟 4：重新啟動伺服器（1 分鐘）

1. **停止目前的伺服器**（如果正在運行）
   - 在終端機按 `Ctrl+C`

2. **重新啟動**：
   ```bash
   npm run dev
   ```

3. **檢查啟動訊息**：
   - 應該沒有 Supabase 相關錯誤
   - 如果有錯誤，檢查 `.env.local` 設定

## ✅ 完成後測試

### 測試 1：建立表單

1. 開啟管理頁面：`http://localhost:3000/admin`
2. 點擊「+ 建立新表單」
3. 填寫表單資訊
4. 點擊「儲存表單」
5. **如果成功** → Supabase 正常運作 ✅
6. **如果失敗** → 檢查錯誤訊息

### 測試 2：檢查 Supabase Dashboard

1. 前往 Supabase Dashboard
2. 點擊 **"Table Editor"**
3. 點擊 **"forms"** 資料表
4. **如果看到新建立的表單** → Supabase 正常運作 ✅

## 🎯 快速檢查清單

完成後確認：

- [ ] `.env.local` 中有 `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Supabase Dashboard 中有 `forms`、`orders`、`settings` 三個資料表
- [ ] 重新啟動伺服器後沒有錯誤
- [ ] 可以成功建立表單
- [ ] 在 Supabase Dashboard 中可以看到新資料

## 📝 關於 orders.db

`orders.db` 是舊的 SQLite 資料庫檔案。

**目前狀態**：
- 系統已設定使用 Supabase
- `orders.db` 不會被使用
- 可以保留作為備份
- 或刪除（如果確定不再使用）

**建議**：
- 先保留，確認 Supabase 正常運作後再決定

## 🆘 如果遇到問題

### 問題 1：找不到 service_role key

**解決方法**：
- 確認在正確的專案中
- 確認在 Settings > API 頁面
- 如果還是找不到，可能是專案設定問題

### 問題 2：添加後還是無法使用

**解決方法**：
1. 確認 `.env.local` 檔案格式正確（每行一個設定）
2. 確認沒有多餘的空格或引號
3. 確認重新啟動了伺服器
4. 檢查伺服器啟動時的錯誤訊息

### 問題 3：Supabase 資料表不存在

**解決方法**：
1. 執行 `supabase-schema.sql` 中的 SQL
2. 確認執行成功（看到 Success 訊息）
3. 重新整理 Table Editor 頁面

## 🎉 完成後

完成上述步驟後，您的系統就會：
- ✅ 使用 Supabase（雲端資料庫）
- ✅ 可以跨裝置同步
- ✅ 手機和電腦可以共用資料
- ✅ 資料安全備份在雲端

**現在請立即執行步驟 1-4，完成 Supabase 設定！**

