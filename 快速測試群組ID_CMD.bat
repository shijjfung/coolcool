@echo off
chcp 65001 >nul
title 快速測試群組 ID 查詢

echo ========================================
echo 快速測試群組 ID 查詢
echo ========================================
echo.
echo 此腳本會幫您測試 LINE Bot 的群組 ID 查詢功能
echo.
echo 📋 測試步驟：
echo 1. 確保 Bot 已加入您的 LINE 群組
echo 2. 在群組中發送「群組ID」給 Bot
echo 3. Bot 應該會自動回覆群組 ID
echo.
echo ========================================
echo.

REM 檢查 Webhook API
echo [檢查] Webhook API 狀態...
echo.
curl -s https://coolcool-ten.vercel.app/api/webhook/line >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Webhook API 可訪問
) else (
    echo ⚠️  無法連接到 Webhook API
    echo    請確認 Vercel 部署是否完成
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo 測試說明
echo ========================================
echo.
echo 1. 開啟 LINE 應用程式
echo 2. 進入您的測試群組
echo 3. 發送以下任一訊息給 Bot：
echo    - 群組ID
echo    - groupId
echo    - 群組 ID（有空格也可以）
echo.
echo 4. Bot 應該會回覆：
echo    📋 群組 ID：
echo    C1234567890...
echo.
echo ========================================
echo.
echo 如果 Bot 沒有回覆，請檢查：
echo - ✅ Bot 是否已加入群組
echo - ✅ Webhook 是否已啟用
echo - ✅ Vercel 部署是否完成
echo - ✅ 環境變數是否正確設定
echo.
pause

