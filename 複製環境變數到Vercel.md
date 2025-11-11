# 複製環境變數到 Vercel

## 重要說明

如果本機測試正常，表示：
- ✅ Supabase 連線正常
- ✅ 資料庫表結構已建立
- ✅ 環境變數在本機是正確的

問題是：**Vercel 的環境變數可能沒有設定或設定錯誤**

## 解決方案：將本機環境變數複製到 Vercel

### 步驟 1：檢查本機環境變數

本機環境變數通常在以下位置：
- `.env.local` 文件（優先）
- `.env` 文件

請檢查這些文件中的以下變數：
- `DATABASE_TYPE`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`（如果有）
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`（如果有）

### 步驟 2：在 Vercel 中設定相同的環境變數

1. **前往 Vercel Dashboard**
   - 訪問 https://vercel.com/dashboard
   - 選擇您的專案

2. **前往 Settings > Environment Variables**

3. **添加環境變數**（從本機複製）：

   | 變數名稱 | 值 | 說明 |
   |---------|-----|------|
   | `DATABASE_TYPE` | `supabase` | 從本機複製 |
   | `SUPABASE_URL` | `您的 Supabase URL` | 從本機複製 |
   | `SUPABASE_SERVICE_ROLE_KEY` | `您的 Service Role Key` | 從本機複製 |

   **可選變數**（如果本機有設定）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **選擇環境**
   - ✅ Production（必須）
   - ✅ Preview（建議）
   - ✅ Development（可選）

5. **保存設定**
   - 點擊 **Save**
   - Vercel 會自動重新部署

### 步驟 3：確認環境變數已設定

1. **等待 Vercel 重新部署**（1-3 分鐘）

2. **測試環境變數**：
   ```
   https://coolcool-ten.vercel.app/api/test-db
   ```

3. **查看回應**：
   - 應該顯示所有環境變數都已設定
   - 資料庫連線應該成功

## 快速檢查方法

### 方法 1：查看本機 .env.local 文件

在專案根目錄找到 `.env.local` 文件，查看其中的環境變數值。

### 方法 2：使用檢查腳本

執行 `檢查Supabase設定.bat` 查看指引。

## 常見問題

### 問題 1：找不到 .env.local 文件

**解決方案**：
- 檢查專案根目錄
- 確認文件沒有被 `.gitignore` 忽略
- 如果沒有，請從 Supabase Dashboard 重新取得環境變數

### 問題 2：環境變數值很長

**解決方案**：
- 確保複製完整（不要有換行）
- 確認沒有多餘的空格
- 在 Vercel 中貼上時，確認值完整

### 問題 3：設定後還是失敗

**解決方案**：
1. 確認環境變數名稱完全正確（區分大小寫）
2. 確認已選擇正確的環境（Production/Preview）
3. 等待 Vercel 重新部署完成
4. 清除瀏覽器快取後重新測試

## 測試步驟

設定完成後：

1. **等待 Vercel 重新部署**（1-3 分鐘）

2. **測試資料庫連線**：
   ```
   https://coolcool-ten.vercel.app/api/test-db
   ```

3. **預期結果**：
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

4. **如果成功，測試創建表單**：
   - 前往 `https://coolcool-ten.vercel.app/admin`
   - 嘗試創建表單

