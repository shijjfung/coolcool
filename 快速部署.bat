@echo off
chcp 65001 >nul
echo ========================================
echo   快速部署到 Vercel
echo ========================================
echo.

:: 檢查是否在正確的目錄
if not exist ".git" (
    echo ❌ 錯誤：找不到 .git 目錄
    echo 請確認您在專案根目錄執行此批次檔
    pause
    exit /b 1
)

echo [步驟 1] 加入所有變更...
git add -A
if %errorlevel% neq 0 (
    echo ❌ 加入變更失敗
    pause
    exit /b 1
)
echo ✅ 已加入暫存區
echo.

echo [步驟 2] 提交變更...
set commitMsg=更新：%date% %time%
git commit -m "%commitMsg%"
if %errorlevel% neq 0 (
    echo ⚠️  提交失敗，可能沒有變更；繼續進行推送...
) else (
    echo ✅ 已提交變更
)
echo.

echo [步驟 3] 推送到 GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ 推送失敗
    pause
    exit /b 1
)
echo ✅ 已成功推送到 GitHub！
echo.

echo [步驟 4] 檢查 Vercel 部署...
echo.
echo 📋 請按照以下步驟檢查 Vercel 部署：
echo.
echo 1. 前往 Vercel Dashboard: https://vercel.com/dashboard
echo 2. 選擇您的專案
echo 3. 查看 Deployments 頁面
echo 4. 如果沒有自動部署，點擊 "Redeploy" 按鈕
echo.
echo 或者使用 Vercel CLI（如果已安裝）：
echo    vercel --prod
echo.

echo ========================================
echo   部署完成
echo ========================================
echo.
echo ⏳ Vercel 會自動偵測 main 分支的變更並開始部署
echo ⏳ 通常 1～3 分鐘即可完成
echo.
pause

