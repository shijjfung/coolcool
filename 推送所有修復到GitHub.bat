@echo off
chcp 65001 >nul
echo ========================================
echo 推送所有類型錯誤修復到 GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查修改的檔案...
git status --short
echo.

echo [步驟 2] 加入所有修改的檔案...
git add -A
echo.

echo [步驟 3] 提交所有修復...
git commit -m "Fix: Add explicit types to all callback functions

- Fix TypeScript type errors in orders/count.ts
- Fix TypeScript type errors in Facebook API files
- Fix TypeScript type errors in form/[token].tsx
- Clean up unused select type code
- Update database initialization logic"
echo.

echo [步驟 4] 推送到 GitHub...
git push origin main
echo.

echo ========================================
echo ✅ 完成！所有修復已推送到 GitHub
echo ========================================
echo.
echo Vercel 會自動重新部署
echo 請等待 1-3 分鐘後檢查部署狀態
echo.
echo 如果還有錯誤，請提供最新的 Build Logs
echo ========================================
echo.

pause

