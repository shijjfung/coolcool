@echo off
chcp 65001 >nul
echo ========================================
echo 緊急修復 API 返回 HTML 問題
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 加入所有修復的 API 文件...
git add pages/api/forms/create.ts 2>&1
git add pages/api/forms/list.ts 2>&1
git add pages/api/reports/auto-generate.ts 2>&1
git add pages/_app.tsx 2>&1
git add -A 2>&1
echo.

echo [步驟 2] 提交修復...
git commit -m "緊急修復：確保所有 API 返回 JSON 而不是 HTML

- 在所有返回語句前檢查並設置 JSON 響應頭
- 確保每個錯誤處理都設置響應頭
- 修復 manifest.json 使用靜態文件
- 添加 Cache-Control 標頭
- 確保所有錯誤都返回 JSON 格式" 2>&1
echo.

echo [步驟 3] 推送到 GitHub...
git push origin main 2>&1
echo.

echo ========================================
echo ✅ 完成！
echo ========================================
echo.
echo 請按照以下步驟檢查：
echo.
echo [步驟 1] 等待 Vercel 重新部署（1-3 分鐘）
echo   檢查部署狀態是否為 "Ready"（綠色）
echo.
echo [步驟 2] 確認使用生產環境 URL
echo   使用：https://coolcool-ten.vercel.app
echo   不要使用預覽環境 URL
echo.
echo [步驟 3] 測試 API
echo   1. 訪問：https://coolcool-ten.vercel.app/api/health
echo     應該看到 JSON 回應
echo   2. 訪問：https://coolcool-ten.vercel.app/admin
echo     嘗試創建表單
echo.
echo [步驟 4] 如果還是失敗
echo   請檢查 Vercel 構建日誌
echo   確認沒有構建錯誤
echo.
echo ========================================
echo.

pause

