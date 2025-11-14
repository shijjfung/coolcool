@echo off
chcp 65001 >nul
echo ========================================
echo   檢查 Vercel Webhook 設定
echo ========================================
echo.

echo 📋 此批次檔將協助您檢查和設定 Vercel Webhook
echo.

:: 檢查 Git 遠端倉庫
echo [步驟 1] 檢查 Git 遠端倉庫...
git remote -v
if %errorlevel% neq 0 (
    echo ❌ 無法取得遠端倉庫資訊
    pause
    exit /b 1
)
echo.

:: 取得 GitHub 倉庫 URL
for /f "delims=" %%i in ('git remote get-url origin 2^>nul') do set GITHUB_URL=%%i
if "%GITHUB_URL%"=="" (
    echo ❌ 無法取得 GitHub 倉庫 URL
    echo 嘗試從 git remote -v 取得...
    for /f "tokens=2" %%j in ('git remote -v ^| findstr "origin" ^| findstr "fetch"') do set GITHUB_URL=%%j
)

if "%GITHUB_URL%"=="" (
    echo ❌ 無法取得 GitHub 倉庫 URL
    echo 使用預設 URL: https://github.com/shijjfung/coolcool
    set GITHUB_URL=https://github.com/shijjfung/coolcool
) else (
    :: 轉換 SSH URL 為 HTTPS URL
    set GITHUB_URL=%GITHUB_URL:git@github.com:=https://github.com/%
    :: 移除 .git 後綴（如果存在）
    if "%GITHUB_URL:~-4%"==".git" set GITHUB_URL=%GITHUB_URL:~0,-4%
    :: 移除可能的空格
    set GITHUB_URL=%GITHUB_URL: =%
    :: 確保以 / 結尾
    if not "%GITHUB_URL:~-1%"=="/" set GITHUB_URL=%GITHUB_URL%/
)

echo ✅ GitHub 倉庫: %GITHUB_URL%
echo.

echo [步驟 2] 檢查 Webhook 設定指引...
echo.
echo ⚠️  注意：GitHub Webhook 無法通過批次檔自動設定
echo    需要手動在 GitHub 網站上設定
echo.
echo 📋 請按照以下步驟檢查和設定：
echo.
echo 1. 前往 GitHub Webhooks 設定頁面：
echo    %GITHUB_URL%settings/hooks
echo.
echo 2. 檢查是否有 Vercel 的 webhook：
echo    - 應該會看到一個 URL 包含 "vercel.com" 或 "vercel.app" 的 webhook
echo    - 狀態應該顯示為 "Active"（綠色勾號）
echo    - 最近交付（Recent Deliveries）應該有記錄
echo.
echo 3. 如果沒有看到 Vercel webhook：
echo    a) 前往 Vercel Dashboard: https://vercel.com/dashboard
echo    b) 選擇您的專案
echo    c) 進入 Settings ^> Git
echo    d) 點擊 "Disconnect" 然後重新連接 GitHub 倉庫
echo    e) 這會自動創建新的 webhook
echo.
echo 4. 如果 webhook 存在但狀態為 Inactive：
echo    - 點擊 webhook 進入詳細頁面
echo    - 檢查 "Recent Deliveries" 是否有錯誤
echo    - 如果有錯誤，點擊 "Redeliver" 重新發送
echo.

echo [步驟 3] 開啟相關頁面...
echo.
set /p openGitHub="是否要開啟 GitHub Webhooks 設定頁面？(Y/N): "
if /i "%openGitHub%"=="Y" (
    :: 構建正確的 Webhook URL
    set WEBHOOK_URL=%GITHUB_URL%settings/hooks
    echo 正在開啟: %WEBHOOK_URL%
    start "" "%WEBHOOK_URL%"
)

set /p openVercel="是否要開啟 Vercel Dashboard？(Y/N): "
if /i "%openVercel%"=="Y" (
    start "" "https://vercel.com/dashboard"
)

echo.
echo ========================================
echo   檢查完成
echo ========================================
echo.
echo 💡 提示：
echo    - 如果 webhook 設定正確，推送代碼後 Vercel 會自動部署
echo    - 如果沒有自動部署，請檢查 Vercel Dashboard 的 Deployments 頁面
echo    - 可以手動點擊 "Redeploy" 按鈕觸發部署
echo.
pause

