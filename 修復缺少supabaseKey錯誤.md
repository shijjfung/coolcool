# 修復「缺少 supabaseKey」錯誤

## 🔍 問題診斷

**Vercel 運行日誌顯示**：
```
錯誤：缺少 supabaseKey。
```

**這表示**：
- 環境變數沒有正確傳遞到運行時環境
- Supabase 客戶端無法讀取環境變數

---

## 🔧 解決方案

### 步驟 1：確認環境變數已正確設定

在 Vercel Dashboard 中：

1. 前往 **Settings** → **Environment Variables**
2. 確認以下三個變數都已設定：

   **變數 1：DATABASE_TYPE**
   - Key: `DATABASE_TYPE`
   - Value: `supabase`
   - Environments: ✅ Production, ✅ Preview

   **變數 2：SUPABASE_URL**
   - Key: `SUPABASE_URL`
   - Value: `https://ceazouzwbvcfwudcbbnk.supabase.co`
   - Environments: ✅ Production, ✅ Preview

   **變數 3：SUPABASE_SERVICE_ROLE_KEY**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYXpvdXp3YnZjZnd1ZGNiYm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5NTg2NiwiZXhwIjoyMDc4MjcxODY2fQ.8faMxUMEjbNUaGTDgkxUr2Rl3BRZEwIxDHuvFSWjd_M`
   - Environments: ✅ Production, ✅ Preview

### 步驟 2：確認變數名稱完全正確

**重要**：變數名稱必須完全匹配（區分大小寫）：
- ✅ `SUPABASE_URL`（正確）
- ✅ `SUPABASE_SERVICE_ROLE_KEY`（正確）
- ❌ `SUPABASE_URL_`（錯誤，多了一個底線）
- ❌ `supabase_url`（錯誤，應該是大寫）

### 步驟 3：確認每個變數都勾選了正確的環境

**必須勾選**：
- ✅ **Production**（生產環境）
- ✅ **Preview**（預覽環境）

**如果只勾選了 Development**：
- ❌ 環境變數不會傳遞到生產環境
- ❌ 會導致「缺少 supabaseKey」錯誤

### 步驟 4：重新部署

設定環境變數後，**必須重新部署**才能生效：

1. 前往 **Deployments** 頁面
2. 點擊最新部署右側的 **⋯**
3. 選擇 **Redeploy**
4. **不要勾選** "Use existing Build Cache"
5. 點擊 **Redeploy**
6. 等待部署完成（1-3 分鐘）

---

## 🧪 測試步驟

### 測試 1：檢查環境變數

訪問：`https://coolcool-ten.vercel.app/api/test-db`

應該返回：
```json
{
  "success": true,
  "message": "資料庫連線正常",
  "environment": {
    "DATABASE_TYPE": "supabase",
    "SUPABASE_URL": "✅ 已設定",
    "SUPABASE_SERVICE_ROLE_KEY": "✅ 已設定"
  }
}
```

### 測試 2：測試表單列表

訪問：`https://coolcool-ten.vercel.app/api/forms/list`

**如果環境變數正確**：
- 應該返回 JSON（可能是空陣列 `[]`）

**如果環境變數未設定**：
- 應該返回 JSON 錯誤訊息（不是 HTML）

---

## ⚠️ 常見問題

### Q1：環境變數已設定但還是失敗？

**請確認**：
- ✅ 變數名稱完全正確（區分大小寫）
- ✅ 每個變數都勾選了 **Production** 和 **Preview**
- ✅ 值沒有多餘的空格
- ✅ 已重新部署（設定環境變數後）

### Q2：如何確認環境變數是否生效？

**方法 1**：訪問 `/api/test-db`
- 應該顯示所有環境變數都已設定

**方法 2**：查看 Vercel 函數日誌
- 不應該再看到「缺少 supabaseKey」錯誤

---

## 🎯 下一步

請執行以下操作：

1. ✅ 前往 Vercel Dashboard → Settings → Environment Variables
2. ✅ 確認所有三個變數都已設定
3. ✅ 確認每個變數都勾選了 **Production** 和 **Preview**
4. ✅ 手動觸發重新部署（清除快取）
5. ✅ 等待部署完成後測試

---

**問題是環境變數沒有正確傳遞到運行時！請重新檢查環境變數設定！** 🔍

