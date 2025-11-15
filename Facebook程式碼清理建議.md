# Facebook 程式碼清理建議

## 📋 程式碼分析

### ✅ 需要保留的程式碼

#### 1. **URL 解析函數** - `parseFacebookPostUrl`
**位置：** `pages/api/facebook/scan-comments.ts` (第 47-95 行)

**原因：**
- Puppeteer 也需要解析 Facebook 貼文 URL
- 用於提取社團 ID 和貼文 ID
- 仍然有用

**建議：** ✅ 保留

---

#### 2. **回覆留言函數** - `replyToFacebookComment`
**位置：** `pages/api/facebook/scan-comments.ts` (第 287-321 行)

**原因：**
- 雖然 Puppeteer 模式下不支援自動回覆（需要 Access Token）
- 但如果未來有 Access Token，仍可使用
- 或作為備援方案

**建議：** ⚠️ 可以保留（作為備援）或標記為已棄用

---

#### 3. **Token 管理相關 API**
**檔案：**
- `pages/api/facebook/refresh-token.ts`
- `pages/api/facebook/token-status.ts`
- `pages/api/facebook/auto-refresh-deploy.ts`

**原因：**
- 可能還有其他用途（如回覆留言、發送通知）
- 如果完全不用 Access Token，可以刪除

**建議：** ⚠️ 視情況決定（如果確定不用 Access Token，可以刪除）

---

#### 4. **發送取貨通知** - `send-pickup-notification.ts`
**位置：** `pages/api/facebook/send-pickup-notification.ts`

**原因：**
- 使用 Graph API 回覆留言（發送通知）
- 如果還在使用，需要保留
- 如果不用了，可以刪除

**建議：** ⚠️ 視使用情況決定

---

### ❌ 可以刪除的程式碼

#### 1. **Graph API 抓取留言函數** - `fetchFacebookComments`
**位置：** `pages/api/facebook/scan-comments.ts` (第 97-285 行)

**原因：**
- Facebook 已移除 Groups API（2024年4月22日）
- 無法再透過 Graph API 抓取私密社團留言
- 已被 Puppeteer 取代

**建議：** ❌ **可以刪除**

**刪除範圍：**
- 整個 `fetchFacebookComments` 函數（約 188 行）
- 包含所有 Graph API 端點嘗試邏輯
- 包含所有錯誤處理和警告訊息

---

#### 2. **主 Handler 中的 Graph API 模式分支**
**位置：** `pages/api/facebook/scan-comments.ts` (第 519-527 行)

**原因：**
- 如果確定只使用 Puppeteer，可以移除這個分支
- 但建議保留作為備援（如果 Puppeteer 失敗時）

**建議：** ⚠️ **建議保留作為備援**，或標記為已棄用

---

## 🔧 清理方案

### 方案 1：完全移除 Graph API 程式碼（推薦）

**優點：**
- 程式碼更簡潔
- 減少維護成本
- 避免混淆

**缺點：**
- 失去備援方案
- 如果 Puppeteer 失敗，無法回退

**實作步驟：**

1. **刪除 `fetchFacebookComments` 函數**
   ```typescript
   // 刪除第 97-285 行
   // 整個 fetchFacebookComments 函數
   ```

2. **簡化主 Handler**
   ```typescript
   // 移除 Graph API 模式分支
   // 只保留 Puppeteer 模式
   if (!usePuppeteer) {
     return res.status(400).json({
       error: 'Graph API 模式已不再支援，請使用 Puppeteer 模式',
       hint: '設定 FACEBOOK_USE_PUPPETEER=true 或 usePuppeteer=true'
     });
   }
   ```

3. **移除 Access Token 檢查**
   ```typescript
   // 移除 fbAccessToken 相關檢查
   // Puppeteer 不需要 Access Token
   ```

---

### 方案 2：保留作為備援（保守方案）

**優點：**
- 有備援方案
- 如果 Puppeteer 失敗，可以嘗試 Graph API（雖然通常會失敗）

