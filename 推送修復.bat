@echo off
chcp 65001 >nul
echo ========================================
echo 推送 lib/db.ts 修復到 GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 加入修改的檔案...
git add lib/db.ts
echo.

echo [步驟 2] 提交修改...
git commit -m "Fix: Make lib/db.ts compatible with Vercel by conditionally loading SQLite"
echo.

echo [步驟 3] 推送到 GitHub...
git push origin main
echo.

echo ========================================
echo 完成！修復已推送到 GitHub
echo Vercel 會自動重新部署
echo ========================================
echo.

pause

