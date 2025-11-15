# 批次檔使用說明

本專案提供了多個 Windows 批次檔（.bat）來簡化 Puppeteer Facebook 留言抓取的設定和使用。

## 📁 批次檔列表

### 1. `取得FacebookCookie.bat`
**用途：** 使用 Puppeteer 自動登入 Facebook 並取得 Cookie

**使用方式：**
1. 雙擊執行批次檔
2. 輸入 Facebook 帳號和密碼（或設定環境變數）
3. 等待瀏覽器開啟並完成登入
4. 複製輸出的 Cookie JSON 字串

**注意事項：**
- 會開啟瀏覽器視窗，需要手動完成登入（如果需要驗證碼）
- 建議使用測試帳號
- Cookie 會顯示在終端機中，請妥善保存

---

### 2. `設定Cookie環境變數.bat`
**用途：** 將從 Cookie-Editor 複製的 Cookie 設定到 `.env.local` 檔案

**使用方式：**
1. 先使用 Cookie-Editor 擴充功能匯出 Cookie（JSON 格式）
2. 雙擊執行批次檔
3. 貼上 Cookie JSON 字串（按 Ctrl+Z 結束輸入）
4. 批次檔會自動寫入 `.env.local`

**自動設定：**
- `FACEBOOK_COOKIES` - Cookie JSON 字串
- `FACEBOOK_USE_PUPPETEER=true` - 啟用 Puppeteer 模式

---

### 3. `測試Puppeteer.bat`
**用途：** 測試 Puppeteer 設定是否正常運作

**使用方式：**
1. 確保已設定 Cookie（執行「設定Cookie環境變數.bat」）
2. 確保開發伺服器正在運行（執行「啟動開發伺服器.bat」）
3. 雙擊執行批次檔
4. 查看測試結果

**檢查項目：**
- Cookie 是否有效
- Puppeteer 是否能正常啟動
- 是否能成功抓取留言

---

### 4. `啟動開發伺服器.bat`
**用途：** 啟動 Next.js 開發伺服器

**使用方式：**
1. 雙擊執行批次檔
2. 等待伺服器啟動（通常在 http://localhost:3000）
3. 按 Ctrl+C 可以停止伺服器

**自動功能：**
- 如果沒有 `node_modules`，會自動執行 `npm install`

---

## 🚀 完整使用流程

### 第一次設定

1. **安裝依賴**
   ```bash
   npm install
   ```

2. **取得 Cookie（選擇其中一種方法）**

   **方法 A：使用 Cookie-Editor（推薦）**
   - 安裝 Chrome 擴充功能「Cookie-Editor」
   - 登入 Facebook
   - 匯出 Cookie（JSON 格式）
   - 執行「設定Cookie環境變數.bat」
   - 貼上 Cookie JSON

   **方法 B：使用批次檔自動取得**
   - 執行「取得FacebookCookie.bat」
   - 輸入帳號密碼
   - 複製輸出的 Cookie
   - 執行「設定Cookie環境變數.bat」
   - 貼上 Cookie

3. **測試設定**
   - 執行「啟動開發伺服器.bat」（保持運行）
   - 在另一個終端機執行「測試Puppeteer.bat」
   - 檢查是否成功

### 日常使用

1. **啟動伺服器**
   - 執行「啟動開發伺服器.bat」

2. **執行掃描**
   - 使用 Cron Job 自動執行
   - 或手動呼叫 API：
     ```bash
     curl -X POST http://localhost:3000/api/facebook/scan-comments \
       -H "Authorization: Bearer YOUR_SECRET" \
       -d "{\"usePuppeteer\": true}"
     ```

---

## ⚙️ 環境變數說明

批次檔會自動設定以下環境變數到 `.env.local`：

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `FACEBOOK_COOKIES` | Facebook Cookie JSON 字串 | `[{"name":"c_user",...}]` |
| `FACEBOOK_USE_PUPPETEER` | 是否使用 Puppeteer 模式 | `true` |
| `FACEBOOK_PUPPETEER_HEADLESS` | 是否使用無頭模式 | `true`（可選） |
| `FACEBOOK_PUPPETEER_TIMEOUT` | 超時時間（毫秒） | `60000`（可選） |

---

## 🆘 常見問題

### Q1: 批次檔執行時出現亂碼？

**解決方法：**
- 批次檔已設定 UTF-8 編碼（`chcp 65001`）
- 如果還是亂碼，請確認終端機字型支援 UTF-8

### Q2: 找不到 Node.js？

**解決方法：**
- 安裝 Node.js：https://nodejs.org/
- 確認 Node.js 已加入系統 PATH
- 重新開啟終端機

### Q3: Cookie 設定後仍無法使用？

**檢查項目：**
1. Cookie 是否已過期（重新取得）
2. `.env.local` 檔案格式是否正確
3. 開發伺服器是否已重新啟動（載入新環境變數）

### Q4: 測試時連線被拒絕？

**解決方法：**
- 確認開發伺服器正在運行
- 檢查是否在 `http://localhost:3000`
- 確認防火牆沒有阻擋

---

## 📝 注意事項

1. **安全性**
   - Cookie 包含登入資訊，請妥善保管
   - 不要將 `.env.local` 提交到 Git
   - 建議使用測試帳號

2. **Cookie 有效期**
   - Cookie 通常有效 1-3 個月
   - 過期後需要重新取得
   - 建議定期檢查

3. **批次檔位置**
   - 所有批次檔應放在專案根目錄
   - 與 `package.json` 同一層級

---

## 🔧 自訂批次檔

如果需要修改批次檔，請注意：

1. **編碼格式**：使用 UTF-8（已設定 `chcp 65001`）
2. **路徑處理**：使用相對路徑，避免硬編碼絕對路徑
3. **錯誤處理**：檢查命令執行結果（`%errorlevel%`）

---

## 📞 需要協助？

- 查看詳細文件：`Puppeteer設定指南.md`
- 查看快速開始：`Puppeteer快速開始.md`
- 查看 Cookie 安裝指南：`Cookie擴充功能安裝指南.md`

