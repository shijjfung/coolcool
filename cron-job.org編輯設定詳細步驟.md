# cron-job.org 編輯設定詳細步驟

## 當前介面說明

您看到的設定項目：
- **HTTP 身份驗證**：不需要設定（這是用於需要帳號密碼的網站）
- **標頭**：這裡需要新增自訂標頭 ⚠️ 重要
- **請求方法**：需要選擇 POST
- **請求本體**：留空
- **請求逾時**：30 秒（預設即可）

## 設定步驟

### 1. 請求方法（Request Method）

找到 **"請求方法"** 選項（目前顯示為 `0`）

- 點擊下拉選單或選項
- 選擇 **`POST`** 或 **`HTTP POST`**
- 不要選擇 GET 或其他選項

### 2. 標頭（Headers）⚠️ 最重要

找到 **"標頭"** 區塊，目前顯示「沒有定義自訂標頭」

1. 點擊 **"新增標頭"** 或 **"Add Header"** 或 **"+"** 按鈕
2. 會出現兩個欄位：**名稱（Name）** 和 **值（Value）**

**新增第一個標頭：**
- **名稱（Name）**：輸入 `Authorization`
- **值（Value）**：輸入 `Bearer 你的CRON_SECRET`
  （請將 `你的CRON_SECRET` 替換為您在 Vercel 設定的實際密碼）
- 例如：`Bearer abc123xyz789`

**新增第二個標頭：**
- 再次點擊 **"新增標頭"** 或 **"Add Header"**
- **名稱（Name）**：輸入 `Content-Type`
- **值（Value）**：輸入 `application/json`

**完成後應該看到：**
```
標頭
Authorization: Bearer 你的CRON_SECRET
Content-Type: application/json
```

### 3. 請求本體（Request Body）

找到 **"請求本體"** 或 **"Request Body"** 欄位

- **留空**，不需要填寫任何內容
- 或選擇「無」或「Empty」

### 4. 請求逾時（Request Timeout）

- **30 秒**（預設即可，不需要修改）

### 5. HTTP 身份驗證

- **不需要設定**，保持空白
- 這是用於需要帳號密碼登入的網站，我們不需要

### 6. 時區

- **Asia/Taipei**（已經正確，不需要修改）

### 7. 儲存

點擊 **"儲存"** 或 **"Save"** 或 **"更新"** 按鈕

## 完整設定摘要

| 項目 | 設定值 |
|------|--------|
| 標題 | 臉書掃描 |
| 網址 | https://coolcool-ten.vercel.app/api/cron/facebook-monitor |
| Crontab 表達式 | `*/3 * * * *` |
| 請求方法 | **POST** |
| 標頭 1 | `Authorization: Bearer 你的CRON_SECRET` |
| 標頭 2 | `Content-Type: application/json` |
| 請求本體 | **留空** |
| 請求逾時 | 30 秒（預設） |
| HTTP 身份驗證 | **不需要** |
| 時區 | Asia/Taipei |

## 重要提醒

### ⚠️ Authorization 標頭格式

必須是：
```
Bearer 你的CRON_SECRET
```

**注意**：
- `Bearer` 後面**必須有一個空格**
- 然後才是您的 CRON_SECRET 密碼
- 例如：`Bearer abc123xyz789`（正確）
- 例如：`Beareraabc123xyz789`（錯誤，沒有空格）

### ⚠️ 如果找不到「新增標頭」按鈕

有些介面可能顯示為：
- **"新增"** 或 **"Add"**
- **"+"** 按鈕
- **"定義標頭"** 或 **"Define Headers"**

## 測試設定

儲存後：

1. 點擊 **"立即執行"** 或 **"Run now"** 按鈕
2. 檢查執行結果：
   - ✅ **成功**：HTTP 200
   - ❌ **401 Unauthorized**：CRON_SECRET 錯誤
   - ❌ **404 Not Found**：網址錯誤
   - ❌ **405 Method Not Allowed**：請求方法錯誤（應該是 POST）

## 常見問題

### Q: 請求方法顯示為 0，無法選擇？
A: 可能需要點擊該欄位，會出現下拉選單，選擇 POST

### Q: 找不到「新增標頭」按鈕？
A: 可能在「進階」或「Advanced」選項中，或介面下方

### Q: 標頭格式不正確？
A: 確認格式為 `Authorization: Bearer 你的密碼`（Bearer 後面有空格）

