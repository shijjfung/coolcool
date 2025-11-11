@echo off
chcp 65001 >nul
echo ========================================
echo 清理並重新啟動 Next.js 開發伺服器
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 停止現有的 Node.js 進程...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo [步驟 2] 刪除 .next 資料夾...
if exist .next (
    rmdir /s /q .next
    echo [完成] .next 資料夾已刪除
) else (
    echo [資訊] .next 資料夾不存在
)

echo [步驟 3] 檢查 Node.js 和 npm...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [錯誤] 找不到 Node.js，請先安裝 Node.js
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [錯誤] 找不到 npm，請先安裝 npm
    pause
    exit /b 1
)

echo [步驟 4] 啟動開發伺服器...
echo.
echo [提示] 按 Ctrl+C 可以停止伺服器
echo.

npm run dev

pause

