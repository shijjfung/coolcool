# 檢查 Supabase 環境變數

## 重要說明

**Supabase 連線不需要資料庫名稱**，只需要：
- `SUPABASE_URL` - Supabase 專案 URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key（後端使用）

資料庫名稱「訂單管理系統」只是用於識別，不影響 API 連線。

## 檢查步驟

### 步驟 1：取得 Supabase 環境變數

1. **前往 Supabase Dashboard**
   - 訪問 https://supabase.com/dashboard
   - 選擇您的專案（資料庫名稱是「訂單管理系統」）

2. **取得 SUPABASE_URL**
   - 在專案設定中，找到 **Project URL**
   - 格式類似：`https://xxxxx.supabase.co`
   - 複製這個 URL

3. **取得 SUPABASE_SERVICE_ROLE_KEY**
   - 在專案設定中，前往 **API** 或 **Settings** > **API**
   - 找到 **service_role** key（不是 anon key）
   - 點擊 **Reveal** 顯示完整 key
   - 複製這個 key（很長的字串）

### 步驟 2：在 Vercel 中設定環境變數

1. **前往 Vercel Dashboard**
   - 訪問 https://vercel.com/dashboard
   - 選擇您的專案

2. **前往 Settings > Environment Variables**

3. **添加以下環境變數**：

   | 變數名稱 | 值 | 說明 |
   |---------|-----|------|
   | `DATABASE_TYPE` | `supabase` | 資料庫類型 |
   | `SUPABASE_URL` | `您的 Supabase URL` | 從 Supabase Dashboard 複製 |
   | `SUPABASE_SERVICE_ROLE_KEY` | `您的 Service Role Key` | 從 Supabase Dashboard 複製 |

4. **選擇環境**
   - 勾選 **Production**（生產環境）
   - 勾選 **Preview**（預覽環境）
   - 勾選 **Development**（開發環境，可選）

5. **保存設定**
   - 點擊 **Save**
   - Vercel 會自動重新部署

### 步驟 3：確認環境變數已設定

1. **等待 Vercel 重新部署完成**（1-3 分鐘）

2. **測試環境變數**
   - 訪問：`https://coolcool-ten.vercel.app/api/test-db`
   - 查看回應中的 `environment` 部分
   - 應該顯示：
     ```json
     {
       "DATABASE_TYPE": "supabase",
       "SUPABASE_URL": "✅ 已設定",
       "SUPABASE_SERVICE_ROLE_KEY": "✅ 已設定"
     }
     ```

## 常見問題

### 問題 1：找不到 Service Role Key

**解決方案**：
1. 在 Supabase Dashboard 中，前往 **Settings** > **API**
2. 找到 **Project API keys** 區塊
3. 找到 **service_role** key（通常標記為 "secret"）
4. 點擊 **Reveal** 或眼睛圖示顯示 key

### 問題 2：環境變數已設定但還是失敗

**解決方案**：
1. 確認環境變數名稱完全正確（區分大小寫）
2. 確認已選擇正確的環境（Production/Preview）
3. 確認值沒有多餘的空格
4. 重新部署 Vercel 專案

### 問題 3：使用錯誤的 Key

**重要**：
- ✅ 使用 **service_role** key（後端使用，有完整權限）
- ❌ 不要使用 **anon** key（前端使用，權限有限）

## 測試步驟

設定完成後：

1. **等待 Vercel 重新部署**（1-3 分鐘）

2. **測試資料庫連線**：
   ```
   https://coolcool-ten.vercel.app/api/test-db
   ```

3. **查看回應**：
   - 如果 `success: true` = 連線成功
   - 如果 `success: false` = 檢查錯誤訊息

## 下一步

如果環境變數設定正確但還是失敗，請檢查：
1. Supabase 資料庫表結構是否已建立
2. 執行 `supabase-complete-schema.sql` 建立表結構

