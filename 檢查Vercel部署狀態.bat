@echo off
chcp 65001 >nul
echo ========================================
echo   檢查 Vercel 部署狀態
echo ========================================
echo.

echo ✅ 已確認 Vercel 連接到 GitHub 倉庫：shijjfung/coolcool
echo.

echo [步驟 1] 檢查最近的提交...
echo.
git log --oneline -3
echo.

echo [步驟 2] 檢查本地與遠端是否同步...
echo.
git fetch origin
git log origin/main --oneline -3
echo.

echo [步驟 3] 檢查是否有未推送的提交...
echo.
git log origin/main..HEAD --oneline
if %errorlevel% equ 0 (
    echo ✅ 本地與遠端已同步
) else (
    echo 📤 發現未推送的提交
    set /p pushNow="是否要推送到 GitHub？(Y/N): "
    if /i "%pushNow%"=="Y" (
        git push origin main
        echo.
        echo ✅ 已推送，Vercel 應該會自動觸發部署
    )
)
echo.

echo [步驟 4] 開啟 Vercel Dashboard...
echo.
echo 請在 Vercel Dashboard 中檢查：
echo.
echo 1. 前往 Deployments 頁面
echo 2. 查看最新的部署狀態
echo 3. 如果顯示失敗，點擊查看 Build Logs
echo 4. 檢查錯誤訊息並複製給我
echo.
set /p openVercel="是否要開啟 Vercel Dashboard？(Y/N): "
if /i "%openVercel%"=="Y" (
    start "" "https://vercel.com/dashboard"
    echo.
    echo 提示：在 Vercel Dashboard 中：
    echo    - 點擊專案名稱
    echo    - 查看 Deployments 標籤
    echo    - 點擊最新的部署查看詳細資訊
    echo    - 查看 Build Logs 找出錯誤
)

echo.
echo [步驟 5] 手動觸發部署（如果需要）...
echo.
echo 如果自動部署沒有觸發，您可以：
echo.
echo 方法 1：在 Vercel Dashboard
echo    - 前往 Deployments 頁面
echo    - 點擊右上角的 "Redeploy" 按鈕
echo    - 選擇最新的提交或輸入提交 hash
echo.
echo 方法 2：使用 Vercel CLI（如果已安裝）
echo    - 執行：vercel --prod
echo.
set /p useCLI="是否要使用 Vercel CLI 部署？(Y/N): "
if /i "%useCLI%"=="Y" (
    where vercel >nul 2>&1
    if %errorlevel% equ 0 (
        echo.
        echo 正在使用 Vercel CLI 部署...
        vercel --prod
    ) else (
        echo.
        echo ❌ 未安裝 Vercel CLI
        echo.
        echo 安裝方式：
        echo    npm install -g vercel
        echo.
        echo 或使用 npx（不需要安裝）：
        set /p useNpx="是否要使用 npx 部署？(Y/N): "
        if /i "%useNpx%"=="Y" (
            echo.
            echo 正在使用 npx 部署...
            npx vercel --prod
        )
    )
)

echo.
echo ========================================
echo   檢查完成
echo ========================================
echo.
echo 常見問題排查：
echo.
echo 1. 部署失敗：
echo    - 檢查 Build Logs 中的錯誤訊息
echo    - 確認環境變數已正確設定
echo    - 確認依賴已正確安裝
echo.
echo 2. 沒有自動部署：
echo    - 檢查 GitHub Webhook 是否正常
echo    - 確認 Production Branch 設定為 main
echo    - 嘗試手動觸發部署
echo.
echo 3. 構建錯誤：
echo    - TypeScript 編譯錯誤
echo    - 缺少依賴
echo    - 環境變數未設定
echo.
pause

