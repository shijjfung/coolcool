@echo off
chcp 65001 >nul
echo ========================================
echo 強制重新部署到 Vercel
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查 Git 狀態...
git status --short 2>&1 | more
echo.
pause

echo [步驟 2] 加入所有文件...
git add -A 2>&1
echo.

echo [步驟 3] 創建空提交以觸發重新部署...
git commit --allow-empty -m "觸發 Vercel 重新部署

- 強制觸發 Vercel 重新構建
- 確保所有 API 路由文件都被包含" 2>&1
echo.

echo [步驟 4] 推送到 GitHub...
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
echo      - ✅ Ready（綠色）= 部署成功
echo      - ⏳ Building = 正在構建
echo      - ❌ Error = 構建失敗，請查看日誌
echo.
echo [步驟 2] 查看構建日誌
echo   1. 點擊最新部署
echo   2. 查看 Build Logs（構建日誌）
echo   3. 檢查是否有錯誤或警告
echo.
echo [步驟 3] 測試 API
echo   等待部署完成後，訪問：
echo   https://coolcool-ten.vercel.app/api/health
echo.
echo   預期結果：
echo   - ✅ 看到 JSON 回應 = API 正常
echo   - ❌ 看到 404 = 需要檢查構建日誌
echo.
echo ========================================
echo.

pause

