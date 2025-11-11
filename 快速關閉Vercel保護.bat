@echo off
chcp 65001 >nul
echo ========================================
echo 快速關閉 Vercel 部署保護
echo ========================================
echo.
echo 您看到的是 Vercel 的部署保護頁面
echo 這不是代碼問題，而是 Vercel 的設定
echo.
echo 請按照以下步驟操作：
echo.
echo [步驟 1] 前往 Vercel Dashboard
echo   1. 訪問 https://vercel.com/dashboard
echo   2. 選擇您的專案
echo.
echo [步驟 2] 關閉部署保護
echo   1. 點擊左側選單的 "Settings"（設定）
echo   2. 滾動到 "Deployment Protection"（部署保護）部分
echo   3. 將保護模式改為 "None" 或 "Off"
echo   4. 點擊 "Save" 保存
echo.
echo [步驟 3] 等待重新部署
echo   Vercel 會自動重新部署（1-3 分鐘）
echo.
echo [步驟 4] 測試 API
echo   訪問：https://coolcool-ten.vercel.app/api/test-db
echo   應該會看到 JSON 回應，不是認證頁面
echo.
echo ========================================
echo.
echo 詳細說明請查看：關閉Vercel部署保護.md
echo.
echo ========================================
echo.

pause

