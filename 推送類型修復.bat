@echo off
chcp 65001 >nul
echo ========================================
echo 推送類型錯誤修復到 GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 加入修改的檔案...
git add lib/db.ts lib/db-supabase.ts
echo.

echo [步驟 2] 提交修改...
git commit -m "Fix: Add pickup_time to Form interface and fix property name in db-supabase.ts"
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

