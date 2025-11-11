@echo off
chcp 65001 >nul
echo ========================================
echo 檢查 Supabase 環境變數設定
echo ========================================
echo.
echo 重要：Supabase 連線不需要資料庫名稱
echo 只需要 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY
echo.
echo 請按照以下步驟檢查：
echo.
echo [步驟 1] 取得 Supabase 環境變數
echo   1. 前往 https://supabase.com/dashboard
echo   2. 選擇您的專案（訂單管理系統）
echo   3. 前往 Settings ^> API
echo   4. 複製以下資訊：
echo      - Project URL（SUPABASE_URL）
echo      - service_role key（SUPABASE_SERVICE_ROLE_KEY）
echo.
echo [步驟 2] 在 Vercel 中設定環境變數
echo   1. 前往 https://vercel.com/dashboard
echo   2. 選擇您的專案
echo   3. 前往 Settings ^> Environment Variables
echo   4. 添加以下變數：
echo      - DATABASE_TYPE = supabase
echo      - SUPABASE_URL = 您的 Supabase URL
echo      - SUPABASE_SERVICE_ROLE_KEY = 您的 Service Role Key
echo   5. 選擇環境：Production、Preview
echo   6. 點擊 Save
echo.
echo [步驟 3] 等待重新部署
echo   Vercel 會自動重新部署（1-3 分鐘）
echo.
echo [步驟 4] 測試環境變數
echo   訪問：https://coolcool-ten.vercel.app/api/test-db
echo   查看回應中的 environment 部分
echo   應該顯示所有變數都已設定
echo.
echo ========================================
echo.
echo 詳細說明請查看：檢查Supabase環境變數.md
echo.
echo ========================================
echo.

pause

