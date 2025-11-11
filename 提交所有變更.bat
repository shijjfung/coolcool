@echo off
chcp 65001 >nul
echo ========================================
echo 提交所有變更到 GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 加入所有修改和刪除的檔案...
git add -A
echo.

echo [步驟 2] 提交修改...
git commit -m "Fix: Use pickup_time consistently and clean up documentation files"
echo.

echo [步驟 3] 推送到 GitHub...
git push origin main
echo.

echo ========================================
echo 完成！所有變更已推送到 GitHub
echo Vercel 會自動重新部署
echo ========================================
echo.

pause

