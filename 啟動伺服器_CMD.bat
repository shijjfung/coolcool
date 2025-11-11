@echo off
chcp 65001 >nul
title 訂單管理系統 - 開發伺服器 (CMD)
color 0A

echo ========================================
echo   訂單管理系統 - 開發伺服器啟動
echo ========================================
echo.

cd /d "%~dp0"

echo 正在啟動開發伺服器...
echo 請稍候...
echo.

REM 使用 cmd 執行 npm（避免 PowerShell 執行原則問題）
call npm.cmd run dev

if errorlevel 1 (
    echo.
    echo 啟動失敗！請檢查錯誤訊息。
    pause
)


