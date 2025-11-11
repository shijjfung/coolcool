@echo off
chcp 65001 >nul
echo ========================================
echo 手動提交並推送更改
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 設定 Git 用戶身份...
git config --global user.name "monke"
git config --global user.email "monke@example.com"
echo ✅ Git 用戶身份已設定
echo.

echo [步驟 2] 檢查當前狀態...
git status
echo.

echo [步驟 3] 提交暫存區的更改...
git commit -m "修改價格輸入欄位為只接受整數"
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
    ) else (
        echo ⚠️  推送失敗，請檢查錯誤訊息
    )
) else (
    echo ⚠️  提交失敗，可能沒有需要提交的更改
    echo.
    echo 檢查是否有未暫存的文件...
    git status
)

echo.
echo ========================================
pause

