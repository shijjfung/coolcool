@echo off
chcp 65001 >nul
echo ========================================
echo 立即修復環境變數問題
echo ========================================
echo.

echo ⚠️  重要：Vercel 運行日誌顯示「缺少 supabaseKey」
echo 這表示環境變數沒有正確傳遞到運行時環境
echo.
echo ========================================
echo 必須在 Vercel Dashboard 中手動設定
echo ========================================
echo.
echo 請按照以下步驟操作：
echo.
echo [步驟 1] 前往 Vercel Dashboard
echo.
echo 1. 打開瀏覽器，前往：https://vercel.com/dashboard
echo 2. 選擇您的專案
echo 3. 前往 Settings → Environment Variables
echo.
echo [步驟 2] 確認環境變數已正確設定
echo.
echo 確認以下三個變數都已設定：
echo.
echo 變數 1：DATABASE_TYPE
echo   - Key: DATABASE_TYPE
echo   - Value: supabase
echo   - Environments: ✅ Production, ✅ Preview
echo.
echo 變數 2：SUPABASE_URL
echo   - Key: SUPABASE_URL
echo   - Value: https://ceazouzwbvcfwudcbbnk.supabase.co
echo   - Environments: ✅ Production, ✅ Preview
echo.
echo 變數 3：SUPABASE_SERVICE_ROLE_KEY
echo   - Key: SUPABASE_SERVICE_ROLE_KEY
echo   - Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYXpvdXp3YnZjZnd1ZGNiYm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5NTg2NiwiZXhwIjoyMDc4MjcxODY2fQ.8faMxUMEjbNUaGTDgkxUr2Rl3BRZEwIxDHuvFSWjd_M
echo   - Environments: ✅ Production, ✅ Preview
echo.
echo [步驟 3] 確認每個變數都勾選了 Production 和 Preview
echo.
echo ⚠️  重要：如果只勾選了 Development，環境變數不會傳遞到生產環境
echo.
echo [步驟 4] 重新部署
echo.
echo 1. 前往 Deployments 頁面
echo 2. 點擊最新部署右側的 ⋯（三個點）
echo 3. 選擇 Redeploy（重新部署）
echo 4. ⚠️  重要：不要勾選 "Use existing Build Cache"
echo 5. 點擊 Redeploy
echo 6. 等待部署完成（1-3 分鐘）
echo.
echo [步驟 5] 測試
echo.
echo 訪問：https://coolcool-ten.vercel.app/api/test-db
echo 應該顯示所有環境變數都已設定
echo.
echo 訪問：https://coolcool-ten.vercel.app/api/forms/list
echo 應該返回 JSON，不是 HTML 或 500 錯誤
echo.
echo ========================================
echo.

pause

