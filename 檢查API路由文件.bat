@echo off
chcp 65001 >nul
echo ========================================
echo 檢查 API 路由文件
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查 API 路由文件是否存在...
echo.

if exist "pages\api\forms\create.ts" (
    echo ✅ pages\api\forms\create.ts 存在
) else (
    echo ❌ pages\api\forms\create.ts 不存在！
)

if exist "pages\api\forms\list.ts" (
    echo ✅ pages\api\forms\list.ts 存在
) else (
    echo ❌ pages\api\forms\list.ts 不存在！
)

if exist "pages\api\forms\[id].ts" (
    echo ✅ pages\api\forms\[id].ts 存在
) else (
    echo ❌ pages\api\forms\[id].ts 不存在！
)

if exist "pages\api\reports\auto-generate.ts" (
    echo ✅ pages\api\reports\auto-generate.ts 存在
) else (
    echo ❌ pages\api\reports\auto-generate.ts 不存在！
)

if exist "pages\api\health.ts" (
    echo ✅ pages\api\health.ts 存在
) else (
    echo ❌ pages\api\health.ts 不存在！
)

echo.
echo ========================================
echo [步驟 2] 檢查 Git 狀態...
echo ========================================
echo.

git status pages/api/ 2>&1 | findstr /V "^$" | findstr /V "On branch" | findstr /V "nothing to commit" | findstr /V "Changes not staged" | findstr /V "Untracked files"

echo.
echo ========================================
echo [步驟 3] 檢查文件是否已提交...
echo ========================================
echo.

git ls-files pages/api/forms/create.ts 2>&1 | findstr /V "^$"
if %errorlevel% equ 0 (
    echo ✅ create.ts 已提交到 Git
) else (
    echo ❌ create.ts 未提交到 Git！
    echo.
    echo 請執行：
    echo   git add pages/api/forms/create.ts
    echo   git commit -m "添加 API 路由文件"
    echo   git push origin main
)

git ls-files pages/api/forms/list.ts 2>&1 | findstr /V "^$"
if %errorlevel% equ 0 (
    echo ✅ list.ts 已提交到 Git
) else (
    echo ❌ list.ts 未提交到 Git！
)

echo.
echo ========================================
echo 下一步
echo ========================================
echo.
echo 如果文件不存在或未提交：
echo 1. 確認文件是否在正確的位置
echo 2. 執行 git add 和 git commit
echo 3. 推送到 GitHub
echo 4. 等待 Vercel 重新部署
echo.
echo ========================================
echo.

pause

