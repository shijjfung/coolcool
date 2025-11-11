@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
echo ========================================
echo 驗證 .env.local 設定
echo ========================================
echo.

if not exist ".env.local" (
    echo ❌ .env.local 檔案不存在
    pause
    exit /b 1
)

echo ✅ .env.local 檔案存在
echo.
echo 檢查設定值：
echo ----------------------------------------

set "all_ok=1"

for /f "usebackq tokens=1,2 delims==" %%a in (".env.local") do (
    if "%%a"=="DATABASE_TYPE" (
        if "%%b"=="supabase" (
            echo ✅ DATABASE_TYPE = supabase
        ) else (
            echo ❌ DATABASE_TYPE = %%b （應該是 supabase）
            set "all_ok=0"
        )
    )
    
    if "%%a"=="NEXT_PUBLIC_SUPABASE_URL" (
        echo %%b | findstr /R /C:"^https://" | findstr /R /C:"\.supabase\.co" >nul 2>&1
        if !errorlevel!==0 (
            echo ✅ NEXT_PUBLIC_SUPABASE_URL = %%b
        ) else (
            echo ❌ NEXT_PUBLIC_SUPABASE_URL 格式不正確
            echo    實際值: %%b
            set "all_ok=0"
        )
    )
    
    if "%%a"=="NEXT_PUBLIC_SUPABASE_ANON_KEY" (
        echo %%b | findstr /R "^eyJ" >nul 2>&1
        if !errorlevel!==0 (
            set "key_len=%%b"
            call :get_length "!key_len!"
            echo ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY = 已設定（長度: !len! 字符）
        ) else (
            echo ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 格式不正確
            set "all_ok=0"
        )
    )
    
    if "%%a"=="SUPABASE_SERVICE_ROLE_KEY" (
        echo %%b | findstr /R "^eyJ" >nul 2>&1
        if !errorlevel!==0 (
            set "key_len=%%b"
            call :get_length "!key_len!"
            echo ✅ SUPABASE_SERVICE_ROLE_KEY = 已設定（長度: !len! 字符）
        ) else (
            echo ❌ SUPABASE_SERVICE_ROLE_KEY 格式不正確
            set "all_ok=0"
        )
    )
)

echo ----------------------------------------
echo.

if !all_ok!==1 (
    echo ✅ 所有設定值都正確！
    echo.
    echo ========================================
    echo 下一步操作：
    echo ========================================
    echo.
    echo [1] 在 Vercel Dashboard 設定相同的環境變數
    echo     - 進入 Vercel Dashboard → 您的專案
    echo     - Settings → Environment Variables
    echo     - 添加以下 4 個變數（選擇所有環境）：
    echo       * DATABASE_TYPE = supabase
    echo       * NEXT_PUBLIC_SUPABASE_URL = https://ceazouzwbvcfwudcbbnk.supabase.co
    echo       * NEXT_PUBLIC_SUPABASE_ANON_KEY = （從 .env.local 複製）
    echo       * SUPABASE_SERVICE_ROLE_KEY = （從 .env.local 複製）
    echo.
    echo [2] 在 Supabase Dashboard 執行 SQL 腳本
    echo     - 登入 https://app.supabase.com
    echo     - 選擇您的專案
    echo     - SQL Editor → New Query
    echo     - 使用「互動式設定Supabase.bat」選項 [4] 複製 SQL 腳本
    echo     - 貼上並執行
    echo.
    echo [3] 重新部署 Vercel
    echo     - 在 Vercel Dashboard → Deployments
    echo     - 點擊最新部署的「⋯」→ Redeploy
    echo.
    echo [4] 測試連線
    echo     - 部署完成後訪問：https://您的網址.vercel.app/api/debug/check-env
    echo.
) else (
    echo ❌ 發現設定問題，請檢查並修正
)

echo ========================================
echo.

pause
exit /b 0

:get_length
set "str=%~1"
set "len=0"
:count
if defined str (
    set "str=%str:~1%"
    set /a len+=1
    goto count
)
exit /b

