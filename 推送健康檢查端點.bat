@echo off
chcp 65001 >nul
echo ========================================
echo 推送健康檢查端點
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 加入健康檢查端點...
git add pages/api/health.ts 2>&1
git add 診斷404錯誤.md 2>&1
git add -A 2>&1
echo.

echo [步驟 2] 提交...
git commit -m "添加健康檢查 API 端點用於診斷 404 錯誤

- 創建 /api/health 端點（最簡單的測試）
- 添加 404 錯誤診斷指南
- 幫助確認 API 路由是否正常工作" 2>&1
echo.

echo [步驟 3] 推送到 GitHub...
git push origin main 2>&1
echo.

echo ========================================
echo ✅ 完成！
echo ========================================
echo.
echo 請按照以下步驟測試：
echo.
echo [步驟 1] 等待 Vercel 重新部署（1-3 分鐘）
echo.
echo [步驟 2] 測試健康檢查端點
echo   訪問：https://coolcool-ten.vercel.app/api/health
echo.
echo   預期結果：
echo   - ✅ 看到 JSON 回應 = API 路由正常
echo   - ❌ 看到 404 = 文件可能沒有正確部署
echo.
echo [步驟 3] 如果還是 404
echo   1. 檢查 Vercel 構建日誌
echo   2. 確認文件已提交到 Git
echo   3. 查看詳細說明：診斷404錯誤.md
echo.
echo ========================================
echo.

pause

