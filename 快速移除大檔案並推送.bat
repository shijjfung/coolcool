@echo off
chcp 65001 >nul
echo ========================================
echo 快速移除大檔案並推送到 GitHub
echo ========================================
echo.
echo [問題] 檔案「下單庫存管理.7z」179.36 MB 超過 GitHub 限制
echo [解決] 從 Git 歷史中移除此檔案
echo.

REM 切換到專案目錄
cd /d "E:\下單庫存管理"

echo 目前目錄：%CD%
echo.

echo [步驟 1] 從 Git 暫存區移除大檔案...
git rm --cached "下單庫存管理.7z" 2>nul
if errorlevel 1 (
    echo [資訊] 檔案可能不在暫存區，或已不存在
)

echo.
echo [步驟 2] 提交移除大檔案的變更...
git add .gitignore
git commit -m "Remove large file and update .gitignore"
if errorlevel 1 (
    echo [資訊] 沒有變更需要提交
)

echo.
echo [步驟 3] 使用 git filter-branch 從歷史中移除大檔案...
echo [警告] 這將重寫 Git 歷史
echo [提示] 如果這是個人專案，這是安全的
echo.
pause

git filter-branch --force --index-filter "git rm --cached --ignore-unmatch '下單庫存管理.7z'" --prune-empty --tag-name-filter cat -- --all
if errorlevel 1 (
    echo [錯誤] filter-branch 失敗，嘗試使用 BFG 或手動處理
    echo [替代方案] 建立新的提交來覆蓋
    goto :alternative
)

echo [完成] 已從歷史中移除大檔案

echo.
echo [步驟 4] 清理 Git 快取...
git reflog expire --expire=now --all
git gc --prune=now --aggressive
echo [完成] 快取已清理

echo.
echo [步驟 5] 推送到 GitHub（需要強制推送）...
echo [警告] 因為重寫了歷史，需要強制推送
echo.
pause

git push -u origin main --force
if errorlevel 1 (
    echo [錯誤] 推送失敗
    pause
    exit /b 1
)

echo.
echo ========================================
echo [完成] 程式碼已成功推送到 GitHub！
echo ========================================
goto :end

:alternative
echo.
echo [替代方案] 建立新的提交來覆蓋歷史
echo [步驟] 建立新的孤立分支並推送
echo.
echo 這需要手動操作，建議：
echo 1. 刪除遠端倉庫並重新建立
echo 2. 或使用 GitHub Desktop 等工具
echo.
pause
exit /b 1

:end
echo.
echo [驗證] 請前往 https://github.com/shijjfung/coolcool 查看
echo.
pause

