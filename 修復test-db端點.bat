@echo off
chcp 65001 >nul
echo ========================================
echo 修復 test-db 端點
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查 test-db.ts 文件是否存在...
if exist "pages\api\test-db.ts" (
    echo ✅ pages/api/test-db.ts 存在
) else (
    echo ❌ pages/api/test-db.ts 不存在！
    pause
    exit /b 1
)
echo.

echo [步驟 2] 檢查 Git 狀態...
git status pages/api/test-db.ts 2>&1 | more
echo.
pause

echo [步驟 3] 強制加入 test-db.ts...
git add -f pages/api/test-db.ts 2>&1
echo.

echo [步驟 4] 提交...
git commit -m "確保 test-db.ts 端點已提交

- 強制加入 test-db.ts 文件
- 確保 API 端點可以正常訪問" 2>&1
echo.

echo [步驟 5] 推送到 GitHub...
git push origin main 2>&1
echo.

echo ========================================
echo ✅ 完成！
echo ========================================
echo.
echo 請等待 Vercel 重新部署（1-3 分鐘）
echo 然後測試：https://coolcool-ten.vercel.app/api/test-db
echo.
echo ========================================
echo.

pause

