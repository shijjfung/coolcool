@echo off
chcp 65001 >nul
echo ========================================
echo   檢查 Git 狀態並推送到 Vercel
echo ========================================
echo.

:: 檢查是否在正確的目錄
if not exist ".git" (
    echo ❌ 錯誤：找不到 .git 目錄
    echo 請確認您在專案根目錄執行此批次檔
    pause
    exit /b 1
)

echo [步驟 1] 檢查 Git 狀態...
git status
echo.

echo [步驟 2] 檢查是否有未提交的變更...
git diff --name-only
if %errorlevel% equ 0 (
    echo ✅ 沒有未提交的變更
) else (
    echo ⚠️  發現未提交的變更
    echo.
    set /p addFiles="是否要加入所有變更並提交？(Y/N): "
    if /i "%addFiles%"=="Y" (
        git add -A
        set /p commitMsg="請輸入提交訊息（或按 Enter 使用預設）: "
        if "%commitMsg%"=="" set commitMsg=更新：自動提交
        git commit -m "%commitMsg%"
    )
)
echo.

echo [步驟 3] 檢查遠端倉庫連接...
git remote -v
echo.

echo [步驟 4] 取得最新變更...
git fetch origin
echo.

echo [步驟 5] 檢查本地與遠端的差異...
git log HEAD..origin/main --oneline
if %errorlevel% equ 0 (
    echo ⚠️  遠端有新的提交，建議先拉取：git pull origin main
) else (
    echo ✅ 本地已是最新
)
echo.

echo [步驟 6] 檢查本地是否有未推送的提交...
git log origin/main..HEAD --oneline
if %errorlevel% equ 0 (
    echo ✅ 沒有未推送的提交
) else (
    echo 📤 發現未推送的提交，準備推送...
    set /p pushNow="是否要推送到 GitHub？(Y/N): "
    if /i "%pushNow%"=="Y" (
        git push origin main
        if %errorlevel% equ 0 (
            echo.
            echo ✅ 已成功推送到 GitHub！
            echo.
            echo [步驟 7] 檢查 Vercel 部署狀態...
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
        ) else (
            echo ❌ 推送失敗，請檢查錯誤訊息
        )
    ) else (
        echo ⏭️  跳過推送
    )
)
echo.

echo [步驟 8] 檢查 GitHub Webhook 設定...
echo.
echo 📋 請手動檢查 GitHub Webhook：
echo.
echo 1. 前往 GitHub 倉庫: https://github.com/shijjfung/coolcool
echo 2. 點擊 Settings ^> Webhooks
echo 3. 確認是否有 Vercel 的 webhook（URL 包含 vercel.com）
echo 4. 確認狀態為 Active（綠色勾號）
echo 5. 查看 Recent Deliveries 是否有最近的記錄
echo.
echo 如果沒有 Vercel webhook：
echo 1. 前往 Vercel Dashboard: https://vercel.com/dashboard
echo 2. 選擇專案 ^> Settings ^> Git
echo 3. 點擊 "Disconnect" 然後重新連接 GitHub 倉庫
echo.

echo ========================================
echo   檢查完成
echo ========================================
echo.
pause

