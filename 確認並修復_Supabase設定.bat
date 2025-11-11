@echo off
chcp 65001 >nul
echo ========================================
echo 確認並修復 Supabase 設定
echo ========================================
echo.

REM 切換到專案目錄
cd /d "E:\下單庫存管理"

echo 目前目錄：%CD%
echo.

echo [檢查] .env.local 檔案內容...
echo.
type .env.local
echo.

echo.
echo ========================================
echo 分析結果
echo ========================================
echo.

REM 使用 PowerShell 讀取檔案（支援 Unicode）
powershell -Command "Get-Content .env.local -Encoding UTF8 | Select-String 'DATABASE_TYPE=supabase'" >nul 2>&1
if errorlevel 1 (
    echo [問題] DATABASE_TYPE 未設定為 supabase
    echo [狀態] 目前使用：SQLite（本地資料庫）
) else (
    echo [✓] DATABASE_TYPE=supabase 已設定
    echo [狀態] 系統應該使用 Supabase（雲端資料庫）
    echo.
    
    powershell -Command "Get-Content .env.local -Encoding UTF8 | Select-String 'SUPABASE_SERVICE_ROLE_KEY'" >nul 2>&1
    if errorlevel 1 (
        echo [⚠] 警告：缺少 SUPABASE_SERVICE_ROLE_KEY
        echo [說明] 這可能導致 Supabase 無法正常工作
        echo [建議] 需要添加 SERVICE_ROLE_KEY
        echo.
        echo [如何取得]：
        echo 1. 前往 https://supabase.com/dashboard
        echo 2. 選擇您的專案
        echo 3. 前往 Settings ^> API
        echo 4. 找到 service_role key（secret）
        echo 5. 複製並添加到 .env.local
        echo.
        echo [重要] 請立即添加 SERVICE_ROLE_KEY，否則 Supabase 無法正常運作
    ) else (
        echo [✓] SUPABASE_SERVICE_ROLE_KEY 已設定
    )
)

echo.
echo ========================================
echo 重要提醒
echo ========================================
echo.
echo 1. 如果 .env.local 中有 DATABASE_TYPE=supabase
echo    系統應該使用 Supabase（雲端資料庫）
echo.
echo 2. orders.db 檔案可能是舊的 SQLite 資料庫
echo    如果已切換到 Supabase，可以保留作為備份
echo    或刪除（如果確定不再使用 SQLite）
echo.
echo 3. 修改 .env.local 後，需要重新啟動伺服器
echo    設定才會生效
echo.
echo 4. 確認 Supabase 資料表已建立：
echo    - 前往 Supabase Dashboard
echo    - 檢查是否有 forms、orders、settings 三個資料表
echo    - 如果沒有，執行 supabase-schema.sql
echo.
pause

