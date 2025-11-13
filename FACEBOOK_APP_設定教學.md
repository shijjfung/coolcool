# Facebook App 設定教學

## 📋 目錄
1. [建立 Facebook App](#1-建立-facebook-app)
2. [取得 Access Token](#2-取得-access-token)
3. [設定環境變數](#3-設定環境變數)
4. [測試功能](#4-測試功能)
5. [常見問題](#5-常見問題)

---

## 1. 建立 Facebook App

### 💰 費用說明

**✅ 完全免費！**

- 建立 Meta for Developers 帳號：**免費**
- 建立 Facebook App：**免費**
- 使用 Facebook Graph API 基本功能：**免費**
- 取得 Access Token：**免費**

**⚠️ 注意事項：**
- API 呼叫有速率限制（免費方案通常足夠一般使用）
- 某些進階權限需要 Facebook 審核（審核本身也是免費的）
- 如果使用量非常大，可能需要考慮付費方案（但一般團購管理系統不會達到這個量級）

### 步驟 1：前往 Facebook Developers

1. 前往 [Facebook Developers](https://developers.facebook.com/)
2. 使用您的 Facebook 帳號登入（**不需要付費**）
3. 點擊右上角的「我的應用程式」>「建立應用程式」

### 步驟 2：選擇應用程式類型

1. 選擇「**商業**」或「**其他**」類型
   - 💡 **建議選擇「商業」**，因為您的系統是用來管理訂單和客戶關係

### 步驟 3：填寫應用程式資訊

Facebook 會問一些關於您和應用程式的問題：

#### 問題 1：「About you」（關於您）

**選擇：**
- ✅ **「我是開發者或企業」** 或
- ✅ **「我是企業主」** 或
- ✅ **「其他」**

💡 這些選項都不影響功能，選擇最符合您身份的即可。

#### 問題 2：「應用程式名稱」

**填寫：**
- 例如：「訂單管理系統」
- 或：「團購小幫手」
- 或：「自動訂單管理」

💡 這個名稱只有您看得到，不會公開顯示。

#### 問題 3：「應用程式連絡電子郵件」

**填寫：**
- 您的 Email 地址（用於接收通知）

#### 問題 4：「應用程式用途」或「What are you building?」（您要建立什麼？）

**選擇：**
- ✅ **「管理客戶關係」** 或
- ✅ **「其他」** 或
- ✅ **「商業工具」**

💡 如果沒有完全符合的選項，選擇「其他」即可，不影響後續使用。

#### 問題 5：「Business Account」（商業帳號，可選）

- 可以選擇「稍後再說」或「跳過」
- 這個不是必須的

#### 問題 6：「商家資產管理組合」（Business Asset Group，可選）

**選擇：**
- ✅ **「我還不想連結商家資產管理組合」** 或
- ✅ **「稍後再新增」**

💡 **說明**：
- 這不是必須的步驟
- 可以稍後在「設定」中再新增
- 不會影響基本功能（讀取留言、回覆留言）
- 如果您的系統只是用來管理訂單，通常不需要立即連結

3. 完成後，點擊「**建立應用程式**」或「**Continue**」

### 步驟 4：新增使用案例

建立應用程式後，Facebook 會問「**新增使用案例**」或「**Add Use Cases**」：

#### 建議勾選的選項：

1. ✅ **「Facebook 登入」**（Facebook Login）
   - 用於取得 Access Token

2. ✅ **「Graph API」** 或 **「使用 Graph API」**
   - 這是核心功能，用於讀取留言和回覆留言

3. ✅ **「其他」**（如果有這個選項）
   - 如果沒有完全符合的，可以選這個

#### 不一定要勾選的：

- ❌ 「WhatsApp」- 如果不需要 WhatsApp 功能
- ❌ 「Instagram」- 如果不需要 Instagram 功能
- ❌ 「Messenger」- 如果不需要 Messenger 功能

💡 **重要**：至少需要勾選「**Graph API**」或「**Facebook 登入**」，才能使用 API 功能。

完成後點擊「**完成**」或「**Continue**」。

### 步驟 6：發佈條件（可稍後完成）

建立應用程式後，Facebook 會顯示「**發佈條件**」頁面，列出需要完成的步驟：

#### 顯示的項目：

1. **商家驗證**（Business Verification）
   - 驗證您的商家是商業實體
   - 用於透過 Meta API 存取用戶資料

2. **應用程式審查**（App Review）
   - 完成所有必填的資料使用、資料處理和資料保護問題
   - 提交應用程式審查

#### 重要說明：

⚠️ **這些步驟可以稍後完成！**

- ✅ **基本功能可以先使用**：
  - 讀取公開貼文留言（如果貼文是公開的）
  - 回覆留言（如果帳號有權限）
  - 測試功能

- ⚠️ **進階功能需要完成審查**：
  - 讀取**私密社團**的留言（需要 `groups_access_member_info` 權限，需要審查）
  - 某些進階 API 功能

#### 建議操作：

1. **現在**：點擊「**稍後完成**」或「**Continue**」，先繼續設定基本功能
2. **之後**：如果需要讀取私密社團留言，再回來完成商家驗證和應用程式審查

💡 **對於您的團購訂單管理系統**：
- 如果您的社團是**公開社團**，可能不需要立即完成審查
- 如果您的社團是**私密社團**，之後需要完成審查才能讀取留言
- 可以先測試基本功能，確認運作正常後再決定是否需要審查

### ✅ 應用程式建立完成！

建立完成後，您會看到應用程式的總覽頁面，顯示：
- ✅ 應用程式名稱（例如：「涼涼小幫手」）
- ✅ 應用程式電子郵件
- ✅ 使用案例（例如：「使用 Facebook 登入」）
- ⚠️ 要求（商家驗證、應用程式審查 - 可稍後完成）

**現在可以開始取得 Access Token 了！** 請繼續閱讀「2. 取得 Access Token」章節。

### 步驟 7：取得 App ID 和 App Secret

在取得 Access Token 之前，您需要先取得 App ID 和 App Secret：

1. 在應用程式儀表板中，點擊左側選單「**設定**」>「**基本資料**」
2. 找到「**應用程式編號**」（App ID）- 複製這個號碼
3. 找到「**應用程式密鑰**」（App Secret）- 點擊「**顯示**」來查看，然後複製

💡 **重要**：App Secret 只會顯示一次，請妥善保存！

#### ⚠️ 關於「目前不符合提交資格」的提示

在「基本資料」頁面，您可能會看到「目前不符合提交資格」的提示，缺少以下欄位：
- 應用程式圖示（1024 x 1024）
- 隱私政策網址
- 用戶資料刪除
- 類別

**這些欄位可以稍後填寫！**

- ✅ **基本功能不需要這些**：讀取留言、回覆留言等功能不需要完成這些欄位
- ⚠️ **應用程式審查才需要**：只有當您要提交應用程式審查時，才需要填寫這些欄位
- 💡 **建議**：現在先跳過，直接去取得 Access Token 測試功能，之後如果需要審查再回來填寫

**現在可以：**
1. 複製 App ID 和 App Secret
2. 點擊「**儲存變更**」或直接離開此頁面
3. 前往 Graph API Explorer 取得 Access Token

### 步驟 8：新增產品（如果還沒新增）

如果建立流程中沒有自動新增產品，您需要手動新增：

1. 在應用程式儀表板中，找到「**新增產品**」區塊
2. 找到「**Facebook 登入**」或「**Graph API**」，點擊「**設定**」
3. 如果沒有看到，可以點擊左側選單的「**產品**」>「**新增產品**」

---

## 2. 取得 Access Token

### ⚠️ 重要：應該使用哪個 Facebook 帳號？

**答案：使用「回覆留言的帳號」（Helper Account）來申請 Access Token**

#### 為什麼？

1. **Access Token 綁定帳號**：
   - Access Token 是綁定到「產生 Token 的 Facebook 帳號」
   - 這個帳號會用來：
     - ✅ 讀取社團貼文的留言
     - ✅ 自動回覆留言（例如：「已登記」）

2. **帳號權限要求**：
   - 這個帳號必須是**社團管理員**或**已授權的成員**
   - 必須有權限在該社團：
     - 讀取貼文和留言
     - 回覆留言

3. **如果 PO 文帳號和回覆帳號不同**：
   - ✅ **可以**：PO 文用帳號 A，回覆用帳號 B
   - ⚠️ **但**：帳號 B（回覆帳號）必須有權限存取帳號 A 的貼文
   - 💡 **建議**：如果兩個帳號都是社團管理員，通常沒問題

#### 範例情境

- **情境 1**：同一個帳號
  - 團媽用「愛買」帳號 PO 文
  - 也用「愛買」帳號回覆留言
  - → 使用「愛買」帳號申請 Access Token ✅

- **情境 2**：不同帳號
  - 團媽用「愛買」帳號 PO 文
  - 用「小幫手」帳號回覆留言
  - → 使用「小幫手」帳號申請 Access Token ✅
  - ⚠️ 確保「小幫手」帳號有權限存取「愛買」的貼文

---

### 方法 1：使用 Graph API Explorer（推薦，適合測試）

#### 步驟 1：開啟 Graph API Explorer

1. 前往 [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. **重要**：確保您已登入「回覆留言的帳號」（Helper Account）
3. 在右上角選擇您剛建立的應用程式

#### 步驟 2：選擇權限

1. 在 Graph API Explorer 頁面，找到「**權限**」（Permissions）區塊
2. 點擊「**新增權限**」（Add Permissions）按鈕
3. 勾選以下權限（至少需要這些基本權限）：

**基本權限（必須）：**
- ✅ `public_profile`（公開個人檔案）- 通常已預設勾選
- ✅ `user_posts`（用戶貼文）- 用於讀取貼文和留言

**粉絲專頁權限（如果有粉絲專頁）：**
- ✅ `pages_read_engagement`（讀取粉絲專頁互動）
- ✅ `pages_manage_posts`（管理粉絲專頁貼文）
- ✅ `pages_read_user_content`（讀取粉絲專頁用戶內容）

**社團權限（如果需要讀取私密社團留言，需要審核）：**
- ⚠️ `groups_access_member_info`（存取社團成員資訊）- **需要審核**

💡 **建議**：先勾選基本權限（`public_profile`、`user_posts`）測試功能，如果需要讀取私密社團留言，再申請 `groups_access_member_info` 權限。

#### 步驟 3：取得短期 Token

1. 在 Graph API Explorer 頁面，找到「**存取權杖**」（Access Token）區塊
2. 點擊「**取得權杖**」（Generate Access Token）按鈕
3. 會跳出 Facebook 登入視窗，確認權限
4. 確認後，Token 會自動填入「存取權杖」欄位
5. 點擊「**Copy Token**」按鈕複製 Token（格式類似：`EAABwzLix...`）

💡 **重要**：這是短期 Token，只有 1-2 小時有效，需要轉換為長期 Token。

#### 步驟 4：轉換為長期 Token（重要！）

短期 Token 只有 1-2 小時有效，需要轉換為長期 Token：

1. 在瀏覽器開啟以下 URL（替換 `YOUR_SHORT_TOKEN` 為您的短期 Token）：
   ```
   https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_TOKEN
   ```

2. 取得 `APP_ID` 和 `APP_SECRET`：
   - 前往應用程式儀表板
   - 點擊左側選單「**設定**」>「**基本資料**」
   - 找到「**應用程式編號**」（App ID）和「**應用程式密鑰**」（App Secret）
   - 點擊「**顯示**」來查看 App Secret

3. 在瀏覽器開啟轉換 URL，會得到長期 Token（約 60 天有效）

#### ⚠️ 關於 Token 有效期

**Facebook 不再提供永久 Token**，長期 Token 最多約 60 天有效。

**解決方案：**

1. **手動更新**（每 60 天）：
   - 在 Token 到期前，重新使用 Graph API Explorer 取得新的短期 Token
   - 再次轉換為長期 Token
   - 更新環境變數

2. **自動更新**（推薦）：
   - 使用 Facebook 的 Token 刷新機制
   - 在 Token 到期前（例如：第 55 天），使用以下 URL 自動刷新：
     ```
     https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_CURRENT_LONG_TOKEN
     ```
   - 這會產生一個新的長期 Token（再延長 60 天）

3. **設定提醒**：
   - 建議在行事曆設定提醒（例如：每 50 天提醒一次）
   - 或使用自動化工具定期更新

💡 **實際使用建議**：
- 60 天其實很長，對於一般使用來說足夠
- 如果您的系統是長期運作，建議設定自動更新機制
- 或者定期檢查 Token 是否有效，到期前手動更新

### 方法 2：使用 Page Access Token（適合粉絲專頁）

如果您要管理粉絲專頁的貼文：

1. 前往 [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. 選擇您的應用程式
3. 在「**使用者或頁面**」下拉選單中選擇您的粉絲專頁
4. 點擊「**產生存取權杖**」
5. 複製產生的 Page Access Token

### 方法 3：使用 User Access Token（適合個人貼文和社團）

對於社團貼文，您需要：

1. **確保您是社團管理員或管理員已授權**
2. 使用 Graph API Explorer 取得 User Access Token
3. 選擇權限時，確保包含 `groups_access_member_info`（需要審核）

---

## 3. 設定環境變數

### 在 Vercel 設定（如果使用 Vercel 部署）

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇您的專案
3. 點擊「**Settings**」>「**Environment Variables**」
4. 點擊「**Add New**」
5. 新增以下環境變數：

| 變數名稱 | 值 | 說明 |
|---------|-----|------|
| `FACEBOOK_ACCESS_TOKEN` | 您的長期 Access Token | Facebook API 存取權杖 |
| `FACEBOOK_APP_ID` | 您的 App ID | Facebook 應用程式編號（選填） |
| `FACEBOOK_APP_SECRET` | 您的 App Secret | Facebook 應用程式密鑰（選填） |

6. 選擇「**All Environments**」✅
7. 點擊「**Save**」

### 在本地開發環境設定

建立或編輯 `.env.local` 檔案：

```env
FACEBOOK_ACCESS_TOKEN=您的長期AccessToken
FACEBOOK_APP_ID=您的AppID
FACEBOOK_APP_SECRET=您的AppSecret
```

**重要**：不要將 `.env.local` 檔案提交到 Git！

---

## 4. 測試功能

### 測試 1：檢查環境變數

訪問：
```
https://your-domain.com/api/debug/check-env
```

應該看到：
```json
{
  "FACEBOOK_ACCESS_TOKEN": "已設定",
  "diagnosis": {
    "facebookConfigured": true
  }
}
```

### 測試 2：測試掃描留言

1. 在管理後台建立一個表單
2. 啟用「Facebook 自動監控留言」
3. 填入：
   - Facebook 貼文連結
   - 發文者姓名
   - 關鍵字列表
   - 自動回覆訊息
4. 系統會每 3 分鐘自動掃描一次

### 測試 3：手動觸發掃描

可以透過 API 手動觸發掃描：

```bash
POST https://your-domain.com/api/facebook/scan-comments
Content-Type: application/json

{
  "accessToken": "您的AccessToken"  // 可選，如果不提供會使用環境變數
}
```

---

## 5. 常見問題

### Q1: 為什麼無法取得社團留言？

**A:** Facebook 對社團留言的存取有嚴格限制：

1. **需要審核的權限**：
   - `groups_access_member_info` 需要 Facebook 審核
   - 審核可能需要數天到數週

2. **替代方案**：
   - 使用 **Puppeteer** 自動化瀏覽器（需要額外設定）
   - 使用 **Facebook Webhook**（需要設定 Webhook URL）
   - 手動複製留言到系統

3. **建議**：
   - 如果是公開社團，可以嘗試使用公開 API
   - 如果是私密社團，建議使用 LINE Bot 作為主要管道

### Q2: Access Token 過期了怎麼辦？

**A:** 長期 Token 約 60 天有效，過期後需要：

1. 重新使用 Graph API Explorer 取得新的短期 Token
2. 轉換為長期 Token
3. 更新環境變數中的 `FACEBOOK_ACCESS_TOKEN`

### Q3: 如何取得社團貼文的 Access Token？

**A:** 對於社團貼文：

1. **使用「回覆留言的帳號」登入 Facebook**
2. 確保該帳號是社團管理員或已授權的成員
3. 在 Graph API Explorer 中：
   - 選擇您的應用程式
   - 選擇「**使用者或頁面**」>「**取得權杖**」
   - 勾選 `groups_access_member_info` 權限
   - 產生 Token

4. **注意**：`groups_access_member_info` 需要 Facebook 審核，審核通過後才能使用

### Q6: PO 文帳號和回覆帳號不同，可以嗎？

**A:** 可以，但需要注意：

1. **使用回覆帳號申請 Access Token**：
   - Access Token 必須是「回覆留言的帳號」產生的
   - 這個帳號會用來讀取留言和回覆留言

2. **確保權限**：
   - 回覆帳號必須有權限存取 PO 文帳號的貼文
   - 如果兩個帳號都是社團管理員，通常沒問題
   - 如果 PO 文帳號是管理員，回覆帳號是成員，可能需要額外授權

3. **測試方法**：
   - 用回覆帳號登入 Facebook
   - 嘗試在 PO 文帳號的貼文下方留言
   - 如果可以留言，通常就可以用 API 回覆

### Q4: 如何測試回覆功能？

**A:** 

1. 確保 Access Token 有回覆權限
2. 在測試貼文下方留言（符合關鍵字）
3. 等待系統掃描（最多 3 分鐘）
4. 檢查留言下方是否有自動回覆

### Q5: 為什麼回覆失敗？

**A:** 可能的原因：

1. **權限不足**：Access Token 沒有回覆權限
2. **Token 過期**：需要更新 Token
3. **社團設定**：某些社團可能限制自動回覆
4. **API 限制**：Facebook API 有速率限制

**解決方法**：
- 檢查 Access Token 是否有效
- 確認帳號有該社團的管理權限
- 查看伺服器日誌了解詳細錯誤

### Q7: 使用 Facebook API 需要付費嗎？

**A:** 不需要！完全免費：

1. **建立帳號和 App**：完全免費
2. **使用 Graph API**：免費（有速率限制，但一般使用足夠）
3. **取得 Access Token**：免費
4. **審核權限**：免費（但需要時間）

**⚠️ 速率限制：**
- 免費方案有 API 呼叫次數限制
- 一般團購管理系統的使用量不會超過限制
- 如果超過限制，Facebook 會暫時限制，但不會收費

**💡 付費方案：**
- 只有當您的使用量非常大（例如：每天數百萬次 API 呼叫）時才需要考慮
- 一般個人或小型企業使用完全不需要付費

---

## 6. 進階設定

### 設定 Webhook（可選）

如果您想即時接收 Facebook 留言通知：

1. 在應用程式儀表板中，點擊「**產品**」>「**Webhooks**」
2. 點擊「**新增訂閱**」
3. 選擇「**comments**」事件
4. 設定回呼 URL：`https://your-domain.com/api/webhook/facebook`
5. 設定驗證 Token（在環境變數中設定 `FACEBOOK_VERIFY_TOKEN`）

### 使用 Page Access Token（粉絲專頁）

如果您要管理粉絲專頁：

1. 在 Graph API Explorer 中選擇您的粉絲專頁
2. 取得 Page Access Token
3. 使用 Page Access Token 來回覆留言

---

## 7. 安全建議

1. **不要公開 Access Token**：
   - 不要將 Token 提交到 Git
   - 不要在前端程式碼中使用 Token
   - 只在後端環境變數中儲存

2. **定期更新 Token**：
   - 長期 Token 約 60 天有效
   - 建議設定提醒，定期更新

3. **限制權限**：
   - 只申請必要的權限
   - 定期檢查應用程式的權限設定

---

## 8. 快速開始檢查清單

- [ ] 建立 Facebook App
- [ ] 取得 App ID 和 App Secret
- [ ] 使用 Graph API Explorer 取得短期 Token
- [ ] 轉換為長期 Token
- [ ] 設定環境變數 `FACEBOOK_ACCESS_TOKEN`
- [ ] 測試掃描留言功能
- [ ] 測試自動回覆功能

---

## 需要幫助？

如果遇到問題，請檢查：
1. 伺服器日誌（查看錯誤訊息）
2. Facebook Developers Console（查看應用程式狀態）
3. Graph API Explorer（測試 API 是否正常）

---

**最後更新**：2024年


