# 設定 Facebook Cookie 到 .env.local

$cookie = '[{"domain":".facebook.com","expirationDate":1797562272.628018,"hostOnly":false,"httpOnly":true,"name":"ps_l","path":"/","sameSite":"lax","secure":true,"session":false,"storeId":null,"value":"1"},{"domain":".facebook.com","expirationDate":1797471276.900405,"hostOnly":false,"httpOnly":true,"name":"datr","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":null,"value":"KuQTaeppzhrzHbvXiWjzoRcD"},{"domain":".facebook.com","expirationDate":1770995215.010163,"hostOnly":false,"httpOnly":true,"name":"fr","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":null,"value":"1b75sHZwbcsNm0Q8x.AWfFVOkP4WCi0EZGprFXSoaGeHGO-5sX7IzDLMeyoUeNG8LOL8A.BpGI-9..AAA.0.0.BpGJcP.AWdxf-PS73w5sJiG1i3zrCki1Zo"},{"domain":".facebook.com","expirationDate":1768341174,"hostOnly":false,"httpOnly":false,"name":"vpd","path":"/","sameSite":"lax","secure":true,"session":false,"storeId":null,"value":"v1%3B632x313x2.0000000298023224"},{"domain":".facebook.com","expirationDate":1794753341.740141,"hostOnly":false,"httpOnly":true,"name":"xs","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":null,"value":"2%3AC0gNgH5svHEjIA%3A2%3A1763003500%3A-1%3A-1%3A%3AAcxLPK1k7qusKzf9AuCZfpAVH03lWUMxJ3yClq6nU14"},{"domain":".facebook.com","expirationDate":1794693174,"hostOnly":false,"httpOnly":false,"name":"fbl_st","path":"/","sameSite":"strict","secure":true,"session":false,"storeId":null,"value":"101727739%3BT%3A29385952"},{"domain":".facebook.com","expirationDate":1763608300.611802,"hostOnly":false,"httpOnly":false,"name":"locale","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":null,"value":"zh_TW"},{"domain":".facebook.com","expirationDate":1794753341.740026,"hostOnly":false,"httpOnly":false,"name":"c_user","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":null,"value":"61583437452067"},{"domain":".facebook.com","hostOnly":false,"httpOnly":false,"name":"presence","path":"/","sameSite":null,"secure":true,"session":true,"storeId":null,"value":"C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1763219217704%2C%22v%22%3A1%7D"},{"domain":".facebook.com","expirationDate":1770932338.006079,"hostOnly":false,"httpOnly":true,"name":"b_user","path":"/","sameSite":"lax","secure":true,"session":false,"storeId":null,"value":"61583437452067"},{"domain":".facebook.com","expirationDate":1763824017,"hostOnly":false,"httpOnly":false,"name":"dpr","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":null,"value":"1.25"},{"domain":".facebook.com","expirationDate":1797717173.51079,"hostOnly":false,"httpOnly":true,"name":"pas","path":"/","sameSite":"lax","secure":true,"session":false,"storeId":null,"value":"61583437452067%3AWnHKksGjwU"},{"domain":".facebook.com","expirationDate":1797562272.628139,"hostOnly":false,"httpOnly":true,"name":"ps_n","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":null,"value":"1"},{"domain":".facebook.com","expirationDate":1797563500.611923,"hostOnly":false,"httpOnly":true,"name":"sb","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":null,"value":"KuQTaaDQwKpqZSgjfyBWk5vn"},{"domain":".facebook.com","expirationDate":1763824017,"hostOnly":false,"httpOnly":false,"name":"wd","path":"/","sameSite":"lax","secure":true,"session":false,"storeId":null,"value":"1034x724"},{"domain":".facebook.com","expirationDate":1770933173,"hostOnly":false,"httpOnly":false,"name":"wl_cbv","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":null,"value":"v2%3Bclient_version%3A2985%3Btimestamp%3A1763157174"}]'

$envFile = '.env.local'

# 讀取現有內容
$content = if (Test-Path $envFile) { 
    Get-Content $envFile -Raw 
} else { 
    '' 
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
$content += '# Facebook Cookie for Puppeteer' + [Environment]::NewLine
$content += "FACEBOOK_COOKIES=$cookie" + [Environment]::NewLine
$content += 'FACEBOOK_USE_PUPPETEER=true' + [Environment]::NewLine

# 寫入檔案
[System.IO.File]::WriteAllText($envFile, $content, [System.Text.Encoding]::UTF8)

Write-Host ''
Write-Host '[Success] Cookie saved to .env.local!' -ForegroundColor Green
Write-Host ''
Write-Host 'Configured:' -ForegroundColor Cyan
Write-Host '  - FACEBOOK_COOKIES' -ForegroundColor White
Write-Host '  - FACEBOOK_USE_PUPPETEER=true' -ForegroundColor White
Write-Host ''
Write-Host 'Next: Run "測試Puppeteer.bat" to test' -ForegroundColor Yellow
Write-Host ''
