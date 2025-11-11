@echo off
chcp 65001 >nul
echo ========================================
echo 快速測試 Supabase 是否正常運作
echo ========================================
echo.

REM 切換到專案目錄
cd /d "E:\下單庫存管理"

echo 目前目錄：%CD%
echo.

echo [步驟 1] 檢查 .env.local 設定...
powershell -Command "Get-Content .env.local -Encoding UTF8 | Select-String 'DATABASE_TYPE=supabase'" >nul 2>&1
if errorlevel 1 (
    echo [錯誤] DATABASE_TYPE 未設定為 supabase
    echo 請先設定 .env.local
    pause
    exit /b 1
) else (
    echo [✓] DATABASE_TYPE=supabase 已設定
)

powershell -Command "Get-Content .env.local -Encoding UTF8 | Select-String 'SUPABASE_SERVICE_ROLE_KEY'" >nul 2>&1
if errorlevel 1 (
    echo [錯誤] SUPABASE_SERVICE_ROLE_KEY 未設定
    echo 請先添加 SERVICE_ROLE_KEY 到 .env.local
    pause
    exit /b 1
) else (
    echo [✓] SUPABASE_SERVICE_ROLE_KEY 已設定
)

echo.
echo [步驟 2] 檢查 Supabase 相關檔案...
if exist lib\supabase.ts (
    echo [✓] lib\supabase.ts 存在
) else (
    echo [錯誤] lib\supabase.ts 不存在
)

if exist lib\db-supabase.ts (
    echo [✓] lib\db-supabase.ts 存在
) else (
    echo [錯誤] lib\db-supabase.ts 不存在
)

if exist supabase-schema.sql (
    echo [✓] supabase-schema.sql 存在
) else (
    echo [警告] supabase-schema.sql 不存在
)

echo.
echo ========================================
echo 設定檢查完成
echo ========================================
echo.
echo [下一步] 請執行以下測試：
echo.
echo 1. 確認 Supabase 資料表已建立
echo    - 前往 https://supabase.com/dashboard
echo    - 檢查 Table Editor 中是否有 forms、orders、settings
echo.
echo 2. 重新啟動伺服器
echo    - 停止目前的伺服器（Ctrl+C）
echo    - 執行：npm run dev
echo.
echo 3. 測試建立表單
echo    - 開啟 http://localhost:3000/admin
echo    - 建立一個測試表單
echo    - 檢查是否成功
echo.
echo 4. 確認資料已寫入 Supabase
echo    - 前往 Supabase Dashboard
echo    - 檢查 forms 資料表中是否有新資料
echo.
pause

