# Cookie 設定方法說明

## 🎯 推薦方法（最簡單）

### 方法 1：使用檔案方式 ⭐⭐⭐（最推薦）

**步驟：**

1. **從 Cookie-Editor 複製 Cookie JSON**
   - 開啟 Cookie-Editor 擴充功能
   - 點擊 Export → JSON → Copy

2. **建立 cookie.txt 檔案**
   - 在專案資料夾中建立 `cookie.txt`
   - 貼上剛才複製的 Cookie JSON
   - 儲存檔案

3. **執行批次檔**
   ```
   設定Cookie_最簡單.bat
   ```
   - 批次檔會自動讀取 `cookie.txt`
   - 自動寫入 `.env.local`
   - 自動刪除 `cookie.txt`（安全）

**優點：**
- ✅ 最簡單，不會有輸入問題
- ✅ 支援長 JSON
- ✅ 不會有編碼問題
- ✅ 自動清理臨時檔案

---

### 方法 2：使用 PowerShell 腳本 ⭐⭐

**步驟：**

1. **開啟 PowerShell**
   - 在專案資料夾中，按 `Shift + 右鍵`
   - 選擇「在此處開啟 PowerShell 視窗」

2. **執行腳本**
   ```powershell
   .\設定Cookie_互動式.ps1
   ```

3. **貼上 Cookie JSON**
   - 貼上 Cookie JSON（可以多行）
   - 按 Enter 兩次完成

**優點：**
- ✅ 支援多行輸入
- ✅ 更好的錯誤處理
- ✅ 彩色輸出，更清楚

**注意：**
- 如果遇到執行政策錯誤，執行：
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

---

### 方法 3：直接貼上（批次檔）⭐

**步驟：**

1. **執行批次檔**
   ```
   設定Cookie環境變數.bat
   ```

2. **貼上 Cookie JSON**
   - Cookie JSON 通常是**單行**（很長的一行）
   - 直接貼上，按 Enter

**注意：**
- Cookie JSON 必須是單行
- 如果 JSON 很長，建議使用方法 1（檔案方式）

---

## 📋 Cookie JSON 格式說明

Cookie JSON 通常長這樣（**單行**）：

```json
[{"name":"c_user","value":"123456789","domain":".facebook.com","path":"/","secure":true,"httpOnly":false,"sameSite":"None","expirationDate":1735689600},{"name":"xs","value":"abc123...","domain":".facebook.com",...}]
```

**特點：**
- 是一個 JSON 陣列 `[...]`
- 通常是很長的一行（沒有換行）
- 包含多個 Cookie 物件

---

## 🔍 如何確認 Cookie 是否正確

### 檢查 .env.local 檔案

設定完成後，檢查 `.env.local` 檔案：

```env
# Facebook Cookie for Puppeteer
FACEBOOK_COOKIES=[{"name":"c_user",...}]
FACEBOOK_USE_PUPPETEER=true
```

### 測試 Cookie

執行測試批次檔：
```
測試Puppeteer.bat
```

如果看到：
- ✅ `[Puppeteer] ✅ 使用 Cookie 登入成功` → Cookie 有效
- ❌ `[Puppeteer] ⚠️ Cookie 可能已過期` → 需要重新取得 Cookie

---

## ⚠️ 常見問題

### Q1: 貼上 Cookie 後沒有反應？

**可能原因：**
- Cookie JSON 太長，批次檔無法處理
- 包含特殊字元

**解決方法：**
- 使用**方法 1（檔案方式）**，最可靠

### Q2: 看到亂碼？

**解決方法：**
- 使用 PowerShell 版本（方法 2）
- 或使用檔案方式（方法 1）

### Q3: Cookie 設定後仍無法使用？

**檢查項目：**
1. Cookie 是否已過期（重新取得）
2. `.env.local` 檔案格式是否正確
3. 開發伺服器是否已重新啟動（載入新環境變數）

### Q4: 如何重新設定 Cookie？

**方法：**
1. 重新執行設定批次檔
2. 會自動覆蓋舊的 Cookie
3. 或手動編輯 `.env.local` 檔案

---

## 🎓 完整流程範例

### 第一次設定

1. **取得 Cookie**
   ```
   使用 Cookie-Editor 擴充功能匯出 Cookie
   ```

2. **設定 Cookie（選擇一種方法）**
   ```
   方法 A: 建立 cookie.txt → 執行「設定Cookie_最簡單.bat」
   方法 B: 執行「設定Cookie_互動式.ps1」→ 貼上 Cookie
   方法 C: 執行「設定Cookie環境變數.bat」→ 貼上 Cookie
   ```

3. **測試**
   ```
   執行「啟動開發伺服器.bat」
   執行「測試Puppeteer.bat」
   ```

### 更新 Cookie（Cookie 過期時）

1. **重新取得 Cookie**
   - 使用 Cookie-Editor 重新匯出

2. **重新設定**
   - 執行任何一個設定批次檔
   - 會自動覆蓋舊的 Cookie

3. **重新啟動伺服器**
   - 停止開發伺服器（Ctrl+C）
   - 重新執行「啟動開發伺服器.bat」

---

## 💡 小技巧

1. **保存 Cookie 備份**
   - 將 Cookie JSON 保存到安全的地方
   - 方便下次快速設定

2. **使用檔案方式**
   - 最可靠，不會有輸入問題
   - 適合長 JSON

3. **定期檢查 Cookie**
   - Cookie 通常有效 1-3 個月
   - 定期測試，過期前更新

---

## 📞 需要協助？

如果遇到問題：
1. 查看 `Cookie擴充功能安裝指南.md`
2. 查看 `Puppeteer設定指南.md`
3. 檢查 Console 日誌

