# 如何找到您的 Vercel 域名

## 方法 1：從 Vercel Dashboard（最簡單）

1. 前往：https://vercel.com/dashboard
2. 點擊您的專案：**coolcool**
3. 在專案頁面，您會看到：
   - **Production** 或 **Preview** 部署
   - 點擊任何一個部署記錄
   - 在部署詳情頁面，您會看到 **URL** 或 **Visit** 按鈕
   - 點擊後會打開您的網站，網址列就是您的域名

4. **複製域名**（例如）：
   ```
   https://coolcool-xxxxx.vercel.app
   ```
   或
   ```
   https://coolcool.vercel.app
   ```

## 方法 2：從專案設定

1. 前往 Vercel Dashboard > 專案 **coolcool**
2. 點擊 **Settings** 標籤
3. 點擊左側選單的 **Domains**
4. 您會看到所有已設定的域名
5. 通常會有一個預設域名：`coolcool-xxxxx.vercel.app`

## 方法 3：從部署記錄

1. 前往 Vercel Dashboard > 專案 **coolcool** > **Deployments**
2. 點擊任何一個部署記錄（狀態為 Ready）
3. 在部署詳情頁面，您會看到：
   - **Visit** 按鈕旁邊的 URL
   - 或直接複製瀏覽器網址列的 URL

## 完整的 cron-job.org 網址格式

找到您的域名後，完整的網址應該是：

```
https://您的域名/api/cron/facebook-monitor
```

### 範例：

如果您的域名是：`https://coolcool-abc123.vercel.app`

那麼在 cron-job.org 輸入的網址應該是：

```
https://coolcool-abc123.vercel.app/api/cron/facebook-monitor
```

## 如何確認網址是否正確

1. 在瀏覽器中打開：
   ```
   https://您的域名/api/cron/facebook-monitor
   ```

2. 如果看到以下回應，表示網址正確：
   ```json
   {
     "error": "Unauthorized"
   }
   ```
   （這是正常的，因為沒有提供 Authorization header）

3. 如果看到 **404 Not Found**，表示：
   - 網址錯誤
   - 或 API 還沒有部署
   - 請檢查 Vercel 部署狀態

## 快速檢查清單

- [ ] 找到您的 Vercel 域名
- [ ] 確認域名格式：`https://xxxxx.vercel.app`
- [ ] 完整的 API 網址：`https://xxxxx.vercel.app/api/cron/facebook-monitor`
- [ ] 在瀏覽器中測試網址（應該看到 Unauthorized 錯誤，這是正常的）

