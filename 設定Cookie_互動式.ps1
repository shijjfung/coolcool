# Facebook Cookie 設定工具 (PowerShell 版本)
# 使用方式：在 PowerShell 中執行 .\設定Cookie_互動式.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Facebook Cookie Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 檢查 .env.local 檔案
$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "[Info] Creating .env.local file..." -ForegroundColor Yellow
    New-Item -Path $envFile -ItemType File | Out-Null
}

Write-Host "Please paste your Cookie JSON from Cookie-Editor:" -ForegroundColor Green
Write-Host "Example: [{\"name\":\"c_user\",\"value\":\"123456789\",\"domain\":\".facebook.com\",...}]" -ForegroundColor Gray
Write-Host ""

# 讀取輸入（支援多行）
Write-Host "Paste your Cookie JSON below (press Enter twice when done):" -ForegroundColor Yellow
Write-Host ""

$cookieLines = @()
$lineCount = 0

while ($true) {
    $line = Read-Host
    if ([string]::IsNullOrWhiteSpace($line) -and $lineCount -gt 0) {
        break
    }
    if (-not [string]::IsNullOrWhiteSpace($line)) {
        $cookieLines += $line
        $lineCount++
    }
}

$cookieJson = $cookieLines -join ""

if ([string]::IsNullOrWhiteSpace($cookieJson)) {
    Write-Host ""
    Write-Host "[Error] No Cookie provided!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# 驗證格式
if (-not $cookieJson.TrimStart().StartsWith("[")) {
    Write-Host ""
    Write-Host "[Warning] Cookie format may be incorrect (should start with [)" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (Y/N)"
    if ($continue -ne "Y" -and $continue -ne "y") {
        exit 0
    }
}

Write-Host ""
Write-Host "[1/2] Processing Cookie..." -ForegroundColor Cyan

# 讀取現有內容
$content = if (Test-Path $envFile) { 
    Get-Content $envFile -Raw 
} else { 
    "" 
}

# 移除舊的設定
$content = $content -replace '(?m)^FACEBOOK_COOKIES=.*$', ''
$content = $content -replace '(?m)^FACEBOOK_USE_PUPPETEER=.*$', ''
$content = $content.Trim()

# 添加新設定
if ($content -and -not $content.EndsWith([Environment]::NewLine)) {
    $content += [Environment]::NewLine
}

$content += [Environment]::NewLine
$content += "# Facebook Cookie for Puppeteer" + [Environment]::NewLine
$content += "FACEBOOK_COOKIES=$cookieJson" + [Environment]::NewLine
$content += "FACEBOOK_USE_PUPPETEER=true" + [Environment]::NewLine

Write-Host "[2/2] Writing to .env.local..." -ForegroundColor Cyan

# 寫入檔案
try {
    [System.IO.File]::WriteAllText($envFile, $content, [System.Text.Encoding]::UTF8)
    Write-Host ""
    Write-Host "[Success] Cookie saved successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Configured environment variables:" -ForegroundColor Cyan
    Write-Host "  - FACEBOOK_COOKIES" -ForegroundColor White
    Write-Host "  - FACEBOOK_USE_PUPPETEER=true" -ForegroundColor White
    Write-Host ""
    Write-Host "Next step: Run '測試Puppeteer.bat' to test" -ForegroundColor Yellow
} catch {
    Write-Host ""
    Write-Host "[Error] Failed to save: $_" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"

