@echo off
chcp 65001 >nul
echo ========================================
echo Supabase 連線問題診斷
echo ========================================
echo.
echo 請按照以下步驟檢查：
echo.
echo [步驟 1] 檢查 Vercel 環境變數
echo   1. 登入 Vercel Dashboard
echo   2. 進入您的專案
echo   3. Settings → Environment Variables
echo   4. 確認以下變數都已設定：
echo      - DATABASE_TYPE = supabase
echo      - NEXT_PUBLIC_SUPABASE_URL
echo      - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo      - SUPABASE_SERVICE_ROLE_KEY
echo.
echo [步驟 2] 檢查 Supabase 資料庫結構
echo   1. 登入 Supabase Dashboard
echo   2. SQL Editor → New Query
echo   3. 執行 supabase-complete-schema.sql
echo.
echo [步驟 3] 測試環境變數
echo   部署完成後，訪問：
echo   https://您的網址.vercel.app/api/debug/check-env
echo.
echo [步驟 4] 重新部署
echo   在 Vercel Dashboard → Deployments → Redeploy
echo.
echo ========================================
echo 詳細說明請查看：Supabase連線檢查與設定指南.md
echo ========================================
echo.

pause

