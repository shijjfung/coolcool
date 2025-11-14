# cron-job.org 完成設定檢查清單

## ✅ 已完成
- [x] 標題：臉書掃描
- [x] 網址：https://coolcool-ten.vercel.app/api/cron/facebook-monitor
- [x] Crontab 表達式：`*/3 * * * *`（每 3 分鐘）

## 📝 接下來要完成的設定

### 1. 請求方法（Request Method）

- 找到「請求方法」或「Request Method」選項
- 選擇 **`POST`**
- 不要選擇 GET

### 2. 請求標頭（Request Headers）⚠️ 非常重要

找到「請求標頭」或「Request Headers」區塊，點擊「新增標頭」或「Add header」，然後新增**兩行**：

**第一行：**
```
Authorization: Bearer 你的CRON_SECRET
```
（請將 `你的CRON_SECRET` 替換為您在 Vercel 設定的實際密碼）

**第二行：**
```
Content-Type: application/json
```

**完整範例**（如果您的 CRON_SECRET 是 `abc123xyz789`）：
```
Authorization: Bearer abc123xyz789
Content-Type: application/json
```

### 3. 請求內容（Request Body）

- 找到「請求內容」或「Request Body」欄位
- **留空**，不需要填寫任何內容

### 4. 其他選項（可選）

- **啟用工作**：確保已勾選 ✅
- **在工作歷史中儲存回應**：可以勾選，方便查看執行記錄

### 5. 儲存任務

點擊 **"建立定時工作"** 或 **"儲存"** 或 **"Create cronjob"** 按鈕

## 🧪 測試設定

### 步驟 1：立即測試

1. 任務建立後，在任務列表中會看到新建立的任務
2. 點擊任務右側的 **"立即執行"** 或 **"Run now"** 按鈕
3. 檢查執行結果：
   - ✅ **成功**：會顯示 HTTP 200 狀態碼
   - ❌ **失敗**：會顯示錯誤訊息

### 步驟 2：檢查執行記錄

1. 點擊任務名稱進入詳情頁面
2. 查看「執行記錄」或「Execution history」
3. 應該會看到每 3 分鐘有一次執行記錄

## 🔧 後台表單設定（重要！）

### 在您的後台管理系統中：

1. 前往後台管理頁面
2. 編輯您的表單（或建立新表單）
3. 找到 **"掃描間隔（分鐘）"** 欄位
4. 將數值設定為 `3`（與 cron-job.org 的設定一致）
5. 儲存表單

**為什麼重要？**
- 即使 cron-job.org 每 3 分鐘觸發一次
- 如果表單設定是其他數值，系統會按照表單設定執行
- 兩個設定應該一致，才能達到每 3 分鐘掃描一次

## ✅ 完整檢查清單

### cron-job.org 設定
- [x] 標題：臉書掃描
- [x] 網址：https://coolcool-ten.vercel.app/api/cron/facebook-monitor
- [x] Crontab 表達式：`*/3 * * * *`
- [ ] 請求方法：POST
- [ ] 請求標頭：Authorization: Bearer 你的CRON_SECRET
- [ ] 請求標頭：Content-Type: application/json
- [ ] 請求內容：留空
- [ ] 啟用工作：已勾選
- [ ] 儲存任務

### Vercel 環境變數
- [ ] CRON_SECRET 已設定

### 後台表單設定
- [ ] 表單的「掃描間隔（分鐘）」設定為 3

### 測試
- [ ] 在 cron-job.org 點擊「立即執行」測試
- [ ] 檢查執行結果（應該返回 HTTP 200）
- [ ] 檢查執行記錄（應該每 3 分鐘執行一次）

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

## 📊 驗證設定是否成功

### 方法 1：檢查 cron-job.org 執行記錄
- 應該每 3 分鐘有一次執行記錄
- 狀態應該是 HTTP 200

### 方法 2：檢查 Vercel Function Logs
1. 前往 Vercel Dashboard > 專案 > Functions
2. 查看 `/api/cron/facebook-monitor` 的執行記錄
3. 應該會看到每 3 分鐘有一次執行記錄

### 方法 3：測試實際功能
1. 在 Facebook 貼文下留言 "+1" 或符合關鍵字的留言
2. 等待 3-5 分鐘
3. 檢查後台是否有新訂單
4. 檢查留言是否收到自動回覆

