@echo off
chcp 65001 >nul
title 從雲端更新專案到本地（公司/家裡通用）

echo ========================================
echo 從雲端更新專案到本地
echo ========================================
echo.
echo 此腳本會幫您：
echo 1. 檢查本地是否有未提交的修改
echo 2. 如果有修改，會自動暫存
echo 3. 從雲端拉取最新版本
echo 4. 嘗試恢復您的本地修改
echo.
echo ========================================
echo.

REM 切換到專案目錄（腳本所在目錄）
cd /d "%~dp0"

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

REM 檢查是否為 Git 倉庫
if not exist ".git" (
    echo ❌ 錯誤：目前目錄不是 Git 倉庫
    echo.
    echo 請確認您在專案目錄中執行此腳本
    echo.
    pause
    exit /b 1
)

echo 目前目錄：%CD%
echo.

REM 檢查遠端倉庫
git remote -v
echo.

REM 檢查本地狀態
echo [步驟 1/4] 檢查本地狀態...
echo.
git status --short
echo.

REM 檢查是否有未提交的修改
git diff --quiet && git diff --cached --quiet
set HAS_CHANGES=%ERRORLEVEL%

if %HAS_CHANGES% NEQ 0 (
    echo ⚠️  發現本地有未提交的修改
    echo.
    echo 為了安全更新，將先暫存您的修改
    echo.
    set /p confirm="是否要繼續？（將暫存您的修改）(Y/N): "
    if /i not "%confirm%"=="Y" (
        echo 已取消操作
        pause
        exit /b 0
    )
    echo.
    echo [步驟 2/4] 暫存本地修改...
    git stash push -m "自動暫存：更新前保存本地修改 - %date% %time%"
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 本地修改已暫存
    ) else (
        echo ⚠️  暫存失敗，但將繼續嘗試更新
    )
    echo.
) else (
    echo ✅ 沒有未提交的修改，可以直接更新
    echo.
)

REM 從遠端拉取最新版本
echo [步驟 3/4] 從雲端拉取最新版本...
echo.
git fetch origin
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 錯誤：無法連接到遠端倉庫
    echo.
    echo 請檢查：
    echo 1. 網路連線
    echo 2. GitHub 認證設定
    echo.
    pause
    exit /b 1
)

REM 檢查是否有新版本
git log HEAD..origin/main --oneline >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 發現雲端有新版本，正在更新...
    echo.
    git pull origin main
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ 更新完成！專案已與雲端同步
        echo.
    ) else (
        echo.
        echo ❌ 更新失敗
        echo.
        echo 可能的原因：
        echo 1. 本地有未暫存的修改
        echo 2. 遠端有衝突的修改
        echo.
        pause
        exit /b 1
    )
) else (
    echo ✅ 您的專案已經是最新版本，無需更新
    echo.
)

REM 如果有暫存的修改，嘗試恢復
if %HAS_CHANGES% NEQ 0 (
    echo [步驟 4/4] 嘗試恢復您的本地修改...
    echo.
    git stash list | findstr /C:"自動暫存" >nul
    if %ERRORLEVEL% EQU 0 (
        git stash pop
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo ✅ 本地修改已恢復
            echo.
            echo ⚠️  請檢查是否有衝突需要解決
        ) else (
            echo.
            echo ⚠️  恢復修改時發生衝突
            echo.
            echo 請手動解決衝突：
            echo 1. 檢查衝突的檔案
            echo 2. 解決衝突後執行：git add .
            echo 3. 如果需要，執行：git stash drop
            echo.
        )
    )
)

echo.
echo ========================================
echo ✅ 同步完成！
echo ========================================
echo.
echo 📋 目前狀態：
git status --short
echo.
echo 📝 提示：
echo - 如果有衝突，請手動解決後再繼續工作
echo - 完成工作後，記得使用「推送最新版本_CMD.bat」推送到雲端
echo.
echo ========================================
echo.
pause


