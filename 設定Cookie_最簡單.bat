@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo   Facebook Cookie Setup (Easiest Way)
echo ========================================
echo.
echo Step 1: Copy Cookie JSON from Cookie-Editor
echo Step 2: Save it to a file named "cookie.txt" in this folder
echo Step 3: Press any key to continue...
pause >nul

if not exist "cookie.txt" (
    echo.
    echo [Error] cookie.txt not found!
    echo.
    echo Please:
    echo 1. Copy Cookie JSON from Cookie-Editor
    echo 2. Create a file named "cookie.txt" in this folder
    echo 3. Paste the Cookie JSON into cookie.txt
    echo 4. Save the file
    echo 5. Run this batch file again
    echo.
    pause
    exit /b 1
)

echo.
echo [Info] Found cookie.txt, reading...
echo.

REM 使用 PowerShell 讀取檔案（處理 UTF-8 編碼）
for /f "delims=" %%i in ('powershell -NoProfile -Command "Get-Content cookie.txt -Raw -Encoding UTF8"') do set COOKIE_JSON=%%i

if "%COOKIE_JSON%"=="" (
    echo [Error] cookie.txt is empty!
    pause
    exit /b 1
)

echo [Info] Cookie loaded successfully
echo [Info] Writing to .env.local...
echo.

REM 使用 PowerShell 寫入
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$cookie = '%COOKIE_JSON%'; ^
$cookie = $cookie.Trim(); ^
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
[System.IO.File]::WriteAllText($envFile, $content, [System.Text.Encoding]::UTF8)"

if %errorlevel% equ 0 (
    echo.
    echo [Success] Cookie saved to .env.local!
    echo.
    echo Deleting cookie.txt for security...
    del cookie.txt >nul 2>&1
    echo.
    echo Configured:
    echo   - FACEBOOK_COOKIES
    echo   - FACEBOOK_USE_PUPPETEER=true
    echo.
    echo Next: Run "測試Puppeteer.bat" to test
) else (
    echo.
    echo [Error] Failed to save
)

echo.
pause

