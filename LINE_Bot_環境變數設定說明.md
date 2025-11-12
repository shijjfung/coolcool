# LINE Bot 環境變數設定說明

## 📋 需要設定的環境變數

### 1. LINE_CHANNEL_ACCESS_TOKEN（必填）

這是 LINE Bot 最重要的環境變數，用於發送訊息。

#### 如何取得：

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 選擇您的 Bot（或建立新的 Bot）
3. 點擊左側選單的 **「Messaging API」**
4. 向下滾動找到 **「Channel access token」** 區塊
5. 點擊 **「Issue」** 或 **「Reissue」** 按鈕
6. 複製產生的 Token（格式類似：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

#### 在 Vercel 設定：

1. 前往 Vercel Dashboard
2. 選擇您的專案
3. 點擊 **Settings** > **Environment Variables**
4. 點擊 **Add New**
5. 填入：
   - **Key**: `LINE_CHANNEL_ACCESS_TOKEN`
   - **Value**: 貼上剛才複製的 Token
   - **Environments**: 選擇 **「All Environments」** ✅
6. 點擊 **Save**

---

### 2. LINE_CHANNEL_SECRET（選填，建議設定）

用於驗證 Webhook 請求的安全性。

#### 如何取得：

1. 在 LINE Developers Console 中，選擇您的 Bot
2. 點擊 **「Basic settings」** 頁籤
3. 找到 **「Channel secret」**
4. 點擊 **「Show」** 顯示並複製

#### 在 Vercel 設定：

1. 同樣在 Vercel Environment Variables 中
2. 新增：
   - **Key**: `LINE_CHANNEL_SECRET`
   - **Value**: 貼上 Channel Secret
   - **Environments**: 選擇 **「All Environments」** ✅
3. 點擊 **Save**

---

### 3. LINE_FORM_TOKEN（選填）

預設的表單代碼，用於 LINE Bot 自動建立訂單時使用。

如果沒有設定，用戶需要在訊息中指定表單代碼（例如：`@表單代碼 商品+數量`）

---

## ✅ 設定完成後

### 1. 重新部署

**重要**：設定環境變數後，必須重新部署才能生效！

1. 前往 Vercel Dashboard > **Deployments**
2. 點擊最新部署右側的 **⋯**
3. 選擇 **Redeploy**
4. **不要勾選** "Use existing Build Cache"
5. 點擊 **Redeploy**
6. 等待部署完成（1-3 分鐘）

### 2. 檢查設定

部署完成後，訪問：
```
https://your-domain.vercel.app/api/debug/check-env
```

應該看到：
```json
{
  "LINE_CHANNEL_ACCESS_TOKEN": "xxxxxxxxxxxxx...（已設定）",
  "diagnosis": {
    "lineBotConfigured": true
  }
}
```

---

## 🔧 測試 LINE Bot 功能

設定完成後，您可以：

1. 前往管理後台
2. 選擇一個有 LINE 入口訂單的表單
3. 點擊 **「💬 LINE 取貨通知」** 按鈕
4. 輸入：
   - **LINE 群組 ID**（可在 LINE Developers Console 的 Webhook 事件中取得）
   - **通知訊息**
5. 點擊 **「📤 發送通知」**

---

## ⚠️ 常見問題

### Q: 如何取得 LINE 群組 ID？

A: 有幾種方式：

1. **從 Webhook 事件中取得**：
   - 在 LINE Developers Console 中，前往 **「Messaging API」** > **「Webhook settings」**
   - 當 Bot 收到群組訊息時，Webhook 事件中會包含 `groupId`

2. **從 Bot 接收的訊息中取得**：
   - 當 Bot 在群組中收到訊息時，Webhook 事件中的 `source.groupId` 就是群組 ID

3. **使用 LINE API 查詢**：
   - 如果 Bot 已經在群組中，可以透過 API 查詢群組資訊

### Q: Token 過期了怎麼辦？

A: 
1. 前往 LINE Developers Console
2. 在 **「Messaging API」** 頁籤中
3. 點擊 **「Reissue」** 重新產生 Token
4. 更新 Vercel 環境變數
5. 重新部署

### Q: 為什麼發送訊息失敗？

A: 請檢查：
- ✅ Channel Access Token 是否正確設定
- ✅ Bot 是否已加入目標群組
- ✅ 群組 ID 是否正確
- ✅ Bot 是否有發送訊息的權限

---

## 📝 環境變數清單

| 變數名稱 | 必填 | 說明 |
|---------|------|------|
| `LINE_CHANNEL_ACCESS_TOKEN` | ✅ 是 | LINE Bot 的存取權杖 |
| `LINE_CHANNEL_SECRET` | ⚠️ 選填 | 用於 Webhook 驗證 |
| `LINE_FORM_TOKEN` | ⚠️ 選填 | 預設表單代碼 |

---

**設定完成後，記得重新部署！** 🚀

