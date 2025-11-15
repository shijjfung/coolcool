@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo   Facebook Cookie Setup (Direct Paste)
echo ========================================
echo.
echo Step 1: Copy your Cookie JSON from Cookie-Editor
echo Step 2: Paste it below (can be multiple lines)
echo Step 3: Press Enter twice when done
echo.
echo ========================================
echo Paste your Cookie JSON here:
echo ========================================
echo.

REM 使用臨時檔案來讀取多行輸入
set TEMP_FILE=%TEMP%\cookie_%RANDOM%.txt
(
echo Please paste your Cookie JSON below, then press Enter twice:
echo.
type con
) > "%TEMP_FILE%"

REM 讀取檔案內容（跳過前兩行提示）
for /f "skip=2 delims=" %%i in ('type "%TEMP_FILE%"') do (
    set "LINE=%%i"
    setlocal enabledelayedexpansion
    if defined COOKIE_JSON (
        set "COOKIE_JSON=!COOKIE_JSON!!LINE!"
    ) else (
        set "COOKIE_JSON=!LINE!"
    )
    endlocal
)

REM 清理臨時檔案
del "%TEMP_FILE%" >nul 2>&1

REM 移除所有換行和空格（但保留 JSON 結構）
setlocal enabledelayedexpansion
set "COOKIE_JSON=!COOKIE_JSON: =!"
set "COOKIE_JSON=!COOKIE_JSON: =!"
endlocal & set COOKIE_JSON=%COOKIE_JSON%

if "%COOKIE_JSON%"=="" (
    echo.
    echo [Error] No Cookie provided
    pause
    exit /b 1
)

echo.
echo [Info] Cookie received, processing...
echo.

REM 使用 PowerShell 處理和寫入
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
Write-Host '[Success] Cookie saved to .env.local!' -ForegroundColor Green"

if %errorlevel% equ 0 (
    echo.
    echo [Success] Cookie has been saved!
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

