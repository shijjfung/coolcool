@echo off
chcp 65001 >nul
echo ========================================
echo 推送 500 錯誤修復到 GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查修改的檔案...
git status --short
echo.

echo [步驟 2] 加入修復的檔案...
git add lib/db-supabase.ts
git add pages/api/forms/create.ts
git add pages/api/forms/list.ts
git add pages/api/reports/auto-generate.ts
git add pages/admin/create.tsx
echo.

echo [步驟 3] 提交修復...
git commit -m "Fix 500 errors with improved database initialization error handling

- Improve ensureDatabaseInitialized error messages
- Add detailed environment variable checking
- Better error messages for missing Supabase tables
- Handle database connection failures gracefully"
echo.

echo [步驟 4] 推送到 GitHub...
git push origin main
echo.

echo ========================================
echo ✅ 完成！500 錯誤修復已推送到 GitHub
echo ========================================
echo.
echo Vercel 會自動重新部署
echo 請等待 1-3 分鐘後再次測試
echo.
echo ⚠️  重要：如果還有錯誤，請檢查：
echo 1. Vercel 環境變數是否正確設定：
echo    - DATABASE_TYPE=supabase
echo    - SUPABASE_URL=您的 Supabase URL
echo    - SUPABASE_SERVICE_ROLE_KEY=您的 Service Role Key
echo.
echo 2. Supabase 資料庫表結構是否已建立：
echo    - 在 Supabase Dashboard ^> SQL Editor
echo    - 執行 supabase-complete-schema.sql
echo ========================================
echo.

pause
