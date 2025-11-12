@echo off
chcp 65001 >nul
title 部署到 Vercel

REM 切換到專案目錄
cd /d "E:\下單庫存管理"

echo ========================================
echo 部署到 Vercel
echo ========================================
echo.
echo 目前目錄：%CD%
echo.

REM 檢查是否安裝 Git
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 錯誤：未找到 Git，請先安裝 Git
    echo.
    pause
    exit /b 1
)

echo [步驟 1/4] 檢查 Git 狀態...
echo.
git status
echo.
echo ========================================
echo.

set /p confirm="是否要提交並推送修改到 Git？(Y/N): "
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
if "%commit_msg%"=="" set commit_msg=更新 LINE Bot 功能：新增群組 ID 查詢

git commit -m "%commit_msg%"
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  警告：提交失敗或沒有需要提交的修改
    echo.
    set /p continue="是否繼續推送到遠端？(Y/N): "
    if /i not "%continue%"=="Y" (
        echo 已取消操作
        pause
        exit /b 0
    )
) else (
    echo ✅ 修改已提交
    echo.
)

echo [步驟 4/4] 推送到遠端...
git push
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 錯誤：推送失敗
    echo.
    echo 可能的原因：
    echo 1. 未設定遠端倉庫
    echo 2. 沒有推送權限
    echo 3. 網路連線問題
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
echo 2. 檢查部署狀態（通常會自動觸發部署）
echo 3. 等待部署完成（約 1-3 分鐘）
echo 4. 在 LINE 群組中測試「群組ID」指令
echo.
echo 或者，如果已安裝 Vercel CLI，可以執行：
echo   vercel --prod
echo.
pause

