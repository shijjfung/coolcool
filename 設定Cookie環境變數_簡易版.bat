@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo   Facebook Cookie Setup (Simple)
echo ========================================
echo.

REM 檢查 .env.local 檔案是否存在
if not exist ".env.local" (
    echo Creating .env.local file...
    echo. > .env.local
)

echo Step 1: Copy your Cookie JSON from Cookie-Editor
echo Step 2: Paste it here (one line, no line breaks)
echo.
echo Example:
echo [{"name":"c_user","value":"123456789","domain":".facebook.com"}]
echo.
echo.

REM 使用臨時檔案來讀取輸入（避免特殊字元問題）
set TEMP_FILE=%TEMP%\cookie_input_%RANDOM%.txt
echo Please paste your Cookie JSON below, then press Enter twice:
echo.

REM 讀取輸入到臨時檔案
type con > "%TEMP_FILE%"

REM 讀取第一行（Cookie JSON）
set /p COOKIE_JSON=<"%TEMP_FILE%"
del "%TEMP_FILE%" >nul 2>&1

if "%COOKIE_JSON%"=="" (
    echo.
    echo [Error] No input provided. Please try again.
    pause
    exit /b 1
)

echo.
echo Processing...

REM 使用 PowerShell 寫入檔案
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$cookie = '%COOKIE_JSON%'; ^
$envFile = '.env.local'; ^
$lines = if (Test-Path $envFile) { Get-Content $envFile -Raw } else { '' }; ^
$lines = $lines -replace '(?m)^FACEBOOK_COOKIES=.*$', ''; ^
$lines = $lines -replace '(?m)^FACEBOOK_USE_PUPPETEER=.*$', ''; ^
$lines = $lines.Trim(); ^
if ($lines -and -not $lines.EndsWith([Environment]::NewLine)) { $lines += [Environment]::NewLine }; ^
$lines += [Environment]::NewLine; ^
$lines += '# Facebook Cookie for Puppeteer' + [Environment]::NewLine; ^
$lines += \"FACEBOOK_COOKIES=$cookie\" + [Environment]::NewLine; ^
$lines += 'FACEBOOK_USE_PUPPETEER=true' + [Environment]::NewLine; ^
[System.IO.File]::WriteAllText($envFile, $lines, [System.Text.Encoding]::UTF8)"

if %errorlevel% equ 0 (
    echo.
    echo [Success] Cookie saved successfully!
    echo.
    echo Configured:
    echo - FACEBOOK_COOKIES
    echo - FACEBOOK_USE_PUPPETEER=true
    echo.
    echo Next: Run "測試Puppeteer.bat" to test
) else (
    echo.
    echo [Error] Failed to save. Please check the Cookie format.
)

echo.
pause

