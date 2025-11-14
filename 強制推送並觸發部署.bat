@echo off
chcp 65001 >nul
echo ========================================
echo   強制推送並觸發 Vercel 部署
echo ========================================
echo.

:: 檢查是否在正確的目錄
if not exist ".git" (
    echo ❌ 錯誤：找不到 .git 目錄
    pause
    exit /b 1
)

echo [步驟 1] 檢查所有檔案狀態...
echo.
git status
echo.

echo [步驟 2] 加入所有變更（包括新檔案）...
echo.
git add -A
git status --short
echo.

echo [步驟 3] 檢查是否有變更需要提交...
echo.
git diff --cached --name-only
if %errorlevel% neq 0 (
    echo ✅ 沒有變更需要提交
) else (
    echo 📝 發現變更，準備提交...
    set commitMsg=強制推送以觸發 Vercel 部署 - %date% %time%
    git commit -m "%commitMsg%"
    if %errorlevel% equ 0 (
        echo ✅ 已提交變更
    ) else (
        echo ⚠️  提交失敗，可能沒有變更
    )
)
echo.

echo [步驟 4] 強制推送到 GitHub...
echo.
git push origin main --force
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  強制推送失敗，嘗試普通推送...
    git push origin main
    if %errorlevel% neq 0 (
        echo ❌ 推送失敗
        pause
        exit /b 1
    )
)
echo.
echo ✅ 已成功推送到 GitHub
echo.

echo [步驟 5] 確認推送狀態...
echo.
git log --oneline -1
echo.
git log origin/main --oneline -1
echo.

echo [步驟 6] 開啟 Vercel Dashboard 手動觸發部署...
echo.
echo 📋 請在 Vercel Dashboard 中：
echo.
echo 1. 前往 https://vercel.com/dashboard
echo 2. 選擇專案 coolcool
echo 3. 點擊 Deployments 標籤
echo 4. 點擊右上角的 "Redeploy" 按鈕
echo 5. 選擇最新的提交
echo 6. 點擊 "Redeploy"
echo.
set /p openVercel="是否要開啟 Vercel Dashboard？(Y/N): "
if /i "%openVercel%"=="Y" (
    start "" "https://vercel.com/dashboard"
)

echo.
echo ========================================
echo   完成
echo ========================================
echo.
echo 💡 提示：
echo    - 代碼已推送到 GitHub
echo    - Vercel 應該會自動偵測並開始部署
echo    - 如果沒有自動部署，請在 Vercel Dashboard 手動觸發
echo    - 通常 1-3 分鐘內會完成部署
echo.
pause

