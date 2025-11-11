@echo off
chcp 65001 >nul
echo ========================================
echo 推送 count.ts 類型錯誤修復
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 加入修改的檔案...
git add pages/api/orders/count.ts
echo.

echo [步驟 2] 提交修改...
git commit -m "Fix: Add explicit types to callback in orders/count.ts"
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

