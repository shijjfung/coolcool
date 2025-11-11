# 測試 Supabase 是否正常運作

## ✅ 設定確認

根據檢查結果，您的 Supabase 設定已完成：
- ✅ `DATABASE_TYPE=supabase` 已設定
- ✅ `SUPABASE_SERVICE_ROLE_KEY` 已設定
- ✅ Supabase URL 和 Anon Key 已設定

## 🧪 測試步驟

### 步驟 1：確認 Supabase 資料表（重要！）

1. **前往 Supabase Dashboard**
   - 網址：https://supabase.com/dashboard
   - 選擇您的專案

2. **檢查資料表**
   - 點擊左側選單的 **"Table Editor"**
   - 檢查是否有以下三個資料表：
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

### 步驟 2：重新啟動伺服器

1. **停止目前的伺服器**（如果正在運行）
   - 在終端機按 `Ctrl+C`

2. **重新啟動**：
   ```bash
   npm run dev
   ```

3. **檢查啟動訊息**：
   - 應該沒有 Supabase 相關錯誤
   - 如果有錯誤，請記錄錯誤訊息

### 步驟 3：測試建立表單

1. **開啟管理頁面**
   - 網址：`http://localhost:3000/admin`

2. **建立測試表單**
   - 點擊「+ 建立新表單」
   - 表單名稱：`測試表單`
   - 截止時間：選擇一個未來的時間
   - 點擊「+ 新增欄位」
   - 欄位標籤：`測試欄位`
   - 點擊「儲存表單」

3. **檢查結果**：
   - **如果成功** → 會跳轉到分享頁面 ✅
   - **如果失敗** → 會顯示錯誤訊息 ❌

### 步驟 4：確認資料已寫入 Supabase

1. **前往 Supabase Dashboard**
2. **點擊 "Table Editor"**
3. **點擊 "forms" 資料表**
4. **檢查是否有新建立的表單**
   - **如果有** → Supabase 正常運作 ✅
   - **如果沒有** → 可能有問題，需要檢查

## 🎯 成功指標

如果以下都正常，表示 Supabase 已成功設定：

- [ ] 伺服器啟動時沒有 Supabase 錯誤
- [ ] 可以成功建立表單
- [ ] 在 Supabase Dashboard 的 `forms` 資料表中可以看到新建立的表單
- [ ] 可以成功分享表單連結

## 🆘 如果遇到問題

### 問題 1：伺服器啟動時有 Supabase 錯誤

**可能原因**：
- SERVICE_ROLE_KEY 不正確
- Supabase URL 不正確
- 網路連線問題

**解決方法**：
1. 檢查 `.env.local` 中的設定
2. 確認 SERVICE_ROLE_KEY 正確（沒有多餘空格）
3. 確認網路連線正常

### 問題 2：可以建立表單，但 Supabase 中沒有資料

**可能原因**：
- Supabase 資料表不存在
- 權限設定問題

**解決方法**：
1. 確認 Supabase 資料表已建立（步驟 1）
2. 檢查 Supabase Dashboard 中的資料表

### 問題 3：建立表單失敗

**可能原因**：
- Supabase 連線問題
- 資料表結構不正確

**解決方法**：
1. 檢查伺服器啟動時的錯誤訊息
2. 確認 Supabase 資料表已建立
3. 確認資料表結構正確（執行 `supabase-schema.sql`）

## 📊 目前狀態總結

### 已完成的設定

✅ Supabase 專案已建立
✅ API Key 已設定
✅ `.env.local` 設定完成
✅ 程式碼已準備好

### 需要確認

- [ ] Supabase 資料表已建立
- [ ] 伺服器可以正常啟動
- [ ] 可以成功建立表單
- [ ] 資料可以寫入 Supabase

## 🎉 完成後

如果所有測試都通過，您的系統就會：
- ✅ 使用 Supabase（雲端資料庫）
- ✅ 可以跨裝置同步
- ✅ 手機和電腦可以共用資料
- ✅ 資料安全備份在雲端

**現在請執行上述測試步驟，確認 Supabase 是否正常運作！**

