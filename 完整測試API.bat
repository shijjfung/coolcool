@echo off
chcp 65001 >nul
echo ========================================
echo 完整測試 API 端點
echo ========================================
echo.
echo ✅ 健康檢查端點已確認正常
echo.
echo 請按照以下步驟測試其他端點：
echo.
echo [步驟 1] 測試資料庫連線
echo   在瀏覽器中訪問：
echo   https://coolcool-ten.vercel.app/api/test-db
echo.
echo   預期結果：
echo   - ✅ 看到 JSON 回應，顯示環境變數狀態
echo   - ❌ 如果看到 500 錯誤，檢查環境變數設定
echo.
echo [步驟 2] 測試表單列表
echo   1. 打開瀏覽器開發者工具（F12）
echo   2. 前往 Console 標籤
echo   3. 執行以下代碼：
echo.
echo   fetch('/api/forms/list')
echo     .then(res => res.json())
echo     .then(data => console.log('表單列表:', data))
echo     .catch(error => console.error('錯誤:', error));
echo.
echo   預期結果：
echo   - ✅ 看到表單列表（可能是空陣列）
echo   - ❌ 如果看到錯誤，檢查錯誤訊息
echo.
echo [步驟 3] 測試創建表單
echo   在 Console 中執行以下代碼：
echo.
echo   fetch('/api/forms/create', {
echo     method: 'POST',
echo     headers: { 'Content-Type': 'application/json' },
echo     body: JSON.stringify({
echo       name: '測試表單',
echo       fields: [{ name: 'test', label: '測試', type: 'text', required: false }],
echo       deadline: new Date(Date.now() + 86400000).toISOString()
echo     })
echo   })
echo     .then(res => res.json())
echo     .then(data => console.log('創建結果:', data))
echo     .catch(error => console.error('錯誤:', error));
echo.
echo   預期結果：
echo   - ✅ 看到 {"success":true,"formId":...,"formToken":"..."}
echo   - ❌ 如果看到錯誤，檢查錯誤訊息
echo.
echo ========================================
echo.
echo 詳細說明請查看：測試所有API端點.md
echo.
echo ========================================
echo.

pause

