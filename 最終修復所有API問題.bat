@echo off
chcp 65001 >nul
echo ========================================
echo 最終修復所有 API 問題
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查關鍵 API 文件是否存在...
if exist "pages\api\forms\create.ts" (
    echo ✅ pages/api/forms/create.ts 存在
) else (
    echo ❌ pages/api/forms/create.ts 不存在！
    pause
    exit /b 1
)

if exist "pages\api\forms\list.ts" (
    echo ✅ pages/api/forms/list.ts 存在
) else (
    echo ❌ pages/api/forms/list.ts 不存在！
    pause
    exit /b 1
)

if exist "pages\api\manifest.json.ts" (
    echo ✅ pages/api/manifest.json.ts 存在
) else (
    echo ❌ pages/api/manifest.json.ts 不存在！
    pause
    exit /b 1
)
echo.

echo [步驟 2] 強制加入所有 API 文件...
git add -f pages/api/forms/create.ts 2>&1
git add -f pages/api/forms/list.ts 2>&1
git add -f pages/api/forms/[id].ts 2>&1
git add -f pages/api/reports/auto-generate.ts 2>&1
git add -f pages/api/manifest.json.ts 2>&1
git add -f pages/api/test-db.ts 2>&1
git add -A 2>&1
echo.

echo [步驟 3] 提交...
git commit -m "最終修復：確保所有 API 路由正確部署

- 強制加入所有 API 文件
- 確保所有 API 返回 JSON 而不是 HTML
- 修復 404 和 500 錯誤
- 修復 manifest.json 401 錯誤" 2>&1
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
echo      - ❌ Error = 構建失敗，請查看日誌
echo.
echo [步驟 2] ⚠️  重要：確認訪問的是生產環境
echo   生產環境 URL：https://coolcool-ten.vercel.app
echo   不要使用預覽環境 URL（包含隨機字串的 URL）
echo   預覽環境可能沒有正確部署或需要認證
echo.
echo [步驟 3] 等待重新部署完成（1-3 分鐘）
echo.
echo [步驟 4] 測試 API
echo   1. 訪問：https://coolcool-ten.vercel.app/api/health
echo     應該看到 JSON 回應
echo   2. 訪問：https://coolcool-ten.vercel.app/admin
echo     嘗試創建表單
echo.
echo ========================================
echo.

pause

