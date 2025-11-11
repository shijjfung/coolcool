# 解決 /api/forms/ API 404 問題

## 🔍 問題診斷

**當前狀況**：
- ✅ `/api/health` 返回 JSON（基本 API 路由正常）
- ❌ `/api/forms/list` 返回 404（嵌套 API 路由失敗）

**這表示**：
- 基本 API 路由工作正常
- 嵌套在 `/api/forms/` 目錄下的 API 路由可能有問題

---

## 🔧 可能的原因

### 原因 1：文件未正確推送到 GitHub

**檢查**：
1. 前往 GitHub 倉庫
2. 確認 `pages/api/forms/list.ts` 文件存在
3. 確認文件已提交到 main 分支

### 原因 2：Vercel 構建時未包含嵌套目錄

**檢查**：
1. 查看 Vercel 構建日誌
2. 確認 `/api/forms/list` 是否被編譯
3. 檢查是否有任何警告

### 原因 3：文件路徑或導出問題

**檢查**：
1. 確認文件在 `pages/api/forms/list.ts`
2. 確認文件包含 `export default async function handler`
3. 確認沒有語法錯誤

---

## 🧪 診斷步驟

### 步驟 1：檢查 GitHub 倉庫

1. 前往您的 GitHub 倉庫
2. 導航到 `pages/api/forms/` 目錄
3. 確認 `list.ts` 文件存在
4. 點擊文件查看內容
5. 確認文件包含正確的 handler 函數

### 步驟 2：檢查 Vercel Functions 頁面

1. 前往 Vercel Dashboard
2. 選擇您的專案
3. 前往 **Functions**（函數）標籤
4. 查看是否有 `/api/forms/list` 函數

**如果不存在**：
- 函數沒有被正確部署
- 需要重新部署

**如果存在但返回 404**：
- 可能是路由配置問題
- 需要檢查函數日誌

### 步驟 3：檢查構建日誌

1. 在 Vercel Dashboard 中，點擊最新部署
2. 查看 **Build Logs**（構建日誌）
3. 搜索 `/api/forms/list`
4. 確認是否被編譯

---

## 🔧 解決方案

### 方案 1：強制重新部署（推薦）

執行 `修復forms API 404.bat`，然後：

1. 在 Vercel Dashboard 中手動觸發重新部署
2. **不要勾選** "Use existing Build Cache"
3. 等待部署完成

### 方案 2：檢查文件導出

確認 `pages/api/forms/list.ts` 文件包含：

```typescript
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ... 處理邏輯
}
```

### 方案 3：檢查文件路徑

確認文件在正確的位置：
- ✅ `pages/api/forms/list.ts` → `/api/forms/list`
- ❌ `pages/api/forms/list.js` → 錯誤（應該是 `.ts`）

---

## 📝 測試步驟

### 測試 1：確認文件已推送

訪問 GitHub 倉庫，確認 `pages/api/forms/list.ts` 存在。

### 測試 2：檢查 Vercel Functions

在 Vercel Dashboard 的 Functions 頁面，確認 `/api/forms/list` 函數存在。

### 測試 3：重新部署後測試

1. 手動觸發重新部署（清除快取）
2. 等待部署完成
3. 測試：`https://coolcool-ten.vercel.app/api/forms/list`
4. 應該返回 JSON，不是 404

---

## ⚠️ 重要提醒

1. **必須清除構建快取**：
   - 在重新部署時，不要勾選 "Use existing Build Cache"
   - 這確保所有文件都被重新編譯

2. **檢查 Functions 頁面**：
   - 如果函數不存在，表示部署有問題
   - 需要檢查構建日誌

3. **等待部署完成**：
   - 重新部署後，等待 1-3 分鐘
   - 確認狀態為 "Ready"

---

## 🎯 下一步

請執行以下操作：

1. ✅ 執行 `修復forms API 404.bat`
2. ✅ 在 Vercel Dashboard 中手動觸發重新部署（清除快取）
3. ✅ 檢查 Vercel Functions 頁面，確認 `/api/forms/list` 函數存在
4. ✅ 等待部署完成後測試

---

**請先執行修復腳本，然後手動觸發重新部署（清除快取）！** 🔧

