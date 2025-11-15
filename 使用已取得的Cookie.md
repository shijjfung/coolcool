# 使用已取得的 Cookie JSON

## ✅ 您的 Cookie 已成功取得！

您的 Cookie JSON 包含以下重要欄位：
- ✅ `c_user` - 用戶 ID（必備）
- ✅ `xs` - 安全 Token（必備）
- ✅ `datr` - 設備識別碼
- ✅ `sb` - 會話 ID
- ✅ 其他必要的 Cookie

---

## 🚀 最簡單的設定方法

### 方法 1：使用剪貼簿（最簡單）⭐

1. **確認 Cookie JSON 已在剪貼簿**
   - 您剛才複製的 Cookie JSON 應該還在剪貼簿中

2. **執行批次檔**
   ```
   設定Cookie_從剪貼簿.bat
   ```
   - 批次檔會自動從剪貼簿讀取 Cookie
   - 自動寫入 `.env.local`

3. **完成！**
   - Cookie 已設定完成
   - 可以執行「測試Puppeteer.bat」測試

---

### 方法 2：使用檔案方式（推薦，最可靠）

1. **建立 cookie.txt 檔案**
   - 在專案資料夾中建立 `cookie.txt`
   - 將您的 Cookie JSON 貼上並儲存

2. **執行批次檔**
   ```
   設定Cookie_最簡單.bat
   ```
   - 批次檔會自動讀取 `cookie.txt`
   - 自動寫入 `.env.local`
   - 自動刪除 `cookie.txt`（安全）

---

### 方法 3：直接貼上

1. **執行批次檔**
   ```
   設定Cookie環境變數.bat
   ```

2. **貼上 Cookie JSON**
   - 將您的 Cookie JSON 貼上（可以是多行）
   - 按 Enter

---

## 📝 Cookie 格式說明

您的 Cookie JSON 格式正確，但包含一些額外欄位：
- `expirationDate` - 過期時間 ✅
- `hostOnly` - 主機限制
- `storeId` - 儲存 ID
- `session` - 會話標記

**這些額外欄位不會影響使用**，程式會自動處理。

---

## ✅ 設定完成後

1. **檢查 `.env.local` 檔案**
   - 應該包含：
     ```env
     # Facebook Cookie for Puppeteer
     FACEBOOK_COOKIES=[{"domain":".facebook.com",...}]
     FACEBOOK_USE_PUPPETEER=true
     ```

2. **測試 Cookie**
   ```
   測試Puppeteer.bat
   ```

3. **如果測試成功**
   - 您會看到：`[Puppeteer] ✅ 使用 Cookie 登入成功`
   - 然後就可以開始使用 Puppeteer 抓取留言了！

---

## 🔧 程式已自動處理格式問題

我已經更新了程式碼，會自動處理：
- ✅ `"expiration Date"` → `"expirationDate"`（修正欄位名稱）
- ✅ 移除不需要的欄位（`storeId`、`hostOnly` 等）
- ✅ 轉換 `sameSite` 格式（`no_restriction` → `None`）
- ✅ 處理多行 JSON

所以您可以直接使用從 Cookie-Editor 複製的 Cookie，不需要手動修改！

---

## 🆘 如果遇到問題

1. **Cookie 格式錯誤**
   - 確認 Cookie JSON 是完整的（從 `[` 開始，以 `]` 結束）
   - 確認沒有缺少引號或括號

2. **無法解析**
   - 使用「方法 2（檔案方式）」最可靠
   - 或檢查 Cookie 是否包含特殊字元

3. **測試失敗**
   - 檢查 Cookie 是否已過期
   - 確認 `.env.local` 檔案格式正確
   - 確認開發伺服器已重新啟動（載入新環境變數）

---

## 📞 下一步

設定完成後：
1. 執行「測試Puppeteer.bat」測試 Cookie
2. 如果成功，就可以開始使用 Puppeteer 抓取 Facebook 留言了！
3. 設定定時任務（Cron Job）自動執行

