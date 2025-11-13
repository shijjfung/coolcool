# Facebook 和 LINE 自動監控系統使用說明

## 功能概述

本系統支援以下功能：

1. **Facebook 自動監控**：每 3 分鐘自動掃描 Facebook 貼文留言，符合關鍵字的留言會自動建立訂單並回覆
2. **LINE Bot 自動監控**：當 LINE 群組中有符合關鍵字的訊息時，自動建立訂單並回覆「已登記」

## 設定步驟

### 1. Facebook 自動監控設定

#### 步驟 1：在表單創建頁面設定

1. 前往「建立團購單」頁面
2. 勾選「🤖 Facebook 自動監控留言」
3. 填寫以下資訊：
   - **Facebook 貼文連結**：貼上要監控的 Facebook 貼文網址
   - **發文者姓名**：輸入發文者的姓名（例如：愛買）
   - **關鍵字列表**：輸入要匹配的關鍵字（例如：+1、加一、加1、烤雞半隻+1、半隻+1 等）
   - **自動回覆訊息**：當系統抓到符合條件的留言時，會自動回覆此訊息（預設：感謝訂購，本單已登記）

#### 步驟 2：設定 Facebook Access Token

**重要**：Facebook API 對於私密社團的留言存取有嚴格限制，需要：

1. **建立 Facebook App**：
   - 前往 [Facebook Developers](https://developers.facebook.com/)
   - 建立新的 App
   - 取得 App ID 和 App Secret

2. **取得 Access Token**：
   - 需要具有社團管理員權限的帳號
   - 使用 Facebook Graph API Explorer 取得 Access Token
   - 或使用長期有效的 Page Access Token

3. **設定環境變數**：
   ```bash
   FACEBOOK_ACCESS_TOKEN=your_access_token_here
   ```

**注意**：對於私密社團，Facebook Graph API 可能無法直接存取留言。如果遇到此問題，建議：
- 使用 Puppeteer 或其他自動化工具來存取 Facebook
- 或使用 Facebook Webhook（需要 Facebook App 審核通過）

#### 步驟 3：設定定時任務

在 Vercel 中設定 Cron Job：

1. 在 `vercel.json` 中加入：
```json
{
  "crons": [
    {
      "path": "/api/cron/facebook-monitor",
      "schedule": "*/3 * * * *"
    }
  ]
}
```

2. 或在其他定時任務服務中設定每 3 分鐘呼叫：
   `POST https://your-domain.com/api/cron/facebook-monitor`

### 2. LINE Bot 自動監控設定

LINE Bot 已經設定好，會自動監控群組訊息。

#### 支援的關鍵字格式

系統會自動識別以下格式的訊息：
- `+1`
- `加一`
- `加1`
- `半隻+1`
- `+1半隻`
- `半隻加一`
- `半隻加1`
- `烤鴨一隻+1`
- `+1烤鴨一隻`
- 等等...

#### 使用方式

1. 在 LINE 群組中發送符合格式的訊息
2. Bot 會自動識別並建立訂單
3. Bot 會回覆「✅ 已登記」

## 技術說明

### Facebook 留言掃描流程

1. 定時任務每 3 分鐘執行一次
2. 掃描所有啟用自動監控的表單
3. 使用 Facebook Graph API 取得貼文留言
4. 檢查留言是否符合關鍵字
5. 如果符合，建立訂單並回覆留言

### LINE Bot 監控流程

1. LINE Webhook 接收群組訊息
2. 檢查訊息是否符合關鍵字格式
3. 如果符合，解析訊息並建立訂單
4. 回覆「✅ 已登記」

## 注意事項

1. **Facebook Access Token 有效期**：
   - 短期 Token 有效期約 1-2 小時
   - 長期 Token 有效期約 60 天
   - 建議使用 Page Access Token 或長期 Token

2. **私密社團限制**：
   - Facebook Graph API 對私密社團的留言存取有限制
   - 可能需要使用 Puppeteer 或其他自動化工具
   - 或申請 Facebook App 審核以獲得更高權限

3. **重複處理**：
   - 系統會記錄已處理的留言 ID，避免重複處理
   - 但如果留言被刪除後重新建立，可能會重複處理

4. **關鍵字匹配**：
   - 系統使用模糊匹配，只要留言中包含關鍵字就會匹配
   - 建議設定多個關鍵字變體（例如：+1、加一、加1）

## 故障排除

### Facebook 留言無法取得

1. 檢查 Access Token 是否有效
2. 確認貼文連結格式正確
3. 檢查是否有適當的權限（社團管理員權限）
4. 查看伺服器日誌中的錯誤訊息

### LINE Bot 無法回應

1. 確認 LINE Webhook URL 設定正確
2. 檢查環境變數 `LINE_CHANNEL_SECRET` 和 `LINE_CHANNEL_ACCESS_TOKEN` 是否設定
3. 確認 Bot 已加入群組
4. 檢查訊息格式是否符合關鍵字

## 未來改進

1. 使用 Puppeteer 自動化存取 Facebook（解決私密社團限制）
2. 建立已處理留言的追蹤機制（避免重複處理）
3. 支援更多關鍵字格式
4. 增加錯誤通知機制


