@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo   Facebook Cookie 自動刷新
echo ========================================
echo.

REM 檢查 Node.js 是否安裝
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [錯誤] 未找到 Node.js，請先安裝 Node.js
    pause
    exit /b 1
)

REM 檢查 .env.local 是否存在
if not exist ".env.local" (
    echo [錯誤] 找不到 .env.local 檔案
    echo 請先設定環境變數
    pause
    exit /b 1
)

echo [1/3] 檢查環境變數設定...
findstr /C:"FACEBOOK_EMAIL" .env.local >nul
if %errorlevel% neq 0 (
    echo [警告] 未找到 FACEBOOK_EMAIL
    echo 請在 .env.local 中設定：
    echo   FACEBOOK_EMAIL=your-email@example.com
    echo   FACEBOOK_PASSWORD=your-password
    echo.
    pause
    exit /b 1
)

findstr /C:"FACEBOOK_PASSWORD" .env.local >nul
if %errorlevel% neq 0 (
    echo [警告] 未找到 FACEBOOK_PASSWORD
    echo 請在 .env.local 中設定：
    echo   FACEBOOK_EMAIL=your-email@example.com
    echo   FACEBOOK_PASSWORD=your-password
    echo.
    pause
    exit /b 1
)

echo [2/3] 檢查開發伺服器是否運行...
netstat -an | findstr ":3000" >nul
if %errorlevel% neq 0 (
    echo [警告] 開發伺服器似乎未運行
    echo 請在另一個終端機執行：npm run dev
    echo.
    set /p CONTINUE="是否繼續測試？(Y/N): "
    if /i not "!CONTINUE!"=="Y" (
        exit /b 0
    )
)

echo [3/3] 發送自動刷新請求...
echo.

REM 讀取 CRON_SECRET（如果有的話）
for /f "tokens=1,* delims==" %%a in ('findstr /C:"CRON_SECRET" .env.local 2^>nul') do (
    set CRON_SECRET=%%b
)

REM 使用 curl 發送請求（如果有的話）
where curl >nul 2>&1
if %errorlevel% equ 0 (
    echo 使用 curl 發送請求...
    if "%CRON_SECRET%"=="" (
        curl -X POST http://localhost:3000/api/facebook/auto-refresh-cookie ^
            -H "Content-Type: application/json" ^
            -d "{}"
    ) else (
        curl -X POST http://localhost:3000/api/facebook/auto-refresh-cookie ^
            -H "Content-Type: application/json" ^
            -H "Authorization: Bearer %CRON_SECRET%" ^
            -d "{}"
    )
) else (
    REM 如果沒有 curl，使用 PowerShell
    echo 使用 PowerShell 發送請求...
    if "%CRON_SECRET%"=="" (
        powershell -Command "$body = '{}'; Invoke-RestMethod -Uri 'http://localhost:3000/api/facebook/auto-refresh-cookie' -Method Post -Body $body -ContentType 'application/json'"
    ) else (
        powershell -Command "$headers = @{'Authorization'='Bearer %CRON_SECRET%'}; $body = '{}'; Invoke-RestMethod -Uri 'http://localhost:3000/api/facebook/auto-refresh-cookie' -Method Post -Body $body -ContentType 'application/json' -Headers $headers"
    )
)

echo.
echo ========================================
echo 完成！
echo ========================================
echo.
echo 請檢查上面的輸出結果：
echo - 如果看到「Cookie 已成功更新」，表示刷新成功
echo - 如果看到「Cookie 仍然有效」，表示無需更新
echo - 如果看到錯誤訊息，請檢查：
echo   1. 帳號密碼是否正確
echo   2. 開發伺服器是否運行
echo   3. 是否需要處理驗證碼
echo.
echo 注意：更新 Cookie 後，請重新啟動開發伺服器
echo.
pause

