# CRON_SECRET 說明

## 什麼是 CRON_SECRET？

**CRON_SECRET** 是一個**安全密碼**，用來保護您的 API 端點，防止未授權的訪問。

## 為什麼需要 CRON_SECRET？

當 cron-job.org 呼叫您的 API 時，我們需要確認：
- ✅ 這個請求是來自 cron-job.org（有正確的密碼）
- ❌ 不是其他人隨意呼叫您的 API

如果沒有這個密碼保護，任何人都可以觸發您的 Facebook 掃描功能，這會造成：
- 資源浪費
- 可能被惡意攻擊
- 增加不必要的 API 呼叫

## CRON_SECRET 在哪裡？

**CRON_SECRET 需要您在 Vercel 環境變數中設定**，然後在 cron-job.org 的標頭中使用。

## 如何取得或設定 CRON_SECRET？

### 步驟 1：生成一個隨機密碼

您可以使用以下方法生成一個隨機密碼：

#### 方法 A：使用線上工具（最簡單）

1. 前往：https://www.random.org/strings/
2. 設定：
   - **Length（長度）**：32
   - **Characters（字元類型）**：選擇 "Alphanumeric"（字母和數字）
3. 點擊 "Generate" 生成
4. **複製生成的密碼**（例如：`aB3cD5eF7gH9iJ1kL3mN5oP7qR9sT1uV3wX5yZ7`）

#### 方法 B：使用其他線上工具

- LastPass 密碼生成器：https://www.lastpass.com/features/password-generator
- 1Password 密碼生成器：https://1password.com/password-generator/

### 步驟 2：在 Vercel 設定環境變數

1. 前往 Vercel Dashboard：https://vercel.com/dashboard
2. 點擊您的專案：**coolcool**
3. 點擊 **Settings** 標籤
4. 點擊左側選單的 **Environment Variables**
5. 點擊 **Add New** 按鈕
6. 填寫：
   - **Key（鍵）**：`CRON_SECRET`
   - **Value（值）**：貼上您剛才生成的隨機密碼
   - **Environment（環境）**：選擇所有環境（Production, Preview, Development）
7. 點擊 **Save**

### 步驟 3：在 cron-job.org 使用

在 cron-job.org 的標頭設定中：
- **鍵**：`Authorization`
- **數值**：`Bearer 您的CRON_SECRET`
  - 例如：如果您的 CRON_SECRET 是 `abc123xyz789`
  - 那麼數值應該是：`Bearer abc123xyz789`

## 完整流程範例

### 1. 生成密碼
使用線上工具生成：`K8mN2pQ5rS9tU3vW7xY1zA4bC6dE8fG0hI2jK4lM6nO8pQ0rS2tU4vW6xY8zA`

### 2. 在 Vercel 設定
- Key: `CRON_SECRET`
- Value: `K8mN2pQ5rS9tU3vW7xY1zA4bC6dE8fG0hI2jK4lM6nO8pQ0rS2tU4vW6xY8zA`

### 3. 在 cron-job.org 使用
- 鍵：`Authorization`
- 數值：`Bearer K8mN2pQ5rS9tU3vW7xY1zA4bC6dE8fG0hI2jK4lM6nO8pQ0rS2tU4vW6xY8zA`

## 重要提醒

### ⚠️ 安全性

1. **不要分享**這個密碼給任何人
2. **不要**在程式碼中寫死這個密碼
3. **妥善保存**這個密碼（如果忘記，可以重新生成並更新）

### ⚠️ 格式要求

在 cron-job.org 使用時，必須是：
```
Bearer 您的CRON_SECRET
```

**注意**：
- `Bearer` 後面**必須有一個空格**
- 然後才是您的 CRON_SECRET 密碼
- 例如：`Bearer abc123xyz789`（正確）
- 例如：`Beareraabc123xyz789`（錯誤，沒有空格）

## 如果忘記 CRON_SECRET

如果忘記了 CRON_SECRET：

1. 重新生成一個新的隨機密碼
2. 在 Vercel 環境變數中更新 `CRON_SECRET` 的值
3. 在 cron-job.org 中更新標頭的數值
4. 重新部署 Vercel（如果需要）

## 檢查 CRON_SECRET 是否正確設定

### 在 Vercel
1. 前往 Vercel Dashboard > 專案 > Settings > Environment Variables
2. 確認 `CRON_SECRET` 存在且有值

### 在 cron-job.org
1. 檢查標頭設定
2. 確認 `Authorization: Bearer 您的CRON_SECRET` 格式正確

### 測試
1. 在 cron-job.org 點擊「立即執行」
2. 如果返回 HTTP 200，表示 CRON_SECRET 正確
3. 如果返回 401 Unauthorized，表示 CRON_SECRET 錯誤或未設定

