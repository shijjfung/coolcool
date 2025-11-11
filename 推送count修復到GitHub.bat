@echo off
chcp 65001 >nul
echo ========================================
echo 推送 count.ts 類型錯誤修復到 GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查檔案狀態...
if not exist "pages\api\orders\count.ts" (
    echo ❌ 找不到 pages\api\orders\count.ts
    pause
    exit /b 1
)

echo ✅ 檔案存在
echo.

echo [步驟 2] 加入修改的檔案...
git add pages/api/orders/count.ts
echo.

echo [步驟 3] 檢查是否有其他未提交的修改...
git status
echo.

echo [步驟 4] 提交修改...
git commit -m "Fix: Add explicit types to callback in orders/count.ts"
echo.

echo [步驟 5] 推送到 GitHub...
git push origin main
echo.

echo ========================================
echo ✅ 完成！修復已推送到 GitHub
echo ========================================
echo.
echo Vercel 會自動重新部署
echo 請等待 1-3 分鐘後檢查部署狀態
echo.
echo ========================================
echo.

pause

