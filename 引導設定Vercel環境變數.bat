@echo off
chcp 65001 >nul
echo ========================================
echo 引導設定 Vercel 環境變數
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查本地環境變數檔案...
echo.

if exist ".env.local" (
    echo ✅ 找到 .env.local 檔案
    echo.
    echo 正在讀取環境變數...
    echo.
    
    echo ========================================
    echo 您的本地環境變數：
    echo ========================================
    echo.
    
    findstr /C:"DATABASE_TYPE" .env.local 2>nul
    findstr /C:"SUPABASE_URL" .env.local 2>nul
    findstr /C:"SUPABASE_SERVICE_ROLE_KEY" .env.local 2>nul | findstr /V "^$" >nul
    if %errorlevel% equ 0 (
        echo SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...（已隱藏，太長）
    ) else (
        echo ⚠️  未找到 SUPABASE_SERVICE_ROLE_KEY
    )
    
    echo.
    echo ========================================
    echo.
) else (
    echo ⚠️  未找到 .env.local 檔案
    echo.
    echo 請確認：
    echo 1. 您在正確的專案資料夾中
    echo 2. .env.local 檔案存在
    echo.
    echo 如果沒有 .env.local，請：
    echo 1. 前往 Supabase Dashboard
    echo 2. 取得 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY
    echo.
)

echo.
echo ========================================
echo 下一步操作
echo ========================================
echo.
echo 請按照以下步驟設定 Vercel 環境變數：
echo.
echo 1. 打開瀏覽器，前往：
echo    https://vercel.com/dashboard
echo.
echo 2. 找到您的專案（coolcool-ten）
echo.
echo 3. 點擊專案 → Settings → Environment Variables
echo.
echo 4. 新增以下三個環境變數：
echo.
echo    ┌─────────────────────────────────────┐
echo    │ Key: DATABASE_TYPE                  │
echo    │ Value: supabase                     │
echo    │ Environments: ✅ Production, Preview │
echo    └─────────────────────────────────────┘
echo.
echo    ┌─────────────────────────────────────┐
echo    │ Key: SUPABASE_URL                   │
echo    │ Value: （從上方複製，或從 .env.local）│
echo    │ Environments: ✅ Production, Preview │
echo    └─────────────────────────────────────┘
echo.
echo    ┌─────────────────────────────────────┐
echo    │ Key: SUPABASE_SERVICE_ROLE_KEY      │
echo    │ Value: （從上方複製，或從 .env.local）│
echo    │ Environments: ✅ Production, Preview │
echo    └─────────────────────────────────────┘
echo.
echo 5. 設定完成後，Vercel 會自動重新部署
echo.
echo 6. 等待 1-3 分鐘，確認部署狀態為 "Ready"
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

