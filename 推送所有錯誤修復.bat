@echo off
chcp 65001 >nul
echo ========================================
echo 推送所有錯誤修復到 GitHub（完整版）
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查所有修改的檔案...
git status --short
echo.

echo [步驟 2] 加入所有修復的檔案...
git add lib/db-supabase.ts
git add lib/supabase.ts
git add pages/api/forms/create.ts
git add pages/api/forms/list.ts
git add pages/api/reports/auto-generate.ts
git add pages/api/settings/report-folder.ts
git add pages/admin/create.tsx
echo.

echo [步驟 3] 提交所有修復...
git commit -m "Fix all 500 and 405 errors with comprehensive error handling

- Fix 405 Method Not Allowed by moving HTTP method check before DB init
- Fix 500 errors with improved database initialization error handling
- Add detailed environment variable checking with clear error messages
- Better error messages for missing Supabase tables
- Handle database connection failures gracefully
- Support both SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL
- Improve JSON parsing error handling
- Add proper error responses instead of HTML error pages"
echo.

echo [步驟 4] 推送到 GitHub...
git push origin main
echo.

echo ========================================
echo ✅ 完成！所有錯誤修復已推送到 GitHub
echo ========================================
echo.
echo Vercel 會自動重新部署
echo 請等待 1-3 分鐘後再次測試
echo.
echo ⚠️  重要：如果還有錯誤，請檢查：
echo.
echo 1. Vercel 環境變數是否正確設定：
echo    - DATABASE_TYPE=supabase
echo    - SUPABASE_URL=您的 Supabase URL
echo    - SUPABASE_SERVICE_ROLE_KEY=您的 Service Role Key
echo.
echo 2. Supabase 資料庫表結構是否已建立：
echo    - 在 Supabase Dashboard ^> SQL Editor
echo    - 執行 supabase-complete-schema.sql
echo.
echo 3. Vercel 部署是否成功：
echo    - 檢查最新部署的 Build Logs
echo    - 確認沒有編譯錯誤
echo ========================================
echo.

pause

