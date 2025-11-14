# cron-job.org 設定完成後步驟

## ✅ 檢查清單

請確認以下項目都已完成：

### cron-job.org 設定
- [x] 標題：臉書掃描
- [x] 網址：https://coolcool-ten.vercel.app/api/cron/facebook-monitor
- [x] Crontab 表達式：`*/3 * * * *`（每 3 分鐘）
- [x] 請求方法：POST
- [x] 標頭 1：`Authorization: Bearer 您的CRON_SECRET`
- [x] 標頭 2：`Content-Type: application/json`
- [x] 請求本體：留空
- [x] 已儲存任務

### Vercel 環境變數
- [x] CRON_SECRET 已設定

## 🧪 步驟 1：測試 cron-job.org 設定

### 在 cron-job.org 測試

1. 在任務列表中，找到「臉書掃描」任務
2. 點擊任務右側的 **"立即執行"** 或 **"Run now"** 按鈕
3. 等待幾秒鐘
4. 檢查執行結果：
   - ✅ **成功**：會顯示 HTTP 200 狀態碼
   - ❌ **401 Unauthorized**：CRON_SECRET 錯誤或格式不正確
   - ❌ **404 Not Found**：網址錯誤或 API 還沒部署
   - ❌ **405 Method Not Allowed**：請求方法錯誤（應該是 POST）

### 如果測試失敗

#### 錯誤：401 Unauthorized
- **原因**：CRON_SECRET 不正確或格式錯誤
- **解決**：
  1. 檢查 Vercel 環境變數中的 `CRON_SECRET` 是否正確
  2. 檢查 cron-job.org 的標頭格式：`Bearer 您的CRON_SECRET`（Bearer 後面有空格）
  3. 確認兩個地方的 CRON_SECRET 完全一致

#### 錯誤：404 Not Found
- **原因**：網址錯誤或 API 還沒部署
- **解決**：
  1. 確認網址：`https://coolcool-ten.vercel.app/api/cron/facebook-monitor`
  2. 檢查 Vercel 部署狀態
  3. 確認 API 端點是否存在

## 🔧 步驟 2：檢查 Vercel Function Logs

1. 前往 Vercel Dashboard：https://vercel.com/dashboard
2. 點擊您的專案：**coolcool**
3. 點擊 **Functions** 標籤
4. 查看 `/api/cron/facebook-monitor` 的執行記錄
5. 應該會看到執行記錄（如果 cron-job.org 測試成功）

## 📋 步驟 3：後台表單設定（重要！）

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

## ✅ 步驟 4：驗證完整流程

### 測試實際功能

1. **在 Facebook 貼文下留言**：
   - 留言 "+1" 或符合您設定的關鍵字
   - 例如：如果關鍵字是「烤雞半隻+1」，就留言「烤雞半隻+1」

2. **等待 3-5 分鐘**：
   - 等待 cron-job.org 觸發掃描
   - 等待系統處理留言

3. **檢查結果**：
   - 前往後台管理頁面
   - 檢查是否有新訂單
   - 檢查 Facebook 留言是否收到自動回覆「感謝訂購，本單已登記」

## 📊 步驟 5：監控執行狀態

### 在 cron-job.org

1. 點擊「臉書掃描」任務進入詳情頁面
2. 查看「執行記錄」或「Execution history」
3. 應該會看到每 3 分鐘有一次執行記錄
4. 確認執行狀態都是成功（HTTP 200）

### 在 Vercel

1. 前往 Vercel Dashboard > Functions
2. 查看 `/api/cron/facebook-monitor` 的執行記錄
3. 應該會看到每 3 分鐘有一次執行記錄

## 🎉 完成！

如果所有步驟都完成並且測試成功，您的 Facebook 自動掃描系統就設定完成了！

系統會：
- ✅ 每 3 分鐘自動掃描 Facebook 留言
- ✅ 自動抓取符合關鍵字的留言並建立訂單
- ✅ 自動回覆留言「感謝訂購，本單已登記」

## 🔍 如果遇到問題

### 問題：沒有新訂單
- 檢查留言是否符合關鍵字
- 檢查表單是否啟用 Facebook 自動監控
- 檢查表單的掃描間隔設定
- 檢查 Vercel Function Logs 是否有錯誤

### 問題：沒有自動回覆
- 檢查 Facebook Access Token 是否有效
- 檢查 Vercel Function Logs 是否有錯誤
- 檢查表單的回覆訊息設定

### 問題：執行記錄顯示錯誤
- 查看錯誤訊息
- 檢查 Vercel Function Logs
- 確認所有環境變數都已正確設定

