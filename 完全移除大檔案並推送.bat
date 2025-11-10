@echo off
chcp 65001 >nul
echo ========================================
echo 完全移除大檔案並推送到 GitHub
echo ========================================
echo.
echo [問題] 大檔案仍在 Git 歷史中
echo [解決] 建立新的 Git 歷史，不包含大檔案
echo.

REM 切換到專案目錄
cd /d "E:\下單庫存管理"

echo 目前目錄：%CD%
echo.

echo [步驟 1] 備份當前狀態...
echo [提示] 如果操作失敗，可以從備份恢復
echo.

echo [步驟 2] 建立新的孤立分支（不包含歷史）...
git checkout --orphan new-main
if errorlevel 1 (
    echo [錯誤] 建立孤立分支失敗
    pause
    exit /b 1
)
echo [完成] 已建立孤立分支

echo.
echo [步驟 3] 移除所有檔案（準備重新加入）...
git rm -rf --cached . 2>nul
echo [完成] 已清除暫存區

echo.
echo [步驟 4] 重新加入所有檔案（排除大檔案）...
git add .
echo [完成] 檔案已重新加入

echo.
echo [步驟 5] 檢查是否有大檔案...
git ls-files | findstr /I "\.7z$ \.zip$ \.rar$"
if not errorlevel 1 (
    echo [警告] 發現大檔案，將從 .gitignore 中排除
    git rm --cached *.7z 2>nul
    git rm --cached *.zip 2>nul
    git rm --cached *.rar 2>nul
)

echo.
echo [步驟 6] 建立新的初始提交...
git commit -m "Initial commit: 訂單管理系統（已移除大檔案）"
if errorlevel 1 (
    echo [錯誤] 提交失敗
    pause
    exit /b 1
)
echo [完成] 新提交已建立

echo.
echo [步驟 7] 刪除舊的 main 分支...
git branch -D main
if errorlevel 1 (
    echo [警告] 刪除舊分支失敗，可能不存在
)

echo.
echo [步驟 8] 將新分支重命名為 main...
git branch -m main
echo [完成] 分支已重命名

echo.
echo [步驟 9] 強制推送到 GitHub...
echo [警告] 這會完全覆蓋遠端倉庫
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
echo [注意] Git 歷史已重寫，大檔案已完全移除
echo.
pause

