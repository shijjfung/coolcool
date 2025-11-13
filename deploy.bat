@echo off
chcp 65001 >nul
echo ========================================
echo 部署最新更新
echo ========================================
echo.

:: 步驟 1：檢查 Git 狀態
echo [步驟 1] 檢查 Git 狀態...
git status
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Git 未初始化或發生錯誤
    echo    請確認已安裝 Git 並設定遠端倉庫
    pause
    exit /b 1
)
echo.

:: 步驟 2：加入所有更改
echo [步驟 2] 加入所有更改的檔案...
git add .
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  加入文件失敗
    pause
    exit /b 1
)
echo ✅ 已加入暫存區
echo.

:: 步驟 3：提交變更
set "COMMIT_MSG=%*"
if "%COMMIT_MSG%"=="" (
    set "COMMIT_MSG=更新 LINE 自動結單流程"
)
echo [步驟 3] 提交更改...
git commit -m "%COMMIT_MSG%"
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  提交失敗，可能沒有變動；繼續進行推送...
) else (
    echo ✅ 提交成功！
)
echo.

:: 步驟 4：推送到 GitHub
echo [步驟 4] 推送到 GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo ⚠️  推送失敗
    echo ========================================
    echo 可能原因：未設定遠端、權限不足或網路問題
    echo 請檢查錯誤訊息後手動執行：git push origin main
    echo.
    pause
    exit /b 1
)
echo.
echo ========================================
echo ✅ 代碼已成功推送到 GitHub！
echo ========================================
echo.

echo 📦 Vercel 會自動偵測 main 分支的變更並開始部署
echo ⏳ 通常 1～3 分鐘即可完成
echo.
pause