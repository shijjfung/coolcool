@echo off
chcp 65001 >nul
echo ========================================
echo 修復 Vercel API 404 錯誤
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 修改 next.config.js（移除 standalone 輸出）...
echo.

echo [步驟 2] 加入所有更改...
git add next.config.js 2>&1
git add -A 2>&1
echo.

echo [步驟 3] 提交更改...
git commit -m "修復 Vercel API 404：移除 standalone 輸出模式

- 移除 output: 'standalone' 配置
- standalone 模式可能導致 API 路由在 Vercel 上無法正常工作
- 使用默認的 Next.js 輸出模式" 2>&1
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
echo [步驟 6] 等待部署完成
echo.
echo - 等待 1-3 分鐘
echo - 確認部署狀態為 Ready（綠色）
echo.
echo [步驟 7] 測試 API
echo.
echo 訪問：https://coolcool-ten.vercel.app/api/health
echo 應該返回 JSON，不是 404
echo.
echo 訪問：https://coolcool-ten.vercel.app/api/forms/list
echo 應該返回 JSON，不是 404
echo.
echo ========================================
echo.

pause

