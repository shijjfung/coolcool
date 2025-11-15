# 如何正確匯出所有 Cookie

## ⚠️ 重要：需要匯出所有 Cookie

您目前只複製了單個 Cookie（`c_user`），但 Puppeteer 需要**多個 Cookie** 才能成功登入 Facebook。

### 必需的 Cookie

Facebook 登入通常需要以下 Cookie：
- ✅ `c_user` - 用戶 ID（您已經有了）
- ✅ `xs` - 安全 Token（**非常重要**）
- ✅ `datr` - 設備識別碼
- ✅ `sb` - 會話 ID
- ✅ 其他輔助 Cookie

**只使用 `c_user` 是不夠的！** 必須匯出**所有 Cookie**。

---

## 🔍 正確的匯出方法

### 步驟 1：開啟 Cookie-Editor

1. **在 Facebook 頁面上**
   - 確認您在 `https://www.facebook.com`
   - 確認已登入

2. **點擊 Cookie-Editor 圖示** 🍪
   - 瀏覽器右上角的 Cookie 圖示
   - 或按 `Ctrl+Shift+E`

### 步驟 2：找到 Export 按鈕

在 Cookie-Editor 視窗中：

```
┌─────────────────────────────────────┐
│  Cookie-Editor                      │
├─────────────────────────────────────┤
│  [Search框]                          │
│                                      │
│  Cookies (25)                        │
│  ┌─────────────────────────────────┐│
│  │ ✓ c_user                       ││
│  │ ✓ xs                           ││
│  │ ✓ datr                         ││
│  │ ...                             ││
│  └─────────────────────────────────┘│
│                                      │
│  [Import]  [Export ▼]  [Clear]     │ ← 這裡！
└─────────────────────────────────────┘
```

**Export 按鈕位置：**
- 在 Cookie-Editor 視窗的**右上角**
- 與 Import 和 Clear 按鈕並排
- 點擊「Export」按鈕

### 步驟 3：選擇格式並匯出

1. **點擊 Export 按鈕**
   - 會出現下拉選單

2. **選擇「JSON」格式**
   - 選項包括：JSON、Netscape、Header String
   - 選擇「JSON」

3. **點擊「Copy」**
   - Cookie JSON 會複製到剪貼簿
   - 這會包含**所有 Cookie**，不只是單個

---

## 📋 正確的 Cookie JSON 格式

匯出後，您應該得到類似這樣的 JSON（**包含多個 Cookie**）：

```json
[
  {
    "name": "c_user",
    "value": "61583437452067",
    "domain": ".facebook.com",
    "path": "/",
    ...
  },
  {
    "name": "xs",
    "value": "2%3AC0gNgH5svHEjIA%3A2%3A...",
    "domain": ".facebook.com",
    "path": "/",
    ...
  },
  {
    "name": "datr",
    "value": "KuQTaeppzhrzHbvXiWjzoRcD",
    "domain": ".facebook.com",
    "path": "/",
    ...
  },
  ...（更多 Cookie）
]
```

**特點：**
- ✅ 以 `[` 開始（陣列）
- ✅ 包含多個 Cookie 物件
- ✅ 每個 Cookie 用 `,` 分隔
- ✅ 以 `]` 結束

---

## ❌ 錯誤的方式（您目前的方式）

如果您只複製單個 Cookie：

```
Name: c_user
Value: 61583437452067
```

**問題：**
- ❌ 只有一個 Cookie
- ❌ 缺少 `xs`（安全 Token）
- ❌ 格式不是 JSON 陣列
- ❌ Puppeteer 無法使用

---

## ✅ 正確的方式

使用 Export 功能匯出所有 Cookie：

1. **點擊 Export → JSON → Copy**
2. **得到完整的 JSON 陣列**
3. **包含所有必要的 Cookie**

---

## 🚀 使用匯出的 Cookie

匯出所有 Cookie 後：

### 方法 1：使用剪貼簿（最簡單）

1. **確認 Cookie JSON 已在剪貼簿**
2. **執行：**
   ```
   設定Cookie_從剪貼簿.bat
   ```

### 方法 2：使用檔案

1. **建立 `cookie.txt`**
   - 貼上完整的 Cookie JSON
   - 儲存

2. **執行：**
   ```
   設定Cookie_最簡單.bat
   ```

---

## 🔍 如何確認是否正確

### 檢查 Cookie JSON

正確的 Cookie JSON 應該：
- ✅ 以 `[` 開始
- ✅ 包含多個 `{...}` 物件
- ✅ 包含 `c_user` 和 `xs` 等重要 Cookie
- ✅ 以 `]` 結束

### 檢查 .env.local

設定完成後，`.env.local` 應該包含：

```env
FACEBOOK_COOKIES=[{"name":"c_user",...},{"name":"xs",...},...]
```

---

## 💡 小技巧

### 如果找不到 Export 按鈕

1. **放大 Cookie-Editor 視窗**
   - 拖曳視窗邊緣放大
   - Export 按鈕在右上角

2. **檢查是否在正確頁面**
   - 確認在 Facebook 頁面上
   - 確認已授予權限

3. **重新整理頁面**
   - 按 `F5` 重新整理
   - 再次開啟 Cookie-Editor

---

## 🆘 如果還是無法匯出

### 替代方法：使用 Chrome 開發者工具

1. **按 `F12` 開啟開發者工具**

2. **切換到 Application 分頁**
   - 在開發者工具頂部

3. **展開 Cookies**
   - 左側選單 → Cookies
   - 點擊 `https://www.facebook.com`

4. **手動複製 Cookie**
   - 右側會顯示所有 Cookie
   - 複製需要的 Cookie（至少 `c_user` 和 `xs`）
   - 手動組合成 JSON 格式

---

## 📝 總結

**重要：**
- ❌ 不要只複製單個 Cookie
- ✅ 使用 Export 功能匯出**所有 Cookie**
- ✅ 使用 JSON 格式
- ✅ 確認包含 `c_user` 和 `xs` 等重要 Cookie

**正確流程：**
1. 開啟 Cookie-Editor
2. 點擊 Export → JSON → Copy
3. 使用批次檔設定 Cookie
4. 測試是否成功

