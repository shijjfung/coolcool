@echo off
chcp 65001 >nul
echo ========================================
echo 立即檢查和修復
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查 Git 狀態...
git status --short 2>&1 | more
echo.
pause

echo [步驟 2] 檢查是否有未提交的修改...
git diff --name-only 2>&1 | more
echo.
pause

echo [步驟 3] 加入所有檔案...
git add -A 2>&1
echo.

echo [步驟 4] 提交所有修改...
git commit -m "確保所有 API 返回 JSON 格式

- 添加自定義錯誤頁面
- 確保所有 API 路由都有正確的錯誤處理
- 添加 Vercel 部署檢查指南" 2>&1
echo.

echo [步驟 5] 推送到 GitHub...
git push origin main 2>&1
echo.

echo ========================================
echo ✅ 完成！
echo ========================================
echo.
echo 請按照以下步驟檢查：
echo.
echo [步驟 1] 檢查 Vercel 部署狀態
echo   1. 前往 https://vercel.com/dashboard
echo   2. 選擇您的專案
echo   3. 查看最新部署狀態
echo      - ✅ Ready（綠色）= 成功
echo      - ❌ Error = 失敗，請查看構建日誌
echo.
echo [步驟 2] 如果構建失敗
echo   1. 點擊最新部署
echo   2. 查看 Build Logs（構建日誌）
echo   3. 複製錯誤訊息
echo.
echo [步驟 3] 測試 API
echo   在瀏覽器中訪問：
echo   https://coolcool-ten.vercel.app/api/test-db
echo.
echo   應該看到 JSON 回應，不是 HTML
echo.
echo [步驟 4] 如果還是返回 HTML
echo   1. 檢查 Vercel 環境變數是否正確設定
echo   2. 查看詳細說明：檢查Vercel部署狀態.md
echo.
echo ========================================
echo.

pause

