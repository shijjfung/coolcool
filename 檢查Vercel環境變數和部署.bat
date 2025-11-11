@echo off
chcp 65001 >nul
echo ========================================
echo 檢查 Vercel 環境變數和部署狀態
echo ========================================
echo.

echo ⚠️  重要：如果 API 仍然返回 HTML 而不是 JSON
echo 可能是以下原因之一：
echo.
echo 1. 環境變數還沒有設定到 Vercel
echo 2. 環境變數已設定但還沒有重新部署
echo 3. 代碼還沒有正確推送到 GitHub
echo.
echo ========================================
echo 檢查步驟
echo ========================================
echo.
echo [步驟 1] 確認環境變數已設定到 Vercel
echo.
echo 1. 前往：https://vercel.com/dashboard
echo 2. 選擇您的專案
echo 3. 前往 Settings → Environment Variables
echo 4. 確認以下三個變數都已設定：
echo    - DATABASE_TYPE = supabase
echo    - SUPABASE_URL = https://ceazouzwbvcfwudcbbnk.supabase.co
echo    - SUPABASE_SERVICE_ROLE_KEY = （很長的 key）
echo 5. 確認每個變數都勾選了 Production 和 Preview
echo.
echo [步驟 2] 確認代碼已推送到 GitHub
echo.
git status
echo.
echo 如果有未提交的更改，請執行：
echo   git add .
echo   git commit -m "修復 API 返回 JSON"
echo   git push origin main
echo.
echo [步驟 3] 確認 Vercel 已重新部署
echo.
echo 1. 前往 Vercel Dashboard
echo 2. 查看 Deployments 頁面
echo 3. 確認最新部署狀態為 "Ready"（綠色）
echo 4. 如果部署失敗，查看 Build Logs
echo.
echo [步驟 4] 測試 API
echo.
echo 訪問以下 URL 測試：
echo.
echo 1. https://coolcool-ten.vercel.app/api/health
echo    （應該返回 JSON）
echo.
echo 2. https://coolcool-ten.vercel.app/api/forms/list
echo    （應該返回 JSON，不是 HTML）
echo.
echo ========================================
echo 如果還是失敗
echo ========================================
echo.
echo 請提供以下資訊：
echo.
echo 1. Vercel 構建日誌（完整內容）
echo    - 前往 Vercel Dashboard
echo    - 點擊最新部署
echo    - 查看 Build Logs
echo    - 複製所有錯誤訊息
echo.
echo 2. 環境變數是否已設定
echo    - 是否已設定 DATABASE_TYPE？
echo    - 是否已設定 SUPABASE_URL？
echo    - 是否已設定 SUPABASE_SERVICE_ROLE_KEY？
echo.
echo 3. 最新部署的狀態
echo    - Ready（成功）？
echo    - Error（失敗）？
echo    - Building（進行中）？
echo.
echo ========================================
echo.

pause

