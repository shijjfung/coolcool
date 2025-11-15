# Cookie-Editor 使用圖解說明

## 📍 如何找到 Export 按鈕

### 步驟 1：開啟 Cookie-Editor

1. **確認已安裝 Cookie-Editor 擴充功能**
   - 瀏覽器右上角應該有 Cookie 圖示 🍪
   - 如果沒看到，點擊擴充功能圖示（拼圖圖示）→ 找到 Cookie-Editor → 點擊圖釘固定

2. **開啟 Facebook 並登入**
   - 在 Chrome 中訪問：https://www.facebook.com
   - 登入您的 Facebook 帳號

3. **點擊 Cookie-Editor 圖示**
   - 點擊瀏覽器右上角的 Cookie 圖示 🍪
   - 或按快捷鍵：`Ctrl+Shift+E`（Windows）或 `Cmd+Shift+E`（Mac）

---

### 步驟 2：找到 Export 按鈕

Cookie-Editor 開啟後，您會看到一個視窗，結構如下：

```
┌─────────────────────────────────────┐
│  Cookie-Editor                      │
├─────────────────────────────────────┤
│  [Search框]                          │
│                                      │
│  Cookie 列表：                        │
│  ┌─────────────────────────────────┐│
│  │ name: c_user                    ││
│  │ value: 123456789               ││
│  │ domain: .facebook.com          ││
│  │ ...                             ││
│  └─────────────────────────────────┘│
│                                      │
│  [右上角區域]                         │
│  ┌─────────────────────────────────┐│
│  │  [Import]  [Export]  [Clear]   ││ ← 這裡！
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Export 按鈕位置：**
- 在 Cookie-Editor 視窗的**右上角**
- 通常與 "Import" 和 "Clear" 按鈕並排
- 按鈕文字是 "Export" 或「匯出」

---

### 步驟 3：匯出 Cookie

1. **點擊 "Export" 按鈕**
   - 點擊右上角的 "Export" 按鈕

2. **選擇格式**
   - 會出現選單，選擇 "JSON" 格式
   - 選項通常包括：
     - JSON
     - Netscape
     - Header String

3. **複製 Cookie**
   - 點擊 "Copy" 按鈕（或「複製」）
   - Cookie JSON 會複製到剪貼簿
   - 或點擊 "Download" 下載為檔案

---

## 🖼️ 詳細操作流程

### 完整流程圖

```
1. 開啟 Facebook
   ↓
2. 點擊 Cookie-Editor 圖示 🍪
   ↓
3. Cookie-Editor 視窗開啟
   ↓
4. 在右上角找到 "Export" 按鈕
   ↓
5. 點擊 "Export" → 選擇 "JSON"
   ↓
6. 點擊 "Copy" 複製
   ↓
7. Cookie JSON 已複製到剪貼簿
```

---

## 🔍 如果找不到 Export 按鈕？

### 可能原因 1：視窗太小

**解決方法：**
- 拖曳 Cookie-Editor 視窗邊緣，放大視窗
- Export 按鈕在右上角，可能需要滾動或放大才能看到

### 可能原因 2：版本不同

**不同版本的 Cookie-Editor 介面可能略有不同：**

**版本 A（新版本）：**
- Export 按鈕在右上角工具列
- 點擊後出現下拉選單

**版本 B（舊版本）：**
- Export 按鈕可能在底部
- 或需要點擊選單圖示（三條線 ☰）

### 可能原因 3：需要先選擇 Cookie

**解決方法：**
- 某些版本需要先選擇 Cookie（點擊 Cookie 列表中的項目）
- 然後 Export 按鈕才會啟用

---

## 📱 替代方法：使用鍵盤快捷鍵

如果找不到按鈕，可以嘗試：

1. **在 Cookie-Editor 視窗中按 `Ctrl+F`**
   - 搜尋 "export" 或「匯出」

2. **使用右鍵選單**
   - 在 Cookie 列表上按右鍵
   - 查看是否有「匯出」選項

3. **檢查選單**
   - 點擊 Cookie-Editor 視窗左上角的選單圖示（如果有）
   - 查看是否有 Export 選項

---

## 🎯 快速檢查清單

確認以下項目：

- [ ] Cookie-Editor 已安裝並啟用
- [ ] 已在 Facebook 頁面上（https://www.facebook.com）
- [ ] 已登入 Facebook
- [ ] Cookie-Editor 視窗已開啟
- [ ] 可以看到 Cookie 列表
- [ ] 在視窗右上角找到 "Export" 按鈕

---

## 💡 小技巧

### 技巧 1：使用快捷鍵

- `Ctrl+Shift+E`（Windows）或 `Cmd+Shift+E`（Mac）快速開啟 Cookie-Editor

### 技巧 2：直接複製所有 Cookie

某些版本的 Cookie-Editor 支援：
- 全選所有 Cookie（`Ctrl+A`）
- 右鍵 → Copy
- 然後手動轉換為 JSON 格式

### 技巧 3：使用瀏覽器開發者工具

如果 Cookie-Editor 無法使用，可以使用 Chrome 開發者工具：

1. 按 `F12` 開啟開發者工具
2. 切換到 "Application" 分頁
3. 左側選單展開 "Cookies"
4. 點擊 `https://www.facebook.com`
5. 右側會顯示所有 Cookie
6. 手動複製需要的 Cookie

