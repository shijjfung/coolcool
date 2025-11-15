@echo off
chcp 65001 >nul
echo ========================================
echo   Puppeteer Facebook 留言抓取測試
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
    echo 請先執行「設定Cookie環境變數.bat」來設定 Cookie
    pause
    exit /b 1
)

REM 檢查是否有 FACEBOOK_COOKIES
findstr /C:"FACEBOOK_COOKIES" .env.local >nul
if %errorlevel% neq 0 (
    echo [錯誤] .env.local 中找不到 FACEBOOK_COOKIES
    echo 請先執行「設定Cookie環境變數.bat」來設定 Cookie
    pause
    exit /b 1
)

echo [1/3] 載入環境變數...
REM 載入 .env.local 中的變數（簡單版本）
for /f "tokens=1,* delims==" %%a in ('findstr /C:"FACEBOOK_COOKIES" .env.local') do (
    set FACEBOOK_COOKIES=%%b
)

for /f "tokens=1,* delims==" %%a in ('findstr /C:"FACEBOOK_USE_PUPPETEER" .env.local') do (
    set FACEBOOK_USE_PUPPETEER=%%b
)

if "%FACEBOOK_USE_PUPPETEER%"=="" (
    set FACEBOOK_USE_PUPPETEER=true
)

echo [2/3] 檢查開發伺服器是否運行...
netstat -an | findstr ":3000" >nul
if %errorlevel% neq 0 (
    echo [警告] 開發伺服器似乎未運行
    echo 請在另一個終端機執行：npm run dev
    echo.
    set /p CONTINUE="是否繼續測試？(Y/N): "
    if /i not "%CONTINUE%"=="Y" (
        exit /b 0
    )
)

echo [3/3] 發送測試請求...
echo.

REM 讀取 CRON_SECRET（如果有的話）
for /f "tokens=1,* delims==" %%a in ('findstr /C:"CRON_SECRET" .env.local 2^>nul') do (
    set CRON_SECRET=%%b
)

if "%CRON_SECRET%"=="" (
    echo [提示] 未設定 CRON_SECRET，使用空字串
    set AUTH_HEADER=
) else (
    set AUTH_HEADER=Authorization: Bearer %CRON_SECRET%
)

REM 使用 curl 發送請求（如果有的話）
where curl >nul 2>&1
if %errorlevel% equ 0 (
    echo 使用 curl 發送請求...
    if "%AUTH_HEADER%"=="" (
        curl -X POST http://localhost:3000/api/facebook/scan-comments ^
            -H "Content-Type: application/json" ^
            -d "{\"usePuppeteer\": true}"
    ) else (
        curl -X POST http://localhost:3000/api/facebook/scan-comments ^
            -H "Content-Type: application/json" ^
            -H "%AUTH_HEADER%" ^
            -d "{\"usePuppeteer\": true}"
    )
) else (
    REM 如果沒有 curl，使用 PowerShell
    echo 使用 PowerShell 發送請求...
    if "%AUTH_HEADER%"=="" (
        powershell -Command "$body = @{usePuppeteer=$true} | ConvertTo-Json; Invoke-RestMethod -Uri 'http://localhost:3000/api/facebook/scan-comments' -Method Post -Body $body -ContentType 'application/json'"
    ) else (
        powershell -Command "$headers = @{'Authorization'='Bearer %CRON_SECRET%'}; $body = @{usePuppeteer=$true} | ConvertTo-Json; Invoke-RestMethod -Uri 'http://localhost:3000/api/facebook/scan-comments' -Method Post -Body $body -ContentType 'application/json' -Headers $headers"
    )
)

echo.
echo ========================================
echo 測試完成！
echo ========================================
echo.
echo 請檢查上面的輸出結果：
echo - 如果看到「成功抓取 X 筆留言」，表示設定成功
echo - 如果看到錯誤訊息，請檢查：
echo   1. Cookie 是否有效（可能已過期）
echo   2. 開發伺服器是否運行
echo   3. 是否有啟用自動監控的表單
echo.
pause

