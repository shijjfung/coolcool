# 診斷「缺少 supabaseKey」錯誤

## 🔍 問題診斷

**Vercel 運行日誌顯示**：
```
錯誤：缺少 supabaseKey。
```

**這表示**：
- 環境變數沒有正確傳遞到運行時環境
- Supabase 客戶端無法讀取環境變數

---

## 🔧 可能的原因

### 原因 1：環境變數名稱不正確

Vercel 環境變數名稱必須完全匹配代碼中使用的名稱。

### 原因 2：環境變數沒有選擇正確的環境

環境變數必須勾選 **Production** 和 **Preview**。

### 原因 3：需要重新部署

設定環境變數後，必須重新部署才能生效。

---

## 🧪 診斷步驟

### 步驟 1：確認環境變數已正確設定

在 Vercel Dashboard 中：

1. 前往 **Settings** → **Environment Variables**
2. 確認以下三個變數都已設定：
   - `DATABASE_TYPE` = `supabase`
   - `SUPABASE_URL` = `https://ceazouzwbvcfwudcbbnk.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = （完整 key）

3. **重要**：確認每個變數都勾選了：
   - ✅ **Production**
   - ✅ **Preview**

### 步驟 2：確認變數名稱完全正確

變數名稱必須完全匹配（區分大小寫）：
- ✅ `SUPABASE_URL`（正確）
- ❌ `SUPABASE_URL_`（錯誤，多了一個底線）
- ❌ `supabase_url`（錯誤，應該是大寫）

### 步驟 3：重新部署

設定環境變數後，必須重新部署：

1. 前往 **Deployments** 頁面
2. 點擊最新部署右側的 **⋯**
3. 選擇 **Redeploy**
4. **不要勾選** "Use existing Build Cache"
5. 點擊 **Redeploy**

---

## 🔧 解決方案

### 方案 1：重新檢查環境變數設定

1. 前往 Vercel Dashboard
2. 前往 **Settings** → **Environment Variables**
3. 檢查每個變數：
   - 名稱是否完全正確
   - 值是否完整（沒有多餘空格）
   - 是否勾選了 **Production** 和 **Preview**

### 方案 2：刪除並重新創建環境變數

如果環境變數設定有問題：

1. 刪除現有的環境變數
2. 重新創建，確保：
   - 名稱完全正確
   - 值完整
   - 勾選 **Production** 和 **Preview**

### 方案 3：使用測試端點確認環境變數

訪問：`https://coolcool-ten.vercel.app/api/test-db`

應該返回環境變數檢查結果。

---

## 📝 需要確認的事項

請確認：

1. ✅ `SUPABASE_URL` 環境變數已設定
2. ✅ `SUPABASE_SERVICE_ROLE_KEY` 環境變數已設定
3. ✅ 兩個變數都勾選了 **Production** 和 **Preview**
4. ✅ 變數名稱完全正確（沒有多餘空格或錯誤）
5. ✅ 已重新部署（設定環境變數後）

---

## 🎯 下一步

請執行以下操作：

1. ✅ 前往 Vercel Dashboard → Settings → Environment Variables
2. ✅ 確認所有環境變數都已正確設定
3. ✅ 確認每個變數都勾選了 **Production** 和 **Preview**
4. ✅ 手動觸發重新部署（清除快取）
5. ✅ 等待部署完成後測試

---

**問題是環境變數沒有正確傳遞到運行時！請重新檢查環境變數設定！** 🔍

