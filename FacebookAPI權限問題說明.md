# Facebook API 權限問題說明

## 問題

從錯誤日誌中看到：
```
Facebook API 錯誤: {"error":{"message":"API access blocked.","type":"OAuthException","code":200,"fbtrace_id":"A9w9nXknhQRvspv3swhmXWW"}}
```

這表示 Facebook Access Token 沒有權限訪問該社團或貼文。

## 可能的原因

### 1. Access Token 權限不足

Facebook Access Token 需要以下權限：
- `groups_access_member_info`：訪問社團成員資訊
- `groups_read_content`：讀取社團內容（貼文、留言）
- 對於私密社團，還需要管理員權限

### 2. 社團權限設定

- 如果社團是**私密社團**，只有管理員或已加入的成員才能訪問
- Access Token 對應的帳號必須是該社團的**管理員**或**成員**

### 3. Access Token 已過期或無效

- Access Token 可能已過期
- 需要重新生成或刷新 Access Token

## 解決方案

### 方案 1：檢查 Access Token 權限

1. 前往 Facebook Developers：https://developers.facebook.com/
2. 選擇您的應用程式
3. 前往 **Tools** > **Graph API Explorer**
4. 選擇您的 Access Token
5. 檢查權限（Permissions）：
   - 確認有 `groups_access_member_info`
   - 確認有 `groups_read_content`

### 方案 2：重新生成 Access Token

1. 在 Graph API Explorer 中：
   - 點擊 **Generate Access Token**
   - 選擇需要的權限
   - 生成新的 Access Token

2. 更新 Vercel 環境變數：
   - 前往 Vercel Dashboard > Settings > Environment Variables
   - 更新 `FACEBOOK_ACCESS_TOKEN` 的值
   - 重新部署

### 方案 3：確認帳號權限

1. 確認 Access Token 對應的 Facebook 帳號：
   - 是該社團的**管理員**或**成員**
   - 有權限訪問該社團的內容

2. 如果帳號不是管理員：
   - 請使用管理員帳號生成 Access Token
   - 或請管理員將該帳號設為管理員

### 方案 4：檢查社團設定

1. 確認社團不是**完全私密**的
2. 確認 Access Token 對應的帳號已加入該社團
3. 確認社團允許外部應用程式訪問（如果適用）

## 測試 Access Token

### 使用 Graph API Explorer

1. 前往：https://developers.facebook.com/tools/explorer/
2. 選擇您的 Access Token
3. 測試 API 呼叫：
   ```
   GET /{group_id}_{post_id}/comments
   ```
   例如：
   ```
   GET /371907553892831_1476892770060965/comments
   ```

4. 如果返回錯誤，查看錯誤訊息：
   - `API access blocked`：權限不足
   - `Invalid OAuth access token`：Token 無效或過期
   - `Unsupported get request`：API 端點不正確

## 常見錯誤代碼

| 錯誤代碼 | 含義 | 解決方案 |
|---------|------|---------|
| 200 | API access blocked | 檢查權限和帳號設定 |
| 190 | Invalid OAuth access token | 重新生成 Access Token |
| 803 | Unsupported get request | 檢查 API 端點是否正確 |
| 10 | Permission denied | 檢查 Access Token 權限 |

## 建議

1. **使用管理員帳號**：確保 Access Token 對應的帳號是社團管理員
2. **定期刷新 Token**：Facebook Access Token 會過期，需要定期刷新
3. **檢查權限**：定期檢查 Access Token 的權限是否足夠
4. **測試 API**：使用 Graph API Explorer 測試 API 呼叫，確認權限正常

