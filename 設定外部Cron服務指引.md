# 設定外部 Cron 服務指引

## 為什麼需要外部 Cron 服務？

Vercel Hobby（免費）方案限制：
- 每天只能執行 **1 次** cron job
- 我們需要：
  - Facebook 留言掃描：每 3 分鐘
  - LINE 結單檢查：每 5 分鐘

## 推薦服務：cron-job.org（免費）

### 步驟 1：註冊帳號
1. 前往：https://cron-job.org
2. 點擊右上角 "Sign up" 註冊（免費）
3. 驗證電子郵件

### 步驟 2：設定 CRON_SECRET
在 Vercel 環境變數中新增：
```
CRON_SECRET=你的隨機密碼（例如：abc123xyz789）
```

### 步驟 3：建立 Facebook 留言掃描任務

1. 登入 cron-job.org
2. **切換中文介面**（可選）：
   - 點擊右上角的語言選單
   - 選擇 "中文" 或 "繁體中文"
3. 點擊 "建立 cronjob" 或 "Create cronjob"
4. 填寫：
   - **標題（Title）**: `Facebook 留言掃描`
   - **網址（Address/URL）**: `https://你的域名.vercel.app/api/cron/facebook-monitor`
   - **排程（Schedule）**: 選擇 "每 X 分鐘" 或 "Every X minutes"，輸入 `3`
   - **請求方法（Request method）**: `POST`
   - **請求標頭（Request headers）**: 新增兩行：
     ```
     Authorization: Bearer 你的CRON_SECRET
     Content-Type: application/json
     ```
     （請將 `你的CRON_SECRET` 替換為實際密碼）
   - **請求內容（Request body）**: 留空
5. 點擊 "建立 cronjob" 或 "Create cronjob"

### 步驟 4：建立 LINE 結單檢查任務（可選）

如果 LINE 結單檢查也遇到 Vercel 限制，可以同樣設定：
1. 再次點擊 "Create cronjob"
2. 填寫：
   - **Title**: `LINE 結單檢查`
   - **Address (URL)**: `https://你的域名.vercel.app/api/cron/line-deadline-check`
   - **Schedule**: 選擇 "Every X minutes"，輸入 `5`
   - **Request method**: `POST`
   - **Request headers**: 
     ```
     Authorization: Bearer 你的CRON_SECRET
     Content-Type: application/json
     ```
   - **Request body**: 留空
3. 點擊 "Create cronjob"

**注意**：如果 LINE 結單檢查在 Vercel 上運作正常，可以跳過此步驟。

## 其他免費 Cron 服務

### EasyCron
- 網址：https://www.easycron.com
- 免費方案：每天 100 次執行

### Cronitor
- 網址：https://cronitor.io
- 免費方案：每月 50 次執行

### GitHub Actions（進階）
如果您熟悉 GitHub Actions，也可以使用它來觸發 API：
```yaml
name: Facebook Monitor
on:
  schedule:
    - cron: '*/3 * * * *'  # 每 3 分鐘
jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Call API
        run: |
          curl -X POST https://你的域名.vercel.app/api/cron/facebook-monitor \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## 測試

建立 cron job 後，可以：
1. 在 cron-job.org 點擊 "Run now" 測試
2. 檢查 Vercel 的 Function Logs 確認是否有執行
3. 檢查資料庫是否有新訂單

## 注意事項

1. **安全性**：務必設定 `CRON_SECRET`，避免他人隨意觸發
2. **監控**：定期檢查 cron job 是否正常執行
3. **備援**：可以設定多個 cron 服務作為備援

## 故障排除

### 問題：API 返回 401 Unauthorized
- 檢查 `CRON_SECRET` 是否正確設定
- 檢查 cron job 的 Authorization header 是否正確

### 問題：API 沒有執行
- 檢查 Vercel Function Logs
- 檢查 cron-job.org 的執行記錄
- 確認 URL 是否正確

### 問題：執行頻率不對
- 檢查 cron-job.org 的 Schedule 設定
- 確認時區設定是否正確

