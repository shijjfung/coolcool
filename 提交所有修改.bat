@echo off
chcp 65001 >nul
echo ========================================
echo 提交所有修改到 GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 加入所有修改的檔案...
git add -A
echo.

echo [步驟 2] 提交修改...
git commit -m "Fix: Make check-db.ts compatible with Vercel/Supabase and update all features"
echo.

echo [步驟 3] 推送到 GitHub...
git push origin main
echo.

echo ========================================
echo 完成！所有修改已推送到 GitHub
echo Vercel 會自動檢測到新的 commit 並重新部署
echo ========================================
echo.
echo 請等待 1-3 分鐘後在 Vercel Dashboard 查看新的部署狀態
echo.

pause

