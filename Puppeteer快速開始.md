# Puppeteer Facebook 留言抓取 - 快速開始

## 🚀 5 分鐘快速設定

### 方法 A：使用批次檔（Windows，最簡單）⭐

1. **取得 Cookie**
   - 使用 Cookie-Editor 擴充功能匯出 Cookie
   - 或執行 `取得FacebookCookie.bat` 自動取得

2. **設定環境變數**
   - 執行 `設定Cookie環境變數.bat`
   - 貼上 Cookie JSON 字串

3. **測試**
   - 執行 `啟動開發伺服器.bat`（保持運行）
   - 執行 `測試Puppeteer.bat` 測試

詳細說明請參考：`README_批次檔使用說明.md`

---

### 方法 B：手動設定

### 步驟 1：安裝依賴（已完成）

```bash
npm install
```

### 步驟 2：取得 Facebook Cookie

#### 方法 A：使用瀏覽器擴充功能（最簡單）

**步驟 1：安裝 Chrome 擴充功能**

有兩種擴充功能可以選擇：

**選項 1：Cookie-Editor（推薦）**
1. 開啟 Chrome 瀏覽器
2. 前往 Chrome 線上應用程式商店：https://chrome.google.com/webstore
3. 搜尋「Cookie-Editor」
4. 點擊「加到 Chrome」→「新增擴充功能」
5. 安裝完成後，瀏覽器右上角會出現 Cookie 圖示

**選項 2：EditThisCookie**
1. 開啟 Chrome 瀏覽器
2. 前往 Chrome 線上應用程式商店：https://chrome.google.com/webstore
3. 搜尋「EditThisCookie」
4. 點擊「加到 Chrome」→「新增擴充功能」
5. 安裝完成後，瀏覽器右上角會出現 Cookie 圖示

**步驟 2：登入 Facebook**
1. 在 Chrome 中開啟 https://www.facebook.com
2. 登入您的 Facebook 帳號（建議使用測試帳號）

**步驟 3：匯出 Cookie**
1. 點擊瀏覽器右上角的擴充功能圖示（Cookie 圖示）
2. 找到「Export」或「匯出」按鈕
3. 選擇「JSON」格式
4. 點擊「Copy」或「複製」按鈕
5. 您會得到一個 JSON 字串，類似這樣：
   ```json
   [{"name":"c_user","value":"123456789","domain":".facebook.com","path":"/","secure":true,"httpOnly":false,"sameSite":"None","expirationDate":1234567890},...]
   ```

**步驟 4：保存 Cookie**
將複製的 JSON 字串保存到環境變數 `FACEBOOK_COOKIES`（見步驟 3）

#### 方法 B：使用 API（需要提供帳號密碼）

```bash
curl -X POST http://localhost:3000/api/facebook/get-cookies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

### 步驟 3：設定環境變數

在 `.env.local` 或環境變數中設定：

```env
# 啟用 Puppeteer 模式
FACEBOOK_USE_PUPPETEER=true

# Facebook Cookie（從步驟 2 取得）
FACEBOOK_COOKIES='[{"name":"c_user","value":"...","domain":".facebook.com"},...]'

# 可選設定
FACEBOOK_PUPPETEER_HEADLESS=true   # false = 顯示瀏覽器（用於除錯）
FACEBOOK_PUPPETEER_TIMEOUT=60000   # 超時時間（毫秒）
```

### 步驟 4：測試執行

```bash
# 啟動開發伺服器
npm run dev

# 在另一個終端機執行測試
curl -X POST http://localhost:3000/api/facebook/scan-comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -d '{
    "usePuppeteer": true
  }'
```

## 📝 完整設定指南

詳細說明請參考：`Puppeteer設定指南.md`

## ⚠️ 重要提醒

1. **使用測試帳號**：不要使用主要 Facebook 帳號
2. **Cookie 安全**：不要將 Cookie 提交到 Git
3. **遵守條款**：使用自動化工具可能違反 Facebook 服務條款
4. **定期更新**：Cookie 會過期，需要定期重新取得

## 🆘 遇到問題？

- 查看 `Puppeteer設定指南.md` 的「常見問題」章節
- 檢查 Console 日誌
- 設定 `FACEBOOK_PUPPETEER_HEADLESS=false` 查看瀏覽器行為

