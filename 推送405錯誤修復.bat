@echo off
chcp 65001 >nul
echo ========================================
echo 推送 405 錯誤修復到 GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查修改的檔案...
git status --short
echo.

echo [步驟 2] 加入修復的檔案...
git add pages/api/forms/create.ts
git add pages/api/forms/list.ts
git add pages/api/reports/auto-generate.ts
git add pages/admin/create.tsx
git add lib/supabase.ts
echo.

echo [步驟 3] 提交修復...
git commit -m "Fix 405 Method Not Allowed errors and improve error handling

- Move HTTP method check before database initialization
- Add proper error handling for database initialization failures
- Improve error messages with details and hints
- Fix JSON parsing errors by handling empty responses
- Support both SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL"
echo.

echo [步驟 4] 推送到 GitHub...
git push origin main
echo.

echo ========================================
echo ✅ 完成！405 錯誤修復已推送到 GitHub
echo ========================================
echo.
echo Vercel 會自動重新部署
echo 請等待 1-3 分鐘後再次測試建立表單
echo.
echo 如果還有錯誤，請檢查：
echo 1. Supabase 環境變數是否正確設定
echo 2. 資料庫表結構是否已建立
echo 3. Vercel 部署是否成功
echo ========================================
echo.

pause

