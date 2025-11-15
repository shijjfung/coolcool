@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo   Quick Cookie Setup
echo ========================================
echo.
echo Your Cookie JSON has been copied!
echo.
echo Choose a method:
echo.
echo [1] Save Cookie to cookie.txt file (Recommended)
echo [2] Paste Cookie directly here
echo.
set /p CHOICE="Enter choice (1 or 2): "

if "%CHOICE%"=="1" (
    echo.
    echo Please paste your Cookie JSON into cookie.txt file
    echo Then run: 設定Cookie_最簡單.bat
    echo.
    echo Creating cookie.txt template...
    (
        echo Paste your Cookie JSON below:
        echo.
    ) > cookie.txt
    notepad cookie.txt
    echo.
    echo After saving cookie.txt, run: 設定Cookie_最簡單.bat
    pause
    exit /b 0
)

if "%CHOICE%"=="2" (
    echo.
    echo Paste your Cookie JSON (can be multiple lines):
    echo Press Enter twice when done
    echo.
    
    REM 讀取多行輸入
    setlocal enabledelayedexpansion
    set COOKIE_JSON=
    set LINE_COUNT=0
    
    :read_loop
    set /p INPUT_LINE="> "
    if "!INPUT_LINE!"=="" (
        set /a LINE_COUNT+=1
        if !LINE_COUNT! geq 2 goto end_read
        goto read_loop
    )
    set LINE_COUNT=0
    if "!COOKIE_JSON!"=="" (
        set "COOKIE_JSON=!INPUT_LINE!"
    ) else (
        set "COOKIE_JSON=!COOKIE_JSON! !INPUT_LINE!"
    )
    goto read_loop
    
    :end_read
    endlocal & set COOKIE_JSON=%COOKIE_JSON%
    
    if "%COOKIE_JSON%"=="" (
        echo [Error] No Cookie provided
        pause
        exit /b 1
    )
    
    echo.
    echo Processing...
    
    REM 使用 PowerShell 處理
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$cookie = '%COOKIE_JSON%'; ^
    $cookie = $cookie -replace '\s+', ' '; ^
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
    [System.IO.File]::WriteAllText($envFile, $content, [System.Text.Encoding]::UTF8); ^
    Write-Host '[Success] Cookie saved!' -ForegroundColor Green"
    
    if %errorlevel% equ 0 (
        echo.
        echo [Success] Cookie saved to .env.local!
        echo.
        echo Next: Run "測試Puppeteer.bat" to test
    )
    
    pause
    exit /b 0
)

echo [Error] Invalid choice
pause

