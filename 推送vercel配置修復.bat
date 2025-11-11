@echo off
chcp 65001 >nul
echo ========================================
echo 推送 vercel.json 配置修復
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 加入所有新文件...
git add vercel.json
git add "創建vercel.json配置.bat"
git add "最終解決404問題.md"
git add "診斷404問題完整步驟.md"
git add -A
echo.

echo [步驟 2] 提交更改...
git commit -m "添加 vercel.json 配置和 404 問題診斷指南

- 創建 vercel.json 明確指定 API 路由重寫規則
- 添加完整的 404 問題診斷步驟
- 提供多種解決方案"
echo.

echo [步驟 3] 推送到 GitHub...
git push origin main
echo.

echo ========================================
echo ✅ 代碼已推送！
echo ========================================
echo.
echo ⚠️  重要：接下來必須執行以下步驟
echo.
echo [步驟 4] 在 Vercel Dashboard 中手動觸發重新部署
echo.
echo 1. 前往：https://vercel.com/dashboard
echo 2. 選擇您的專案
echo 3. 前往 Deployments 頁面
echo 4. 點擊最新部署右側的 ⋯（三個點）
echo 5. 選擇 Redeploy（重新部署）
echo 6. ⚠️  重要：不要勾選 "Use existing Build Cache"
echo 7. 點擊 Redeploy
echo.
echo [步驟 5] 等待部署完成並測試
echo.
echo - 等待 1-3 分鐘
echo - 確認部署狀態為 Ready（綠色）
echo - 測試：https://coolcool-ten.vercel.app/api/health
echo - 應該返回 JSON，不是 404
echo - 測試：https://coolcool-ten.vercel.app/api/forms/list
echo - 應該返回 JSON 或 500（不是 404）
echo.
echo ========================================
echo.

pause

