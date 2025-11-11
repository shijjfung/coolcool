@echo off
chcp 65001 >nul
echo ========================================
echo Supabase 完整設定流程
echo ========================================
echo.

cd /d "%~dp0"

:MENU
cls
echo ========================================
echo Supabase 完整設定流程
echo ========================================
echo.
echo 請選擇要執行的步驟：
echo.
echo [1] 檢查本地環境變數設定
echo [2] 複製 SQL 腳本到剪貼簿（準備在 Supabase 執行）
echo [3] 檢查必要檔案是否存在
echo [4] 顯示完整設定指南
echo [5] 全部執行（1+2+3）
echo [0] 退出
echo.
set /p choice="請輸入選項 (0-5): "

if "%choice%"=="1" goto CHECK_ENV
if "%choice%"=="2" goto COPY_SQL
if "%choice%"=="3" goto CHECK_FILES
if "%choice%"=="4" goto SHOW_GUIDE
if "%choice%"=="5" goto ALL
if "%choice%"=="0" goto END
goto MENU

:CHECK_ENV
cls
echo ========================================
echo [步驟 1] 檢查本地環境變數設定
echo ========================================
echo.
call "檢查Supabase環境變數.bat"
goto MENU

:COPY_SQL
cls
echo ========================================
echo [步驟 2] 複製 SQL 腳本到剪貼簿
echo ========================================
echo.
call "複製SQL到剪貼簿.bat"
goto MENU

:CHECK_FILES
cls
echo ========================================
echo [步驟 3] 檢查必要檔案
echo ========================================
echo.
if exist "supabase-complete-schema.sql" (
    echo ✅ supabase-complete-schema.sql
) else (
    echo ❌ supabase-complete-schema.sql 不存在
)

if exist "lib\supabase.ts" (
    echo ✅ lib\supabase.ts
) else (
    echo ❌ lib\supabase.ts 不存在
)

if exist "lib\db-supabase.ts" (
    echo ✅ lib\db-supabase.ts
) else (
    echo ❌ lib\db-supabase.ts 不存在
)

if exist "pages\api\debug\check-env.ts" (
    echo ✅ pages\api\debug\check-env.ts
) else (
    echo ❌ pages\api\debug\check-env.ts 不存在
)

echo.
pause
goto MENU

:SHOW_GUIDE
cls
echo ========================================
echo 完整設定指南
echo ========================================
echo.
echo [步驟 A] 在 Vercel 設定環境變數
echo   1. 登入 https://vercel.com
echo   2. 進入您的專案
echo   3. Settings → Environment Variables
echo   4. 添加以下變數（選擇所有環境）：
echo.
echo      變數名稱: DATABASE_TYPE
echo      值: supabase
echo.
echo      變數名稱: NEXT_PUBLIC_SUPABASE_URL
echo      值: 從 Supabase Dashboard → Settings → API → Project URL
echo.
echo      變數名稱: NEXT_PUBLIC_SUPABASE_ANON_KEY
echo      值: 從 Supabase Dashboard → Settings → API → anon public key
echo.
echo      變數名稱: SUPABASE_SERVICE_ROLE_KEY
echo      值: 從 Supabase Dashboard → Settings → API → service_role key
echo.
echo [步驟 B] 在 Supabase 建立資料庫結構
echo   1. 登入 https://app.supabase.com
echo   2. 選擇您的專案
echo   3. 點擊左側「SQL Editor」
echo   4. 點擊「New Query」
echo   5. 使用「複製SQL到剪貼簿.bat」複製 SQL 腳本
echo   6. 在 SQL Editor 中按 Ctrl+V 貼上
echo   7. 點擊「Run」執行
echo.
echo [步驟 C] 重新部署 Vercel
echo   1. 在 Vercel Dashboard → Deployments
echo   2. 點擊最新部署的「⋯」→ Redeploy
echo.
echo [步驟 D] 測試連線
echo   訪問: https://您的網址.vercel.app/api/debug/check-env
echo.
echo ========================================
echo.
pause
goto MENU

:ALL
cls
echo ========================================
echo 執行所有檢查步驟
echo ========================================
echo.
call "檢查Supabase環境變數.bat"
echo.
echo 按任意鍵繼續複製 SQL 腳本...
pause >nul
call "複製SQL到剪貼簿.bat"
echo.
echo 按任意鍵返回主選單...
pause >nul
goto MENU

:END
echo.
echo 感謝使用！
echo.
pause
exit /b 0

