@echo off
chcp 65001 >nul
echo ========================================
echo 使用替代方法檢查環境變數
echo ========================================
echo.
echo /api/test-db 返回 404，但我們有其他方法檢查
echo.
echo [方法 1] 使用 /api/debug/check-env
echo   在瀏覽器中訪問：
echo   https://coolcool-ten.vercel.app/api/debug/check-env
echo.
echo   這個端點可以檢查環境變數設定
echo.
echo [方法 2] 直接測試創建表單
echo   1. 前往：https://coolcool-ten.vercel.app/admin
echo   2. 嘗試創建表單
echo   3. 如果失敗，查看錯誤訊息
echo.
echo [方法 3] 修復 test-db 端點
echo   執行：修復test-db端點.bat
echo   強制推送 test-db.ts 文件
echo.
echo ========================================
echo.
echo 建議：先使用方法 1 檢查環境變數
echo 如果環境變數都設定正確，直接測試創建表單
echo.
echo ========================================
echo.

pause

