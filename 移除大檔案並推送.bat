@echo off
chcp 65001 >nul
echo ========================================
echo 移除大檔案並推送到 GitHub
echo ========================================
echo.
echo [問題] 發現大檔案「下單庫存管理.7z」179.36 MB
echo [說明] GitHub 不允許超過 100 MB 的檔案
echo [解決] 將從 Git 歷史中移除此檔案
echo.

REM 切換到專案目錄
cd /d "E:\下單庫存管理"

echo 目前目錄：%CD%
echo.

echo [步驟 1] 檢查 .gitignore 是否已包含 .7z 檔案...
findstr /C:"*.7z" .gitignore >nul
if errorlevel 1 (
    echo [設定] 將 .7z 加入 .gitignore...
    echo. >> .gitignore
    echo # large files (超過 GitHub 100MB 限制) >> .gitignore
    echo *.7z >> .gitignore
    echo *.zip >> .gitignore
    echo [完成] .gitignore 已更新
) else (
    echo [完成] .gitignore 已包含 .7z
)

echo.
echo [步驟 2] 從 Git 暫存區移除大檔案（如果存在）...
git rm --cached "下單庫存管理.7z" 2>nul
git rm --cached "*.7z" 2>nul
echo [完成] 已從暫存區移除

echo.
echo [步驟 3] 檢查是否有其他大檔案...
git ls-files | findstr /I "\.7z$ \.zip$ \.rar$ \.exe$ \.dmg$ \.iso$"
if not errorlevel 1 (
    echo [警告] 發現其他可能的大檔案
    echo [提示] 這些檔案也會被排除
)

echo.
echo [步驟 4] 重新加入所有檔案（排除大檔案）...
git add .
echo [完成] 檔案已重新加入

echo.
echo [步驟 5] 檢查變更...
git status --short
echo.

echo [步驟 6] 提交變更...
git commit -m "Remove large files and update .gitignore"
if errorlevel 1 (
    echo [資訊] 沒有變更需要提交，或檔案已在歷史中
    echo [步驟 7] 需要從歷史中移除大檔案...
    echo.
    echo [警告] 這將重寫 Git 歷史
    echo [提示] 如果這是個人專案且沒有其他人使用，這是安全的
    echo.
    pause
    
    echo [執行] 使用 git filter-branch 移除大檔案...
    git filter-branch --force --index-filter "git rm --cached --ignore-unmatch '下單庫存管理.7z'" --prune-empty --tag-name-filter cat -- --all
    if errorlevel 1 (
        echo [錯誤] 移除歷史檔案失敗
        echo [建議] 可以建立新的提交來覆蓋
        pause
        exit /b 1
    )
    
    echo [完成] 已從歷史中移除大檔案
    echo [清理] 清理 Git 快取...
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
)

echo.
echo [步驟 8] 推送到 GitHub...
echo [提示] 這次應該會成功，因為大檔案已被移除
echo.
pause

git push -u origin main
if errorlevel 1 (
    echo.
    echo [錯誤] 推送失敗
    echo.
    echo 如果錯誤訊息仍然提到大檔案，可能需要強制推送：
    echo [警告] 強制推送會覆蓋遠端倉庫
    echo.
    set /p FORCE_PUSH="是否要強制推送？(y/n): "
    if /i "%FORCE_PUSH%"=="y" (
        git push -u origin main --force
        if errorlevel 1 (
            echo [錯誤] 強制推送失敗
            pause
            exit /b 1
        )
    ) else (
        echo [取消] 未執行強制推送
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo [完成] 程式碼已成功推送到 GitHub！
echo ========================================
echo.
echo [驗證] 請前往 https://github.com/shijjfung/coolcool 查看
echo [注意] 大檔案「下單庫存管理.7z」已被排除，不會上傳
echo.
pause

