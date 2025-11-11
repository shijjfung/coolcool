@echo off
chcp 65001 >nul
echo ========================================
echo 快速診斷和修復
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 加入所有文件...
git add pages/api/test-db.ts 2>&1
git add pages/api/debug/check-env.ts 2>&1
git add -A 2>&1
echo.

echo [步驟 2] 提交...
git commit -m "確保所有診斷 API 端點已提交

- 確保 test-db.ts 和 check-env.ts 都已提交
- 提供多個方法檢查環境變數" 2>&1
echo.

echo [步驟 3] 推送到 GitHub...
git push origin main 2>&1
echo.

echo ========================================
echo ✅ 完成！
echo ========================================
echo.
echo 請按照以下步驟檢查：
echo.
echo [步驟 1] 等待 Vercel 重新部署（1-3 分鐘）
echo.
echo [步驟 2] 測試環境變數檢查端點
echo   訪問：https://coolcool-ten.vercel.app/api/debug/check-env
echo   這個端點可以檢查環境變數設定
echo.
echo [步驟 3] 如果環境變數都設定正確
echo   直接測試創建表單：
echo   https://coolcool-ten.vercel.app/admin
echo.
echo ========================================
echo.

pause

