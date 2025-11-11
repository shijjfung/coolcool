# Vercel 環境變數設定完整指南

## 📋 前置準備

在開始之前，請確認您已經：
1. ✅ 有 Vercel 帳號並已登入
2. ✅ 專案已連接到 Vercel
3. ✅ 知道您的 Supabase 專案資訊

---

## 🔍 步驟 1：取得本地環境變數

### 方法 A：從 `.env.local` 檔案讀取

1. 在專案資料夾中找到 `.env.local` 檔案
2. 用記事本打開它
3. 找到以下三個變數的值：
   ```
   DATABASE_TYPE=supabase
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 方法 B：從 Supabase Dashboard 取得

如果找不到 `.env.local`，請：

1. 前往 https://supabase.com/dashboard
2. 選擇您的專案
3. 點擊左側選單的 **Settings**（設定）
4. 點擊 **API**
5. 找到以下資訊：
   - **Project URL** → 這就是 `SUPABASE_URL`
   - **service_role** key（在 "Project API keys" 區塊）→ 這就是 `SUPABASE_SERVICE_ROLE_KEY`

---

## 🌐 步驟 2：前往 Vercel Dashboard

1. 打開瀏覽器，前往：https://vercel.com/dashboard
2. 如果還沒登入，請先登入
3. 找到您的專案（應該是 `coolcool-ten` 或類似的名稱）
4. 點擊專案名稱進入專案頁面

---

## ⚙️ 步驟 3：進入環境變數設定

1. 在專案頁面，點擊頂部選單的 **Settings**（設定）
2. 在左側選單中，點擊 **Environment Variables**（環境變數）

---

## ➕ 步驟 4：新增環境變數

您需要新增 **3 個環境變數**，請按照以下順序逐一新增：

### 變數 1：DATABASE_TYPE

1. 點擊 **Add New**（新增）按鈕
2. 在 **Key**（鍵）欄位輸入：`DATABASE_TYPE`
3. 在 **Value**（值）欄位輸入：`supabase`
4. 在 **Environment**（環境）區塊，勾選：
   - ✅ Production（生產環境）
   - ✅ Preview（預覽環境）
   - ✅ Development（開發環境）- 可選
5. 點擊 **Save**（保存）

### 變數 2：SUPABASE_URL

1. 再次點擊 **Add New**（新增）按鈕
2. 在 **Key**（鍵）欄位輸入：`SUPABASE_URL`
3. 在 **Value**（值）欄位輸入：您的 Supabase URL
   - 格式通常是：`https://xxxxx.supabase.co`
   - 從步驟 1 取得的完整 URL
4. 在 **Environment**（環境）區塊，勾選：
   - ✅ Production
   - ✅ Preview
   - ✅ Development（可選）
5. 點擊 **Save**（保存）

### 變數 3：SUPABASE_SERVICE_ROLE_KEY

1. 再次點擊 **Add New**（新增）按鈕
2. 在 **Key**（鍵）欄位輸入：`SUPABASE_SERVICE_ROLE_KEY`
3. 在 **Value**（值）欄位輸入：您的 Service Role Key
   - 這是一個很長的 JWT token
   - 格式通常是：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - 從步驟 1 取得的完整 key
4. 在 **Environment**（環境）區塊，勾選：
   - ✅ Production
   - ✅ Preview
   - ✅ Development（可選）
5. 點擊 **Save**（保存）

---

## ✅ 步驟 5：確認設定

設定完成後，您應該會看到三個環境變數：

| Key | Value（部分顯示） | Environments |
|-----|------------------|--------------|
| DATABASE_TYPE | supabase | Production, Preview |
| SUPABASE_URL | https://xxxxx.supabase.co | Production, Preview |
| SUPABASE_SERVICE_ROLE_KEY | eyJhbGci... | Production, Preview |

---

## 🔄 步驟 6：觸發重新部署

環境變數設定後，Vercel 會自動觸發重新部署。但如果您想手動觸發：

1. 前往專案的 **Deployments**（部署）頁面
2. 點擊最新部署右側的 **⋯**（三個點）
3. 選擇 **Redeploy**（重新部署）
4. 選擇 **Use existing Build Cache**（使用現有構建快取）- 可選
5. 點擊 **Redeploy**

---

## ⏱️ 步驟 7：等待部署完成

1. 等待 1-3 分鐘
2. 確認部署狀態變為 **Ready**（綠色）
3. 如果部署失敗，請查看 **Build Logs**（構建日誌）

---

## 🧪 步驟 8：測試

部署完成後，請測試：

1. 訪問：`https://coolcool-ten.vercel.app/api/health`
   - 應該返回 JSON：`{"success":true,"message":"API 路由正常工作",...}`

2. 訪問：`https://coolcool-ten.vercel.app/admin`
   - 嘗試創建表單
   - 應該不再出現 500/404 錯誤

---

## ⚠️ 常見問題

### Q1：找不到 Environment Variables 選項？

**A：** 請確認：
- 您已登入 Vercel
- 您有該專案的管理權限
- 您正在專案頁面，不是首頁

### Q2：環境變數設定後還是失敗？

**A：** 請確認：
- 所有三個變數都已設定
- 所有變數都勾選了 **Production** 和 **Preview**
- 變數值沒有多餘的空格或換行
- 已觸發重新部署

### Q3：如何確認環境變數是否生效？

**A：** 訪問 `/api/test-db` 端點（如果有的話），或查看 Vercel 構建日誌中的環境變數檢查。

### Q4：可以從本地複製環境變數嗎？

**A：** 可以！請使用 `快速複製環境變數到Vercel.bat` 批次檔，它會：
1. 讀取您的 `.env.local` 檔案
2. 顯示需要設定的變數值
3. 提供複製到 Vercel 的指引

---

## 📝 注意事項

1. **安全性**：`SUPABASE_SERVICE_ROLE_KEY` 是敏感資訊，請不要分享給他人
2. **環境選擇**：建議至少勾選 **Production** 和 **Preview**
3. **重新部署**：設定環境變數後，必須重新部署才能生效
4. **變數名稱**：請確保變數名稱完全正確（大小寫敏感）

---

## 🎯 完成後

設定完成後，請：
1. ✅ 等待 Vercel 重新部署完成
2. ✅ 測試 API 端點是否正常
3. ✅ 嘗試創建表單
4. ✅ 如果還有問題，請提供 Vercel 構建日誌

---

**祝您設定順利！** 🚀

