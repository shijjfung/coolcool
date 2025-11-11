@echo off
chcp 65001 >nul
echo ========================================
echo 提交 API 路由和 viewport 修復
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
git commit -m "修復 API 路由 404 問題和 viewport 警告 - 改進動態路由匹配邏輯，移除 viewport 中的 maximum-scale 和 user-scalable，移除不存在的圖標引用"
echo.

if %errorlevel% equ 0 (
    echo ✅ 提交成功！
    echo.
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
        echo 🧪 部署完成後，請測試：
        echo    GET https://coolcool-ten.vercel.app/api/forms/list
        echo    應該返回 JSON 數組，而不是 404
        echo.
    ) else (
        echo ⚠️  推送失敗，請檢查錯誤訊息
    )
) else (
    echo ⚠️  提交失敗，可能沒有需要提交的更改
    echo.
    echo 檢查狀態...
    git status
)

echo.
echo ========================================
pause

