@echo off
chcp 65001 >nul
echo ========================================
echo 簡單推送所有錯誤修復
echo ========================================
echo.

cd /d "%~dp0"

echo 正在加入所有檔案...
git add -A
echo.

echo 正在提交...
git commit -m "Fix all API errors: 405, 500, JSON parsing, and manifest issues" 2>&1
echo.

echo 正在推送到 GitHub...
git push origin main 2>&1
echo.

echo ========================================
echo ✅ 完成！
echo ========================================
echo.
echo 請等待 Vercel 重新部署（1-3 分鐘）
echo 然後重新整理頁面測試
echo.
echo ========================================
echo.

pause

