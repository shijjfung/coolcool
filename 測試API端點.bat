@echo off
chcp 65001 >nul
echo ========================================
echo 測試 API 端點
echo ========================================
echo.
echo 這個批次檔會幫您測試 API 端點是否正常運作
echo.
echo 請按照以下步驟操作：
echo.
echo [步驟 1] 打開瀏覽器
echo   1. 前往您的 Vercel 部署網址
echo   2. 按 F12 打開開發者工具
echo   3. 前往 Console 標籤
echo.
echo [步驟 2] 執行測試代碼
echo   複製以下代碼並貼到 Console 中執行：
echo.
echo ========================================
echo.
echo fetch('/api/forms/create', {
echo   method: 'POST',
echo   headers: { 'Content-Type': 'application/json' },
echo   body: JSON.stringify({
echo     name: '測試表單',
echo     fields: [{ name: 'test', label: '測試', type: 'text', required: false }],
echo     deadline: new Date(Date.now() + 86400000).toISOString()
echo   })
echo })
echo .then(res => {
echo   console.log('狀態碼:', res.status);
echo   return res.text();
echo })
echo .then(text => {
echo   console.log('回應內容:', text);
echo   try {
echo     const json = JSON.parse(text);
echo     console.log('✅ JSON 解析成功:', json);
echo   } catch (e) {
echo     console.error('❌ JSON 解析失敗');
echo     console.log('原始回應:', text.substring(0, 200));
echo   }
echo })
echo .catch(error => console.error('❌ 請求失敗:', error));
echo.
echo ========================================
echo.
echo [步驟 3] 查看結果
echo   - 如果看到 "✅ JSON 解析成功"，表示 API 正常
echo   - 如果看到 "❌ JSON 解析失敗"，請複製錯誤訊息
echo   - 如果看到 "❌ 請求失敗"，請複製錯誤訊息
echo.
echo ========================================
echo.

pause

