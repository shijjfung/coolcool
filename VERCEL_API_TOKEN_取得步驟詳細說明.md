# Vercel API Token 取得步驟詳細說明

## 📍 方法 1：從個人設定取得（推薦）

### 步驟 1：進入個人設定

1. **登入 Vercel Dashboard**
   - 前往：https://vercel.com/dashboard
   - 確保您已登入

2. **點擊右上角的頭像或帳號名稱**
   - 在頁面右上角，會看到您的頭像或帳號名稱
   - 點擊它會出現下拉選單

3. **選擇「Settings」**
   - 在下拉選單中找到「Settings」選項
   - 點擊進入個人設定頁面

### 步驟 2：找到 Tokens 選項

1. **在左側選單中找到「Tokens」**
   - 左側選單可能包含：
     - Profile（個人資料）
     - Security（安全性）
     - **Tokens** ← 點擊這個
     - Notifications（通知）
     - Billing（帳單）
     - 等等...

2. **如果找不到 Tokens**
   - 嘗試點擊「Security」或「Account」
   - Tokens 可能在不同的分類下

### 步驟 3：建立 Token

1. **點擊「Create Token」按鈕**
   - 在 Tokens 頁面中，會看到「Create Token」或「New Token」按鈕
   - 點擊它

2. **填寫 Token 資訊**
   - **Name（名稱）**：輸入「Facebook Token Auto Refresh」
   - **Expiration（過期時間）**：
     - 選擇「Never」（永不過期）或
     - 選擇「Custom」並設定較長期限（例如：1 年）

3. **點擊「Create」或「Generate」**
   - 系統會產生 Token
   - **重要**：Token 只會顯示一次，請立即複製！

---

## 📍 方法 2：從專案設定取得 Project ID

### 步驟 1：進入專案

1. **在 Vercel Dashboard 首頁**
   - 您會看到專案列表
   - 點擊您的專案名稱（例如：「order-management-system」）

### 步驟 2：進入專案設定

1. **點擊頂部選單的「Settings」**
   - 在專案頁面頂部，會看到選單：
     - Overview（概覽）
     - Deployments（部署）
     - **Settings（設定）** ← 點擊這個
     - Analytics（分析）
     - 等等...

2. **在左側選單中找到「General」**
   - 左側選單可能包含：
     - **General（一般）** ← 點擊這個
     - Environment Variables（環境變數）
     - Domains（網域）
     - 等等...

### 步驟 3：找到 Project ID

1. **在 General 頁面中尋找「Project ID」**
   - 通常顯示在頁面頂部或中間
   - 格式類似：`prj_xxxxxxxxxxxxxxxxxxxx`
   - 點擊「Copy」按鈕複製

---

## 📍 方法 3：直接連結（如果上述方法找不到）

### 取得 Token 的直接連結：
```
https://vercel.com/account/tokens
```

### 取得 Project ID 的步驟：
1. 進入您的專案
2. 在瀏覽器網址列，您會看到類似：
   ```
   https://vercel.com/your-team/your-project/settings
   ```
3. 或者直接訪問：
   ```
   https://vercel.com/your-project-name/settings/general
   ```
   （將 `your-project-name` 替換為您的專案名稱）

---

## 🔍 如果還是找不到

### 檢查事項：

1. **確認您有正確的權限**
   - 您必須是專案的擁有者或管理員
   - 如果是團隊專案，確認您有適當的權限

2. **確認您使用的是正確的帳號**
   - 確保您登入的是正確的 Vercel 帳號

3. **嘗試使用搜尋功能**
   - 在 Vercel Dashboard 中，使用瀏覽器的搜尋功能（Ctrl+F 或 Cmd+F）
   - 搜尋「Token」或「Project ID」

4. **檢查瀏覽器語言設定**
   - 如果介面是英文，選項名稱可能不同
   - 嘗試切換語言或使用英文介面

---

## 📸 視覺指引

### Tokens 頁面應該看起來像：

```
┌─────────────────────────────────┐
│  Vercel Dashboard               │
│                                 │
│  [頭像] Settings ▼              │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Settings                  │  │
│  │                           │  │
│  │ Profile                   │  │
│  │ Security                  │  │
│  │ Tokens ← 點擊這裡         │  │
│  │ Notifications             │  │
│  │ ...                       │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Project ID 應該在：

```
┌─────────────────────────────────┐
│  Project Settings               │
│                                 │
│  General                        │
│  ─────────────────────────────  │
│                                 │
│  Project ID                     │
│  prj_xxxxxxxxxxxxxxxxxxxx       │
│  [Copy] ← 點擊複製              │
│                                 │
└─────────────────────────────────┘
```

---

## 💡 替代方案

如果實在找不到，您可以：

1. **使用 Vercel CLI**
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   ```
   這會顯示 Project ID

2. **查看部署記錄**
   - 在 Deployments 頁面
   - 點擊任何一個部署
   - 在 URL 或詳細資訊中可能會顯示 Project ID

3. **聯繫 Vercel 支援**
   - 如果以上方法都不行，可以聯繫 Vercel 客服

---

## ✅ 完成後

取得 Token 和 Project ID 後，請：
1. 將它們設定到環境變數中
2. 重新部署應用程式
3. 系統就會自動運作了！

