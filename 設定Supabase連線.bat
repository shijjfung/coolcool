@echo off
chcp 65001 >nul
echo ========================================
echo Supabase 連線設定助手
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查必要檔案...
if exist "supabase-complete-schema.sql" (
    echo ✅ supabase-complete-schema.sql 存在
) else (
    echo ❌ 找不到 supabase-complete-schema.sql
    pause
    exit /b 1
)

if exist "lib\supabase.ts" (
    echo ✅ lib\supabase.ts 存在
) else (
    echo ❌ 找不到 lib\supabase.ts
    pause
    exit /b 1
)

echo.
echo [步驟 2] 檢查本地環境變數檔案...
if exist ".env.local" (
    echo ✅ .env.local 存在
    echo.
    echo 檢查 .env.local 內容：
    echo ----------------------------------------
    findstr /C:"DATABASE_TYPE" .env.local 2>nul || echo ⚠️ 未找到 DATABASE_TYPE
    findstr /C:"NEXT_PUBLIC_SUPABASE_URL" .env.local 2>nul || echo ⚠️ 未找到 NEXT_PUBLIC_SUPABASE_URL
    findstr /C:"NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local 2>nul || echo ⚠️ 未找到 NEXT_PUBLIC_SUPABASE_ANON_KEY
    findstr /C:"SUPABASE_SERVICE_ROLE_KEY" .env.local 2>nul || echo ⚠️ 未找到 SUPABASE_SERVICE_ROLE_KEY
    echo ----------------------------------------
) else (
    echo ⚠️ .env.local 不存在
    echo.
    echo 是否要建立 .env.local 範本檔案？(Y/N)
    set /p create_env="請輸入: "
    if /i "%create_env%"=="Y" (
        (
            echo DATABASE_TYPE=supabase
            echo NEXT_PUBLIC_SUPABASE_URL=您的_Supabase_URL
            echo NEXT_PUBLIC_SUPABASE_ANON_KEY=您的_anon_key
            echo SUPABASE_SERVICE_ROLE_KEY=您的_service_role_key
        ) > .env.local
        echo ✅ 已建立 .env.local 範本
        echo 請編輯 .env.local 填入正確的值
    )
)

echo.
echo ========================================
echo 📋 接下來需要手動完成的步驟：
echo ========================================
echo.
echo [步驟 A] 在 Vercel 設定環境變數
echo   1. 登入 https://vercel.com
echo   2. 進入您的專案
echo   3. Settings → Environment Variables
echo   4. 添加以下變數（選擇所有環境）：
echo      - DATABASE_TYPE = supabase
echo      - NEXT_PUBLIC_SUPABASE_URL = 從 Supabase Dashboard 取得
echo      - NEXT_PUBLIC_SUPABASE_ANON_KEY = 從 Supabase Dashboard 取得
echo      - SUPABASE_SERVICE_ROLE_KEY = 從 Supabase Dashboard 取得
echo.
echo [步驟 B] 在 Supabase 建立資料庫結構
echo   1. 登入 https://app.supabase.com
echo   2. 選擇您的專案
echo   3. 點擊左側「SQL Editor」
echo   4. 點擊「New Query」
echo   5. 複製 supabase-complete-schema.sql 的全部內容
echo   6. 貼上並執行（Run 或 Ctrl+Enter）
echo.
echo [步驟 C] 重新部署 Vercel
echo   1. 在 Vercel Dashboard → Deployments
echo   2. 點擊最新部署的「⋯」→ Redeploy
echo.
echo ========================================
echo 🔍 測試連線
echo ========================================
echo.
echo 部署完成後，訪問以下網址檢查環境變數：
echo https://您的網址.vercel.app/api/debug/check-env
echo.
echo ========================================
echo.

pause

