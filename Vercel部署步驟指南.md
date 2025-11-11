# Vercel 部署步驟指南

## 📋 前置準備

### 1. 確認修復已完成
✅ 已修復 `pages/api/debug/check-db.ts` 的導入錯誤

---

## 🚀 步驟 1：提交並推送修復到 GitHub

### 方法 A：使用 Git 命令（如果已安裝 Git）

在專案目錄 `E:\下單庫存管理` 開啟命令提示字元或 PowerShell，執行：

```bash
# 1. 檢查修改的檔案
git status

# 2. 加入修改的檔案
git add pages/api/debug/check-db.ts

# 3. 提交修改
git commit -m "Fix: Remove unused imports from check-db.ts for Vercel deployment"

# 4. 推送到 GitHub
git push origin main
```

### 方法 B：使用 GitHub Desktop（圖形化介面）

1. 開啟 GitHub Desktop
2. 應該會看到 `pages/api/debug/check-db.ts` 有修改
3. 在左下角輸入提交訊息：「Fix: Remove unused imports from check-db.ts」
4. 點擊「Commit to main」
5. 點擊「Push origin」推送到 GitHub

---

## 🔧 步驟 2：在 Vercel 設定環境變數

### 2.1 取得 Supabase 環境變數

1. 登入 Supabase Dashboard：https://app.supabase.com
2. 選擇您的專案
3. 點擊左側選單的「Settings」→「API」
4. 找到以下資訊：
   - **Project URL** → 這是 `SUPABASE_URL`
   - **anon public** key → 這是 `SUPABASE_ANON_KEY`
   - **service_role** key → 這是 `SUPABASE_SERVICE_ROLE_KEY`（⚠️ 請小心保管）

### 2.2 在 Vercel 添加環境變數

1. 回到 Vercel Dashboard
2. 進入您的專案 `coolcool`
3. 點擊上方選單的「Settings」
4. 點擊左側選單的「Environment Variables」
5. 點擊「Add New」添加以下 4 個環境變數：

#### 環境變數 1：
- **Key**: `DATABASE_TYPE`
- **Value**: `supabase`
- **Environment**: 選擇 `Production`, `Preview`, `Development`（全選）

#### 環境變數 2：
- **Key**: `SUPABASE_URL`
- **Value**: 貼上您的 Supabase Project URL
- **Environment**: 全選

#### 環境變數 3：
- **Key**: `SUPABASE_ANON_KEY`
- **Value**: 貼上您的 Supabase anon public key
- **Environment**: 全選

#### 環境變數 4：
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: 貼上您的 Supabase service_role key
- **Environment**: 全選（⚠️ 注意：這個 key 有完整權限，請妥善保管）

6. 點擊「Save」儲存所有環境變數

---

## 🗄️ 步驟 3：確認 Supabase 資料庫結構

### 3.1 在 Supabase 執行 SQL 腳本

1. 在 Supabase Dashboard，點擊左側選單的「SQL Editor」
2. 點擊「New query」
3. 打開專案中的 `supabase-complete-schema.sql` 檔案
4. 複製整個 SQL 內容
5. 貼上到 Supabase SQL Editor
6. 點擊「Run」執行
7. 確認沒有錯誤訊息

---

## 🔄 步驟 4：重新部署

### 方法 A：自動部署（推薦）

推送代碼到 GitHub 後，Vercel 會自動觸發部署：

1. 完成步驟 1（推送代碼）
2. 回到 Vercel Dashboard
3. 應該會看到新的部署正在進行
4. 等待部署完成（約 1-3 分鐘）

### 方法 B：手動觸發部署

1. 在 Vercel Dashboard 的專案頁面
2. 點擊右上角的「...」選單
3. 選擇「Redeploy」
4. 選擇「Use existing Build Cache」（可選）
5. 點擊「Redeploy」

---

## ✅ 步驟 5：驗證部署

### 5.1 檢查部署狀態

1. 在 Vercel Dashboard 查看部署狀態
2. 如果顯示「Ready」，表示部署成功 ✅
3. 如果顯示錯誤，點擊查看詳細錯誤訊息

### 5.2 測試網站

1. 點擊部署成功的連結（例如：`https://coolcool.vercel.app`）
2. 測試以下功能：
   - 訪問首頁
   - 建立表單
   - 填寫訂單
   - 查看報表

---

## 🐛 常見問題排除

### 問題 1：部署失敗 - 環境變數未設定

**解決方法**：
- 確認所有 4 個環境變數都已正確設定
- 確認環境變數的值沒有多餘的空格
- 重新部署

### 問題 2：資料庫連線錯誤

**解決方法**：
- 確認 Supabase 環境變數正確
- 確認 Supabase 專案沒有被暫停
- 檢查 Supabase Dashboard 的連線狀態

### 問題 3：編譯錯誤

**解決方法**：
- 確認所有修改都已推送到 GitHub
- 檢查 Vercel 的 Build Logs 查看詳細錯誤
- 確認 `package.json` 中的依賴都正確

---

## 📝 檢查清單

完成以下項目後，部署應該會成功：

- [ ] 修復 `pages/api/debug/check-db.ts` 已提交並推送
- [ ] 在 Vercel 設定了 4 個環境變數
- [ ] 在 Supabase 執行了 `supabase-complete-schema.sql`
- [ ] 重新部署已完成
- [ ] 網站可以正常訪問

---

## 🎉 完成！

部署成功後，您會獲得一個網址，例如：
- `https://coolcool.vercel.app`
- 或您自訂的網域名稱

這個網址可以分享給客戶使用！

---

## 💡 後續維護

### 更新網站

每次修改代碼後：
1. 提交並推送到 GitHub
2. Vercel 會自動重新部署

### 查看日誌

- 在 Vercel Dashboard → 「Deployments」→ 點擊部署 → 「Functions」查看 API 日誌

### 環境變數管理

- 在 Vercel Dashboard → 「Settings」→ 「Environment Variables」管理

---

如有任何問題，請查看 Vercel 的 Build Logs 或聯繫我協助！

