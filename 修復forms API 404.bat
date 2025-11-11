@echo off
chcp 65001 >nul
echo ========================================
echo 修復 /api/forms/ API 404 錯誤
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查 /api/forms/ 目錄結構...
echo.

if exist "pages\api\forms\list.ts" (
    echo ✅ pages\api\forms\list.ts 存在
) else (
    echo ❌ pages\api\forms\list.ts 不存在！
    pause
    exit /b 1
)

if exist "pages\api\forms\create.ts" (
    echo ✅ pages\api\forms\create.ts 存在
) else (
    echo ❌ pages\api\forms\create.ts 不存在！
    pause
    exit /b 1
)

echo.
echo [步驟 2] 檢查文件內容是否正確...
echo.

findstr /C:"export default" pages\api\forms\list.ts >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ list.ts 包含 export default
) else (
    echo ❌ list.ts 缺少 export default！
)

findstr /C:"export default" pages\api\forms\create.ts >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ create.ts 包含 export default
) else (
    echo ❌ create.ts 缺少 export default！
)

echo.
echo [步驟 3] 強制加入所有 /api/forms/ 文件...
git add -f pages/api/forms/list.ts 2>&1
git add -f pages/api/forms/create.ts 2>&1
git add -f pages/api/forms/[id].ts 2>&1
git add -f pages/api/forms/[id]/update.ts 2>&1
git add -f pages/api/forms/[id]/delete.ts 2>&1
git add -A 2>&1
echo.

echo [步驟 4] 提交更改...
git commit -m "修復 /api/forms/ API 404：確保所有文件已提交

- 強制加入所有 /api/forms/ 目錄下的文件
- 確保文件正確推送到 GitHub
- 觸發 Vercel 重新部署" 2>&1
echo.

echo [步驟 5] 推送到 GitHub...
git push origin main 2>&1
echo.

echo ========================================
echo ✅ 代碼已推送！
echo ========================================
echo.
echo ⚠️  重要：接下來必須執行以下步驟
echo.
echo [步驟 6] 在 Vercel Dashboard 中手動觸發重新部署
echo.
echo 1. 前往：https://vercel.com/dashboard
echo 2. 選擇您的專案
echo 3. 前往 Deployments 頁面
echo 4. 點擊最新部署右側的 ⋯（三個點）
echo 5. 選擇 Redeploy（重新部署）
echo 6. ⚠️  重要：不要勾選 "Use existing Build Cache"
echo 7. 點擊 Redeploy
echo.
echo [步驟 7] 檢查 Vercel Functions 頁面
echo.
echo 1. 在 Vercel Dashboard 中，前往 Functions 標籤
echo 2. 查看是否有以下函數：
echo    - /api/health ✅（已確認正常）
echo    - /api/forms/list ❓（需要確認）
echo    - /api/forms/create ❓（需要確認）
echo 3. 如果函數不存在，表示部署有問題
echo.
echo [步驟 8] 等待部署完成並測試
echo.
echo - 等待 1-3 分鐘
echo - 確認部署狀態為 Ready（綠色）
echo - 測試：https://coolcool-ten.vercel.app/api/forms/list
echo - 應該返回 JSON，不是 404
echo.
echo ========================================
echo.

pause

