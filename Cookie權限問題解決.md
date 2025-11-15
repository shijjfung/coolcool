# Cookie-Editor 權限問題解決指南

## ❌ 錯誤訊息：「Cookie-Editor can't display cookies for this page」

### 問題原因

這個錯誤表示 Cookie-Editor **沒有權限**讀取當前頁面的 Cookie。

---

## 🔧 解決步驟（按順序嘗試）

### 步驟 1：授予權限（最常見的解決方法）

1. **在 Cookie-Editor 視窗中**
   - 您應該會看到「Request permission for...」按鈕
   - 點擊這個按鈕

2. **選擇權限範圍**
   - **推薦**：選擇「This site」（僅限當前網站）
   - 或選擇「All sites」（所有網站，較方便但安全性較低）

3. **點擊「Allow」或「允許」**
   - 授予 Cookie-Editor 讀取 Cookie 的權限

4. **重新整理 Facebook 頁面**
   - 按 `F5` 或 `Ctrl+R`
   - 再次點擊 Cookie-Editor 圖示
   - 現在應該可以看到 Cookie 了

---

### 步驟 2：手動授予權限（如果步驟 1 沒有按鈕）

1. **點擊瀏覽器右上角的擴充功能圖示**
   - 找到拼圖圖示 🧩（通常在網址列右側）

2. **找到 Cookie-Editor**
   - 在擴充功能列表中向下滾動
   - 找到 Cookie-Editor

3. **點擊 Cookie-Editor 的詳細資料**
   - 點擊 Cookie-Editor 下方的「詳細資料」或「Details」
   - 或直接點擊 Cookie-Editor 卡片

4. **設定網站存取權限**
   - 找到「網站存取權限」或「Site access」
   - 選擇「在所有網站上」或「On all sites」
   - 或選擇「在特定網站上」→ 輸入 `facebook.com`

5. **回到 Facebook 頁面**
   - 重新整理頁面（`F5`）
   - 再次開啟 Cookie-Editor

---

### 步驟 3：檢查是否在正確的頁面上

確保您：

- ✅ **在 Facebook 主頁面**
  - 網址應該是：`https://www.facebook.com`
  - 不是 `https://m.facebook.com` 或其他子網域

- ✅ **已經登入**
  - 確認您已經登入 Facebook 帳號
  - 不是在登入頁面

- ✅ **頁面已完全載入**
  - 等待頁面完全載入後再開啟 Cookie-Editor

---

### 步驟 4：使用 Chrome 設定授予權限

1. **開啟 Chrome 設定**
   - 前往：`chrome://extensions/`
   - 或點擊選單 → 更多工具 → 擴充功能

2. **找到 Cookie-Editor**
   - 在列表中找到 Cookie-Editor

3. **點擊「詳細資料」**
   - 點擊 Cookie-Editor 下方的「詳細資料」按鈕

4. **設定網站存取權限**
   - 找到「網站存取權限」區塊
   - 選擇「在所有網站上」
   - 或點擊「在特定網站上」→ 新增 `https://www.facebook.com`

5. **重新整理 Facebook**
   - 回到 Facebook 頁面
   - 按 `F5` 重新整理
   - 再次開啟 Cookie-Editor

---

### 步驟 5：重新安裝擴充功能

如果以上方法都不行：

1. **移除 Cookie-Editor**
   ```
   前往 chrome://extensions/
   找到 Cookie-Editor
   點擊「移除」
   ```

2. **重新安裝**
   - 前往 Chrome 線上應用程式商店
   - 搜尋「Cookie-Editor」
   - 重新安裝

3. **重新授予權限**
   - 回到 Facebook 頁面
   - 開啟 Cookie-Editor
   - 按照步驟 1 授予權限

---

## 🔍 檢查清單

在嘗試解決問題前，確認：

- [ ] Cookie-Editor 已正確安裝
- [ ] 在 `https://www.facebook.com` 頁面上
- [ ] 已經登入 Facebook
- [ ] 已授予 Cookie-Editor 權限
- [ ] 頁面已完全載入

---

## 💡 替代方案

如果 Cookie-Editor 一直無法使用，可以使用：

### 方案 1：使用 Chrome 開發者工具

1. **開啟開發者工具**
   - 按 `F12`
   - 或右鍵 → 檢查

2. **切換到 Application 分頁**
   - 在開發者工具頂部，點擊「Application」

3. **展開 Cookies**
   - 左側選單展開「Cookies」
   - 點擊 `https://www.facebook.com`

4. **複製 Cookie**
   - 右側會顯示所有 Cookie
   - 手動複製需要的 Cookie（如 `c_user`、`xs` 等）
   - 轉換為 JSON 格式

### 方案 2：使用 EditThisCookie

1. **安裝 EditThisCookie**
   - 前往 Chrome 商店
   - 搜尋「EditThisCookie」
   - 安裝

2. **使用方式類似**
   - 點擊擴充功能圖示
   - 匯出 Cookie

---

## ✅ 成功後應該看到

授予權限並重新整理後，Cookie-Editor 應該顯示：

```
Cookies (25)
├─ c_user
│  Value: 123456789
│  Domain: .facebook.com
├─ xs
│  Value: abc123...
│  Domain: .facebook.com
...
```

然後就可以點擊右上角的「Export」按鈕了！

---

## 🆘 還是無法解決？

如果以上方法都無法解決：

1. **檢查 Chrome 版本**
   - 確保 Chrome 是最新版本
   - 前往：`chrome://settings/help`

2. **檢查擴充功能是否啟用**
   - 前往 `chrome://extensions/`
   - 確認 Cookie-Editor 已啟用（開關是開啟的）

3. **嘗試無痕模式**
   - 開啟無痕視窗（`Ctrl+Shift+N`）
   - 登入 Facebook
   - 嘗試使用 Cookie-Editor

4. **聯絡支援**
   - 查看 Cookie-Editor 的 GitHub 或 Chrome 商店頁面
   - 回報問題

---

## 📝 快速參考

**最常見的解決方法：**
1. 點擊「Request permission for...」→ 選擇「This site」→ 允許
2. 重新整理頁面（`F5`）
3. 再次開啟 Cookie-Editor

**如果沒有看到按鈕：**
1. 前往 `chrome://extensions/`
2. 找到 Cookie-Editor → 詳細資料
3. 設定網站存取權限
4. 重新整理頁面

