@echo off
chcp 65001 >nul
echo ========================================
echo 快速複製環境變數到 Vercel
echo ========================================
echo.
echo 既然本機測試正常，表示環境變數是正確的
echo 現在需要將相同的環境變數設定到 Vercel
echo.
echo 請按照以下步驟操作：
echo.
echo [步驟 1] 查看本機環境變數
echo   1. 在專案根目錄找到 .env.local 文件
echo   2. 打開文件，查看以下變數的值：
echo      - DATABASE_TYPE
echo      - SUPABASE_URL
echo      - SUPABASE_SERVICE_ROLE_KEY
echo.
echo [步驟 2] 在 Vercel 中設定環境變數
echo   1. 前往 https://vercel.com/dashboard
echo   2. 選擇您的專案
echo   3. 前往 Settings ^> Environment Variables
echo   4. 添加以下變數（從本機複製值）：
echo      - DATABASE_TYPE = supabase
echo      - SUPABASE_URL = 從本機複製
echo      - SUPABASE_SERVICE_ROLE_KEY = 從本機複製
echo   5. 選擇環境：Production、Preview
echo   6. 點擊 Save
echo.
echo [步驟 3] 等待重新部署
echo   Vercel 會自動重新部署（1-3 分鐘）
echo.
echo [步驟 4] 測試
echo   訪問：https://coolcool-ten.vercel.app/api/test-db
echo   應該看到資料庫連線成功
echo.
echo ========================================
echo.
echo 詳細說明請查看：複製環境變數到Vercel.md
echo.
echo ========================================
echo.

pause

