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
git add -A 2>&1
echo.

echo [步驟 2] 提交修復...
git commit -m "緊急修復：確保所有 API 返回 JSON 而不是 HTML

- 在函數開始時立即設置 JSON 響應頭
- 添加 charset=utf-8 確保正確編碼
- 改進錯誤訊息，提示檢查環境變數
- 確保所有錯誤都返回 JSON 格式" 2>&1
echo.

echo [步驟 3] 推送到 GitHub...
git push origin main 2>&1
echo.

echo ========================================
echo ✅ 代碼已推送！
echo ========================================
echo.
echo ⚠️  重要：接下來必須執行以下步驟
echo.
echo [步驟 4] 確認 Vercel 環境變數已設定
echo.
echo 1. 前往：https://vercel.com/dashboard
echo 2. 選擇您的專案
echo 3. 前往 Settings → Environment Variables
echo 4. 確認以下三個變數都已設定：
echo    - DATABASE_TYPE = supabase
echo    - SUPABASE_URL = https://ceazouzwbvcfwudcbbnk.supabase.co
echo    - SUPABASE_SERVICE_ROLE_KEY = （從 Supabase 複製）
echo 5. 確認每個變數都勾選了 Production 和 Preview
echo.
echo [步驟 5] 等待 Vercel 重新部署
echo.
echo - Vercel 會自動檢測 GitHub 推送並重新部署
echo - 等待 1-3 分鐘
echo - 確認部署狀態為 "Ready"（綠色）
echo.
echo [步驟 6] 測試
echo.
echo 訪問：https://coolcool-ten.vercel.app/api/health
echo 應該返回 JSON，不是 HTML
echo.
echo ========================================
echo.

pause

