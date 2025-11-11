@echo off
chcp 65001 >nul
echo ========================================
echo 修復 404 錯誤
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查 API 路由文件是否存在...
echo.

if exist "pages\api\forms\create.ts" (
    echo ✅ pages\api\forms\create.ts 存在
) else (
    echo ❌ pages\api\forms\create.ts 不存在！
    pause
    exit /b 1
)

if exist "pages\api\forms\list.ts" (
    echo ✅ pages\api\forms\list.ts 存在
) else (
    echo ❌ pages\api\forms\list.ts 不存在！
    pause
    exit /b 1
)

echo.
echo [步驟 2] 檢查文件是否已提交到 Git...
echo.

git ls-files pages/api/forms/create.ts >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ create.ts 已提交到 Git
) else (
    echo ⚠️  create.ts 未提交到 Git，正在加入...
    git add pages/api/forms/create.ts
)

git ls-files pages/api/forms/list.ts >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ list.ts 已提交到 Git
) else (
    echo ⚠️  list.ts 未提交到 Git，正在加入...
    git add pages/api/forms/list.ts
)

echo.
echo [步驟 3] 強制加入所有 API 文件...
git add -f pages/api/forms/create.ts 2>&1
git add -f pages/api/forms/list.ts 2>&1
git add -f pages/api/forms/[id].ts 2>&1
git add -f pages/api/reports/auto-generate.ts 2>&1
git add -f pages/api/health.ts 2>&1
git add -A 2>&1
echo.

echo [步驟 4] 提交所有更改...
git commit -m "修復 404 錯誤：確保所有 API 路由文件已提交

- 強制加入所有 API 路由文件
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
echo [步驟 6] 等待 Vercel 重新部署
echo.
echo 1. 前往：https://vercel.com/dashboard
echo 2. 選擇您的專案
echo 3. 前往 Deployments 頁面
echo 4. 等待 1-3 分鐘
echo 5. 確認部署狀態為 Ready（綠色）
echo.
echo [步驟 7] 測試 API
echo.
echo 訪問：https://coolcool-ten.vercel.app/api/health
echo 應該返回 JSON，不是 404
echo.
echo 訪問：https://coolcool-ten.vercel.app/api/forms/list
echo 應該返回 JSON，不是 404
echo.
echo ========================================
echo.

pause

