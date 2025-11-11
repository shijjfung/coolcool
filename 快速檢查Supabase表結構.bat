@echo off
chcp 65001 >nul
echo ========================================
echo 快速檢查 Supabase 資料庫表結構
echo ========================================
echo.
echo 這個批次檔會幫您檢查 Supabase 資料庫表結構
echo.
echo 請按照以下步驟操作：
echo.
echo [步驟 1] 開啟 Supabase Dashboard
echo   1. 前往 https://supabase.com/dashboard
echo   2. 登入您的帳號
echo   3. 選擇您的專案
echo.
echo [步驟 2] 檢查表是否存在
echo   1. 在左側選單中，點擊 "Table Editor"（表編輯器）
echo   2. 檢查是否看到以下表：
echo      - forms（表單設定表）
echo      - orders（訂單表）
echo      - settings（系統設定表）
echo      - reserved_orders（保留訂單表，可選）
echo.
echo [步驟 3] 檢查 orders 表的 items_summary 欄位
echo   1. 點擊 "orders" 表
echo   2. 檢查是否有 "items_summary" 欄位
echo      （類型應該是 jsonb）
echo.
echo [步驟 4] 如果缺少表或欄位
echo   1. 在左側選單中，點擊 "SQL Editor"
echo   2. 點擊 "New query"（新查詢）
echo   3. 打開專案中的 supabase-complete-schema.sql 檔案
echo   4. 複製整個檔案內容
echo   5. 貼到 SQL Editor 中
echo   6. 點擊 "Run"（執行）按鈕
echo.
echo ========================================
echo.
echo 詳細說明請查看：檢查Supabase資料庫表結構.md
echo.
echo ========================================
echo.

pause

