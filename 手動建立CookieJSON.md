# 手動建立 Cookie JSON

## 📋 您提供的 Cookie 列表

您已經提供了所有 Cookie 的詳細資訊。現在需要將它們轉換成 JSON 格式。

## 🔧 方法 1：使用轉換工具（推薦）

1. **執行批次檔**
   ```
   轉換Cookie為JSON.bat
   ```

2. **貼上您的 Cookie 列表**
   - 將您剛才提供的所有 Cookie 貼上
   - 按 Enter 兩次完成

3. **自動轉換**
   - 批次檔會自動轉換成 JSON 格式
   - 自動寫入 `.env.local`

---

## 🔧 方法 2：手動建立 JSON

如果您想手動建立，以下是根據您提供的 Cookie 建立的 JSON：

```json
[
  {
    "name": "b_user",
    "value": "61583437452067",
    "domain": ".facebook.com",
    "path": "/",
    "expirationDate": 1770932338,
    "sameSite": "lax",
    "secure": true,
    "httpOnly": true
  },
  {
    "name": "c_user",
    "value": "61583437452067",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true,
    "httpOnly": false,
    "sameSite": "no_restriction"
  },
  {
    "name": "datr",
    "value": "KuQTaeppzhrzHbvXiWjzoRcD",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true,
    "httpOnly": true,
    "sameSite": "no_restriction"
  },
  {
    "name": "dpr",
    "value": "1.25",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true,
    "httpOnly": false,
    "sameSite": "no_restriction"
  },
  {
    "name": "fbl_st",
    "value": "101727739%3BT%3A29385952",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true,
    "httpOnly": false,
    "sameSite": "strict"
  },
  {
    "name": "fr",
    "value": "1ZZzqENtDz7EkYz4H.AWfY66iOAKjrOrC3cf5WuoraebKb3dFxxu7JLWWEYNplUrF2hO8.BpGPPS..AAA.0.0.BpGPmK.AWesNwhRddML7Ir45xVKAMo1ooI",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true,
    "httpOnly": true,
    "sameSite": "no_restriction"
  },
  {
    "name": "locale",
    "value": "zh_TW",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true,
    "httpOnly": false,
    "sameSite": "no_restriction"
  },
  {
    "name": "pas",
    "value": "61583437452067%3AWnHKksGjwU",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true,
    "httpOnly": true,
    "sameSite": "lax"
  },
  {
    "name": "presence",
    "value": "C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1763244428489%2C%22v%22%3A1%7D",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true,
    "httpOnly": false,
    "session": true
  },
  {
    "name": "ps_l",
    "value": "1",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true,
    "httpOnly": true,
    "sameSite": "lax"
  },
  {
    "name": "ps_n",
    "value": "1",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true,
    "httpOnly": true,
    "sameSite": "no_restriction"
  },
  {
    "name": "sb",
    "value": "KuQTaaDQwKpqZSgjfyBWk5vn",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true,
    "httpOnly": true,
    "sameSite": "no_restriction"
  },
  {
    "name": "vpd",
    "value": "v1%3B632x313x2.0000000298023224",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true,
    "httpOnly": false,
    "sameSite": "lax"
  },
  {
    "name": "wd",
    "value": "1036x726",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true,
    "httpOnly": false,
    "sameSite": "lax"
  },
  {
    "name": "wl_cbv",
    "value": "v2%3Bclient_version%3A2985%3Btimestamp%3A1763157174",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true,
    "httpOnly": false,
    "sameSite": "no_restriction"
  },
  {
    "name": "xs",
    "value": "2%3AC0gNgH5svHEjIA%3A2%3A1763003500%3A-1%3A-1%3A%3AAcxSjLdj20HvjfowrNVYZ6wL7Z5xc2CcNRPuLWZI0g0",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true,
    "httpOnly": true,
    "sameSite": "no_restriction"
  }
]
```

---

## ✅ 重要 Cookie 確認

您的 Cookie 列表包含所有必要的 Cookie：

- ✅ `c_user` = 61583437452067（用戶 ID）
- ✅ `xs` = 2%3AC0gNgH5svHEjIA...（安全 Token，**非常重要**）
- ✅ `datr` = KuQTaeppzhrzHbvXiWjzoRcD（設備識別碼）
- ✅ `sb` = KuQTaaDQwKpqZSgjfyBWk5vn（會話 ID）
- ✅ 其他輔助 Cookie

**所有必要的 Cookie 都有了！** ✅

---

## 🚀 快速設定步驟

### 推薦：使用轉換工具

1. **執行批次檔**
   ```
   轉換Cookie為JSON.bat
   ```

2. **貼上您的 Cookie 列表**
   - 將您剛才提供的所有 Cookie（從 Name 到最後一個 Cookie）
   - 全部貼上
   - 按 Enter 兩次

3. **完成**
   - 批次檔會自動轉換並寫入 `.env.local`
   - 然後執行「測試Puppeteer.bat」測試

---

## 📝 如果轉換工具無法使用

如果轉換工具無法正確解析，您可以：

1. **使用 Cookie-Editor 的 Export 功能**
   - 這是最可靠的方法
   - 點擊 Export → JSON → Copy
   - 會自動產生正確的 JSON 格式

2. **手動建立 JSON**
   - 使用上面提供的 JSON 範例
   - 複製到 `cookie.txt`
   - 執行「設定Cookie_最簡單.bat」

---

## ✅ 設定完成後

1. **檢查 `.env.local`**
   - 應該包含 `FACEBOOK_COOKIES` 和 `FACEBOOK_USE_PUPPETEER=true`

2. **測試 Cookie**
   ```
   測試Puppeteer.bat
   ```

3. **如果成功**
   - 您會看到：`[Puppeteer] ✅ 使用 Cookie 登入成功`
   - 然後就可以開始使用 Puppeteer 了！

