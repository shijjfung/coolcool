# 如何在 Vercel 中勾選 Environments

## 📍 步驟說明

### 步驟 1：進入環境變數設定頁面

1. 前往 Vercel Dashboard：https://vercel.com/dashboard
2. 選擇您的專案
3. 點擊頂部選單的 **Settings**（設定）
4. 在左側選單中，點擊 **Environment Variables**（環境變數）

---

### 步驟 2：創建或編輯環境變數

#### 如果創建新變數：

1. 點擊 **Add New**（新增）按鈕
2. 會彈出一個表單

#### 如果編輯現有變數：

1. 找到您要編輯的變數
2. 點擊變數右側的 **⋯**（三個點）或 **Edit**（編輯）按鈕
3. 會彈出編輯表單

---

### 步驟 3：找到 Environments 選項

在彈出的表單中，您會看到：

```
┌─────────────────────────────────────┐
│ Key（鍵）                           │
│ [輸入框]                            │
│                                     │
│ Value（值）                          │
│ [輸入框]                            │
│                                     │
│ Environments（環境）                │
│ ┌─────────────────────────────┐   │
│ │ ☐ Production                │   │
│ │ ☐ Preview                   │   │
│ │ ☐ Development               │   │
│ └─────────────────────────────┘   │
│                                     │
│ [Save] [Cancel]                    │
└─────────────────────────────────────┘
```

---

### 步驟 4：勾選 Environments

在 **Environments（環境）** 區塊中，您會看到三個選項：

- ☐ **Production**（生產環境）
- ☐ **Preview**（預覽環境）
- ☐ **Development**（開發環境）

**請勾選**：
- ✅ **Production**（必須）
- ✅ **Preview**（必須）
- ⬜ **Development**（可選，不勾選也可以）

---

## 🎯 具體操作

### 對於每個環境變數：

1. **點擊 Production 旁邊的方框** ☐ → 變成 ☑
2. **點擊 Preview 旁邊的方框** ☐ → 變成 ☑
3. **Development 可以不勾選**（可選）

---

## 📝 視覺指引

### 創建環境變數時的畫面：

```
┌─────────────────────────────────────────┐
│  Add Environment Variable               │
├─────────────────────────────────────────┤
│                                         │
│  Key                                    │
│  ┌─────────────────────────────────┐   │
│  │ SUPABASE_URL                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Value                                  │
│  ┌─────────────────────────────────┐   │
│  │ https://ceazouzwbvcfwudcbbnk... │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Environments                           │
│  ┌─────────────────────────────────┐   │
│  │ ☑ Production                    │   │  ← 勾選這個
│  │ ☑ Preview                       │   │  ← 勾選這個
│  │ ☐ Development                   │   │  ← 可以不勾選
│  └─────────────────────────────────┘   │
│                                         │
│  [Save] [Cancel]                        │
└─────────────────────────────────────────┘
```

---

## ⚠️ 重要提醒

1. **必須勾選 Production 和 Preview**：
   - 如果只勾選 Development，環境變數不會傳遞到生產環境
   - 這會導致「缺少 supabaseKey」錯誤

2. **每個變數都需要勾選**：
   - `DATABASE_TYPE` → 勾選 Production 和 Preview
   - `SUPABASE_URL` → 勾選 Production 和 Preview
   - `SUPABASE_SERVICE_ROLE_KEY` → 勾選 Production 和 Preview

3. **勾選後點擊 Save**：
   - 勾選完成後，必須點擊 **Save**（保存）按鈕
   - 否則設定不會保存

---

## 🔍 如何確認已勾選

設定完成後，在環境變數列表中，您應該看到：

| Key | Value（部分顯示） | Environments |
|-----|------------------|--------------|
| DATABASE_TYPE | supabase | **Production, Preview** |
| SUPABASE_URL | https://ceazouzwbvcfwudcbbnk... | **Production, Preview** |
| SUPABASE_SERVICE_ROLE_KEY | eyJhbGci... | **Production, Preview** |

如果看到 "All Environments"，也表示已應用到所有環境。

---

## 🎯 下一步

設定完成後：

1. ✅ 確認所有三個變數都已勾選 Production 和 Preview
2. ✅ 點擊 Save 保存
3. ✅ 手動觸發重新部署（清除快取）
4. ✅ 等待部署完成後測試

---

**請在創建或編輯環境變數時，勾選 Production 和 Preview！** ✅

