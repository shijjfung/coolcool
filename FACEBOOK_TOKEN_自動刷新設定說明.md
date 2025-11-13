# Facebook Token 完全自動刷新設定說明

## 🎯 功能說明

系統會**完全自動**執行以下操作：
1. ✅ 每 24 小時自動檢查 Token 狀態
2. ✅ 當剩餘天數少於 10 天時自動刷新 Token
3. ✅ 自動更新 Vercel 環境變數
4. ✅ 自動觸發 Vercel 重新部署

**完全不需要手動操作！**

---

## 📋 設定步驟

### 步驟 1：取得 Vercel API Token

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊右上角頭像 > **Settings**
3. 點擊左側選單的 **Tokens**
4. 點擊 **Create Token**
5. 填寫：
   - **Name**：例如「Facebook Token Auto Refresh」
   - **Expiration**：選擇「Never」或設定較長期限
6. 點擊 **Create**
7. **複製產生的 Token**（只會顯示一次，請妥善保存）

### 步驟 2：取得 Vercel Project ID

1. 在 Vercel Dashboard 選擇您的專案
2. 前往 **Settings** > **General**
3. 找到 **Project ID**，複製

### 步驟 3：設定環境變數

在 Vercel Dashboard 的 **Environment Variables** 中新增：

| 變數名稱 | 值 | 說明 | 必填 |
|---------|-----|------|------|
| `VERCEL_TOKEN` | 您的 Vercel API Token | 用於更新環境變數和觸發部署 | ✅ 是 |
| `VERCEL_PROJECT_ID` | 您的 Project ID | 用於識別要更新的專案 | ✅ 是 |
| `VERCEL_TEAM_ID` | （選填）您的 Team ID | 如果使用團隊帳號，需要設定 | ⚠️ 選填 |
| `CRON_SECRET` | （選填）自訂密碼 | 用於保護 Cron Job，建議設定 | ⚠️ 選填 |

### 步驟 4：確認 Facebook 相關環境變數

確保以下環境變數已設定：

| 變數名稱 | 說明 | 必填 |
|---------|------|------|
| `FACEBOOK_APP_ID` | Facebook 應用程式編號 | ✅ 是 |
| `FACEBOOK_APP_SECRET` | Facebook 應用程式密鑰 | ✅ 是 |
| `FACEBOOK_ACCESS_TOKEN` | Facebook Access Token | ✅ 是 |

### 步驟 5：重新部署應用程式

設定完成後，**必須重新部署**才能啟用 Cron Job：

1. 前往 Vercel Dashboard > **Deployments**
2. 點擊最新部署右側的 **⋯**
3. 選擇 **Redeploy**
4. 等待部署完成（1-3 分鐘）

---

## ⏰ 自動執行時間

系統會**每天凌晨 2 點（UTC）**自動執行檢查和刷新。

- **時區換算**：
  - UTC+8（台灣時間）：每天上午 10 點
  - UTC+0（倫敦時間）：每天凌晨 2 點
  - UTC-5（紐約時間）：每天晚上 9 點（前一天）

如果需要修改執行時間，可以編輯 `vercel.json` 中的 `schedule` 欄位。

---

## 🔍 如何確認自動刷新是否運作

### 方法 1：查看 Vercel Logs

1. 前往 Vercel Dashboard > **Deployments**
2. 點擊最新的部署
3. 查看 **Functions** > **Logs**
4. 搜尋 `facebook-token-refresh` 相關的日誌

### 方法 2：查看 API 回應

訪問以下 URL（需要設定 `CRON_SECRET`）：
```
https://your-domain.vercel.app/api/cron/facebook-token-refresh
```

應該會看到類似這樣的回應：
```json
{
  "success": true,
  "message": "Token 狀態良好，剩餘 45 天",
  "days_remaining": 45,
  "refreshed": false
}
```

或（當需要刷新時）：
```json
{
  "success": true,
  "message": "Token 已刷新，Vercel 環境變數已更新，重新部署已觸發",
  "vercel_updated": true,
  "deployment_id": "dpl_xxxxx",
  "refreshed": true
}
```

---

## ⚠️ 注意事項

### 1. Vercel API Token 權限

確保 Token 有以下權限：
- ✅ 讀取專案資訊
- ✅ 更新環境變數
- ✅ 觸發部署

### 2. 部署配額

- Vercel 免費方案有部署次數限制
- 自動刷新會觸發部署，會消耗部署配額
- 建議在 Token 剩餘天數少於 10 天時才刷新，避免頻繁部署

### 3. 時區設定

- Cron Job 使用 UTC 時區
- 如果需要調整執行時間，修改 `vercel.json` 中的 `schedule`

### 4. 安全性

- 建議設定 `CRON_SECRET` 來保護 Cron Job
- 不要將 Vercel Token 提交到 Git

---

## 🔧 故障排除

### 問題 1：自動刷新沒有執行

**檢查：**
1. ✅ 確認 `vercel.json` 中有設定 Cron Job
2. ✅ 確認已重新部署應用程式
3. ✅ 查看 Vercel Logs 是否有錯誤

### 問題 2：環境變數沒有更新

**檢查：**
1. ✅ 確認 `VERCEL_TOKEN` 和 `VERCEL_PROJECT_ID` 已正確設定
2. ✅ 確認 Vercel Token 有更新環境變數的權限
3. ✅ 查看 API 回應中的 `vercel_updated` 欄位

### 問題 3：部署沒有觸發

**檢查：**
1. ✅ 確認環境變數更新成功（`vercel_updated: true`）
2. ✅ 確認 Vercel Token 有觸發部署的權限
3. ✅ 查看 Vercel Dashboard 的 Deployments 頁面

---

## 📝 手動觸發（測試用）

如果需要手動觸發自動刷新（例如測試），可以訪問：

```
https://your-domain.vercel.app/api/cron/facebook-token-refresh
```

如果設定了 `CRON_SECRET`，需要在請求標頭中加入：
```
Authorization: Bearer YOUR_CRON_SECRET
```

---

## ✅ 完成！

設定完成後，系統會**完全自動**：
- ✅ 每天檢查 Token 狀態
- ✅ 自動刷新即將到期的 Token
- ✅ 自動更新環境變數
- ✅ 自動觸發部署

**您不需要做任何手動操作！** 🎉

