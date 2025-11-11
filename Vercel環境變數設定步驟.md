# Vercel 環境變數設定步驟（圖解）

## 📋 您目前的狀態

您已經在 Vercel Dashboard 的 Environment Variables 頁面，並且已經填寫了三個變數的值。現在需要**逐一創建**這些變數。

---

## 🔧 設定步驟（逐一創建）

### 變數 1：DATABASE_TYPE

1. **點擊 "Create new" 按鈕**（在頁面右上角或變數列表上方）

2. 在彈出的表單中：
   - **Key（鍵）**：輸入 `DATABASE_TYPE`
   - **Value（值）**：輸入 `supabase`

3. **選擇環境（Environments）**：
   - ✅ 勾選 **Production**
   - ✅ 勾選 **Preview**
   - ⬜ Development（可選，不勾選也可以）

4. **點擊 "Save" 或 "Add" 按鈕**

5. 確認變數已出現在列表中

---

### 變數 2：SUPABASE_URL

1. **再次點擊 "Create new" 按鈕**

2. 在彈出的表單中：
   - **Key（鍵）**：輸入 `SUPABASE_URL`
   - **Value（值）**：輸入 `https://ceazouzwbvcfwudcbbnk.supabase.co`

3. **選擇環境（Environments）**：
   - ✅ 勾選 **Production**
   - ✅ 勾選 **Preview**

4. **點擊 "Save" 或 "Add" 按鈕**

5. 確認變數已出現在列表中

---

### 變數 3：SUPABASE_SERVICE_ROLE_KEY

1. **再次點擊 "Create new" 按鈕**

2. 在彈出的表單中：
   - **Key（鍵）**：輸入 `SUPABASE_SERVICE_ROLE_KEY`
   - **Value（值）**：輸入以下完整 key：
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYXpvdXp3YnZjZnd1ZGNiYm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5NTg2NiwiZXhwIjoyMDc4MjcxODY2fQ.8faMxUMEjbNUaGTDgkxUr2Rl3BRZEwIxDHuvFSWjd_M
     ```
     ⚠️ **重要**：請完整複製整個 key，不要遺漏任何字元

3. **選擇環境（Environments）**：
   - ✅ 勾選 **Production**
   - ✅ 勾選 **Preview**

4. **點擊 "Save" 或 "Add" 按鈕**

5. 確認變數已出現在列表中

---

## ✅ 確認設定完成

設定完成後，您應該會看到三個環境變數：

| Key | Value（部分顯示） | Environments |
|-----|------------------|--------------|
| DATABASE_TYPE | supabase | Production, Preview |
| SUPABASE_URL | https://ceazouzwbvcfwudcbbnk.supabase.co | Production, Preview |
| SUPABASE_SERVICE_ROLE_KEY | eyJhbGci... | Production, Preview |

---

## 🔄 觸發重新部署

環境變數設定後，Vercel 會**自動觸發重新部署**。

1. 前往專案的 **Deployments**（部署）頁面
2. 您應該會看到一個新的部署正在進行
3. 等待 **1-3 分鐘**
4. 確認部署狀態變為 **Ready**（綠色）

---

## 🧪 測試

部署完成後，請測試：

### 測試 1：表單列表 API
訪問：`https://coolcool-ten.vercel.app/api/forms/list`

**如果環境變數已正確設定**，應該返回：
```json
[]
```
（空陣列，因為還沒有表單）

**如果環境變數未設定或設定錯誤**，應該返回：
```json
{
  "error": "資料庫初始化失敗",
  "details": "SUPABASE_URL 環境變數未設定...",
  "hint": "請檢查 Supabase 環境變數設定..."
}
```
（JSON 錯誤訊息，不是 HTML）

### 測試 2：創建表單
1. 訪問：`https://coolcool-ten.vercel.app/admin`
2. 嘗試創建表單
3. 應該不再出現 500/404 錯誤
4. 表單應該能成功創建

---

## ⚠️ 常見問題

### Q1：點擊 "Create new" 沒有反應？

**解決方案**：
- 確認您有專案的管理權限
- 嘗試重新整理頁面
- 檢查瀏覽器控制台是否有錯誤

### Q2：保存後變數沒有出現？

**解決方案**：
- 確認 Key 名稱完全正確（大小寫敏感）
- 確認已選擇至少一個環境（Production 或 Preview）
- 重新整理頁面查看

### Q3：環境變數設定後還是失敗？

**請確認**：
- ✅ 所有三個變數都已創建
- ✅ 所有變數都勾選了 **Production** 和 **Preview**
- ✅ 變數值沒有多餘的空格或換行
- ✅ `SUPABASE_SERVICE_ROLE_KEY` 已完整複製（很長的字串）
- ✅ 已等待 Vercel 重新部署完成

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

**完成設定後，請告訴我結果！** 🚀

