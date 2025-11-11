@echo off
chcp 65001 >nul
echo ========================================
echo 複製 SQL 腳本到剪貼簿
echo ========================================
echo.

cd /d "%~dp0"

if not exist "supabase-complete-schema.sql" (
    echo ❌ 找不到 supabase-complete-schema.sql
    pause
    exit /b 1
)

echo 正在複製 supabase-complete-schema.sql 到剪貼簿...
type "supabase-complete-schema.sql" | clip

echo ✅ 已複製到剪貼簿！
echo.
echo 現在您可以：
echo 1. 登入 Supabase Dashboard
echo 2. 進入 SQL Editor → New Query
echo 3. 按 Ctrl+V 貼上
echo 4. 點擊 Run 執行
echo.
echo ========================================
echo.

pause

