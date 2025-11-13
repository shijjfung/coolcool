@echo off
chcp 65001 >nul
title 從雲端 Git 同步專案到本地

echo ========================================
echo 從雲端 Git 同步專案到本地
echo ========================================
echo.
echo 此腳本會幫您：
echo 1. 檢查是否已存在專案資料夾
echo 2. 如果不存在，則從雲端 Clone 整個專案
echo 3. 如果已存在，則更新到最新版本
echo.
echo ========================================
echo.

REM 檢查是否安裝 Git
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 錯誤：未找到 Git，請先安裝 Git
    echo.
    echo 下載 Git：https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

REM 設定專案名稱和路徑
set "PROJECT_NAME=下單庫存管理"
set "GIT_URL=https://github.com/shijjfung/coolcool.git"
set "PROJECT_PATH=%~dp0%PROJECT_NAME%"

echo 專案名稱：%PROJECT_NAME%
echo 遠端倉庫：%GIT_URL%
echo 本地路徑：%PROJECT_PATH%
echo.

REM 檢查是否在專案資料夾內執行
cd /d "%~dp0"
if exist ".git" (
    echo [發現] 您已在專案資料夾內
    echo 目前位置：%CD%
    echo.
    set "PROJECT_PATH=%CD%"
    goto :update_project
)

REM 檢查專案資料夾是否存在
if exist "%PROJECT_PATH%" (
    echo [發現] 專案資料夾已存在
    echo 專案位置：%PROJECT_PATH%
    echo.
    goto :update_project
)

REM 如果不存在，執行 Clone
goto :clone_project

:update_project
echo 將執行更新操作（git pull）...
echo.
set /p confirm="是否要更新到最新版本？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 已取消操作
    pause
    exit /b 0
)
echo.
echo [步驟 1/3] 切換到專案目錄...
cd /d "%PROJECT_PATH%"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 錯誤：無法切換到專案目錄
    pause
    exit /b 1
)
echo ✅ 已切換到：%CD%
echo.

echo [步驟 2/3] 檢查本地修改...
git diff --quiet && git diff --cached --quiet
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  發現本地有未提交的修改
    echo 將自動暫存您的修改，更新後再恢復
    echo.
    git stash push -m "自動暫存：同步前保存 - %date% %time%"
    set "HAS_STASH=1"
) else (
    set "HAS_STASH=0"
)
echo.

echo [步驟 3/3] 從雲端拉取最新版本...
git pull origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 更新完成！您的專案已與雲端同步
    echo.
    if "%HAS_STASH%"=="1" (
        echo [恢復] 正在恢復您的本地修改...
        git stash pop
        if %ERRORLEVEL% EQU 0 (
            echo ✅ 本地修改已恢復
            echo ⚠️  請檢查是否有衝突需要解決
        ) else (
            echo ⚠️  恢復時發生衝突，請手動解決
        )
        echo.
    )
    echo 📋 專案位置：%PROJECT_PATH%
) else (
    echo.
    echo ❌ 更新失敗
    echo.
    echo 可能的原因：
    echo 1. 網路連線問題
    echo 2. 認證問題（需要設定 GitHub 認證）
    echo 3. 本地有未暫存的修改
    echo.
    if "%HAS_STASH%"=="1" (
        echo 您的修改已暫存，可以使用以下命令恢復：
        echo   git stash pop
    )
)
goto :end

:clone_project
echo [未發現] 專案資料夾不存在
echo.
echo 將執行 Clone 操作（從雲端下載整個專案）...
echo.
echo ⚠️  注意：這會下載整個專案，可能需要一些時間
echo.
set /p confirm="是否要從雲端 Clone 專案？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 已取消操作
    pause
    exit /b 0
)
echo.
echo [步驟 1/2] 準備 Clone 目錄...
set "PARENT_DIR=%~dp0"
cd /d "%PARENT_DIR%"
echo ✅ 準備完成，將在以下位置 Clone：%PARENT_DIR%
echo.
echo [步驟 2/2] 從雲端 Clone 專案...
echo 這可能需要幾分鐘，請稍候...
echo.
git clone %GIT_URL% "%PROJECT_NAME%"
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Clone 完成！
    echo.
    echo 📋 專案位置：%PROJECT_PATH%
    echo.
    echo 📝 下一步：
    echo 1. 進入專案目錄：cd "%PROJECT_NAME%"
    echo 2. 安裝依賴：npm install
    echo 3. 設定環境變數（如果需要）
    echo 4. 開始開發！
) else (
    echo.
    echo ❌ Clone 失敗
    echo.
    echo 可能的原因：
    echo 1. 網路連線問題
    echo 2. 認證問題（需要設定 GitHub 認證）
    echo 3. 倉庫不存在或沒有權限
    echo.
    echo 如果遇到認證問題，請：
    echo 1. 使用 Personal Access Token
    echo 2. 或使用 SSH 金鑰認證
)
goto :end

:end
echo.
echo ========================================
echo.
pause

