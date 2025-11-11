@echo off
chcp 65001 >nul
echo ========================================
echo 最終解決方案
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
git commit -m "最終解決方案：簡化 API 錯誤處理

- 在函數開始時立即設置 JSON 響應頭
- 移除多餘的響應頭檢查
- 確保所有錯誤都返回 JSON
- 修復 manifest.json 使用靜態文件" 2>&1
echo.

echo [步驟 3] 推送到 GitHub...
git push origin main 2>&1
echo.

echo ========================================
echo ✅ 完成！
echo ========================================
echo.
echo ⚠️  重要：請確認以下事項
echo.
echo 1. Vercel 環境變數（必須設定）：
echo    - DATABASE_TYPE=supabase
echo    - SUPABASE_URL=您的 Supabase URL
echo    - SUPABASE_SERVICE_ROLE_KEY=您的 Service Role Key
echo.
echo 2. 等待 Vercel 重新部署（1-3 分鐘）
echo    - 檢查部署狀態是否為 "Ready"（綠色）
echo    - 查看構建日誌確認沒有錯誤
echo.
echo 3. 使用生產環境 URL 測試
echo    - https://coolcool-ten.vercel.app
echo    - 不要使用預覽環境 URL
echo.
echo 4. 如果還是失敗
echo    - 請提供 Vercel 構建日誌
echo    - 請提供 /api/health 的回應內容
echo.
echo ========================================
echo.

pause

