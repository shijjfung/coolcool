# Puppeteer 使用哪個 Facebook 帳號？

## 📌 簡單答案

**Puppeteer 使用的是：您從瀏覽器中匯出的 Cookie 所對應的 Facebook 帳號**

---

## 🔍 詳細說明

### 1. Puppeteer 如何登入？

Puppeteer **不使用帳號密碼登入**，而是使用 **Cookie** 來維持登入狀態。

### 2. Cookie 從哪裡來？

Cookie 是從**您的瀏覽器**中取得的：

1. **您在 Chrome 中登入 Facebook**
   - 開啟 `https://www.facebook.com`
   - 使用您的 Facebook 帳號登入

2. **使用 Cookie-Editor 匯出 Cookie**
   - 點擊 Cookie-Editor 擴充功能圖示
   - Export → JSON → Copy
   - 取得該帳號的 Cookie

3. **將 Cookie 設定到環境變數**
   - 執行 `設定Cookie_從剪貼簿.bat`
   - Cookie 被寫入 `.env.local`

4. **Puppeteer 使用這個 Cookie**
   - 啟動瀏覽器時，會載入這個 Cookie
   - 自動維持該帳號的登入狀態

---

## ✅ 結論

**Puppeteer 使用的 Facebook 帳號 = 您匯出 Cookie 時登入的帳號**

---

## ⚠️ 重要提醒

### 1. 帳號權限

確保使用的 Facebook 帳號：
- ✅ **有權限訪問目標社團**（公開或私密社團）
- ✅ **有權限在貼文下方留言**（如果需要自動回覆）
- ✅ **帳號狀態正常**（未被限制或封鎖）

### 2. 建議使用測試帳號

**強烈建議：**
- 🎯 使用**專門的測試帳號**，而不是個人主要帳號
- 🎯 避免使用重要帳號，以防違反 Facebook 服務條款導致帳號被限制

### 3. Cookie 有效期

- Cookie 通常有效 **1-3 個月**
- 過期後需要重新取得 Cookie
- 如果帳號密碼變更，Cookie 也會失效

### 4. 多帳號管理

如果您需要管理多個 Facebook 帳號：
- 每個帳號需要分別匯出 Cookie
- 每次只能使用一個帳號的 Cookie
- 如果需要切換帳號，需要更新 `FACEBOOK_COOKIES` 環境變數

---

## 🔄 如何確認目前使用的帳號？

### 方法 1：查看 Cookie 中的 `c_user`

Cookie JSON 中有一個 `c_user` 欄位，這是 Facebook 用戶 ID：

```json
{
  "name": "c_user",
  "value": "123456789",  // 這就是您的 Facebook 用戶 ID
  ...
}
```

### 方法 2：查看開發伺服器 Console

當 Puppeteer 登入時，Console 會顯示：

```
[Puppeteer] 使用 Cookie 登入 Facebook...
[Puppeteer] ✅ 使用 Cookie 登入成功
```

### 方法 3：使用非無頭模式觀察

設定環境變數：
```env
FACEBOOK_PUPPETEER_HEADLESS=false
```

這樣可以看到瀏覽器視窗，確認登入的帳號。

---

## 📝 實際範例

### 情境 1：使用個人帳號

1. 您在 Chrome 中登入「您的個人 Facebook 帳號」
2. 使用 Cookie-Editor 匯出 Cookie
3. 設定到 `.env.local`
4. **Puppeteer 會使用「您的個人 Facebook 帳號」**

### 情境 2：使用測試帳號（推薦）

1. 您在 Chrome 中登入「測試 Facebook 帳號」
2. 使用 Cookie-Editor 匯出 Cookie
3. 設定到 `.env.local`
4. **Puppeteer 會使用「測試 Facebook 帳號」**

### 情境 3：切換帳號

1. 原本使用「帳號 A」的 Cookie
2. 現在要改用「帳號 B」
3. 在 Chrome 中登入「帳號 B」
4. 重新匯出 Cookie
5. 更新 `.env.local` 中的 `FACEBOOK_COOKIES`
6. 重新啟動開發伺服器
7. **Puppeteer 現在使用「帳號 B」**

---

## 🆘 常見問題

### Q1: 我可以使用別人的 Cookie 嗎？

**不建議：**
- 使用別人的 Cookie 可能違反 Facebook 服務條款
- 可能導致帳號被限制或封鎖
- 建議使用自己的帳號或測試帳號

### Q2: 如何知道目前使用的是哪個帳號？

查看 Cookie 中的 `c_user` 值，或使用非無頭模式觀察瀏覽器。

### Q3: 如果帳號被限制怎麼辦？

- 停止使用該帳號的 Cookie
- 使用其他帳號重新取得 Cookie
- 更新 `.env.local` 中的 `FACEBOOK_COOKIES`

### Q4: 可以同時使用多個帳號嗎？

**不可以**，每次只能使用一個帳號的 Cookie。如果需要切換，需要更新環境變數並重新啟動伺服器。

---

## ✅ 總結

1. **Puppeteer 使用 Cookie 登入，不是帳號密碼**
2. **使用的帳號 = 匯出 Cookie 時登入的帳號**
3. **建議使用測試帳號，避免使用重要帳號**
4. **確保帳號有權限訪問目標社團**
5. **Cookie 過期後需要重新取得**

---

## 🎯 最佳實踐

1. ✅ 建立專門的測試 Facebook 帳號
2. ✅ 確保測試帳號已加入目標社團
3. ✅ 定期檢查 Cookie 是否有效
4. ✅ 避免頻繁切換帳號
5. ✅ 遵守 Facebook 服務條款

