# 修復 API 路由錯誤指南

## 🔍 問題診斷

線上部署後出現以下錯誤：
1. **圖標文件 404 錯誤** - icon-192.png, icon-512.png
2. **API 路由返回 HTML 而不是 JSON** - `/api/forms/create`, `/api/forms/list`, `/api/reports/auto-generate`
3. **JSON 解析錯誤** - 返回的是 HTML 錯誤頁面而不是 JSON

## ✅ 已修復的問題

### 1. 圖標文件 404 錯誤
- ✅ 已修改 `public/manifest.json`，移除對不存在的圖標文件的引用
- 圖標數組現在為空：`"icons": []`

### 2. Vercel 配置
- ✅ 已簡化 `vercel.json`，移除可能導致問題的 rewrites 配置
- Next.js 會自動處理 API 路由，不需要額外的 rewrites

## 🔧 需要檢查的項目

### 1. 環境變數設定

請確認 Vercel Dashboard 中的環境變數已正確設定：

1. 前往：https://vercel.com/dashboard
2. 選擇您的專案
3. 前往 **Settings** → **Environment Variables**
4. 確認以下變數都已設定並勾選 **All Environments**：
   - `DATABASE_TYPE` = `supabase`
   - `SUPABASE_URL` = `https://ceazouzwbvcfwudcbbnk.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = (您的服務角色金鑰)

### 2. 重新部署

**重要**：修改配置後必須重新部署：

1. 前往 **Deployments** 頁面
2. 點擊最新部署右側的 **⋯** → **Redeploy**
3. ⚠️ **不要勾選** "Use existing Build Cache"
4. 點擊 **Redeploy**
5. 等待部署完成（1-3 分鐘）

### 3. 檢查部署日誌

如果問題仍然存在，請檢查部署日誌：

1. 在 **Deployments** 頁面
2. 點擊最新的部署記錄
3. 查看 **Build Logs** 和 **Function Logs**
4. 尋找錯誤訊息，特別是：
   - 資料庫連線錯誤
   - 環境變數缺失
   - 編譯錯誤

## 🧪 測試步驟

部署完成後，請測試以下 API 端點：

### 1. 健康檢查
```
GET https://coolcool-ten.vercel.app/api/health
```
應該返回 JSON：`{"status":"ok"}`

### 2. 表單列表
```
GET https://coolcool-ten.vercel.app/api/forms/list
```
應該返回 JSON 數組，而不是 HTML

### 3. 創建表單
```
POST https://coolcool-ten.vercel.app/api/forms/create
Content-Type: application/json

{
  "name": "測試表單",
  "fields": [...],
  "deadline": "2024-12-31T23:59"
}
```

## 🆘 如果問題仍然存在

### 檢查 1：API 路由文件是否存在

確認以下文件存在：
- `pages/api/forms/create.ts`
- `pages/api/forms/list.ts`
- `pages/api/reports/auto-generate.ts`

### 檢查 2：Next.js 配置

確認 `next.config.js` 沒有禁用 API 路由：
```javascript
const nextConfig = {
  reactStrictMode: true,
  // 不要設定 output: 'standalone'，這會導致 API 路由問題
}
```

### 檢查 3：Vercel 專案設定

1. 前往 **Settings** → **General**
2. 確認 **Framework Preset** 設定為 **Next.js**
3. 確認 **Build Command** 和 **Output Directory** 使用預設值

### 檢查 4：查看 Vercel 函數日誌

1. 前往 **Deployments** → 選擇最新部署
2. 點擊 **Functions** 標籤
3. 查看 API 路由的執行日誌
4. 尋找錯誤訊息

## 📝 本次修改的文件

1. ✅ `vercel.json` - 簡化配置
2. ✅ `public/manifest.json` - 移除圖標引用

## 🔄 下一步

1. 提交這些更改到 GitHub
2. 在 Vercel Dashboard 觸發重新部署
3. 等待部署完成
4. 測試 API 端點
5. 如果問題仍然存在，檢查部署日誌並查看具體錯誤訊息

