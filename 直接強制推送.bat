@echo off
chcp 65001 >nul
echo ========================================
echo 直接強制推送到 GitHub
echo ========================================
echo.
echo [說明] 已建立新提交移除了大檔案
echo [方法] 直接強制推送新提交，覆蓋遠端倉庫
echo [注意] 這會覆蓋遠端倉庫的內容（目前是空的，所以安全）
echo.

REM 切換到專案目錄
cd /d "E:\下單庫存管理"

echo 目前目錄：%CD%
echo.

echo [步驟 1] 檢查最新提交...
git log --oneline -3
echo.

echo [步驟 2] 確認遠端倉庫...
git remote -v
echo.

echo [步驟 3] 強制推送到 GitHub...
echo [警告] 這會覆蓋遠端倉庫的所有內容
echo [提示] 因為遠端倉庫目前是空的，這是安全的
echo.
pause

git push -u origin main --force
if errorlevel 1 (
    echo.
    echo [錯誤] 推送失敗
    echo.
    echo 可能的原因：
    echo 1. 認證問題（需要輸入 Token）
    echo 2. 網路連線問題
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo [完成] 程式碼已成功推送到 GitHub！
echo ========================================
echo.
echo [驗證] 請前往 https://github.com/shijjfung/coolcool 查看
echo [注意] 大檔案已被移除，不會出現在倉庫中
echo.
pause

