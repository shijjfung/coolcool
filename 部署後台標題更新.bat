@echo off
chcp 65001 >nul
echo ========================================
echo 部署後台標題更新
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
git commit -m "更新後台入口標題：添加書宇皇太后座專用後台標題，使用標楷體和漸層彩紅色"
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
echo 🎨 更新內容：
echo   - 添加「書宇皇太后座專用後台」標題
echo   - 使用標楷體字體
echo   - 使用漸層彩紅色效果
echo   - 縮小「訂單管理系統」字體大小
echo.
echo ========================================
pause

