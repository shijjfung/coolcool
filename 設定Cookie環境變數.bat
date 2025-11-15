@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo   Facebook Cookie Environment Setup
echo ========================================
echo.

REM 檢查 .env.local 檔案是否存在
if not exist ".env.local" (
    echo [Info] Creating .env.local file...
    echo. > .env.local
)

echo Please paste the Cookie JSON from Cookie-Editor:
echo.
echo IMPORTANT: Cookie JSON is usually ONE LONG LINE
echo Just paste it and press Enter
echo.
echo Example format:
echo [{"name":"c_user","value":"123456789","domain":".facebook.com",...}]
echo.
echo ========================================
echo Paste your Cookie JSON here:
echo ========================================
set /p COOKIE_JSON="> "

if "%COOKIE_JSON%"=="" (
    echo [Error] No Cookie input provided
    pause
    exit /b 1
)

echo.
echo [1/2] Checking Cookie format...

REM 簡單驗證 JSON 格式（檢查是否以 [ 開頭）
echo %COOKIE_JSON% | findstr /R "^\[" >nul
if %errorlevel% neq 0 (
    echo [Warning] Cookie format may be incorrect, but will continue...
)

echo [2/2] Writing to .env.local file...

REM 使用 PowerShell 來處理（更可靠，支援特殊字元）
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$cookie = '%COOKIE_JSON%'; ^
$envFile = '.env.local'; ^
$content = if (Test-Path $envFile) { Get-Content $envFile } else { @() }; ^
$content = $content | Where-Object { $_ -notmatch '^FACEBOOK_COOKIES=' -and $_ -notmatch '^FACEBOOK_USE_PUPPETEER=' }; ^
$content += ''; ^
$content += '# Facebook Cookie for Puppeteer'; ^
$content += \"FACEBOOK_COOKIES=$cookie\"; ^
if (($content | Select-String 'FACEBOOK_USE_PUPPETEER').Count -eq 0) { ^
    $content += 'FACEBOOK_USE_PUPPETEER=true'; ^
} ^
$content | Set-Content $envFile -Encoding UTF8"

if %errorlevel% neq 0 (
    echo [Error] Failed to write to .env.local
    pause
    exit /b 1
)

echo.
echo [Success] Cookie has been saved to .env.local file!
echo.
echo Configured environment variables:
echo - FACEBOOK_COOKIES
echo - FACEBOOK_USE_PUPPETEER=true
echo.
echo Next step: Run "測試Puppeteer.bat" to test if it works
echo.
pause

