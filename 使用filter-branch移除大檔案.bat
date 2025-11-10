@echo off
chcp 65001 >nul
echo ========================================
echo 使用 filter-branch 移除大檔案
echo ========================================
echo.

REM 切換到專案目錄
cd /d "E:\下單庫存管理"

echo 目前目錄：%CD%
echo.

echo [步驟 1] 設定環境變數忽略警告...
set FILTER_BRANCH_SQUELCH_WARNING=1
echo [完成] 環境變數已設定

echo.
echo [步驟 2] 使用 git filter-branch 從歷史中移除大檔案...
echo [警告] 這將重寫整個 Git 歷史
echo [提示] 這可能需要一些時間
echo.
pause

git filter-branch --force --index-filter "git rm --cached --ignore-unmatch '下單庫存管理.7z'" --prune-empty --tag-name-filter cat -- --all
if errorlevel 1 (
    echo [錯誤] filter-branch 失敗
    echo [建議] 使用「完全移除大檔案並推送.bat」建立新歷史
    pause
    exit /b 1
)

echo [完成] 已從歷史中移除大檔案

echo.
echo [步驟 3] 清理 Git 快取...
git reflog expire --expire=now --all
git gc --prune=now --aggressive
echo [完成] 快取已清理

echo.
echo [步驟 4] 強制推送到 GitHub...
echo [警告] 這會覆蓋遠端倉庫的所有內容
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
echo.
echo [驗證] 請前往 https://github.com/shijjfung/coolcool 查看
echo.
pause

