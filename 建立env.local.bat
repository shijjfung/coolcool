@echo off
chcp 65001 >nul
echo ========================================
echo 建立 .env.local 環境變數檔案
echo ========================================
echo.

cd /d "%~dp0"

if exist ".env.local" (
    echo ⚠️  .env.local 已存在
    echo.
    set /p overwrite="是否要覆蓋現有檔案？(Y/N): "
    if /i not "%overwrite%"=="Y" (
        echo 已取消
        pause
        exit /b 0
    )
)

echo.
echo 請輸入您的 Supabase 設定值：
echo.
echo [提示] 這些值可以在 Supabase Dashboard 取得：
echo   https://app.supabase.com → 選擇專案 → Settings → API
echo.

set /p supabase_url="請輸入 NEXT_PUBLIC_SUPABASE_URL (例如: https://xxxxx.supabase.co): "
set /p supabase_anon_key="請輸入 NEXT_PUBLIC_SUPABASE_ANON_KEY: "
set /p supabase_service_key="請輸入 SUPABASE_SERVICE_ROLE_KEY: "

echo.
echo 正在建立 .env.local 檔案...

(
    echo DATABASE_TYPE=supabase
    echo NEXT_PUBLIC_SUPABASE_URL=%supabase_url%
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=%supabase_anon_key%
    echo SUPABASE_SERVICE_ROLE_KEY=%supabase_service_key%
) > .env.local

echo.
echo ✅ 已建立 .env.local 檔案！
echo.
echo ⚠️  重要提醒：
echo    1. 這個檔案只適用於本地開發
echo    2. 您還需要在 Vercel Dashboard 設定相同的環境變數
echo    3. 請不要將 .env.local 提交到 Git（應該已在 .gitignore 中）
echo.
echo ========================================
echo.

pause

