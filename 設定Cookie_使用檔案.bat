@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo   Facebook Cookie Setup (File Method)
echo ========================================
echo.
echo This method is easier if you have a Cookie JSON file.
echo.

REM 檢查 .env.local 檔案是否存在
if not exist ".env.local" (
    echo Creating .env.local file...
    echo. > .env.local
)

echo Method 1: Paste Cookie JSON directly
echo Method 2: Use a text file (recommended for long JSON)
echo.
set /p METHOD="Choose method (1 or 2): "

if "%METHOD%"=="2" (
    echo.
    echo Please save your Cookie JSON to a file named "cookie.txt"
    echo in the current directory, then press any key...
    pause >nul
    
    if not exist "cookie.txt" (
        echo [Error] cookie.txt not found!
        echo Please create cookie.txt with your Cookie JSON
        pause
        exit /b 1
    )
    
    REM 讀取檔案內容（使用 PowerShell 處理編碼）
    for /f "delims=" %%i in ('powershell -Command "Get-Content cookie.txt -Raw -Encoding UTF8"') do set COOKIE_JSON=%%i
    
    echo.
    echo Cookie loaded from cookie.txt
) else (
    echo.
    echo Please paste your Cookie JSON (one line):
    set /p COOKIE_JSON="> "
)

if "%COOKIE_JSON%"=="" (
    echo [Error] No Cookie provided
    pause
    exit /b 1
)

echo.
echo Saving to .env.local...

REM 使用 PowerShell 寫入
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$cookie = '%COOKIE_JSON%'; ^
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
    echo [Success] Cookie saved successfully!
    echo.
    if exist "cookie.txt" (
        echo Deleting cookie.txt for security...
        del cookie.txt >nul 2>&1
    )
) else (
    echo.
    echo [Error] Failed to save
)

echo.
pause

