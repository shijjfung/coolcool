# Facebook Cookie 自動刷新功能

## 🎯 功能說明

由於 Facebook Cookie 通常有效 **1-3 個月**就會過期，我們建立了自動刷新 Cookie 的功能，可以：

1. ✅ **自動檢測 Cookie 是否過期**
2. ✅ **自動使用帳號密碼重新取得 Cookie**
3. ✅ **自動更新 `.env.local` 檔案**
4. ✅ **支援定時任務（Cron Job）自動執行**

---

## 🚀 快速開始

### 步驟 1：設定 Facebook 帳號密碼

在 `.env.local` 檔案中加入：

```env
# Facebook 帳號密碼（用於自動刷新 Cookie）
FACEBOOK_EMAIL=your-email@example.com
FACEBOOK_PASSWORD=your-password
```

**⚠️ 安全提醒：**
- 建議使用**測試帳號**，不要使用主要帳號
- 不要將 `.env.local` 上傳到 Git
- 定期檢查帳號安全

---

### 步驟 2：測試自動刷新功能

#### 方法 1：使用批次檔（推薦）

執行：
```
自動刷新Cookie.bat
```

#### 方法 2：使用 API

```bash
curl -X POST http://localhost:3000/api/facebook/auto-refresh-cookie \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -d '{}'
```

#### 方法 3：使用 PowerShell

```powershell
$body = '{}'
Invoke-RestMethod -Uri "http://localhost:3000/api/facebook/auto-refresh-cookie" `
  -Method Post `
  -Body $body `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer YOUR_CRON_SECRET"}
```

---

### 步驟 3：設定定時任務（自動執行）

#### 方法 1：使用 Vercel Cron Jobs（如果部署在 Vercel）

在 `vercel.json` 中設定：

```json
{
  "crons": [
    {
      "path": "/api/facebook/auto-refresh-cookie",
      "schedule": "0 0 * * 0"
    }
  ]
}
```

這會每週日執行一次（檢查並更新 Cookie）。

#### 方法 2：使用外部 Cron 服務（如 cron-job.org）

1. 註冊 cron-job.org 帳號
2. 建立新的 Cron Job：
   - **URL**: `https://您的網址/api/facebook/auto-refresh-cookie`
   - **方法**: `POST`
   - **頻率**: 每週一次（建議每週日）
   - **Headers**（如果設定了 CRON_SECRET）:
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```
   - **Body**: `{}`

#### 方法 3：使用 Windows 工作排程器（本地開發）

1. 開啟「工作排程器」
2. 建立基本工作
3. 設定：
   - **名稱**: Facebook Cookie 自動刷新
   - **觸發程序**: 每週
   - **動作**: 啟動程式
   - **程式**: `自動刷新Cookie.bat` 的完整路徑

---

## 🔍 工作原理

### 1. 檢查 Cookie 是否過期

系統會檢查：
- Cookie 中的 `expirationDate` 或 `expires` 欄位
- 如果任何重要 Cookie（`c_user`、`xs`）已過期 → 需要更新
- 如果過期時間在 7 天內 → 需要更新

### 2. 自動取得新 Cookie

如果 Cookie 過期，系統會：
1. 使用 Puppeteer 啟動瀏覽器
2. 使用設定的帳號密碼登入 Facebook
3. 取得新的 Cookie
4. 自動更新 `.env.local` 檔案

### 3. 更新環境變數

系統會：
- 自動更新 `.env.local` 中的 `FACEBOOK_COOKIES`
- 保留其他環境變數不變
- 添加註解說明這是自動更新的

---

## 📋 API 說明

### 端點

```
POST /api/facebook/auto-refresh-cookie
```

### 請求 Headers

```
Authorization: Bearer YOUR_CRON_SECRET  # 可選，但建議設定
Content-Type: application/json
```

### 請求 Body（可選）

如果沒有在環境變數中設定帳號密碼，可以在請求中提供：

```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

### 回應範例

**成功（Cookie 仍然有效）：**
```json
{
  "success": true,
  "message": "Cookie 仍然有效，無需更新",
  "refreshed": false
}
```

**成功（Cookie 已更新）：**
```json
{
  "success": true,
  "message": "Cookie 已成功更新",
  "refreshed": true,
  "hint": "請重新啟動開發伺服器以載入新的 Cookie"
}
```

**失敗：**
```json
{
  "error": "缺少必要參數",
  "hint": "請設定環境變數 FACEBOOK_EMAIL 和 FACEBOOK_PASSWORD"
}
```

---

## ⚙️ 環境變數設定

### 必需的環境變數

```env
# Facebook 帳號密碼（用於自動刷新 Cookie）
FACEBOOK_EMAIL=your-email@example.com
FACEBOOK_PASSWORD=your-password
```

### 可選的環境變數

```env
# Cron Secret（用於保護 API，建議設定）
CRON_SECRET=your-secret-key
```

---

## 🔒 安全注意事項

### 1. 帳號安全

- ✅ **使用測試帳號**，不要使用主要帳號
- ✅ **定期檢查帳號安全**，確保沒有異常登入
- ✅ **啟用雙因素驗證**（如果可能）

### 2. 密碼安全

- ✅ **不要將密碼上傳到 Git**
- ✅ **不要分享 `.env.local` 檔案**
- ✅ **定期更換密碼**

### 3. API 安全

- ✅ **設定 `CRON_SECRET`** 保護 API
- ✅ **只在安全環境下使用**（HTTPS）
- ✅ **限制 API 訪問來源**（如果可能）

---

## 🆘 常見問題

### Q1: 自動刷新失敗怎麼辦？

**可能原因：**
- 帳號密碼錯誤
- 需要處理驗證碼
- Facebook 偵測到自動化行為

**解決方法：**
1. 檢查帳號密碼是否正確
2. 手動登入 Facebook 確認帳號正常
3. 如果被要求驗證，先手動完成驗證
4. 使用 Cookie-Editor 手動取得 Cookie

### Q2: 如何知道 Cookie 是否已更新？

**檢查方法：**
1. 查看 `.env.local` 檔案的修改時間
2. 查看 API 回應訊息
3. 查看開發伺服器 Console 日誌

### Q3: 更新 Cookie 後需要重新啟動伺服器嗎？

**是的**，需要重新啟動開發伺服器才能載入新的環境變數。

### Q4: 可以手動觸發刷新嗎？

**可以**，執行 `自動刷新Cookie.bat` 或直接呼叫 API。

### Q5: 多久執行一次比較好？

**建議：**
- 每週執行一次（檢查並更新）
- 或每月執行一次（如果 Cookie 有效期較長）

---

## 📝 批次檔說明

### 自動刷新Cookie.bat

這個批次檔會：
1. 檢查環境變數是否設定
2. 呼叫 API 自動刷新 Cookie
3. 顯示結果

**使用方式：**
```
自動刷新Cookie.bat
```

---

## ✅ 最佳實踐

1. ✅ **使用測試帳號**，不要使用主要帳號
2. ✅ **設定定時任務**，每週自動檢查一次
3. ✅ **監控執行結果**，確保 Cookie 正常更新
4. ✅ **定期檢查帳號安全**，確保沒有異常
5. ✅ **備份 Cookie**，以防自動刷新失敗

---

## 🎯 總結

現在您可以：
- ✅ 自動檢測 Cookie 是否過期
- ✅ 自動使用帳號密碼重新取得 Cookie
- ✅ 自動更新環境變數
- ✅ 設定定時任務自動執行

**不再需要手動更新 Cookie！** 🎉

