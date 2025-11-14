@echo off
chcp 65001 >nul
echo ========================================
echo   檢查 GitHub 和 Vercel 連接狀態
echo ========================================
echo.

:: 檢查是否在正確的目錄
if not exist ".git" (
    echo ❌ 錯誤：找不到 .git 目錄
    echo 請確認您在專案根目錄執行此批次檔
    pause
    exit /b 1
)

echo [步驟 1] 檢查 Git 遠端倉庫連接...
echo.
git remote -v
if %errorlevel% neq 0 (
    echo ❌ Git 遠端倉庫未設定
    echo 請執行：git remote add origin https://github.com/shijjfung/coolcool.git
    pause
    exit /b 1
)
echo.

echo [步驟 2] 檢查本地與遠端的同步狀態...
echo.
git fetch origin
if %errorlevel% neq 0 (
    echo ⚠️  無法連接到 GitHub，請檢查網路或權限
) else (
    echo ✅ 已成功連接到 GitHub
)
echo.

echo [步驟 3] 檢查本地提交狀態...
echo.
git log --oneline -5
echo.

echo [步驟 4] 檢查遠端提交狀態...
echo.
git log origin/main --oneline -5
echo.

echo [步驟 5] 檢查是否有未推送的提交...
echo.
git log origin/main..HEAD --oneline
if %errorlevel% equ 0 (
    echo ✅ 沒有未推送的提交
) else (
    echo 📤 發現未推送的提交
    set /p pushNow="是否要推送到 GitHub？(Y/N): "
    if /i "%pushNow%"=="Y" (
        git push origin main
    )
)
echo.

echo [步驟 6] 檢查 GitHub 倉庫 URL...
echo.
for /f "delims=" %%i in ('git remote get-url origin 2^>nul') do set GITHUB_URL=%%i
if "%GITHUB_URL%"=="" (
    set GITHUB_URL=https://github.com/shijjfung/coolcool
) else (
    :: 轉換 SSH URL 為 HTTPS URL
    set GITHUB_URL=%GITHUB_URL:git@github.com:=https://github.com/%
    if "%GITHUB_URL:~-4%"==".git" set GITHUB_URL=%GITHUB_URL:~0,-4%
    set GITHUB_URL=%GITHUB_URL: =%
    if not "%GITHUB_URL:~-1%"=="/" set GITHUB_URL=%GITHUB_URL%/
)

echo ✅ GitHub 倉庫: %GITHUB_URL%
echo.

echo [步驟 7] 開啟相關頁面...
echo.
set /p openGitHub="是否要開啟 GitHub 倉庫頁面？(Y/N): "
if /i "%openGitHub%"=="Y" (
    start "" "%GITHUB_URL%"
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
echo 📋 重要檢查項目：
echo.
echo 1. GitHub 倉庫：
echo    - 確認倉庫存在：%GITHUB_URL%
echo    - 確認有最新的提交
echo    - 確認倉庫是公開或您有權限存取
echo.
echo 2. Vercel 連接：
echo    - 前往 Vercel Dashboard: https://vercel.com/dashboard
echo    - 選擇專案 ^> Settings ^> Git
echo    - 確認已連接到：%GITHUB_URL%
echo    - 確認 Production Branch 設定為 "main"
echo.
echo 3. 如果 Vercel 沒有連接到 GitHub：
echo    - 在 Vercel Dashboard 點擊 "Add New Project"
echo    - 選擇 "Import Git Repository"
echo    - 選擇您的 GitHub 倉庫
echo    - 完成設定
echo.
pause

