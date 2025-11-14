@echo off
chcp 65001 >nul
echo ========================================
echo   使用 Vercel CLI 部署
echo ========================================
echo.

:: 檢查是否安裝了 Vercel CLI
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未檢測到 Vercel CLI
    echo.
    echo 📋 請先安裝 Vercel CLI：
    echo.
    echo    npm install -g vercel
    echo.
    echo 或者使用 npx（不需要安裝）：
    echo    npx vercel --prod
    echo.
    set /p useNpx="是否要使用 npx 部署？(Y/N): "
    if /i "%useNpx%"=="Y" (
        echo.
        echo [使用 npx 部署...]
        npx vercel --prod
    ) else (
        echo 請先安裝 Vercel CLI 後再執行此批次檔
    )
    pause
    exit /b 1
)

echo ✅ 已檢測到 Vercel CLI
echo.

echo [步驟 1] 檢查登入狀態...
vercel whoami
if %errorlevel% neq 0 (
    echo ⚠️  未登入 Vercel
    echo.
    echo 正在登入...
    vercel login
    if %errorlevel% neq 0 (
        echo ❌ 登入失敗
        pause
        exit /b 1
    )
)
echo.

echo [步驟 2] 部署到生產環境...
echo.
set /p confirm="確認要部署到生產環境？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 已取消部署
    pause
    exit /b 0
)

vercel --prod
if %errorlevel% equ 0 (
    echo.
    echo ✅ 部署成功！
) else (
    echo.
    echo ❌ 部署失敗，請檢查錯誤訊息
)
echo.
pause

