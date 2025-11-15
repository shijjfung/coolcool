@echo off
chcp 65001 >nul
title Facebook 留言監控 - 開發伺服器

echo ========================================
echo   啟動 Next.js 開發伺服器
echo ========================================
echo.

REM 檢查 Node.js 是否安裝
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [錯誤] 未找到 Node.js，請先安裝 Node.js
    echo 下載網址：https://nodejs.org/
    pause
    exit /b 1
)

REM 檢查 node_modules 是否存在
if not exist "node_modules" (
    echo [提示] 未找到 node_modules，正在安裝依賴...
    call npm install
    echo.
)

echo 正在啟動開發伺服器...
echo 伺服器將在 http://localhost:3000 運行
echo.
echo 按 Ctrl+C 可以停止伺服器
echo.

call npm run dev

