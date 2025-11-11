@echo off
chcp 65001 >nul
echo ========================================
echo 自動讀取並顯示環境變數
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查 .env.local 檔案...
echo.

if not exist ".env.local" (
    echo ❌ 未找到 .env.local 檔案
    echo.
    echo 請確認：
    echo 1. 您在正確的專案資料夾中
    echo 2. .env.local 檔案存在
    echo.
    echo 如果沒有 .env.local，請：
    echo 1. 前往 Supabase Dashboard
    echo 2. 取得 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY
    echo.
    pause
    exit /b 1
)

echo ✅ 找到 .env.local 檔案
echo.
echo ========================================
echo 您的環境變數值（請複製到 Vercel）
echo ========================================
echo.

echo [變數 1] DATABASE_TYPE
echo ───────────────────────────────────────
echo 值：supabase
echo.
echo [變數 2] SUPABASE_URL
echo ───────────────────────────────────────
for /f "tokens=2 delims==" %%a in ('findstr /C:"SUPABASE_URL" .env.local') do (
    set "SUPABASE_URL=%%a"
    echo 值：%%a
)
echo.

echo [變數 3] SUPABASE_SERVICE_ROLE_KEY
echo ───────────────────────────────────────
for /f "tokens=2 delims==" %%a in ('findstr /C:"SUPABASE_SERVICE_ROLE_KEY" .env.local') do (
    set "SERVICE_KEY=%%a"
    echo 值：%%a
    echo.
    echo ⚠️  注意：這個 key 很長，請完整複製
)
echo.

echo ========================================
echo 下一步：在 Vercel 中設定
echo ========================================
echo.
echo 請按照以下步驟操作：
echo.
echo 1. 打開瀏覽器，前往：
echo    https://vercel.com/dashboard
echo.
echo 2. 找到您的專案（coolcool-ten）
echo.
echo 3. 點擊專案 → Settings → Environment Variables
echo.
echo 4. 點擊 "Add New" 按鈕，新增以下三個變數：
echo.
echo    ┌─────────────────────────────────────┐
echo    │ Key: DATABASE_TYPE                  │
echo    │ Value: supabase                     │
echo    │ Environments: ✅ Production, Preview │
echo    └─────────────────────────────────────┘
echo.
echo    ┌─────────────────────────────────────┐
echo    │ Key: SUPABASE_URL                   │
echo    │ Value: （從上方複製）                │
echo    │ Environments: ✅ Production, Preview │
echo    └─────────────────────────────────────┘
echo.
echo    ┌─────────────────────────────────────┐
echo    │ Key: SUPABASE_SERVICE_ROLE_KEY      │
echo    │ Value: （從上方複製，完整複製！）    │
echo    │ Environments: ✅ Production, Preview │
echo    └─────────────────────────────────────┘
echo.
echo 5. 每個變數設定後，點擊 "Save"
echo.
echo 6. 設定完成後，Vercel 會自動重新部署
echo.
echo 7. 等待 1-3 分鐘，確認部署狀態為 "Ready"
echo.
echo ========================================
echo 詳細指南
echo ========================================
echo.
echo 已為您準備完整的設定指南：
echo 📄 Vercel環境變數設定完整指南.md
echo.
echo 請打開這個檔案查看詳細步驟和截圖說明。
echo.
echo ========================================
echo.

pause

