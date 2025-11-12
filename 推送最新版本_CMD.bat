@echo off
chcp 65001 >nul
title 推送最新版本到 Git

REM 切換到專案目錄
cd /d "E:\下單庫存管理"

echo ========================================
echo 推送最新版本到 Git
echo ========================================
echo.
echo 目前目錄：%CD%
echo.
echo 此操作將會：
echo 1. 檢查 Git 狀態
echo 2. 加入所有修改的檔案
echo 3. 提交修改
echo 4. 推送到遠端（觸發 Vercel 自動部署）
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

REM 檢查是否為 Git 倉庫
if not exist ".git" (
    echo ❌ 錯誤：目前目錄不是 Git 倉庫
    echo.
    echo 請先初始化 Git 倉庫：
    echo   git init
    echo   git remote add origin 您的遠端倉庫網址
    echo.
    pause
    exit /b 1
)

echo [步驟 1/4] 檢查 Git 狀態...
echo.
git status --short
echo.

REM 檢查是否有修改
git diff --quiet && git diff --cached --quiet
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  沒有需要提交的修改
    echo.
    set /p continue="是否仍要推送到遠端？(Y/N): "
    if /i not "%continue%"=="Y" (
        echo 已取消操作
        pause
        exit /b 0
    )
    echo.
    echo [步驟 4/4] 推送到遠端...
    git push
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ 推送完成！
        echo.
        echo 📋 下一步：
        echo 1. 前往 Vercel Dashboard 查看部署狀態
        echo 2. 等待部署完成（約 1-3 分鐘）
        echo 3. 測試 LINE Bot 功能
    ) else (
        echo.
        echo ❌ 推送失敗
        echo.
        echo 可能的原因：
        echo 1. 未設定遠端倉庫
        echo 2. 沒有推送權限
        echo 3. 網路連線問題
    )
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================
echo.

set /p confirm="是否要提交並推送所有修改？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 已取消操作
    pause
    exit /b 0
)

echo.
echo [步驟 2/4] 加入所有修改的檔案...
git add .
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 錯誤：git add 失敗
    pause
    exit /b 1
)
echo ✅ 檔案已加入暫存區
echo.

echo [步驟 3/4] 提交修改...
set /p commit_msg="請輸入提交訊息（直接按 Enter 使用預設訊息）: "
if "%commit_msg%"=="" (
    set commit_msg=更新：新增 LINE Bot 群組 ID 保存和切換功能
)

git commit -m "%commit_msg%"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 錯誤：提交失敗
    pause
    exit /b 1
)
echo ✅ 修改已提交
echo.

echo [步驟 4/4] 推送到遠端...
git push
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 錯誤：推送失敗
    echo.
    echo 可能的原因：
    echo 1. 未設定遠端倉庫
    echo 2. 沒有推送權限
    echo 3. 網路連線問題
    echo 4. 遠端有新的提交需要先拉取
    echo.
    echo 如果遠端有新的提交，請先執行：
    echo   git pull
    echo   然後再次執行此批次檔
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 推送完成！
echo ========================================
echo.
echo 📋 下一步：
echo 1. 前往 Vercel Dashboard
echo    網址：https://vercel.com/dashboard
echo.
echo 2. 選擇您的專案
echo.
echo 3. 查看「Deployments」頁籤
echo    - 應該會看到新的部署正在進行
echo    - 等待部署完成（約 1-3 分鐘）
echo    - 狀態會從「Building」變為「Ready」
echo.
echo 4. 部署完成後，測試功能：
echo    - 訪問管理後台
echo    - 測試 LINE Bot 群組 ID 保存功能
echo    - 在 LINE 群組中測試「群組ID」指令
echo.
echo ========================================
echo.
pause

