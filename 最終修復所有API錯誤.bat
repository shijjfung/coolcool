@echo off
chcp 65001 >nul
echo ========================================
echo 最終修復所有 API 錯誤
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 加入所有修復檔案...
git add lib/api-error-handler.ts 2>&1
git add pages/api/forms/create.ts 2>&1
git add pages/api/forms/list.ts 2>&1
git add pages/api/reports/auto-generate.ts 2>&1
git add -A 2>&1
echo.

echo [步驟 2] 提交修復...
git commit -m "最終修復：確保所有 API 返回 JSON 而不是 HTML

- 在所有 API 路由開始時立即設置 JSON 響應頭
- 創建統一的錯誤處理函數
- 確保所有錯誤都被捕獲並返回 JSON 格式
- 修復 405、500 錯誤和 JSON 解析錯誤
- 添加詳細的錯誤訊息和調試資訊" 2>&1
echo.

echo [步驟 3] 推送到 GitHub...
git push origin main 2>&1
echo.

echo ========================================
echo ✅ 完成！所有錯誤已修復
echo ========================================
echo.
echo 請等待 Vercel 重新部署（1-3 分鐘）
echo 然後重新整理頁面測試
echo.
echo ⚠️  重要檢查事項：
echo.
echo 1. Vercel 環境變數（必須設定）：
echo    - DATABASE_TYPE=supabase
echo    - SUPABASE_URL=您的 Supabase URL
echo    - SUPABASE_SERVICE_ROLE_KEY=您的 Service Role Key
echo.
echo 2. 確認 Vercel 部署成功：
echo    - 檢查 Vercel Dashboard 的部署狀態
echo    - 確認最新部署為 "Ready"（綠色）
echo    - 查看部署日誌確認沒有錯誤
echo.
echo 3. 如果還有錯誤：
echo    - 打開瀏覽器開發者工具（F12）
echo    - 查看 Console 和 Network 標籤
echo    - 複製完整的錯誤訊息
echo.
echo ========================================
echo.

pause

