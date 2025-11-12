# Vercel 環境變數 Environments 選項說明

## 🎯 選項說明

Vercel 提供以下選項：

- **All Environments**（所有環境）- 推薦使用 ✅
- **Production**（生產環境）
- **Preview**（預覽環境）
- **Development**（開發環境）

---

## ✅ 推薦選擇：All Environments

**最簡單的方法**：直接選擇 **All Environments**

這樣會自動應用到：
- ✅ Production（生產環境）
- ✅ Preview（預覽環境）
- ✅ Development（開發環境）

---

## 📝 設定步驟

### 對於每個環境變數：

1. **創建或編輯環境變數**
2. 在 **Environments** 區塊中
3. **選擇 "All Environments"** ✅
4. 點擊 **Save**（保存）

---

## 🎯 具體操作

### 變數 1：DATABASE_TYPE

1. 點擊 **Add New** 或編輯現有變數
2. Key: `DATABASE_TYPE`
3. Value: `supabase`
4. **Environments: 選擇 "All Environments"** ✅
5. 點擊 **Save**

### 變數 2：SUPABASE_URL

1. 點擊 **Add New**
2. Key: `SUPABASE_URL`
3. Value: `https://ceazouzwbvcfwudcbbnk.supabase.co`
4. **Environments: 選擇 "All Environments"** ✅
5. 點擊 **Save**

### 變數 3：SUPABASE_SERVICE_ROLE_KEY

1. 點擊 **Add New**
2. Key: `SUPABASE_SERVICE_ROLE_KEY`
3. Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYXpvdXp3YnZjZnd1ZGNiYm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5NTg2NiwiZXhwIjoyMDc4MjcxODY2fQ.8faMxUMEjbNUaGTDgkxUr2Rl3BRZEwIxDHuvFSWjd_M`
4. **Environments: 選擇 "All Environments"** ✅
5. 點擊 **Save**

---

## 📋 視覺指引

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
│  │ ○ All Environments  ← 選擇這個！│   │
│  │ ○ Production                    │   │
│  │ ○ Preview                       │   │
│  │ ○ Development                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Save] [Cancel]                        │
└─────────────────────────────────────────┘
```

---

## ✅ 確認設定

設定完成後，在環境變數列表中，您應該看到：

| Key | Value（部分顯示） | Environments |
|-----|------------------|--------------|
| DATABASE_TYPE | supabase | **All Environments** |
| SUPABASE_URL | https://ceazouzwbvcfwudcbbnk... | **All Environments** |
| SUPABASE_SERVICE_ROLE_KEY | eyJhbGci... | **All Environments** |

或者顯示：
- **All Environments** ✅

---

## 🔄 重新部署

設定完成後，**必須重新部署**：

1. 前往 **Deployments** 頁面
2. 點擊最新部署右側的 **⋯**
3. 選擇 **Redeploy**
4. **不要勾選** "Use existing Build Cache"
5. 點擊 **Redeploy**
6. 等待部署完成（1-3 分鐘）

---

## 🧪 測試

部署完成後，訪問：`https://coolcool-ten.vercel.app/api/test-db`

應該返回：
```json
{
  "success": true,
  "message": "資料庫連線正常",
  "environment": {
    "DATABASE_TYPE": "supabase",
    "SUPABASE_URL": "✅ 已設定",
    "SUPABASE_SERVICE_ROLE_KEY": "✅ 已設定"
  }
}
```

---

## ⚠️ 重要提醒

1. **選擇 "All Environments"**：
   - 這是最簡單的方法
   - 會自動應用到所有環境
   - 不需要單獨勾選每個環境

2. **必須重新部署**：
   - 設定環境變數後，必須重新部署才能生效
   - 不要勾選 "Use existing Build Cache"

3. **確認設定**：
   - 設定完成後，確認列表中顯示 "All Environments"

---

**請選擇 "All Environments" 選項，然後重新部署！** ✅

