@echo off
chcp 65001 >nul
title 訂單管理系統 - 開發伺服器

REM 切換到專案目錄
cd /d "E:\下單庫存管理"

echo ========================================
echo 訂單管理系統 - 開發伺服器
echo ========================================
echo.
echo 目前目錄：%CD%
echo.
echo 正在啟動開發伺服器...
echo 啟動成功後，請在瀏覽器中開啟：http://localhost:3000
echo.
echo 按 Ctrl+C 可以停止伺服器
echo.
echo ========================================
echo.

REM 使用 cmd 執行，避免 PowerShell 執行原則問題
cmd /c "npm run dev"

pause

