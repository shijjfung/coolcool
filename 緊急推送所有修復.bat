@echo off
chcp 65001 >nul
echo ========================================
echo 緊急推送所有錯誤修復
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 加入所有修復的檔案...
git add -A
echo.

echo [步驟 2] 檢查要提交的檔案...
git status --short
echo.

echo [步驟 3] 提交所有修復...
git commit -m "Fix all API errors: 405, 500, JSON parsing, and manifest 401

- Fix 405 Method Not Allowed by checking HTTP method before DB init
- Fix 500 errors with improved database initialization error handling
- Add detailed environment variable checking with clear error messages
- Better error messages for missing Supabase tables (42P01)
- Handle database connection failures gracefully
- Support both SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL
- Improve JSON parsing error handling
- Ensure all errors return JSON instead of HTML error pages
- Add proper error responses for all API routes
- Add PWA manifest.json for mobile home screen installation
- Clean up deleted files"
echo.

echo [步驟 4] 推送到 GitHub...
git push origin main
echo.

echo ========================================
echo ✅ 完成！所有修復已推送到 GitHub
echo ========================================
echo.
echo Vercel 會自動重新部署
echo 請等待 1-3 分鐘後再次測試
echo.
echo ⚠️  重要：請確認以下事項
echo.
echo 1. Vercel 環境變數（必須設定）：
echo    - DATABASE_TYPE=supabase
echo    - SUPABASE_URL=您的 Supabase URL
echo    - SUPABASE_SERVICE_ROLE_KEY=您的 Service Role Key
echo.
echo 2. Supabase 資料庫表結構：
echo    - 在 Supabase Dashboard ^> SQL Editor
echo    - 執行 supabase-complete-schema.sql
echo.
echo 3. 等待 Vercel 重新部署（1-3 分鐘）
echo    - 檢查 Vercel Dashboard 的部署狀態
echo    - 確認最新部署為 "Ready"（綠色）
echo.
echo 4. 重新整理頁面並測試
echo    - 按 Ctrl+F5 強制重新整理
echo    - 再次嘗試建立表單
echo.
echo ========================================
echo.

pause

