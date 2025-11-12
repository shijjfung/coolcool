# 如何取得 LINE 群組 ID

## 方法 1：從 LINE Developers Console 查看（最簡單）

### 步驟：

1. **前往 LINE Developers Console**
   - 網址：https://developers.line.biz/console/
   - 登入並選擇您的 Bot

2. **前往 Webhook 設定頁面**
   - 點擊左側選單的「Messaging API」
   - 找到「Webhook settings」區塊

3. **觸發 Webhook 事件**
   - 在 LINE 群組中發送任何訊息給 Bot（例如：「測試」）
   - 等待幾秒鐘

4. **查看 Webhook 事件**
   - 在 LINE Developers Console 中，點擊「Webhook event」或「Verify」按鈕
   - 或前往「Messaging API」>「Webhook settings」>「Webhook event」
   - 找到最新的事件記錄

5. **找到群組 ID**
   - 在事件記錄中，找到包含 `"source"` 的 JSON 資料
   - 查看 `"source"` 物件中的 `"groupId"` 欄位
   - 複製 `groupId` 的值（格式類似：`C1234567890abcdefghijklmnopqrstuvwxyz`）

### 範例 JSON：

```json
{
  "events": [
    {
      "type": "message",
      "source": {
        "type": "group",
        "groupId": "C1234567890abcdefghijklmnopqrstuvwxyz",
        "userId": "U1234567890abcdefghijklmnopqrstuvwxyz"
      },
      "message": {
        "type": "text",
        "text": "測試"
      }
    }
  ]
}
```

**群組 ID 就是 `"groupId"` 的值！**

---

## 方法 2：等待 Bot 自動回覆（需要重新部署）

如果您已經重新部署到 Vercel，可以在群組中發送「群組ID」給 Bot，Bot 會自動回覆群組 ID。

---

## 方法 3：從伺服器日誌查看

如果您有伺服器日誌存取權限，可以在日誌中搜尋 `groupId` 來找到群組 ID。

---

## 重要提醒

- ✅ 群組 ID 是固定的，取得一次後可以重複使用
- ✅ Bot 必須先加入群組才能取得群組 ID
- ✅ 群組 ID 格式通常以 `C` 開頭，後面跟著一串英數字
- ⚠️ 私訊 Bot 無法取得群組 ID，必須在群組中發送訊息

---

## 快速步驟總結

1. 在群組中發送訊息給 Bot
2. 前往 LINE Developers Console > Messaging API > Webhook settings
3. 查看 Webhook 事件記錄
4. 找到 `source.groupId` 的值
5. 複製並貼到管理後台

