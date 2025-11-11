@echo off
chcp 65001 >nul
echo ========================================
echo 檢查並提交修改
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查修改狀態...
echo.
git status
echo.

echo [步驟 2] 檢查 pages/api/debug/check-db.ts 的修改...
echo.
git diff pages/api/debug/check-db.ts
echo.

echo ========================================
echo 如果看到修改內容，請選擇：
echo.
echo 1. 提交並推送修改（輸入 1）
echo 2. 只查看，不提交（輸入 2 或直接關閉）
echo ========================================
echo.
set /p choice="請輸入選項 (1 或 2): "

if "%choice%"=="1" (
    echo.
    echo [步驟 3] 加入修改的檔案...
    git add pages/api/debug/check-db.ts
    echo.
    echo [步驟 4] 提交修改...
    git commit -m "Fix: Make check-db.ts compatible with Vercel/Supabase"
    echo.
    echo [步驟 5] 推送到 GitHub...
    git push origin main
    echo.
    echo ========================================
    echo 完成！修改已推送到 GitHub
    echo Vercel 會自動重新部署
    echo ========================================
) else (
    echo.
    echo 已取消提交
)

echo.
pause

