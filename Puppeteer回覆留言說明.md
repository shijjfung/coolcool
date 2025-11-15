# Puppeteer 回覆留言功能說明

## ✅ 已完成的功能

### 1. 自動回覆留言（掃描時）

**位置：** `pages/api/facebook/scan-comments.ts`

**功能：**
- 當掃描到符合關鍵字的留言時
- 自動建立訂單
- 自動使用 Puppeteer 回覆留言（「已登記」或自訂訊息）

**使用方式：**
- 在表單設定中啟用「Facebook 自動監控」
- 設定「Facebook 回覆訊息」（可選，預設為「已登記」）
- 系統會自動回覆符合關鍵字的留言

---

### 2. 取貨通知（手動發送）

**位置：** `pages/api/facebook/send-pickup-notification.ts`

**功能：**
- 在後台選擇多個訂單
- 發送統一的取貨通知訊息
- 使用 Puppeteer 自動回覆到對應的 Facebook 留言

**使用方式：**
- 在後台管理頁面選擇訂單
- 點擊「發送取貨通知」
- 輸入通知訊息
- 系統會自動回覆到每個訂單對應的 Facebook 留言

---

## 🔧 技術實作

### Puppeteer 回覆留言流程

1. **啟動瀏覽器**
   - 使用 Cookie 登入 Facebook
   - 設定 User-Agent 和 Headers

2. **訪問留言頁面**
   - 構建留言 URL（貼文 URL + #comment_留言ID）
   - 滾動到目標留言

3. **找到並點擊回覆按鈕**
   - 搜尋包含留言 ID 的元素
   - 點擊該留言的回覆按鈕

4. **輸入回覆訊息**
   - 尋找回覆輸入框
   - 輸入訊息
   - 點擊發送按鈕或按 Enter

5. **確認回覆成功**
   - 檢查頁面是否包含回覆訊息

---

## ⚙️ 環境變數設定

### 必需的環境變數

```env
# Facebook Cookie（從 Cookie-Editor 取得）
FACEBOOK_COOKIES='[{"name":"c_user",...}]'

# 啟用 Puppeteer 模式
FACEBOOK_USE_PUPPETEER=true
```

### 可選的環境變數

```env
# 是否使用無頭模式（false = 顯示瀏覽器視窗，用於除錯）
FACEBOOK_PUPPETEER_HEADLESS=true

# 超時時間（毫秒）
FACEBOOK_PUPPETEER_TIMEOUT=60000
```

---

## 📝 使用範例

### 自動回覆（掃描時）

當系統掃描到符合關鍵字的留言時，會自動：

1. 建立訂單
2. 使用 Puppeteer 回覆留言
3. 記錄回覆結果

**日誌範例：**
```
[Facebook] 💬 準備使用 Puppeteer 回覆留言 comment_123：已登記
[Puppeteer] 啟動瀏覽器以回覆留言...
[Puppeteer] 使用 Cookie 登入 Facebook...
[Puppeteer] ✅ 使用 Cookie 登入成功
[Puppeteer] 正在訪問留言：https://www.facebook.com/groups/.../posts/...#comment_123
[Puppeteer] 找到回覆輸入框：div[contenteditable="true"]
[Puppeteer] 輸入回覆訊息：已登記
[Puppeteer] ✅ 回覆留言成功
[Facebook] ✅ 已使用 Puppeteer 回覆留言 comment_123：已登記
```

---

### 取貨通知（手動發送）

在後台選擇訂單並發送通知：

**API 呼叫：**
```bash
POST /api/facebook/send-pickup-notification
{
  "orderIds": [1, 2, 3],
  "message": "您的訂單已到貨，請於 12/25 前來取貨"
}
```

**日誌範例：**
```
[Puppeteer] 準備回覆留言：貼文 https://www.facebook.com/...，留言 ID comment_123
[Puppeteer] 啟動瀏覽器以回覆留言...
[Puppeteer] ✅ 已成功回覆留言 comment_123
```

---

## ⚠️ 注意事項

### 1. Cookie 有效期

- Cookie 通常有效 1-3 個月
- 過期後需要重新取得
- 建議定期檢查 Cookie 是否有效

### 2. Facebook 頁面結構變更

- Facebook 可能會更新頁面結構
- 如果回覆失敗，可能需要更新選擇器
- 建議定期測試功能

### 3. 回覆速度

- Puppeteer 需要啟動瀏覽器，速度較慢
- 每個回覆約需 5-10 秒
- 大量回覆時可能需要較長時間

### 4. 錯誤處理

- 如果找不到回覆輸入框，會記錄錯誤但不會中斷流程
- 建議查看 Console 日誌了解詳細錯誤

---

## 🔍 除錯方法

### 方法 1：使用非無頭模式

設定環境變數：
```env
FACEBOOK_PUPPETEER_HEADLESS=false
```

這樣可以看到瀏覽器視窗，觀察回覆過程。

### 方法 2：查看 Console 日誌

檢查開發伺服器的 Console 輸出，尋找：
- `[Puppeteer]` 開頭的訊息
- 錯誤訊息和警告

### 方法 3：手動測試

可以建立一個測試 API 來單獨測試回覆功能。

---

## 🆘 常見問題

### Q1: 找不到回覆輸入框？

**可能原因：**
- Facebook 頁面結構已變更
- 留言尚未完全載入
- 需要先點擊回覆按鈕

**解決方法：**
- 更新選擇器（在 `lib/facebook-puppeteer.ts` 中）
- 增加等待時間
- 使用非無頭模式觀察

### Q2: 回覆失敗但沒有錯誤訊息？

**可能原因：**
- Cookie 已過期
- 沒有回覆權限
- 留言已被刪除

**解決方法：**
- 重新取得 Cookie
- 確認帳號有回覆權限
- 檢查留言是否還存在

### Q3: 回覆速度太慢？

**可能原因：**
- 每個回覆都需要啟動瀏覽器
- 網路連線較慢

**解決方法：**
- 這是正常現象，Puppeteer 需要時間
- 可以考慮批次處理（一次處理多個）

---

## ✅ 總結

現在系統已完全使用 Puppeteer 來：

1. ✅ **抓取留言** - 使用 Puppeteer 模擬瀏覽器
2. ✅ **回覆留言** - 使用 Puppeteer 自動回覆
3. ✅ **取貨通知** - 使用 Puppeteer 發送通知

**不再需要：**
- ❌ Graph API（已刪除）
- ❌ Access Token（抓取留言不需要）
- ❌ Token 管理 API（已刪除）

**只需要：**
- ✅ Facebook Cookie（從 Cookie-Editor 取得）
- ✅ Puppeteer 設定

所有功能現在都使用 Puppeteer 實作！

