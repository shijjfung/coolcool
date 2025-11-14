# cron-job.org 標頭設定說明

## 您看到的介面

點擊「新增」後，出現：
- **鍵（Key）**：這是標頭的名稱
- **數值（Value）**：這是標頭的值
- 數值欄位中有兩個選項：`%cjo:unixtime%` 和 `%cjo:uuid4%`

## 重要說明

`%cjo:unixtime%` 和 `%cjo:uuid4%` 是 cron-job.org 的**變數選項**，我們**不需要使用**這些。

我們需要輸入**固定的文字值**。

## 設定步驟

### 第一個標頭：Authorization

1. **鍵（Key）** 欄位：
   - 輸入：`Authorization`
   - 不要使用變數，直接輸入文字

2. **數值（Value）** 欄位：
   - **忽略** `%cjo:unixtime%` 和 `%cjo:uuid4%` 這兩個選項
   - 直接輸入：`Bearer 你的CRON_SECRET`
   - 例如：`Bearer abc123xyz789`
   - **重要**：`Bearer` 後面必須有一個空格

### 第二個標頭：Content-Type

1. 再次點擊「新增」按鈕
2. **鍵（Key）** 欄位：
   - 輸入：`Content-Type`

3. **數值（Value）** 欄位：
   - **忽略** `%cjo:unixtime%` 和 `%cjo:uuid4%` 這兩個選項
   - 直接輸入：`application/json`

## 完整範例

### 第一個標頭
- **鍵**：`Authorization`
- **數值**：`Bearer abc123xyz789`
  （請將 `abc123xyz789` 替換為您在 Vercel 設定的實際 CRON_SECRET）

### 第二個標頭
- **鍵**：`Content-Type`
- **數值**：`application/json`

## 注意事項

### ⚠️ 不要使用變數

- ❌ 不要選擇 `%cjo:unixtime%`（這是時間戳記）
- ❌ 不要選擇 `%cjo:uuid4%`（這是隨機 UUID）
- ✅ 直接輸入固定的文字值

### ⚠️ Authorization 格式

必須是：
```
Bearer 你的CRON_SECRET
```

**格式要求**：
- `Bearer` 後面必須有一個空格
- 然後才是您的 CRON_SECRET 密碼
- 例如：`Bearer abc123xyz789`（正確）
- 例如：`Beareraabc123xyz789`（錯誤，沒有空格）

## 如果數值欄位是下拉選單

如果「數值」欄位顯示為下拉選單，並且有 `%cjo:unixtime%` 和 `%cjo:uuid4%` 選項：

1. **不要選擇**這些選項
2. 查看是否有 **"自訂"** 或 **"Custom"** 或 **"輸入文字"** 選項
3. 或直接**在欄位中輸入文字**（可能可以覆蓋下拉選單）
4. 或點擊欄位旁邊的**編輯圖示**或**文字輸入模式**

## 完成後應該看到

標頭區塊應該顯示：
```
標頭
Authorization: Bearer 你的CRON_SECRET
Content-Type: application/json
```

或顯示為列表：
- Authorization → Bearer 你的CRON_SECRET
- Content-Type → application/json

## 下一步

設定完兩個標頭後：
1. 確認請求方法已設定為 `POST`
2. 確認請求本體留空
3. 點擊「儲存」或「Save」按鈕
4. 測試執行

