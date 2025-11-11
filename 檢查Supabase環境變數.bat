@echo off
chcp 65001 >nul
echo ========================================
echo 檢查 Supabase 環境變數設定
echo ========================================
echo.

cd /d "%~dp0"

echo 檢查本地 .env.local 檔案...
echo.

if not exist ".env.local" (
    echo ❌ .env.local 不存在
    echo.
    echo 請先建立 .env.local 檔案並設定環境變數
    pause
    exit /b 1
)

echo [檢查結果]
echo ----------------------------------------

set "has_database_type=0"
set "has_url=0"
set "has_anon_key=0"
set "has_service_key=0"

findstr /C:"DATABASE_TYPE" .env.local >nul 2>&1
if %errorlevel%==0 (
    echo ✅ DATABASE_TYPE 已設定
    findstr /C:"DATABASE_TYPE" .env.local
    set "has_database_type=1"
) else (
    echo ❌ DATABASE_TYPE 未設定
)

findstr /C:"NEXT_PUBLIC_SUPABASE_URL" .env.local >nul 2>&1
if %errorlevel%==0 (
    echo ✅ NEXT_PUBLIC_SUPABASE_URL 已設定
    for /f "tokens=2 delims==" %%a in ('findstr /C:"NEXT_PUBLIC_SUPABASE_URL" .env.local') do (
        set "url_value=%%a"
        if "!url_value!"=="您的_Supabase_URL" (
            echo ⚠️  但值還是範本值，請更新為實際的 Supabase URL
        ) else (
            echo    值: !url_value:~0,30!...
        )
    )
    set "has_url=1"
) else (
    echo ❌ NEXT_PUBLIC_SUPABASE_URL 未設定
)

findstr /C:"NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local >nul 2>&1
if %errorlevel%==0 (
    echo ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY 已設定
    set "has_anon_key=1"
) else (
    echo ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 未設定
)

findstr /C:"SUPABASE_SERVICE_ROLE_KEY" .env.local >nul 2>&1
if %errorlevel%==0 (
    echo ✅ SUPABASE_SERVICE_ROLE_KEY 已設定
    set "has_service_key=1"
) else (
    echo ❌ SUPABASE_SERVICE_ROLE_KEY 未設定
)

echo ----------------------------------------
echo.

if %has_database_type%==1 if %has_url%==1 if %has_anon_key%==1 if %has_service_key%==1 (
    echo ✅ 所有必要的環境變數都已設定！
    echo.
    echo ⚠️  但請注意：
    echo    1. 這些是本地環境變數（.env.local）
    echo    2. 您還需要在 Vercel Dashboard 設定相同的環境變數
    echo    3. 確保 DATABASE_TYPE 的值是 "supabase"（不是 "sqlite"）
) else (
    echo ❌ 還有環境變數未設定
    echo.
    echo 請編輯 .env.local 檔案，填入所有必要的值
)

echo.
echo ========================================
echo.

pause

