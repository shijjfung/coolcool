@echo off
chcp 65001 >nul
echo ========================================
echo 檢查 API 路由部署
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查 pages/api 目錄是否存在...
if exist "pages\api" (
    echo ✅ pages/api 目錄存在
) else (
    echo ❌ pages/api 目錄不存在！
    pause
    exit /b 1
)
echo.

echo [步驟 2] 檢查關鍵 API 文件...
if exist "pages\api\health.ts" (
    echo ✅ pages/api/health.ts 存在
) else (
    echo ❌ pages/api/health.ts 不存在！
)

if exist "pages\api\test-db.ts" (
    echo ✅ pages/api/test-db.ts 存在
) else (
    echo ❌ pages/api/test-db.ts 不存在！
)

if exist "pages\api\forms\create.ts" (
    echo ✅ pages/api/forms/create.ts 存在
) else (
    echo ❌ pages/api/forms/create.ts 不存在！
)
echo.

echo [步驟 3] 檢查 Git 狀態...
git status pages/api/ 2>&1 | more
echo.

echo [步驟 4] 檢查 .gitignore 是否忽略了 API 文件...
findstr /C:"pages/api" .gitignore 2>nul
if errorlevel 1 (
    echo ✅ .gitignore 沒有忽略 pages/api
) else (
    echo ⚠️  警告：.gitignore 可能忽略了 pages/api
)
echo.

echo [步驟 5] 列出 pages/api 目錄的所有文件...
dir /s /b pages\api\*.ts 2>nul | find /c /v ""
echo.

echo ========================================
echo 檢查完成
echo ========================================
echo.
echo 如果所有文件都存在，但 Vercel 仍然返回 404：
echo 1. 檢查 Vercel 構建日誌
echo 2. 確認文件已提交到 Git
echo 3. 檢查是否有 .vercelignore 文件
echo.
echo ========================================
echo.

pause

