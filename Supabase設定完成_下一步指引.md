# ✅ Supabase 本地設定完成！

## 📋 設定狀態

您的 `.env.local` 檔案已正確設定：

- ✅ `DATABASE_TYPE` = `supabase`
- ✅ `NEXT_PUBLIC_SUPABASE_URL` = `https://ceazouzwbvcfwudcbbnk.supabase.co`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 已設定（208 字符）
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = 已設定（219 字符）

---

## 🚀 接下來的重要步驟

### 步驟 1：在 Vercel Dashboard 設定環境變數

1. **登入 Vercel Dashboard**
   - 訪問：https://vercel.com
   - 登入您的帳號

2. **進入您的專案**
   - 在 Dashboard 中找到您的專案
   - 點擊進入專案頁面

3. **設定環境變數**
   - 點擊 **Settings**（設定）
   - 點擊 **Environment Variables**（環境變數）
   - 點擊 **Add New**（新增）

4. **添加以下 4 個變數**（**重要：選擇所有環境** - Production, Preview, Development）

   | 變數名稱 | 值 |
   |---------|-----|
   | `DATABASE_TYPE` | `supabase` |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://ceazouzwbvcfwudcbbnk.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYXpvdXp3YnZjZnd1ZGNiYm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2OTU4NjYsImV4cCI6MjA3ODI3MTg2Nn0.0ayBcCJyPFtQbVBqF-nKvKQDmHoVshTpzszQSPVXEb0` |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYXpvdXp3YnZjZnd1ZGNiYm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5NTg2NiwiZXhwIjoyMDc4MjcxODY2fQ.8faMxUMEjbNUaGTDgkxUr2Rl3BRZEwIxDHuvFSWjd_M` |

5. **儲存**
   - 每個變數設定完後點擊 **Save**
   - 確認所有 4 個變數都已添加

---

### 步驟 2：在 Supabase Dashboard 執行 SQL 腳本

1. **登入 Supabase Dashboard**
   - 訪問：https://app.supabase.com
   - 登入您的帳號

2. **選擇您的專案**
   - 在專案列表中選擇：`ceazouzwbvcfwudcbbnk`

3. **進入 SQL Editor**
   - 點擊左側選單的 **SQL Editor**
   - 點擊 **New Query**（新查詢）

4. **複製 SQL 腳本**
   - 執行 `互動式設定Supabase.bat`
   - 選擇 `[4]` 複製 SQL 腳本到剪貼簿
   - 或直接開啟 `supabase-complete-schema.sql` 檔案複製全部內容

5. **執行 SQL**
   - 在 SQL Editor 中按 `Ctrl+V` 貼上
   - 點擊 **Run**（執行）或按 `Ctrl+Enter`
   - 確認執行成功（應該看到 "Success. No rows returned"）

---

### 步驟 3：重新部署 Vercel

1. **進入 Vercel Dashboard**
   - 進入您的專案頁面

2. **重新部署**
   - 點擊 **Deployments**（部署）
   - 找到最新的部署
   - 點擊右側的 **⋯**（三個點）
   - 選擇 **Redeploy**（重新部署）
   - 確認勾選 **Use existing Build Cache**（使用現有建置快取）
   - 點擊 **Redeploy**

---

### 步驟 4：測試連線

部署完成後（通常需要 1-3 分鐘），訪問：

```
https://您的網址.vercel.app/api/debug/check-env
```

應該會看到：
- ✅ 所有環境變數都已正確設定
- ✅ `DATABASE_TYPE` = `supabase`
- ✅ 所有 Supabase 相關變數都已設定

---

## 🔍 驗證資料庫連線

設定完成後，您可以：

1. **建立一個測試表單**
   - 訪問：`https://您的網址.vercel.app/admin`
   - 建立一個新表單
   - 確認可以成功建立

2. **檢查 Supabase Dashboard**
   - 進入 Supabase Dashboard → Table Editor
   - 應該可以看到 `forms` 表中有新建立的表單

3. **測試訂單功能**
   - 訪問表單的客戶端連結
   - 填寫並提交一個測試訂單
   - 在 Supabase Dashboard 的 `orders` 表中應該可以看到新訂單

---

## ⚠️ 重要提醒

1. **環境變數必須在 Vercel 設定**
   - `.env.local` 只適用於本地開發
   - Vercel 需要單獨設定環境變數

2. **SQL 腳本只需要執行一次**
   - 在 Supabase Dashboard 執行 `supabase-complete-schema.sql`
   - 建立資料庫結構後就不需要再執行了

3. **重新部署是必要的**
   - 設定完環境變數後，必須重新部署 Vercel
   - 新的環境變數才會生效

---

## 🆘 如果遇到問題

1. **檢查環境變數**
   - 訪問 `/api/debug/check-env` 查看環境變數狀態

2. **檢查 Supabase 連線**
   - 確認 Supabase Dashboard 中的專案狀態正常
   - 確認 API keys 沒有過期

3. **檢查 Vercel 部署日誌**
   - 在 Vercel Dashboard → Deployments → 查看 Build Logs
   - 尋找錯誤訊息

---

## ✅ 完成檢查清單

- [ ] 在 Vercel Dashboard 設定 4 個環境變數
- [ ] 在 Supabase Dashboard 執行 SQL 腳本
- [ ] 重新部署 Vercel
- [ ] 測試 `/api/debug/check-env` 端點
- [ ] 測試建立表單功能
- [ ] 測試提交訂單功能
- [ ] 在 Supabase Dashboard 確認資料已寫入

---

完成所有步驟後，您的應用程式就可以正常使用 Supabase 雲端資料庫了！🎉

