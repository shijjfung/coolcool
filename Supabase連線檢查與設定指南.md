# Supabase 連線檢查與設定指南

## 🔍 問題診斷：為什麼資料沒有寫入雲端資料庫？

可能的原因：
1. ❌ `DATABASE_TYPE` 環境變數沒有設定為 `supabase`（預設是 `sqlite`）
2. ❌ Supabase 環境變數沒有正確設定
3. ❌ 資料庫結構沒有建立
4. ❌ Vercel 環境變數沒有設定

---

## ✅ 解決步驟

### 步驟 1：檢查 Vercel 環境變數

在 **Vercel Dashboard** 中：

1. 進入您的專案
2. 點擊 **Settings** → **Environment Variables**
3. 確認以下變數都已設定：

#### 必須設定的環境變數：

| 變數名稱 | 值 | 說明 |
|---------|-----|------|
| `DATABASE_TYPE` | `supabase` | **重要！** 必須是 `supabase`，不是 `sqlite` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | 從 Supabase Dashboard 取得 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | 從 Supabase Dashboard 取得 |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | 從 Supabase Dashboard 取得（**重要！**） |

#### 如何取得 Supabase 環境變數：

1. 登入 [Supabase Dashboard](https://app.supabase.com)
2. 選擇您的專案
3. 點擊 **Settings** → **API**
4. 複製以下值：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **保密！不要公開**

#### 在 Vercel 設定環境變數：

1. 在 Vercel Dashboard → Settings → Environment Variables
2. 點擊 **Add New**
3. 輸入變數名稱和值
4. **重要：** 選擇所有環境（Production, Preview, Development）
5. 點擊 **Save**

---

### 步驟 2：在 Supabase 建立資料庫結構

1. 登入 [Supabase Dashboard](https://app.supabase.com)
2. 選擇您的專案
3. 點擊左側 **SQL Editor**
4. 點擊 **New Query**
5. 複製 `supabase-complete-schema.sql` 的**全部內容**
6. 貼上到 SQL Editor
7. 點擊 **Run** 或按 `Ctrl+Enter`（Windows）或 `Cmd+Enter`（Mac）
8. 確認執行成功（應該看到 "Success. No rows returned"）

---

### 步驟 3：驗證環境變數設定

#### 方法 1：檢查 Vercel 部署日誌

1. 在 Vercel Dashboard → Deployments
2. 點擊最新的部署
3. 查看 **Build Logs**
4. 搜尋以下關鍵字：
   - `DATABASE_TYPE`
   - `Supabase`
   - `環境變數未設定`

#### 方法 2：建立測試 API 端點

我已經為您建立了一個測試端點，可以檢查環境變數設定。

訪問：`https://您的網址.vercel.app/api/debug/check-env`

---

### 步驟 4：重新部署

設定完環境變數後：

1. 在 Vercel Dashboard → Deployments
2. 點擊最新的部署右側的 **⋯**（三個點）
3. 選擇 **Redeploy**
4. 確認勾選 **Use existing Build Cache**
5. 點擊 **Redeploy**

或者：

1. 推送一個小變更到 GitHub（例如修改 README）
2. Vercel 會自動重新部署

---

## 🔧 建立測試 API 端點

讓我為您建立一個測試端點來檢查環境變數：

