# 測試所有 API 端點

## ✅ 已確認正常

1. **健康檢查端點** - `/api/health`
   - ✅ 返回 JSON 回應
   - ✅ API 路由正常工作

## 需要測試的端點

### 1. 測試資料庫連線

訪問：
```
https://coolcool-ten.vercel.app/api/test-db
```

**預期結果**：
- ✅ 看到 JSON 回應，顯示環境變數狀態和資料庫連線狀態
- ❌ 如果看到 500 錯誤，表示資料庫連線有問題

### 2. 測試表單列表

在瀏覽器控制台執行：
```javascript
fetch('/api/forms/list')
  .then(res => res.json())
  .then(data => console.log('表單列表:', data))
  .catch(error => console.error('錯誤:', error));
```

**預期結果**：
- ✅ 看到表單列表（可能是空陣列 `[]`）
- ❌ 如果看到 500 錯誤，檢查環境變數和資料庫設定

### 3. 測試創建表單

在瀏覽器控制台執行：
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
  .then(res => res.json())
  .then(data => console.log('創建結果:', data))
  .catch(error => console.error('錯誤:', error));
```

**預期結果**：
- ✅ 看到 `{"success":true,"formId":...,"formToken":"..."}`
- ❌ 如果看到錯誤，檢查錯誤訊息

## 測試步驟

1. **先測試資料庫連線**：
   - 訪問 `/api/test-db`
   - 確認環境變數已設定
   - 確認資料庫連線正常

2. **然後測試表單列表**：
   - 在控制台執行測試代碼
   - 確認可以取得表單列表

3. **最後測試創建表單**：
   - 在控制台執行測試代碼
   - 確認可以成功創建表單

## 如果遇到錯誤

### 資料庫連線失敗

**可能原因**：
- 環境變數未設定
- Supabase 連線失敗
- 資料庫表結構未建立

**解決方案**：
1. 檢查 Vercel 環境變數設定
2. 檢查 Supabase 資料庫表結構
3. 查看 `/api/test-db` 的回應中的詳細錯誤訊息

### 表單列表或創建失敗

**可能原因**：
- 資料庫連線問題
- 表結構問題
- 環境變數問題

**解決方案**：
1. 先確認 `/api/test-db` 正常
2. 檢查錯誤訊息中的 `details` 和 `hint`
3. 根據提示修復問題

