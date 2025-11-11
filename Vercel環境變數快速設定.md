# Vercel 環境變數快速設定

## 📋 您的 Supabase 環境變數

以下是您需要設定到 Vercel 的三個環境變數：

### 變數 1：DATABASE_TYPE
```
supabase
```

### 變數 2：SUPABASE_URL
```
https://ceazouzwbvcfwudcbbnk.supabase.co
```

### 變數 3：SUPABASE_SERVICE_ROLE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYXpvdXp3YnZjZnd1ZGNiYm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5NTg2NiwiZXhwIjoyMDc4MjcxODY2fQ.8faMxUMEjbNUaGTDgkxUr2Rl3BRZEwIxDHuvFSWjd_M
```

---

## 🌐 設定步驟

### 步驟 1：前往 Vercel Dashboard

1. 打開瀏覽器，前往：**https://vercel.com/dashboard**
2. 如果還沒登入，請先登入
3. 找到您的專案（應該是 `coolcool-ten` 或類似的名稱）
4. **點擊專案名稱**進入專案頁面

### 步驟 2：進入環境變數設定

1. 在專案頁面，點擊頂部選單的 **Settings**（設定）
2. 在左側選單中，點擊 **Environment Variables**（環境變數）

### 步驟 3：新增環境變數

您需要新增 **3 個環境變數**，請按照以下順序逐一新增：

---

#### 🔹 變數 1：DATABASE_TYPE

1. 點擊 **Add New**（新增）按鈕
2. 在 **Key**（鍵）欄位輸入：
   ```
   DATABASE_TYPE
   ```
3. 在 **Value**（值）欄位輸入：
   ```
   supabase
   ```
4. 在 **Environment**（環境）區塊，勾選：
   - ✅ **Production**（生產環境）
   - ✅ **Preview**（預覽環境）
5. 點擊 **Save**（保存）

---

#### 🔹 變數 2：SUPABASE_URL

1. 再次點擊 **Add New**（新增）按鈕
2. 在 **Key**（鍵）欄位輸入：
   ```
   SUPABASE_URL
   ```
3. 在 **Value**（值）欄位輸入：
   ```
   https://ceazouzwbvcfwudcbbnk.supabase.co
   ```
4. 在 **Environment**（環境）區塊，勾選：
   - ✅ **Production**
   - ✅ **Preview**
5. 點擊 **Save**（保存）

---

#### 🔹 變數 3：SUPABASE_SERVICE_ROLE_KEY

1. 再次點擊 **Add New**（新增）按鈕
2. 在 **Key**（鍵）欄位輸入：
   ```
   SUPABASE_SERVICE_ROLE_KEY
   ```
3. 在 **Value**（值）欄位輸入：
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYXpvdXp3YnZjZnd1ZGNiYm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5NTg2NiwiZXhwIjoyMDc4MjcxODY2fQ.8faMxUMEjbNUaGTDgkxUr2Rl3BRZEwIxDHuvFSWjd_M
   ```
   ⚠️ **重要**：請完整複製整個 key，不要遺漏任何字元
4. 在 **Environment**（環境）區塊，勾選：
   - ✅ **Production**
   - ✅ **Preview**
5. 點擊 **Save**（保存）

---

## ✅ 步驟 4：確認設定

設定完成後，您應該會看到三個環境變數：

| Key | Value（部分顯示） | Environments |
|-----|------------------|--------------|
| DATABASE_TYPE | supabase | Production, Preview |
| SUPABASE_URL | https://ceazouzwbvcfwudcbbnk.supabase.co | Production, Preview |
| SUPABASE_SERVICE_ROLE_KEY | eyJhbGci... | Production, Preview |

---

## 🔄 步驟 5：等待重新部署

環境變數設定後，Vercel 會**自動觸發重新部署**。

1. 前往專案的 **Deployments**（部署）頁面
2. 您應該會看到一個新的部署正在進行
3. 等待 **1-3 分鐘**
4. 確認部署狀態變為 **Ready**（綠色）

---

## 🧪 步驟 6：測試

部署完成後，請測試：

### 測試 1：健康檢查
訪問：`https://coolcool-ten.vercel.app/api/health`

應該返回 JSON：
```json
{
  "success": true,
  "message": "API 路由正常工作",
  "timestamp": "...",
  "environment": "production"
}
```

### 測試 2：創建表單
1. 訪問：`https://coolcool-ten.vercel.app/admin`
2. 嘗試創建表單
3. 應該不再出現 500/404 錯誤
4. 表單應該能成功創建

---

## ⚠️ 常見問題

### Q1：環境變數設定後還是失敗？

**請確認：**
- ✅ 所有三個變數都已設定
- ✅ 所有變數都勾選了 **Production** 和 **Preview**
- ✅ 變數值沒有多餘的空格或換行
- ✅ `SUPABASE_SERVICE_ROLE_KEY` 已完整複製（很長的字串）
- ✅ 已等待 Vercel 重新部署完成

### Q2：如何確認環境變數是否生效？

**方法 1：查看 Vercel 構建日誌**
1. 前往 Vercel Dashboard
2. 點擊最新部署
3. 查看 Build Logs（構建日誌）
4. 應該沒有環境變數相關的錯誤

**方法 2：測試 API**
訪問 `/api/health` 或 `/api/test-db`，應該返回成功訊息。

### Q3：可以手動觸發重新部署嗎？

**可以！**
1. 前往專案的 **Deployments**（部署）頁面
2. 點擊最新部署右側的 **⋯**（三個點）
3. 選擇 **Redeploy**（重新部署）
4. 選擇 **Use existing Build Cache**（使用現有構建快取）- 可選
5. 點擊 **Redeploy**

---

## 📝 注意事項

1. **安全性**：
   - `SUPABASE_SERVICE_ROLE_KEY` 是敏感資訊
   - 請不要分享給他人
   - 如果洩露，請立即在 Supabase Dashboard 中重新生成

2. **環境選擇**：
   - 建議至少勾選 **Production** 和 **Preview**
   - 這樣無論是生產環境還是預覽環境都能正常運作

3. **重新部署**：
   - 設定環境變數後，必須重新部署才能生效
   - Vercel 通常會自動觸發，但也可以手動觸發

4. **變數名稱**：
   - 請確保變數名稱完全正確（大小寫敏感）
   - `DATABASE_TYPE`、`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`

---

## 🎯 完成後

設定完成後，請：
1. ✅ 等待 Vercel 重新部署完成（1-3 分鐘）
2. ✅ 測試 API 端點是否正常
3. ✅ 嘗試創建表單
4. ✅ 如果還有問題，請提供 Vercel 構建日誌

---

**祝您設定順利！** 🚀

