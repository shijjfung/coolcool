# cron-job.org 設定步驟（詳細版）

## 前置準備

1. **在 Vercel 設定環境變數**
   - 前往 Vercel Dashboard > 專案 > Settings > Environment Variables
   - 新增：
     ```
     CRON_SECRET=你的隨機密碼（例如：abc123xyz789）
     ```
   - 選擇所有環境（Production, Preview, Development）
   - 點擊 "Save"

2. **取得您的 Vercel 域名**
   - 例如：`https://coolcool-xxxxx.vercel.app`
   - 或您的自訂域名

## 在 cron-job.org 設定步驟

### 步驟 1：登入 cron-job.org 並切換中文介面

1. 前往：https://console.cron-job.org/dashboard
2. 如果還沒註冊，點擊右上角 "Sign up" 註冊（免費）
3. 登入後會看到 Dashboard
4. **切換中文介面**：
   - 點擊右上角的語言選單（通常是國旗圖示或 "EN"）
   - 選擇 "中文" 或 "繁體中文" 或 "Chinese"
   - 介面會自動切換為中文

### 步驟 2：建立 Facebook 留言掃描任務

1. 點擊左上角的 **"建立 cronjob"** 按鈕（或 "+" 按鈕）

2. 填寫表單（中文介面）：

   **基本設定：**
   - **標題（Title）**: `Facebook 留言掃描`
   - **網址（Address/URL）**: 
     ```
     https://你的域名.vercel.app/api/cron/facebook-monitor
     ```
     例如：
     ```
     https://coolcool-xxxxx.vercel.app/api/cron/facebook-monitor
     ```

   **排程設定：**
   - **方法 A（推薦）**：選擇 "自訂" 或 "Custom"，然後輸入 cron 表達式：
     ```
     */3 * * * *
     ```
     這表示每 3 分鐘執行一次
   
   - **方法 B**：如果沒有「自訂」選項，選擇 "每分鐘" 或 "Every minute"，然後在表單設定中將掃描間隔設為 3 分鐘（系統會自動跳過未達間隔的觸發）
   
   - **方法 C**：選擇 "每 5 分鐘"，然後在表單設定中將掃描間隔設為 3 分鐘（但實際會每 5 分鐘掃描一次）

   **請求設定：**
   - **請求方法（Request method）**: 選擇 `POST`
   - **請求標頭（Request headers）**: 點擊 "新增標頭" 或 "Add header"，然後新增兩行：
     ```
     Authorization: Bearer 你的CRON_SECRET
     Content-Type: application/json
     ```
     例如：
     ```
     Authorization: Bearer abc123xyz789
     Content-Type: application/json
     ```
     **注意**：請將 `你的CRON_SECRET` 替換為您在 Vercel 設定的實際密碼

   **請求內容：**
   - **請求內容（Request body）**: 留空

3. 點擊 **"建立 cronjob"** 或 **"Create cronjob"** 完成建立

### 步驟 3：測試 cron job

1. 建立後，在 cron job 列表中會看到新建立的任務
2. 點擊任務右側的 **"立即執行"** 或 **"Run now"** 按鈕進行測試
3. 檢查執行結果：
   - 如果成功，會顯示 HTTP 200 狀態碼
   - 如果失敗，會顯示錯誤訊息

### 步驟 4：檢查執行記錄

1. 點擊任務名稱進入詳情頁面
2. 查看 "執行記錄" 或 "Execution history"
3. 確認是否有定期執行（應該每 3 分鐘執行一次）

## 驗證設定是否成功

### 方法 1：檢查 Vercel Function Logs

1. 前往 Vercel Dashboard > 專案 > Functions
2. 查看 `/api/cron/facebook-monitor` 的執行記錄
3. 應該會看到每 3 分鐘有一次執行記錄

### 方法 2：檢查資料庫

1. 在 Facebook 貼文下留言 "+1" 或符合關鍵字的留言
2. 等待 3 分鐘後檢查後台是否有新訂單
3. 檢查留言是否收到自動回覆

## 常見問題

### Q1: 收到 401 Unauthorized 錯誤
**解決方法：**
- 檢查 `CRON_SECRET` 是否正確設定在 Vercel
- 檢查 cron-job.org 的 Authorization header 是否正確
- 確認 header 格式：`Authorization: Bearer 你的密碼`（注意 "Bearer" 後面有空格）

### Q2: 收到 404 Not Found 錯誤
**解決方法：**
- 檢查 URL 是否正確（包含 `/api/cron/facebook-monitor`）
- 確認 Vercel 部署是否成功
- 確認域名是否正確

### Q3: cron job 沒有執行
**解決方法：**
- 檢查 cron-job.org 的帳號是否啟用
- 檢查免費方案是否有限制
- 查看 cron-job.org 的執行記錄

### Q4: 執行頻率不對
**解決方法：**
- 檢查 Schedule 設定是否正確
- 確認時區設定（cron-job.org 預設是 UTC）
- 如果需要特定時區，可以在 Schedule 中調整

## 免費方案限制

cron-job.org 免費方案通常包括：
- 每小時最多執行次數：視方案而定
- 每 3 分鐘執行一次應該沒問題（每小時 20 次）

如果遇到限制，可以考慮：
- 調整為每 5 分鐘執行一次（每小時 12 次）
- 或升級到付費方案

## 備援方案

如果 cron-job.org 不穩定，可以考慮：
1. **EasyCron**: https://www.easycron.com
2. **Cronitor**: https://cronitor.io
3. **GitHub Actions**: 如果您的程式碼在 GitHub 上

## 注意事項

1. **安全性**：`CRON_SECRET` 請使用複雜的隨機字串
2. **監控**：定期檢查 cron job 是否正常執行
3. **備份**：可以設定多個 cron 服務作為備援

