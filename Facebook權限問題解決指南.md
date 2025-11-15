# Facebook 權限問題解決指南

## ⚠️ 重要通知（2024年4月22日後）

**Facebook 已於 2024 年 4 月 22 日起移除 Groups API 功能。**

- ❌ `groups_read_content` 和 `groups_access_member_info` 權限已被永久移除
- ❌ 無法再透過 API 讀取群組貼文留言
- ❌ 無法再申請或使用這些權限

**請參考 `Facebook權限已移除說明.md` 了解替代方案。**

---

## 問題描述（歷史參考）

當您看到以下錯誤訊息時，表示 Facebook API 無法取得社團貼文的留言：

1. **錯誤代碼 100 + 子代碼 33**：
   ```
   Unsupported get request. Object with ID 'XXX' does not exist, 
   cannot be loaded due to missing permissions, or does not support this operation.
   ```

2. **錯誤代碼 10**：
   ```
   To use this endpoint, your use of this endpoint must be reviewed 
   and approved by Facebook.
   ```

## ⚠️ 重要：功能已無法使用

由於 Facebook 已移除 Groups API 功能，以下步驟**已無法解決問題**。

**請改用以下替代方案：**
- ✅ 使用 LINE 自動監控功能
- ✅ 引導客戶使用下單連結
- ✅ 手動在後台輸入訂單

---

## 解決步驟（歷史參考 - 已失效）

### 步驟 1：檢查 Access Token 權限（已無法使用）

1. **前往 Graph API Explorer**：
   - 網址：https://developers.facebook.com/tools/explorer/
   - 或搜尋「Facebook Graph API Explorer」

2. **選擇您的應用程式**：
   - 在右上角選擇您建立的 Facebook 應用程式

3. **檢查目前的權限**：
   - 點擊 Token 旁邊的「i」圖示或「除錯」按鈕
   - 查看「權限」列表，確認是否有以下權限：
     - `groups_read_content`（讀取社團內容）
     - `groups_access_member_info`（存取社團成員資訊）

4. **如果缺少權限，添加權限**：
   - 點擊「Generate Access Token」或「產生存取權杖」按鈕
   - 在「新增權限」欄位中輸入：`groups_read_content`
   - 按 Enter 或點擊添加
   - 再次輸入：`groups_access_member_info`
   - 按 Enter 或點擊添加
   - 點擊「Generate Access Token」生成新的 Token
   - **重要**：Facebook 可能會顯示授權畫面，請確認所有權限都被勾選
   - 點擊「Continue」或「繼續」完成授權

5. **驗證新 Token**：
   - 點擊新 Token 旁邊的「i」圖示
   - 確認現在有 `groups_read_content` 和 `groups_access_member_info` 權限

6. **更新環境變數**：
   - 複製新的 Access Token
   - 前往 Vercel 專案設定
   - 更新 `FACEBOOK_ACCESS_TOKEN` 環境變數
   - 重新部署應用程式

### 步驟 2：確認帳號權限

1. **確認 Token 對應的 Facebook 帳號**：
   - 在 Graph API Explorer 中，點擊 Token 旁邊的「i」圖示
   - 查看「使用者」欄位，確認是哪個 Facebook 帳號

2. **確認該帳號的社團權限**：
   - 使用該 Facebook 帳號登入
   - 前往目標社團
   - 確認該帳號是**管理員**或**成員**
   - 確認該帳號可以正常查看和回覆該貼文的留言

3. **如果帳號不是管理員或成員**：
   - 請將該帳號加入社團
   - 或使用社團管理員的帳號來生成 Token

### 步驟 3：測試 API 呼叫

1. **在 Graph API Explorer 中測試**：
   - 在 Graph API Explorer 中，輸入以下 API 端點：
     ```
     GET /{group_id}_{post_id}/comments
     ```
   - 例如：`GET /371907553892831_1477072346709674/comments`
   - 點擊「Submit」或「提交」
   - 查看是否成功取得留言

2. **如果仍然失敗**：
   - 檢查錯誤訊息
   - 如果顯示需要審核，請繼續步驟 4

### 步驟 4：申請 Facebook App Review（如果需要）

如果錯誤代碼是 10，表示該功能需要通過 Facebook 審核：

1. **前往 App Review 頁面**：
   - 網址：https://developers.facebook.com/apps/{your-app-id}/app-review/
   - 將 `{your-app-id}` 替換為您的應用程式 ID

2. **申請權限**：
   - 點擊「Request Permissions」或「申請權限」
   - 搜尋並選擇以下權限：
     - `groups_read_content`
     - `groups_access_member_info`
   - 填寫申請表單，說明您的使用場景
   - 提交申請

3. **等待審核**：
   - Facebook 通常需要 1-7 個工作天審核
   - 審核通過後，您就可以使用這些權限了

## 常見問題

### Q1: 為什麼需要這些權限？

A: 因為您要讀取**私密社團**的貼文留言，Facebook 要求應用程式必須有明確的權限才能存取這些內容。

### Q2: 公開社團也需要這些權限嗎？

A: 公開社團的貼文通常不需要特殊權限，但私密社團一定需要。

### Q3: Token 會過期嗎？

A: 是的，User Access Token 通常有 60 天的有效期。系統會自動刷新 Token，但請確保 Token 有正確的權限。

### Q4: 如何確認 Token 是否有效？

A: 在 Graph API Explorer 中點擊 Token 旁邊的「i」圖示，查看「到期時間」和「權限」列表。

### Q5: 申請 App Review 需要多長時間？

A: 通常需要 1-7 個工作天，但可能更長，取決於 Facebook 的審核速度。

## 技術支援

如果以上步驟都無法解決問題，請：

1. 檢查 Vercel 的函數日誌，查看詳細的錯誤訊息
2. 在 Graph API Explorer 中測試 API 呼叫
3. 確認 Token 的權限和有效期
4. 確認帳號的社團權限

## 相關連結

- [Facebook Graph API 文件](https://developers.facebook.com/docs/graph-api)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [App Review 指南](https://developers.facebook.com/docs/apps/review)
- [權限參考](https://developers.facebook.com/docs/permissions/reference)

