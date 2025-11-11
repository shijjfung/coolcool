@echo off
chcp 65001 >nul
echo ========================================
echo 快速建立 .env.local 檔案
echo ========================================
echo.

cd /d "%~dp0"

if exist ".env.local" (
    echo ⚠️  .env.local 已存在
    set /p overwrite="是否要覆蓋？(Y/N): "
if /i not "%overwrite%"=="Y" (
    echo 已取消
    pause
    exit /b 0
)
    if /i not "%overwrite%"=="Y" (
        echo 已取消
        pause
        exit /b 0
    )
)

echo.
echo 請輸入您的 Supabase Project URL：
echo 格式：https://xxxxx.supabase.co
echo.
set /p supabase_url="請輸入 NEXT_PUBLIC_SUPABASE_URL: "

if "%supabase_url%"=="" (
    echo ❌ URL 不能為空
    pause
    exit /b 1
)

echo.
echo 正在建立 .env.local 檔案...
echo.

(
    echo DATABASE_TYPE=supabase
    echo NEXT_PUBLIC_SUPABASE_URL=%supabase_url%
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYXpvdXp3YnZjZnd1ZGNiYm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2OTU4NjYsImV4cCI6MjA3ODI3MTg2Nn0.0ayBcCJyPFtQbVBqF-nKvKQDmHoVshTpzszQSPVXEb0
    echo SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYXpvdXp3YnZjZnd1ZGNiYm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5NTg2NiwiZXhwIjoyMDc4MjcxODY2fQ.8faMxUMEjbNUaGTDgkxUr2Rl3BRZEwIxDHuvFSWjd_M
) > .env.local

echo ✅ 已成功建立 .env.local 檔案！
echo.
echo 檔案內容：
echo ----------------------------------------
echo DATABASE_TYPE=supabase
echo NEXT_PUBLIC_SUPABASE_URL=%supabase_url%
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...（已設定）
echo SUPABASE_SERVICE_ROLE_KEY=eyJ...（已設定）
echo ----------------------------------------
echo.
echo ⚠️  重要提醒：
echo    1. 這個檔案只適用於本地開發測試
echo    2. 您還需要在 Vercel Dashboard 設定相同的環境變數
echo    3. 請不要將 .env.local 提交到 Git
echo.
echo 下一步：
echo 1. 使用「互動式設定Supabase.bat」選擇 [6] 檢查格式
echo 2. 在 Vercel Dashboard 設定相同的環境變數
echo 3. 在 Supabase Dashboard 執行 SQL 腳本
echo.
pause