---

## ❌ 錯誤訊息：「Cookie-Editor can't display cookies for this page」

### 問題說明

如果您看到這個訊息，表示 Cookie-Editor **無法讀取當前頁面的 Cookie**。

### 解決方法

#### 方法 1：授予權限（最常見）

1. **點擊「Request permission for...」按鈕**
   - 在 Cookie-Editor 視窗中會看到這個按鈕
   - 點擊它

2. **選擇權限範圍**
   - 選擇「This site」（僅限當前網站，推薦）
   - 或選擇「All sites」（所有網站）

3. **點擊「Allow」或「允許」**
   - 授予 Cookie-Editor 讀取 Cookie 的權限

4. **重新整理頁面**
   - 按 `F5` 或 `Ctrl+R` 重新整理 Facebook 頁面
   - 再次點擊 Cookie-Editor 圖示

#### 方法 2：手動授予權限

如果沒有看到「Request permission」按鈕：

1. **點擊瀏覽器右上角的擴充功能圖示**（拼圖圖示）

2. **找到 Cookie-Editor**
   - 在擴充功能列表中找到 Cookie-Editor

3. **點擊「在 facebook.com 上可以讀取和變更網站資料」**
   - 或點擊 Cookie-Editor 旁邊的「詳細資料」或「Details」

4. **選擇權限**
   - 選擇「在 facebook.com 上」
   - 或選擇「在所有網站上」（較不安全）

5. **重新整理頁面**
   - 回到 Facebook 頁面
   - 按 `F5` 重新整理
   - 再次開啟 Cookie-Editor

#### 方法 3：確認在正確的頁面上

確保您：
- ✅ 在 `https://www.facebook.com` 頁面上（不是其他子網域）
- ✅ 已經登入 Facebook
- ✅ 不是在 Facebook 的登入頁面

#### 方法 4：重新安裝擴充功能

如果以上方法都不行：

1. **移除 Cookie-Editor**
   - 前往 `chrome://extensions/`
   - 找到 Cookie-Editor
   - 點擊「移除」

2. **重新安裝**
   - 前往 Chrome 線上應用程式商店
   - 重新安裝 Cookie-Editor

3. **重新授予權限**
   - 回到 Facebook 頁面
   - 開啟 Cookie-Editor
   - 授予權限

---

## 🆘 還是找不到 Export 按鈕？

如果以上方法都無法找到 Export 按鈕，請嘗試：

1. **重新安裝 Cookie-Editor**
   - 移除擴充功能
   - 重新從 Chrome 商店安裝

2. **檢查擴充功能版本**
   - 前往 `chrome://extensions/`
   - 找到 Cookie-Editor
   - 確認版本是否最新

3. **使用替代擴充功能**
   - 嘗試使用 "EditThisCookie"
   - 功能類似，介面可能不同

4. **使用開發者工具手動取得**
   - 參考「技巧 3」使用 Chrome 開發者工具

---

## 📸 視覺化說明

### Cookie-Editor 視窗結構

```
┌──────────────────────────────────────────────┐
│  🍪 Cookie-Editor                    [×]     │ ← 標題列
├──────────────────────────────────────────────┤
│  [🔍 Search cookies...]                      │ ← 搜尋框
│                                               │
│  Cookies (25)                                │
│  ┌─────────────────────────────────────────┐ │
│  │ ✓ c_user                                │ │
│  │   Value: 123456789                      │ │
│  │   Domain: .facebook.com                    │ │
│  ├─────────────────────────────────────────┤ │
│  │ ✓ xs                                    │ │
│  │   Value: abc123...                      │ │
│  │   Domain: .facebook.com                │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  [Import]  [Export ▼]  [Clear]  [Settings]   │ ← 右上角按鈕
└──────────────────────────────────────────────┘
```

**Export 按鈕位置：**
- 在視窗**右上角**，與 Import、Clear 按鈕並排
- 點擊後會出現下拉選單，選擇 "JSON"

---

## ✅ 完成後

匯出 Cookie 後，您會得到一個 JSON 字串，類似：

```json
[{"name":"c_user","value":"123456789","domain":".facebook.com","path":"/","secure":true,"httpOnly":false,"sameSite":"None","expirationDate":1735689600},{"name":"xs","value":"abc123...","domain":".facebook.com",...}]
```

然後就可以使用這個 JSON 來設定環境變數了！

