# 檢查 Vercel 部署狀態

## 問題診斷

如果 API 仍然返回 HTML 而不是 JSON，可能是以下原因：

1. **代碼還沒有正確部署到 Vercel**
2. **Vercel 構建時有錯誤**
3. **環境變數沒有正確設定**

## 檢查步驟

### 步驟 1：檢查 Vercel 部署狀態

1. 前往 https://vercel.com/dashboard
2. 選擇您的專案 `coolcool` 或 `下單庫存管理`
3. 查看 **Deployments**（部署）標籤
4. 檢查最新部署：
   - ✅ **Ready**（綠色）= 部署成功
   - ⏳ **Building** = 正在構建
   - ❌ **Error** = 構建失敗

### 步驟 2：查看構建日誌

1. 點擊最新部署
2. 查看 **Build Logs**（構建日誌）
3. 檢查是否有錯誤：
   - TypeScript 編譯錯誤
   - 依賴安裝錯誤
   - 環境變數錯誤

### 步驟 3：檢查環境變數

1. 在 Vercel Dashboard 中，點擊 **Settings**
2. 前往 **Environment Variables**
3. 確認以下變數已設定：
   - `DATABASE_TYPE` = `supabase`
   - `SUPABASE_URL` = `您的 Supabase URL`
   - `SUPABASE_SERVICE_ROLE_KEY` = `您的 Service Role Key`

### 步驟 4：測試 API 端點

在瀏覽器中訪問：
```
https://coolcool-ten.vercel.app/api/test-db
```

**預期結果**：
- ✅ 看到 JSON 回應 = API 正常
- ❌ 看到 HTML 錯誤頁面 = 代碼可能還沒部署或構建失敗

## 常見問題

### 問題 1：構建失敗

**解決方案**：
1. 查看構建日誌中的錯誤訊息
2. 修復錯誤後重新推送代碼
3. 或手動觸發重新部署

### 問題 2：環境變數未設定

**解決方案**：
1. 在 Vercel Dashboard 中設定環境變數
2. 重新部署（Vercel 會自動觸發）

### 問題 3：代碼已推送但未部署

**解決方案**：
1. 檢查 GitHub 是否有最新提交
2. 在 Vercel Dashboard 中手動觸發重新部署
3. 或推送一個空提交來觸發部署

## 手動觸發重新部署

1. 在 Vercel Dashboard 中，點擊專案
2. 前往 **Deployments** 標籤
3. 點擊最新部署右側的 **"..."** 選單
4. 選擇 **"Redeploy"**（重新部署）

## 需要幫助？

如果問題仍然存在，請提供：
1. Vercel 構建日誌（完整）
2. `/api/test-db` 的回應內容
3. 瀏覽器 Network 標籤中 API 請求的詳細資訊

