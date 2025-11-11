# Supabase API Keys 取得詳細指引

## 📍 步驟 1：登入 Supabase Dashboard

1. 訪問：https://app.supabase.com
2. 使用您的帳號登入

---

## 📍 步驟 2：選擇專案

1. 在左側專案列表中選擇您的專案
2. 如果還沒有專案，點擊 **New Project** 建立一個

---

## 📍 步驟 3：進入 API 設定頁面

1. 點擊左側選單的 **Settings**（設定）
2. 在 Settings 子選單中，點擊 **API**

---

## 📍 步驟 4：找到 Project URL

在頁面頂部，您會看到：

```
Project URL
https://xxxxxxxxxxxxx.supabase.co
```

**這就是 `NEXT_PUBLIC_SUPABASE_URL`**

---

## 📍 步驟 5：找到 Project API keys

向下滾動，找到 **Project API keys** 區塊。

您會看到兩個 key：

### 1. anon public key

```
anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjE2NDAwMDAwMDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**這就是 `NEXT_PUBLIC_SUPABASE_ANON_KEY`**

- ✅ 這個 key 可以公開（用於前端）
- ✅ 權限較低，只能執行允許的操作

### 2. service_role key

```
service_role
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2NDAwMDAwMDAsImV4cCI6MTY0MDAwMDAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**這就是 `SUPABASE_SERVICE_ROLE_KEY`**

- ⚠️ **這個 key 必須保密！**
- ⚠️ 有完整權限，可以繞過所有安全規則
- ⚠️ **絕對不要**提交到 Git 或公開分享
- ⚠️ 只用於後端伺服器端

---

## 📋 複製方式

### 方法 1：點擊複製按鈕
- 每個 key 旁邊通常有一個 **複製圖示**（📋）
- 點擊即可複製

### 方法 2：手動選擇
- 用滑鼠選擇整個 key 字串
- 按 `Ctrl+C` 複製

---

## ✅ 檢查清單

確認您已經取得：

- [ ] **NEXT_PUBLIC_SUPABASE_URL** - Project URL
- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY** - anon public key
- [ ] **SUPABASE_SERVICE_ROLE_KEY** - service_role key

---

## 🔒 安全提醒

### ✅ 可以公開的：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`（雖然可以公開，但建議還是放在環境變數中）

### ❌ 絕對不能公開的：
- `SUPABASE_SERVICE_ROLE_KEY` - 這是最高權限的 key！

---

## 📝 下一步

取得這些值後：

1. **本地設定**：使用 `互動式設定Supabase.bat` 建立 `.env.local`
2. **Vercel 設定**：在 Vercel Dashboard → Settings → Environment Variables 設定
3. **測試**：部署後訪問 `/api/debug/check-env` 檢查設定

---

## 🆘 找不到 service_role key？

如果看不到 **service_role** key：

1. 確認您已經登入 Supabase Dashboard
2. 確認您在正確的專案中
3. 確認您有專案的管理權限
4. 如果還是找不到，可能是專案設定問題，請檢查 Supabase 文件或聯繫支援

---

## 📸 視覺化指引

如果您需要視覺化指引，可以：

1. 在 Supabase Dashboard 截圖（隱藏敏感資訊）
2. 我可以幫您標註需要複製的位置

---

## 💡 提示

- 所有 key 都是以 `eyJ` 開頭的長字串（JWT token）
- 如果 key 太長，確認複製完整（通常有 200+ 個字符）
- 複製後可以貼到記事本檢查長度

