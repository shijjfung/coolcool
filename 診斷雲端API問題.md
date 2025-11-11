# 診斷雲端 API 問題

## 步驟 1：檢查 Vercel 部署狀態

1. 前往 https://vercel.com/dashboard
2. 選擇您的專案
3. 檢查最新部署：
   - ✅ 狀態應該是 "Ready"（綠色）
   - ❌ 如果是 "Error" 或 "Building"，請查看部署日誌

## 步驟 2：檢查 Vercel 環境變數

1. 在 Vercel Dashboard 中，點擊專案
2. 前往 **Settings** > **Environment Variables**
3. 確認以下變數已設定：
   - `DATABASE_TYPE` = `supabase`
   - `SUPABASE_URL` = `您的 Supabase URL`
   - `SUPABASE_SERVICE_ROLE_KEY` = `您的 Service Role Key`

## 步驟 3：檢查瀏覽器控制台錯誤

1. 打開瀏覽器開發者工具（按 F12）
2. 前往 **Console** 標籤
3. 嘗試創建表單
4. 複製所有錯誤訊息

## 步驟 4：檢查 Network 請求

1. 在開發者工具中，前往 **Network** 標籤
2. 嘗試創建表單
3. 找到 `/api/forms/create` 請求
4. 點擊查看：
   - **Headers** - 檢查請求方法（應該是 POST）
   - **Payload** - 檢查請求內容
   - **Response** - 查看伺服器回應

## 步驟 5：直接測試 API

在瀏覽器控制台中執行以下代碼：

```javascript
fetch('/api/forms/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '測試表單',
    fields: [{ name: 'test', label: '測試', type: 'text', required: false }],
    deadline: new Date(Date.now() + 86400000).toISOString()
  })
})
.then(res => res.text())
.then(text => {
  console.log('狀態碼:', res.status);
  console.log('回應內容:', text);
  try {
    const json = JSON.parse(text);
    console.log('JSON 解析成功:', json);
  } catch (e) {
    console.error('JSON 解析失敗:', e);
    console.log('原始回應:', text);
  }
})
.catch(error => console.error('請求失敗:', error));
```

## 常見問題

### 問題 1：405 Method Not Allowed
**原因**：請求方法不正確
**解決**：確認前端使用 POST 方法

### 問題 2：500 Internal Server Error
**原因**：
- 環境變數未設定
- Supabase 連線失敗
- 資料庫表結構不正確

**解決**：
1. 檢查 Vercel 環境變數
2. 檢查 Supabase 連線
3. 執行 `supabase-complete-schema.sql`

### 問題 3：返回 HTML 而不是 JSON
**原因**：錯誤處理未正確工作
**解決**：確認最新代碼已部署到 Vercel

## 需要提供的資訊

如果問題仍然存在，請提供：
1. 瀏覽器控制台的完整錯誤訊息
2. Network 標籤中 `/api/forms/create` 的詳細資訊
3. Vercel 部署日誌（如果有錯誤）
4. Vercel 環境變數設定（隱藏敏感資訊）

