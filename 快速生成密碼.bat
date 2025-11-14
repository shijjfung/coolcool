@echo off
chcp 65001 >nul
echo ========================================
echo   生成 CRON_SECRET 隨機密碼
echo ========================================
echo.
echo 正在生成 32 字元隨機密碼...
echo.

powershell -NoProfile -Command "$chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; $random = -join ((1..32) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] }); Write-Host $random"

echo.
echo ========================================
echo   請複製上面的密碼
echo ========================================
echo.
echo 然後前往 Vercel Dashboard：
echo 1. Settings ^> Environment Variables
echo 2. Add New
echo 3. Key: CRON_SECRET
echo 4. Value: 貼上上面的密碼
echo 5. 選擇所有環境並 Save
echo.
pause

