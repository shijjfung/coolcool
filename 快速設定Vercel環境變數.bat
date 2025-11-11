@echo off
chcp 65001 >nul
echo ========================================
echo 快速設定 Vercel 環境變數
echo ========================================
echo.

echo 您的 Supabase 環境變數已準備好！
echo.
echo ========================================
echo 需要設定的三個環境變數
echo ========================================
echo.
echo [變數 1] DATABASE_TYPE
echo 值：supabase
echo.
echo [變數 2] SUPABASE_URL
echo 值：https://ceazouzwbvcfwudcbbnk.supabase.co
echo.
echo [變數 3] SUPABASE_SERVICE_ROLE_KEY
echo 值：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYXpvdXp3YnZjZnd1ZGNiYm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5NTg2NiwiZXhwIjoyMDc4MjcxODY2fQ.8faMxUMEjbNUaGTDgkxUr2Rl3BRZEwIxDHuvFSWjd_M
echo.
echo ========================================
echo 設定步驟
echo ========================================
echo.
echo 1. 打開瀏覽器，前往：
echo    https://vercel.com/dashboard
echo.
echo 2. 找到您的專案（coolcool-ten）
echo.
echo 3. 點擊專案 → Settings → Environment Variables
echo.
echo 4. 點擊 "Add New" 按鈕，新增以下三個變數：
echo.
echo    ┌─────────────────────────────────────┐
echo    │ Key: DATABASE_TYPE                  │
echo    │ Value: supabase                     │
echo    │ Environments: ✅ Production, Preview │
echo    └─────────────────────────────────────┘
echo.
echo    ┌─────────────────────────────────────┐
echo    │ Key: SUPABASE_URL                   │
echo    │ Value: https://ceazouzwbvcfwudcbbnk.supabase.co
echo    │ Environments: ✅ Production, Preview │
echo    └─────────────────────────────────────┘
echo.
echo    ┌─────────────────────────────────────┐
echo    │ Key: SUPABASE_SERVICE_ROLE_KEY      │
echo    │ Value: （從上方完整複製）            │
echo    │ Environments: ✅ Production, Preview │
echo    └─────────────────────────────────────┘
echo.
echo 5. 每個變數設定後，點擊 "Save"
echo.
echo 6. 設定完成後，Vercel 會自動重新部署
echo.
echo 7. 等待 1-3 分鐘，確認部署狀態為 "Ready"
echo.
echo ========================================
echo 詳細指南
echo ========================================
echo.
echo 已為您準備完整的設定指南：
echo 📄 Vercel環境變數快速設定.md
echo.
echo 請打開這個檔案查看詳細步驟。
echo.
echo ========================================
echo.

pause

