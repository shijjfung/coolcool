# cron-job.org 完整設定清單

## ✅ 已完成
- [x] 網址已輸入：`https://coolcool-ten.vercel.app/api/cron/facebook-monitor`

## 📝 接下來要設定的項目

### 1. 排程設定（Schedule）

- **選項**：選擇 "每 X 分鐘" 或 "Every X minutes"
- **分鐘數**：輸入 `3`
- 這樣會每 3 分鐘執行一次

### 2. 請求方法（Request Method）

- **選項**：選擇 `POST`
- 不要選擇 GET

### 3. 請求標頭（Request Headers）⚠️ 重要

點擊 "新增標頭" 或 "Add header"，然後新增**兩行**：

**第一行：**
```
Authorization: Bearer 你的CRON_SECRET
```
（請將 `你的CRON_SECRET` 替換為您在 Vercel 設定的實際密碼）

**第二行：**
```
Content-Type: application/json
```

**範例**（如果您的 CRON_SECRET 是 `abc123xyz789`）：
```
Authorization: Bearer abc123xyz789
Content-Type: application/json
```

### 4. 請求內容（Request Body）

- **留空**，不需要填寫任何內容

### 5. 儲存並測試

1. 點擊 **"建立 cronjob"** 或 **"Create cronjob"** 按鈕
2. 建立後，在任務列表中會看到新建立的任務
3. 點擊任務右側的 **"立即執行"** 或 **"Run now"** 按鈕進行測試
4. 檢查執行結果：
   - ✅ **成功**：會顯示 HTTP 200 狀態碼
   - ❌ **失敗**：會顯示錯誤訊息（例如 401 Unauthorized 表示 CRON_SECRET 錯誤）

## 🔍 如果測試失敗

### 錯誤：401 Unauthorized
- **原因**：CRON_SECRET 不正確或未設定
- **解決**：
  1. 檢查 Vercel 環境變數中的 `CRON_SECRET` 是否正確
  2. 檢查 cron-job.org 的 Authorization header 是否正確
  3. 確認格式：`Authorization: Bearer 你的密碼`（注意 "Bearer" 後面有空格）

### 錯誤：404 Not Found
- **原因**：網址錯誤或 API 還沒部署
- **解決**：
  1. 確認網址是否正確
  2. 檢查 Vercel 部署狀態
  3. 確認 API 端點是否存在

### 錯誤：500 Internal Server Error
- **原因**：伺服器內部錯誤
- **解決**：
  1. 檢查 Vercel Function Logs
  2. 確認環境變數是否正確設定
  3. 確認資料庫連接是否正常

## ✅ 設定完成後的檢查

1. **檢查執行記錄**：
   - 點擊任務名稱進入詳情頁面
   - 查看 "執行記錄" 或 "Execution history"
   - 確認是否有定期執行（應該每 3 分鐘執行一次）

2. **檢查 Vercel Function Logs**：
   - 前往 Vercel Dashboard > 專案 > Functions
   - 查看 `/api/cron/facebook-monitor` 的執行記錄
   - 應該會看到每 3 分鐘有一次執行記錄

3. **測試實際功能**：
   - 在 Facebook 貼文下留言 "+1" 或符合關鍵字的留言
   - 等待 3 分鐘後檢查後台是否有新訂單
   - 檢查留言是否收到自動回覆

## 📋 完整設定摘要

- **標題**：Facebook 留言掃描
- **網址**：`https://coolcool-ten.vercel.app/api/cron/facebook-monitor`
- **排程**：每 3 分鐘
- **請求方法**：POST
- **請求標頭**：
  - `Authorization: Bearer 你的CRON_SECRET`
  - `Content-Type: application/json`
- **請求內容**：留空

