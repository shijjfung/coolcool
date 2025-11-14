# Facebook API 權限問題解決步驟

## 當前狀態

✅ **Token 有效**：剩餘 59 天（到期時間：2026/1/12）
❌ **API 訪問被阻擋**：`"API access blocked."` (OAuthException code: 200)

## 問題分析

Token 有效但 API 被阻擋，通常是以下原因：

### 1. Token 權限不足

即使 Token 有效，如果沒有正確的權限，也無法訪問社團內容。

### 2. 帳號權限問題

Token 對應的 Facebook 帳號必須：
- 是該社團的**管理員**或**成員**
- 有權限訪問該社團的內容

### 3. 應用程式權限設定

Facebook 應用程式需要：
- 已通過審核的權限（如果適用）
- 正確的權限範圍設定

## 解決步驟

### 步驟 1：檢查 Token 權限

1. 前往 Facebook Graph API Explorer：
   https://developers.facebook.com/tools/explorer/

2. 選擇您的 Access Token（或輸入您的 Token）

3. 點擊 **"i"** 圖示查看 Token 資訊

4. 檢查權限（Permissions）：
   - ✅ `groups_access_member_info` - 訪問社團成員資訊
   - ✅ `groups_read_content` - 讀取社團內容（貼文、留言）
   - ✅ `public_profile` - 基本個人資料（通常自動包含）

### 步驟 2：測試 API 呼叫

在 Graph API Explorer 中測試：

1. **測試 1：檢查 Token 資訊**
   ```
   GET /me?fields=id,name
   ```
   應該返回您的 Facebook 帳號資訊

2. **測試 2：檢查社團權限**
   ```
   GET /me/groups
   ```
   應該返回您有權限的社團列表
   - 確認目標社團 `371907553892831` 在列表中

3. **測試 3：測試貼文訪問**
   ```
   GET /371907553892831_1476892770060965/comments
   ```
   如果返回錯誤，查看錯誤訊息：
   - `API access blocked`：權限不足
   - `Unsupported get request`：貼文 ID 格式錯誤
   - `Invalid OAuth access token`：Token 無效

### 步驟 3：重新生成 Access Token（如果需要）

如果權限不足：

1. 在 Graph API Explorer 中：
   - 點擊 **"Generate Access Token"**
   - 選擇權限：
     - ✅ `groups_access_member_info`
     - ✅ `groups_read_content`
     - ✅ `public_profile`
   - 點擊 **"Generate Access Token"**

2. **重要**：使用**管理員帳號**登入並生成 Token

3. 複製新的 Access Token

4. 更新 Vercel 環境變數：
   - 前往 Vercel Dashboard > Settings > Environment Variables
   - 更新 `FACEBOOK_ACCESS_TOKEN` 的值
   - 選擇所有環境（Production, Preview, Development）
   - 點擊 **Save**

5. 重新部署（如果需要）

### 步驟 4：確認帳號權限

1. 確認 Access Token 對應的 Facebook 帳號：
   - 是社團 `371907553892831` 的**管理員**或**成員**
   - 有權限訪問該社團的內容

2. 如果帳號不是管理員：
   - 請使用管理員帳號生成 Access Token
   - 或請管理員將該帳號設為管理員

### 步驟 5：檢查應用程式設定

1. 前往 Facebook Developers：
   https://developers.facebook.com/apps/

2. 選擇您的應用程式

3. 檢查 **App Review**：
   - 確認需要的權限已通過審核（如果適用）
   - 某些權限可能需要 Facebook 審核

4. 檢查 **Settings > Basic**：
   - 確認應用程式狀態正常
   - 確認沒有被限制或暫停

## 常見問題

### Q: Token 有效但還是被阻擋？

A: 這通常是權限問題：
- Token 沒有 `groups_read_content` 權限
- Token 對應的帳號不是社團管理員/成員
- 應用程式權限未通過審核

### Q: 如何確認帳號是管理員？

A: 
1. 前往 Facebook 社團頁面
2. 點擊「成員」或「Members」
3. 查看您的角色是否為「管理員」或「Admin」

### Q: 可以使用非管理員帳號嗎？

A: 可以，但帳號必須：
- 是該社團的成員
- Token 有正確的權限
- 社團設定允許成員訪問內容

## 測試建議

完成上述步驟後：

1. 在 Graph API Explorer 中測試 API 呼叫
2. 確認可以成功取得留言
3. 如果成功，更新 Vercel 環境變數
4. 等待下一次 cron-job.org 執行（3 分鐘後）
5. 檢查 Vercel Function Logs 確認是否成功

## 如果還是無法解決

請提供：
1. Graph API Explorer 測試結果（截圖或錯誤訊息）
2. Token 的權限列表
3. 帳號在社團中的角色（管理員/成員）

這樣我可以提供更精確的解決方案。

