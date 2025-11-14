# Vercel Cron Jobs 限制說明

## 問題
Vercel Hobby（免費）方案限制：
- **每天只能執行一次 cron job**
- 我們設定的任務：
  - Facebook Token 刷新：每天 1 次 ✅（符合）
  - Facebook 留言掃描：每 3 分鐘 1 次 ❌（超過限制）
  - LINE 結單檢查：每 5 分鐘 1 次（用戶表示目前沒問題，保持原設定）

## 解決方案

### 方案 1：使用外部 Cron 服務（推薦，免費）

使用 [cron-job.org](https://cron-job.org) 或其他免費 cron 服務來觸發 API：

#### Facebook 留言掃描
1. 前往：https://cron-job.org
2. 註冊帳號（免費）
3. 建立新的 cron job：
   - **URL**: `https://你的域名.vercel.app/api/cron/facebook-monitor`
   - **Schedule**: `*/3 * * * *`（每 3 分鐘）
   - **Method**: POST
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```
   - **Body**: 留空

#### LINE 結單檢查（可選）
如果 LINE 結單檢查也遇到限制，可以同樣設定：
1. 在 cron-job.org 建立另一個 cron job：
   - **URL**: `https://你的域名.vercel.app/api/cron/line-deadline-check`
   - **Schedule**: `*/5 * * * *`（每 5 分鐘）
   - **Method**: POST
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```

#### 設定環境變數
在 Vercel 環境變數中設定：
```
CRON_SECRET=你的隨機密碼
```

### 方案 2：升級到 Vercel Pro（付費）

Vercel Pro 方案（$20/月）支援：
- 無限制的 cron jobs
- 更頻繁的執行（每分鐘都可以）

### 方案 3：手動觸發（臨時方案）

如果需要立即掃描，可以手動呼叫 API：

#### Facebook 留言掃描
```bash
curl -X POST https://你的域名.vercel.app/api/facebook/scan-comments \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### LINE 結單檢查
```bash
curl -X POST https://你的域名.vercel.app/api/cron/line-deadline-check \
  -H "Content-Type: application/json"
```

## 當前設定

已從 `vercel.json` 移除：
- ❌ `/api/cron/facebook-monitor`（每 3 分鐘）

保留：
- ✅ `/api/cron/facebook-token-refresh`（每天 02:00）
- ✅ `/api/cron/line-deadline-check`（每 5 分鐘）- 用戶表示目前沒問題

## 建議

**推薦使用方案 1（外部 cron 服務）**，因為：
- 完全免費
- 穩定可靠
- 不影響 Vercel 的免費方案限制
- 可以設定任意頻率