**缺點：**
- 程式碼較複雜
- 維護成本較高

**實作步驟：**

1. **標記 Graph API 函數為已棄用**
   ```typescript
   /**
    * @deprecated Facebook 已移除 Groups API，此函數已無法使用
    * 保留僅作為備援方案
    * 建議使用 Puppeteer 模式
    */
   async function fetchFacebookComments(...) {
     // 現有程式碼
   }
   ```

2. **在主 Handler 中優先使用 Puppeteer**
   ```typescript
   // 優先使用 Puppeteer
   if (usePuppeteer) {
     // Puppeteer 模式
   } else {
     // Graph API 模式（已棄用，僅作為備援）
     console.warn('[Facebook] 使用已棄用的 Graph API 模式');
   }
   ```

---

## 📝 建議的清理步驟

### 步驟 1：評估使用情況

1. **檢查是否還在使用 Access Token**
   - 檢查環境變數中是否有 `FACEBOOK_ACCESS_TOKEN`
   - 檢查是否還在使用回覆留言功能

2. **檢查是否還在使用發送通知功能**
   - 檢查 `send-pickup-notification.ts` 是否還在使用
   - 如果不用，可以一併刪除

### 步驟 2：執行清理

**如果確定只使用 Puppeteer：**

1. 刪除 `fetchFacebookComments` 函數
2. 簡化主 Handler，移除 Graph API 分支
3. 移除 Access Token 相關檢查
4. 更新註解和文件

**如果保留作為備援：**

1. 標記 Graph API 函數為已棄用
2. 在主 Handler 中優先使用 Puppeteer
3. 更新註解說明

### 步驟 3：測試

1. 測試 Puppeteer 模式是否正常
2. 確認沒有破壞現有功能
3. 檢查 Console 日誌

---

## 🗑️ 可以刪除的檔案（如果確定不用）

### 完全不用 Access Token 的情況

如果確定不再使用 Facebook Access Token，可以刪除：

1. `pages/api/facebook/refresh-token.ts` - Token 刷新
2. `pages/api/facebook/token-status.ts` - Token 狀態檢查
3. `pages/api/facebook/auto-refresh-deploy.ts` - 自動刷新並部署

### 完全不用回覆留言功能的情況

如果確定不再使用回覆留言功能，可以刪除：

1. `pages/api/facebook/send-pickup-notification.ts` - 發送取貨通知
2. `replyToFacebookComment` 函數（在 scan-comments.ts 中）

---

## ✅ 推薦方案

**建議採用「方案 1：完全移除 Graph API 程式碼」**

**理由：**
1. Facebook Groups API 已完全移除，無法再使用
2. 保留無用的程式碼只會增加維護成本
3. Puppeteer 是唯一的可行方案
4. 程式碼更簡潔，更容易維護

**保留的程式碼：**
- ✅ `parseFacebookPostUrl` - URL 解析（Puppeteer 需要）
- ✅ 主 Handler 邏輯（但簡化 Graph API 分支）
- ⚠️ `replyToFacebookComment` - 視情況決定（如果不用回覆功能，可以刪除）

**刪除的程式碼：**
- ❌ `fetchFacebookComments` 函數（整個函數）
- ❌ Graph API 相關的錯誤處理和警告訊息
- ❌ Access Token 檢查（如果確定不用）

---

## 🔍 檢查清單

在執行清理前，確認：

- [ ] 是否還在使用 Access Token？
- [ ] 是否還在使用回覆留言功能？
- [ ] 是否還在使用發送通知功能？
- [ ] Puppeteer 模式是否穩定運作？
- [ ] 是否有其他功能依賴 Graph API？

---

## 📞 需要協助？

如果需要我幫您執行清理，請告訴我：
1. 是否還在使用 Access Token？
2. 是否還在使用回覆留言功能？
3. 是否要完全移除 Graph API 程式碼？

我可以幫您：
- 刪除不需要的程式碼
- 簡化主 Handler
- 更新註解和文件
- 確保功能正常運作

