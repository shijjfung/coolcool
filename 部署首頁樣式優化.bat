@echo off
chcp 65001 >nul
echo ========================================
echo 部署首頁樣式優化
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
git commit -m "優化首頁樣式：按鈕改為賺錢開單囉，書宇太座字體放大並使用全色域漸層，調整各元素字體大小和位置"
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
echo   - 按鈕名稱改為「賺錢開單囉」
echo   - 書宇太座字體放大（text-4xl/5xl/6xl）
echo   - 全色域漸層效果（紅橙黃綠藍靛紫）
echo   - 書宇皇太后座專用後台文字往上移動
echo   - 描述文字字體縮小
echo   - 訂單管理系統字體縮小並加粗
echo.
echo ========================================
pause

