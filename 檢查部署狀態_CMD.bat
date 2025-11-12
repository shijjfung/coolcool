@echo off
chcp 65001 >nul
title 檢查 Vercel 部署狀態

echo ========================================
echo 檢查 Vercel 部署狀態
echo ========================================
echo.
echo 正在檢查部署狀態...
echo.

REM 檢查環境變數
echo [檢查 1] 環境變數設定
echo.
echo 正在檢查：https://coolcool-ten.vercel.app/api/debug/check-env
echo.
curl -s https://coolcool-ten.vercel.app/api/debug/check-env | findstr /C:"LINE_CHANNEL_ACCESS_TOKEN"
if %ERRORLEVEL% EQU 0 (
    echo ✅ 環境變數檢查完成
) else (
    echo ⚠️  無法連接到 API，請確認：
    echo   1. Vercel 部署是否完成
    echo   2. 網址是否正確
)
echo.

REM 檢查 Webhook
echo [檢查 2] Webhook API 狀態
echo.
echo 正在檢查：https://coolcool-ten.vercel.app/api/webhook/line
echo.
curl -s https://coolcool-ten.vercel.app/api/webhook/line | findstr /C:"message"
if %ERRORLEVEL% EQU 0 (
    echo ✅ Webhook API 正常
) else (
    echo ⚠️  無法連接到 Webhook API
)
echo.

echo ========================================
echo 檢查完成
echo ========================================
echo.
echo 💡 提示：
echo - 如果環境變數未設定，請前往 Vercel Dashboard 設定
echo - 如果部署失敗，請查看 Vercel Dashboard 的部署日誌
echo - 部署完成後，在 LINE 群組中測試「群組ID」指令
echo.
pause

