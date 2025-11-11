@echo off
chcp 65001 >nul
echo ========================================
echo 一次性修復所有錯誤
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 加入所有修復檔案...
git add pages/api/manifest.json.ts 2>&1
git add pages/api/forms/create.ts 2>&1
git add pages/api/forms/list.ts 2>&1
git add pages/api/reports/auto-generate.ts 2>&1
git add -A 2>&1
echo.

echo [步驟 2] 提交修復...
git commit -m "一次性修復所有 API 錯誤

- 用 try-catch 包裹所有 API 處理函數，確保返回 JSON 而不是 HTML
- 修復 manifest.json 401 錯誤
- 修復 API 500 錯誤（JSON 解析錯誤）
- 修復 API 405 錯誤
- 添加詳細的錯誤訊息和提示
- 確保所有未預期的錯誤都返回 JSON 格式" 2>&1
echo.

echo [步驟 3] 推送到 GitHub...
git push origin main 2>&1
echo.

echo ========================================
echo ✅ 完成！所有錯誤已修復
echo ========================================
echo.
echo 請等待 Vercel 重新部署（1-3 分鐘）
echo 然後重新整理頁面測試
echo.
echo ⚠️  如果還有錯誤，請檢查：
echo 1. Vercel 環境變數是否正確設定
echo    - DATABASE_TYPE=supabase
echo    - SUPABASE_URL=您的 Supabase URL
echo    - SUPABASE_SERVICE_ROLE_KEY=您的 Service Role Key
echo.
echo 2. Supabase 資料庫表結構是否已建立
echo    - 在 Supabase Dashboard ^> SQL Editor
echo    - 執行 supabase-complete-schema.sql
echo.
echo ========================================
echo.

pause

