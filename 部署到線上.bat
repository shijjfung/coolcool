@echo off
chcp 65001 >nul
echo ========================================
echo 部署應用程式到 Vercel
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查 Git 狀態...
git status
echo.

echo [步驟 2] 加入所有更改的文件...
git add -A
echo.

echo [步驟 3] 提交更改...
git commit -m "修改價格輸入欄位為只接受整數

- 將數字欄位的價格輸入改為只接受整數
- 移除小數點輸入功能
- 添加輸入驗證和錯誤提示"
echo.

if %errorlevel% neq 0 (
    echo ⚠️  提交失敗，可能沒有需要提交的更改
    echo 繼續推送到遠端...
    echo.
)

echo [步驟 4] 推送到 GitHub...
git push origin main
echo.

if %errorlevel% equ 0 (
    echo ========================================
    echo ✅ 代碼已成功推送到 GitHub！
    echo ========================================
    echo.
    echo 📦 Vercel 會自動檢測到更改並開始部署
    echo.
    echo ⏳ 請等待 1-3 分鐘讓 Vercel 完成部署
    echo.
    echo 🔍 您可以：
    echo    1. 前往 Vercel Dashboard 查看部署狀態
    echo    2. 等待部署完成後測試應用程式
    echo.
) else (
    echo ========================================
    echo ⚠️  推送失敗
    echo ========================================
    echo.
    echo 可能的原因：
    echo    1. 尚未設定遠端倉庫
    echo    2. 沒有推送權限
    echo    3. 網路連線問題
    echo.
    echo 請檢查錯誤訊息並手動執行：
    echo    git push origin main
    echo.
)

echo ========================================
echo.
pause

