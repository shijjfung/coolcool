@echo off
chcp 65001 >nul
echo ========================================
echo 部署密碼保護功能
echo ========================================
echo.

echo [步驟 1] 檢查 Git 狀態...
git status
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Git 未初始化或發生錯誤
    echo 請確認已安裝 Git 並設定正確
    pause
    exit /b 1
)
echo.

echo [步驟 2] 加入所有更改的文件...
git add .
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  加入文件失敗
    pause
    exit /b 1
)
echo ✅ 文件已加入暫存區
echo.

echo [步驟 3] 提交更改...
git commit -m "添加管理後台密碼保護功能、修復移動設備下載圖片問題、LINE群組ID雲端保存：首頁添加密碼輸入欄位，管理頁面添加驗證保護，預設密碼690921；修復移動設備下載圖片功能，支持Web Share API和新窗口打開；LINE群組ID保存到雲端資料庫，支援跨設備同步"
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  提交失敗，可能沒有需要提交的更改
    echo 繼續推送到遠端...
) else (
    echo ✅ 提交成功！
)
echo.

echo [步驟 4] 推送到 GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo ⚠️  推送失敗
    echo ========================================
    echo.
    echo 可能的原因：
    echo   1. 尚未設定遠端倉庫
    echo   2. 沒有推送權限
    echo   3. 網路連線問題
    echo.
    echo 請檢查錯誤訊息並手動執行：
    echo   git push origin main
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 代碼已成功推送到 GitHub！
echo ========================================
echo.
echo 📦 Vercel 會自動檢測到更改並開始部署
echo.
echo ⏳ 請等待 1-3 分鐘讓 Vercel 完成部署
echo.
echo 🔒 更新內容：
echo   - 首頁添加密碼輸入欄位（在賺錢開單囉按鈕下方）
echo   - 管理頁面添加驗證保護（未驗證會自動導向首頁）
echo   - 預設密碼：690921
echo   - 使用 sessionStorage 保存驗證狀態
echo   - 修復移動設備下載圖片功能（支持Web Share API和新窗口打開）
echo   - LINE 群組 ID 保存到雲端資料庫（支援跨設備同步）
echo   - 從任何設備進入都能看到已保存的群組 ID
echo.
echo ========================================
pause

