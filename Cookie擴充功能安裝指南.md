# Cookie 擴充功能安裝指南

## 📦 推薦擴充功能

### 方案 1：Cookie-Editor（推薦）⭐

**優點：**
- 介面簡潔易用
- 支援多種匯出格式（JSON、Netscape、Header）
- 活躍維護，更新頻繁
- 免費開源

**安裝步驟：**

1. **開啟 Chrome 線上應用程式商店**
   - 網址：https://chrome.google.com/webstore
   - 或直接在 Chrome 網址列輸入：`chrome://extensions/`

2. **搜尋擴充功能**
   - 在搜尋框輸入：`Cookie-Editor`
   - 或直接訪問：https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm

3. **安裝擴充功能**
   - 點擊「加到 Chrome」按鈕
   - 確認安裝（點擊「新增擴充功能」）
   - 等待安裝完成

4. **確認安裝成功**
   - 瀏覽器右上角會出現 Cookie 圖示 🍪
   - 如果沒看到，點擊擴充功能圖示（拼圖圖示）→ 找到 Cookie-Editor → 點擊圖釘圖示固定

**使用方式：**

1. **開啟 Facebook**
   - 在 Chrome 中訪問 https://www.facebook.com
   - 登入您的帳號

2. **授予 Cookie-Editor 權限（重要！）**
   - 當您第一次使用 Cookie-Editor 時，會看到權限請求對話框
   - 點擊「Request permission for...」按鈕
   - 選擇「This site」（僅限當前網站，推薦）或「All sites」（所有網站）
   - 點擊「Allow」或「允許」授予權限
   - 如果沒有看到對話框，可以手動授予權限：
     - 點擊瀏覽器右上角的擴充功能圖示（拼圖圖示）
     - 找到 Cookie-Editor
     - 點擊「在 facebook.com 上可以讀取和變更網站資料」
     - 選擇「在 facebook.com 上」

3. **開啟 Cookie-Editor**
   - 點擊瀏覽器右上角的 Cookie 圖示
   - 或按 `Ctrl+Shift+E`（Windows）或 `Cmd+Shift+E`（Mac）
   - 現在應該可以看到 Facebook 的 Cookie 列表了

4. **匯出 Cookie**
   - 點擊右上角的「Export」按鈕
   - 選擇「JSON」格式
   - 點擊「Copy」複製到剪貼簿
   - 或點擊「Download」下載 JSON 檔案

4. **使用 Cookie**
   - 將複製的 JSON 字串保存到環境變數 `FACEBOOK_COOKIES`
   - 格式範例：
     ```json
     [{"name":"c_user","value":"123456789","domain":".facebook.com","path":"/","secure":true,"httpOnly":false,"sameSite":"None","expirationDate":1735689600}]
     ```

---

### 方案 2：EditThisCookie

**優點：**
- 功能完整
- 支援編輯、刪除、新增 Cookie
- 使用人數多

**安裝步驟：**

1. **開啟 Chrome 線上應用程式商店**
   - 網址：https://chrome.google.com/webstore
   - 搜尋：`EditThisCookie`

2. **安裝擴充功能**
   - 點擊「加到 Chrome」
   - 確認安裝

3. **使用方式**
   - 點擊擴充功能圖示
   - 點擊「Export」→ 選擇「JSON」
   - 複製 JSON 字串

---

### 方案 3：使用 Chrome 開發者工具（無需安裝）

如果您不想安裝擴充功能，也可以使用 Chrome 內建的開發者工具：

**步驟：**

1. **開啟 Facebook 並登入**
   - 訪問 https://www.facebook.com
   - 登入您的帳號

2. **開啟開發者工具**
   - 按 `F12` 或 `Ctrl+Shift+I`（Windows）
   - 或 `Cmd+Option+I`（Mac）

3. **切換到 Application 分頁**
   - 在開發者工具頂部，點擊「Application」分頁
   - 左側選單展開「Cookies」
   - 點擊 `https://www.facebook.com`

4. **複製 Cookie**
   - 在右側會看到所有 Cookie 列表
   - 手動複製需要的 Cookie（如 `c_user`、`xs` 等）
   - 或使用以下 JavaScript 程式碼取得所有 Cookie：

   ```javascript
   // 在 Console 分頁執行
   document.cookie.split(';').map(c => {
     const [name, value] = c.trim().split('=');
     return {name, value, domain: '.facebook.com', path: '/'};
   }).filter(c => c.name).map(c => JSON.stringify(c)).join(',\n')
   ```

5. **轉換為 JSON 格式**
   - 將取得的 Cookie 轉換為 JSON 陣列格式
   - 範例：
     ```json
     [
       {"name":"c_user","value":"123456789","domain":".facebook.com","path":"/"},
       {"name":"xs","value":"abc123...","domain":".facebook.com","path":"/"}
     ]
     ```

