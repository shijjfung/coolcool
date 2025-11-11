@echo off
chcp 65001 >nul
echo ========================================
echo 創建 vercel.json 配置
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 創建 vercel.json 文件...
echo.

(
echo {
echo   "rewrites": [
echo     {
echo       "source": "/api/:path*",
echo       "destination": "/api/:path*"
echo     }
echo   ]
echo }
) > vercel.json

echo ✅ vercel.json 已創建
echo.

echo [步驟 2] 加入 vercel.json 到 Git...
git add vercel.json 2>&1
git add -A 2>&1
echo.

echo [步驟 3] 提交更改...
git commit -m "添加 vercel.json 配置以修復 API 路由 404 問題

- 明確指定 API 路由重寫規則
- 確保所有 /api/* 路由正確工作" 2>&1
echo.

echo [步驟 4] 推送到 GitHub...
git push origin main 2>&1
echo.

echo ========================================
echo ✅ 代碼已推送！
echo ========================================
echo.
echo ⚠️  重要：接下來必須執行以下步驟
echo.
echo [步驟 5] 在 Vercel Dashboard 中手動觸發重新部署
echo.
echo 1. 前往：https://vercel.com/dashboard
echo 2. 選擇您的專案
echo 3. 前往 Deployments 頁面
echo 4. 點擊最新部署右側的 ⋯（三個點）
echo 5. 選擇 Redeploy（重新部署）
echo 6. ⚠️  重要：不要勾選 "Use existing Build Cache"
echo 7. 點擊 Redeploy
echo.
echo [步驟 6] 等待部署完成並測試
echo.
echo - 等待 1-3 分鐘
echo - 確認部署狀態為 Ready（綠色）
echo - 測試：https://coolcool-ten.vercel.app/api/forms/list
echo - 應該返回 JSON，不是 404
echo.
echo ========================================
echo.

pause

