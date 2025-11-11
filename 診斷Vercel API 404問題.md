# 診斷 Vercel API 404 問題

## 🔍 問題描述

構建日誌顯示所有 API 路由都已正確編譯，但訪問時返回 404。

**構建日誌顯示**：
- ✅ `/api/forms/list` 已編譯
- ✅ `/api/forms/create` 已編譯
- ✅ `/api/health` 已編譯
- ✅ 構建成功完成

**但訪問時**：
- ❌ `/api/forms/list` 返回 404
- ❌ `/api/forms/create` 可能也返回 404

---

## 🔧 可能的原因和解決方案

### 原因 1：Vercel 路由快取問題

**解決方案**：
1. 在 Vercel Dashboard 中手動觸發重新部署
2. 清除 Vercel 的構建快取

### 原因 2：Next.js 配置問題

**檢查**：
- `next.config.js` 是否有特殊配置
- `output: 'standalone'` 是否影響 API 路由

### 原因 3：文件路徑問題

**檢查**：
- 確認文件在 `pages/api/forms/list.ts`
- 確認文件名正確（`.ts` 不是 `.js`）

### 原因 4：Vercel 部署配置問題

**檢查**：
- 是否有 `vercel.json` 覆蓋了路由配置
- 是否有重寫規則影響 API 路由

---

## 🧪 診斷步驟

### 步驟 1：測試簡單的 API 端點

訪問：`https://coolcool-ten.vercel.app/api/health`

**如果也返回 404**：
- 可能是 Vercel 路由配置問題
- 需要檢查 Vercel 部署配置

**如果返回 JSON**：
- 基本 API 路由正常
- 問題可能出在 `/api/forms/` 路徑

### 步驟 2：檢查 Vercel 函數日誌

1. 前往 Vercel Dashboard
2. 選擇您的專案
3. 前往 **Functions**（函數）標籤
4. 查看是否有 `/api/forms/list` 函數
5. 檢查函數日誌是否有錯誤

### 步驟 3：檢查實際部署的文件

1. 在 Vercel Dashboard 中，點擊最新部署
2. 查看 **Source**（源代碼）或 **Functions**（函數）
3. 確認 `/api/forms/list` 函數存在

---

## 🔧 解決方案

### 方案 1：手動觸發重新部署（清除快取）

1. 前往 Vercel Dashboard
2. 選擇您的專案
3. 前往 **Deployments**（部署）頁面
4. 點擊最新部署右側的 **⋯**（三個點）
5. 選擇 **Redeploy**（重新部署）
6. **不要勾選** "Use existing Build Cache"
7. 點擊 **Redeploy**

這會清除構建快取並重新構建所有文件。

### 方案 2：檢查並修復 next.config.js

確認 `next.config.js` 沒有影響 API 路由的配置：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'standalone', // 如果這行導致問題，可以暫時註釋
}

module.exports = nextConfig
```

### 方案 3：創建 vercel.json（如果需要）

如果沒有 `vercel.json`，通常不需要。但如果需要，可以創建：

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

---

## 📝 測試步驟

### 測試 1：健康檢查

訪問：`https://coolcool-ten.vercel.app/api/health`

**預期**：返回 JSON
```json
{
  "success": true,
  "message": "API 路由正常工作",
  ...
}
```

### 測試 2：表單列表

訪問：`https://coolcool-ten.vercel.app/api/forms/list`

**預期**：返回 JSON（可能是空陣列 `[]`）

### 測試 3：使用 curl 測試

在終端機中執行：
```bash
curl https://coolcool-ten.vercel.app/api/health
curl https://coolcool-ten.vercel.app/api/forms/list
```

---

## ⚠️ 重要提醒

1. **清除瀏覽器快取**：
   - 按 `Ctrl + Shift + Delete`
   - 或使用無痕模式測試

2. **確認訪問的是生產環境**：
   - ✅ `https://coolcool-ten.vercel.app`
   - ❌ 不是預覽環境 URL

3. **等待部署完成**：
   - 重新部署後，等待 1-3 分鐘
   - 確認狀態為 "Ready"

---

## 🎯 下一步

請執行以下操作：

1. ✅ 測試 `/api/health` 是否正常
2. ✅ 在 Vercel Dashboard 中手動觸發重新部署（清除快取）
3. ✅ 等待部署完成
4. ✅ 再次測試 `/api/forms/list`

如果問題持續，請提供：
- `/api/health` 的測試結果
- Vercel Functions 頁面的截圖
- 重新部署後的構建日誌

---

**請先測試 `/api/health`，然後手動觸發重新部署（清除快取）！** 🔍

