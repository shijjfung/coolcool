@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo   Cookie Format Converter
echo ========================================
echo.
echo This will convert your Cookie list to JSON format
echo.
echo Step 1: Copy all your Cookies (the list you just pasted)
echo Step 2: Paste them below
echo Step 3: Press Enter twice when done
echo.
echo ========================================
echo Paste your Cookie list here:
echo ========================================
echo.

REM 讀取多行輸入
setlocal enabledelayedexpansion
set INPUT_TEXT=
set LINE_COUNT=0

:read_loop
set /p INPUT_LINE="> "
if "!INPUT_LINE!"=="" (
    set /a LINE_COUNT+=1
    if !LINE_COUNT! geq 2 goto end_read
    goto read_loop
)
set LINE_COUNT=0
if "!INPUT_TEXT!"=="" (
    set "INPUT_TEXT=!INPUT_LINE!"
) else (
    set "INPUT_TEXT=!INPUT_TEXT!|!INPUT_LINE!"
)
goto read_loop

:end_read
endlocal & set INPUT_TEXT=%INPUT_TEXT%

if "%INPUT_TEXT%"=="" (
    echo [Error] No input provided
    pause
    exit /b 1
)

echo.
echo [Info] Processing Cookie list...
echo.

REM 使用 PowerShell 轉換格式
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$input = '%INPUT_TEXT%'; ^
$input = $input -replace '\|', \"`n\"; ^
$cookies = @(); ^
$currentCookie = @{}; ^
$lines = $input -split \"`n\"; ^
foreach ($line in $lines) { ^
    $line = $line.Trim(); ^
    if ($line -match '^Name\s+(.+)$') { ^
        if ($currentCookie.Count -gt 0) { $cookies += $currentCookie }; ^
        $currentCookie = @{ name = $matches[1].Trim() }; ^
    } elseif ($line -match '^Value\s+(.+)$') { ^
        $currentCookie['value'] = $matches[1].Trim(); ^
    } elseif ($line -match '^Domain\s+(.+)$') { ^
        $currentCookie['domain'] = $matches[1].Trim(); ^
    } elseif ($line -match '^Path\s+(.+)$') { ^
        $currentCookie['path'] = $matches[1].Trim(); ^
    } elseif ($line -match '^Expiration\s+(.+)$') { ^
        try { ^
            $expDate = [DateTime]::Parse($matches[1].Trim()); ^
            $currentCookie['expirationDate'] = [Math]::Floor((New-TimeSpan -Start (Get-Date) -End $expDate).TotalSeconds + (Get-Date -UFormat %%s)); ^
        } catch {} ^
    } elseif ($line -match '^Same Site\s+(.+)$') { ^
        $sameSite = $matches[1].Trim(); ^
        if ($sameSite -eq 'Lax') { $currentCookie['sameSite'] = 'lax' } ^
        elseif ($sameSite -eq 'Strict') { $currentCookie['sameSite'] = 'strict' } ^
        else { $currentCookie['sameSite'] = 'no_restriction' } ^
    } elseif ($line -match '^Secure') { ^
        $currentCookie['secure'] = $true; ^
    } elseif ($line -match '^Http Only') { ^
        $currentCookie['httpOnly'] = $true; ^
    } elseif ($line -match '^Session') { ^
        $currentCookie['session'] = $true; ^
    } ^
} ^
if ($currentCookie.Count -gt 0) { $cookies += $currentCookie }; ^
$json = $cookies | ConvertTo-Json -Depth 10; ^
$envFile = '.env.local'; ^
$content = if (Test-Path $envFile) { Get-Content $envFile -Raw } else { '' }; ^
$content = $content -replace '(?m)^FACEBOOK_COOKIES=.*$', ''; ^
$content = $content -replace '(?m)^FACEBOOK_USE_PUPPETEER=.*$', ''; ^
$content = $content.Trim(); ^
if ($content -and -not $content.EndsWith([Environment]::NewLine)) { $content += [Environment]::NewLine }; ^
$content += [Environment]::NewLine; ^
$content += '# Facebook Cookie for Puppeteer' + [Environment]::NewLine; ^
$content += \"FACEBOOK_COOKIES=$json\" + [Environment]::NewLine; ^
$content += 'FACEBOOK_USE_PUPPETEER=true' + [Environment]::NewLine; ^
[System.IO.File]::WriteAllText($envFile, $content, [System.Text.Encoding]::UTF8); ^
Write-Host ''; ^
Write-Host '[Success] Cookies converted and saved to .env.local!' -ForegroundColor Green; ^
Write-Host ''; ^
Write-Host 'Converted JSON:' -ForegroundColor Cyan; ^
Write-Host $json -ForegroundColor White"

if %errorlevel% equ 0 (
    echo.
    echo Next: Run "測試Puppeteer.bat" to test
) else (
    echo.
    echo [Error] Conversion failed
)

echo.
pause

