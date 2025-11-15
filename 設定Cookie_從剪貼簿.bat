@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo   Cookie Setup from Clipboard
echo ========================================
echo.
echo This will read Cookie JSON from your clipboard
echo and save it to .env.local
echo.
pause

REM 使用 PowerShell 讀取剪貼簿
for /f "delims=" %%i in ('powershell -NoProfile -Command "Get-Clipboard"') do set CLIPBOARD_CONTENT=%%i

if "%CLIPBOARD_CONTENT%"=="" (
    echo.
    echo [Error] Clipboard is empty or cannot be read
    echo.
    echo Please:
    echo 1. Copy your Cookie JSON from Cookie-Editor
    echo 2. Run this batch file again
    echo.
    pause
    exit /b 1
)

echo.
echo [Info] Cookie JSON found in clipboard
echo [Info] Processing...

REM 使用 PowerShell 處理和寫入
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$cookie = '%CLIPBOARD_CONTENT%'; ^
$cookie = $cookie -replace '\s+', ' '; ^
$cookie = $cookie.Trim(); ^
$cookie = $cookie -replace '\"expiration\s+Date\"', '\"expirationDate\"'; ^
$envFile = '.env.local'; ^
$content = if (Test-Path $envFile) { Get-Content $envFile -Raw } else { '' }; ^
$content = $content -replace '(?m)^FACEBOOK_COOKIES=.*$', ''; ^
$content = $content -replace '(?m)^FACEBOOK_USE_PUPPETEER=.*$', ''; ^
$content = $content.Trim(); ^
if ($content -and -not $content.EndsWith([Environment]::NewLine)) { $content += [Environment]::NewLine }; ^
$content += [Environment]::NewLine; ^
$content += '# Facebook Cookie for Puppeteer' + [Environment]::NewLine; ^
$content += \"FACEBOOK_COOKIES=$cookie\" + [Environment]::NewLine; ^
$content += 'FACEBOOK_USE_PUPPETEER=true' + [Environment]::NewLine; ^
[System.IO.File]::WriteAllText($envFile, $content, [System.Text.Encoding]::UTF8); ^
Write-Host '[Success] Cookie saved to .env.local!' -ForegroundColor Green; ^
Write-Host ''; ^
Write-Host 'Configured:' -ForegroundColor Cyan; ^
Write-Host '  - FACEBOOK_COOKIES' -ForegroundColor White; ^
Write-Host '  - FACEBOOK_USE_PUPPETEER=true' -ForegroundColor White"

if %errorlevel% equ 0 (
    echo.
    echo Next: Run "測試Puppeteer.bat" to test
) else (
    echo.
    echo [Error] Failed to save
)

echo.
pause

