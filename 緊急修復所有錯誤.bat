@echo off
chcp 65001 >nul
echo ========================================
echo 緊急修復所有錯誤
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 加入所有修復檔案...
git add pages/api/manifest.json.ts 2>&1
git add pages/_app.tsx 2>&1
git add pages/api/forms/create.ts 2>&1
git add pages/api/forms/list.ts 2>&1
git add pages/api/reports/auto-generate.ts 2>&1
git add public/manifest.json 2>&1
git add -A 2>&1
echo.

echo [步驟 2] 提交修復...
git commit -m "緊急修復：manifest.json 401、API 500/405 錯誤

- 創建 /api/manifest.json 路由解決 401 錯誤
- 更新 _app.tsx 使用 API 路由
- 改進所有 API 路由的錯誤處理
- 確保所有錯誤返回 JSON 而不是 HTML
- 修復資料庫初始化錯誤處理" 2>&1
echo.

echo [步驟 3] 推送到 GitHub...
git push origin main 2>&1
echo.

echo ========================================
echo ✅ 完成！
echo ========================================
echo.
echo 請等待 Vercel 重新部署（1-3 分鐘）
echo 然後重新整理頁面測試
echo.
echo ⚠️  如果還有錯誤，請檢查：
echo 1. Vercel 環境變數是否正確設定
echo 2. Supabase 資料庫表結構是否已建立
echo.
echo ========================================
echo.

pause

