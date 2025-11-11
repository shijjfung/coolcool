@echo off
chcp 65001 >nul
echo ========================================
echo 檢查並推送所有錯誤修復
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查 Git 狀態...
git status 2>&1 | more
if errorlevel 1 (
    echo.
    echo ❌ Git 命令執行失敗，請確認已安裝 Git
    pause
    exit /b 1
)
echo.
pause

echo [步驟 2] 加入所有修復的檔案...
git add lib/db-supabase.ts 2>&1
git add lib/supabase.ts 2>&1
git add lib/db.ts 2>&1
git add pages/api/forms/create.ts 2>&1
git add pages/api/forms/list.ts 2>&1
git add "pages/api/forms/[id].ts" 2>&1
git add pages/api/reports/auto-generate.ts 2>&1
git add pages/api/settings/report-folder.ts 2>&1
git add pages/admin/create.tsx 2>&1
git add pages/_app.tsx 2>&1
git add pages/api/debug/check-db.ts 2>&1
git add pages/api/facebook/auto-monitor.ts 2>&1
git add pages/api/facebook/fetch-comments.ts 2>&1
git add public/manifest.json 2>&1
echo.
echo ✅ 檔案已加入
echo.
pause

echo [步驟 3] 處理已刪除的檔案...
git add -u 2>&1
echo.
pause

echo [步驟 4] 檢查要提交的檔案...
git status --short 2>&1 | more
echo.
pause

echo [步驟 5] 提交所有修復...
git commit -m "Fix all API errors: 405, 500, and JSON parsing issues

- Fix 405 Method Not Allowed by checking HTTP method before DB init
- Fix 500 errors with improved database initialization error handling
- Add detailed environment variable checking with clear error messages
- Better error messages for missing Supabase tables (42P01)
- Handle database connection failures gracefully
- Support both SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL
- Improve JSON parsing error handling
- Ensure all errors return JSON instead of HTML error pages
- Add proper error responses for all API routes
- Add PWA manifest.json for mobile home screen installation" 2>&1

if errorlevel 1 (
    echo.
    echo ❌ 提交失敗，可能是沒有變更需要提交
    echo 或已經提交過了
    pause
    exit /b 1
)
echo.
echo ✅ 提交成功
echo.
pause

echo [步驟 6] 推送到 GitHub...
git push origin main 2>&1

if errorlevel 1 (
    echo.
    echo ❌ 推送失敗，請檢查：
    echo 1. 網路連線是否正常
    echo 2. GitHub 認證是否正確
    echo 3. 是否有推送權限
    pause
    exit /b 1
)
echo.
echo ✅ 推送成功
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
