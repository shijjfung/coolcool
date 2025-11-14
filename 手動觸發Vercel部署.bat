@echo off
chcp 65001 >nul
echo ========================================
echo   手動觸發 Vercel 部署
echo ========================================
echo.

:: 檢查是否在正確的目錄
if not exist ".git" (
    echo ❌ 錯誤：找不到 .git 目錄
    pause
    exit /b 1
)

echo [步驟 1] 確認最新提交...
echo.
git log --oneline -1
echo.

echo [步驟 2] 確認已推送到 GitHub...
echo.
git log origin/main --oneline -1
echo.

echo [步驟 3] 檢查 Vercel CLI...
echo.
where vercel >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 已安裝 Vercel CLI
    echo.
    set /p useCLI="是否要使用 Vercel CLI 部署？(Y/N): "
    if /i "%useCLI%"=="Y" (
        echo.
        echo 正在檢查登入狀態...
        vercel whoami
        if %errorlevel% neq 0 (
            echo.
            echo ⚠️  未登入 Vercel，正在登入...
            vercel login
        )
        echo.
        echo 正在部署到生產環境...
        vercel --prod
        if %errorlevel% equ 0 (
            echo.
            echo ✅ 部署成功！
        ) else (
            echo.
            echo ❌ 部署失敗，請檢查錯誤訊息
        )
    )
) else (
    echo ❌ 未安裝 Vercel CLI
    echo.
    echo 選項 1：使用 npx（不需要安裝）
    set /p useNpx="是否要使用 npx 部署？(Y/N): "
    if /i "%useNpx%"=="Y" (
        echo.
        echo 正在使用 npx 部署...
        npx vercel --prod
    ) else (
        echo.
        echo 選項 2：在 Vercel Dashboard 手動部署
        echo.
        echo 請按照以下步驟：
        echo 1. 前往 https://vercel.com/dashboard
        echo 2. 選擇專案 coolcool
        echo 3. 點擊 Deployments 標籤
        echo 4. 點擊右上角的 "Redeploy" 按鈕
        echo 5. 選擇最新的提交或輸入提交 hash
        echo 6. 點擊 "Redeploy"
        echo.
        set /p openVercel="是否要開啟 Vercel Dashboard？(Y/N): "
        if /i "%openVercel%"=="Y" (
            start "" "https://vercel.com/dashboard"
        )
    )
)

echo.
echo ========================================
echo   完成
echo ========================================
echo.
pause