---

## 🔍 如何確認 Cookie 是否有效

### 檢查 Cookie 內容

有效的 Facebook Cookie 應該包含以下重要欄位：

1. **c_user** - 用戶 ID（必備）
2. **xs** - 安全 Token（必備）
3. **datr** - 設備識別碼
4. **sb** - 會話 ID

### 測試 Cookie

將 Cookie 設定到環境變數後，執行測試：

```bash
# 測試 Puppeteer 是否能使用 Cookie 登入
curl -X POST http://localhost:3000/api/facebook/scan-comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -d '{
    "usePuppeteer": true,
    "formId": "YOUR_FORM_ID"
  }'
```

如果看到以下訊息，表示 Cookie 有效：
```
[Puppeteer] ✅ 使用 Cookie 登入成功
[Puppeteer] ✅ 成功抓取 X 筆留言
```

如果看到以下訊息，表示 Cookie 無效或已過期：
```
[Puppeteer] ⚠️ Cookie 可能已過期，需要重新登入
```

---

## ⚠️ 安全注意事項

1. **不要分享 Cookie**
   - Cookie 包含您的登入資訊
   - 任何人擁有您的 Cookie 都可以登入您的帳號
   - 不要將 Cookie 提交到 Git 或分享給他人

2. **使用測試帳號**
   - 建議使用專門的測試 Facebook 帳號
   - 不要使用主要帳號的 Cookie

3. **定期更新 Cookie**
   - Cookie 會過期（通常 1-3 個月）
   - 定期檢查並更新 Cookie

4. **環境變數管理**
   - 將 Cookie 保存在 `.env.local` 檔案中
   - 確保 `.env.local` 在 `.gitignore` 中
   - 不要將 Cookie 提交到版本控制系統

---

## 🆘 常見問題

### Q1: 看到「You do not have the permission required to read the cookies for this page」？

**這是權限請求，解決方法：**

1. **點擊「Request permission for...」按鈕**
   - 選擇「This site」（僅限當前網站，推薦）
   - 或選擇「All sites」（所有網站，較方便但安全性較低）

2. **點擊「Allow」或「允許」**
   - 授予 Cookie-Editor 讀取 Cookie 的權限

3. **如果對話框消失，手動授予權限：**
   - 點擊瀏覽器右上角的擴充功能圖示（拼圖圖示）
   - 找到 Cookie-Editor
   - 點擊「在 facebook.com 上可以讀取和變更網站資料」
   - 選擇「在 facebook.com 上」

4. **重新整理頁面**
   - 按 `F5` 或 `Ctrl+R` 重新整理 Facebook 頁面
   - 再次點擊 Cookie-Editor 圖示，應該就可以看到 Cookie 了

**如果還是無法讀取：**
- 確認您已經登入 Facebook
- 確認您在 https://www.facebook.com 頁面上（不是其他子網域）
- 嘗試重新安裝擴充功能

### Q2: 找不到擴充功能圖示？

**解決方法：**
- 點擊瀏覽器右上角的擴充功能圖示（拼圖圖示）
- 找到 Cookie-Editor 或 EditThisCookie
- 點擊圖釘圖示固定到工具列

### Q2: Cookie 匯出後無法使用？

**可能原因：**
- Cookie 格式不正確
- Cookie 已過期
- 缺少必要的 Cookie 欄位

**解決方法：**
- 確認 JSON 格式正確（使用 JSON 驗證工具）
- 重新登入 Facebook 並重新匯出 Cookie
- 確認包含 `c_user` 和 `xs` 等必要欄位

### Q3: 使用 Cookie 後仍無法登入？

**可能原因：**
- Cookie 已過期
- Facebook 偵測到異常行為
- 需要處理驗證碼

**解決方法：**
- 重新取得 Cookie
- 使用非無頭模式（`headless: false`）手動處理驗證
- 降低抓取頻率

---

## 📝 完整流程範例

1. **安裝擴充功能**
   ```
   Chrome 商店 → 搜尋「Cookie-Editor」→ 安裝
   ```

2. **登入 Facebook**
   ```
   開啟 https://www.facebook.com → 登入帳號
   ```

3. **匯出 Cookie**
   ```
   點擊 Cookie-Editor 圖示 → Export → JSON → Copy
   ```

4. **設定環境變數**
   ```env
   FACEBOOK_COOKIES='[{"name":"c_user","value":"...","domain":".facebook.com"},...]'
   ```

5. **測試使用**
   ```bash
   curl -X POST http://localhost:3000/api/facebook/scan-comments \
     -H "Authorization: Bearer YOUR_SECRET" \
     -d '{"usePuppeteer": true}'
   ```

完成！現在您可以使用 Puppeteer 抓取 Facebook 留言了。

