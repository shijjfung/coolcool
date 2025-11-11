@echo off
chcp 65001 >nul
echo ========================================
echo 更新 .env.local 檔案
echo ========================================
echo.

cd /d "%~dp0"

echo 正在更新 .env.local 檔案...
echo.

(
    echo DATABASE_TYPE=supabase
    echo NEXT_PUBLIC_SUPABASE_URL=https://ceazouzwbvcfwudcbbnk.supabase.co
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYXpvdXp3YnZjZnd1ZGNiYm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2OTU4NjYsImV4cCI6MjA3ODI3MTg2Nn0.0ayBcCJyPFtQbVBqF-nKvKQDmHoVshTpzszQSPVXEb0
    echo SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYXpvdXp3YnZjZnd1ZGNiYm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY5NTg2NiwiZXhwIjoyMDc4MjcxODY2fQ.8faMxUMEjbNUaGTDgkxUr2Rl3BRZEwIxDHuvFSWjd_M
) > .env.local

echo ✅ 已成功更新 .env.local 檔案！
echo.
echo 檔案內容摘要：
echo ----------------------------------------
echo DATABASE_TYPE=supabase
echo NEXT_PUBLIC_SUPABASE_URL=https://ceazouzwbvcfwudcbbnk.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...（已設定，長度約 200+ 字符）
echo SUPABASE_SERVICE_ROLE_KEY=eyJ...（已設定，長度約 200+ 字符）
echo ----------------------------------------
echo.
echo ========================================
echo 下一步操作：
echo ========================================
echo.
echo [1] 驗證設定
echo    執行「驗證env.local設定.bat」檢查設定是否正確
echo.
echo [2] 在 Vercel Dashboard 設定環境變數
echo    - 進入 Vercel Dashboard → 您的專案
echo    - Settings → Environment Variables
echo    - 添加以下 4 個變數（選擇所有環境）：
echo      * DATABASE_TYPE = supabase
echo      * NEXT_PUBLIC_SUPABASE_URL = https://ceazouzwbvcfwudcbbnk.supabase.co
echo      * NEXT_PUBLIC_SUPABASE_ANON_KEY = （從 .env.local 複製）
echo      * SUPABASE_SERVICE_ROLE_KEY = （從 .env.local 複製）
echo.
echo [3] 在 Supabase Dashboard 執行 SQL 腳本
echo    - 登入 https://app.supabase.com
echo    - 選擇您的專案
echo    - SQL Editor → New Query
echo    - 使用「互動式設定Supabase.bat」選項 [4] 複製 SQL 腳本
echo    - 貼上並執行
echo.
echo [4] 重新部署 Vercel
echo    - 在 Vercel Dashboard → Deployments
echo    - 點擊最新部署的「⋯」→ Redeploy
echo.
echo [5] 測試連線
echo    - 部署完成後訪問：https://您的網址.vercel.app/api/debug/check-env
echo.
echo ========================================
echo.

pause

