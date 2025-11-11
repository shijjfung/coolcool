@echo off
chcp 65001 >nul
echo ========================================
echo 快速清理 Vercel 舊部署指引
echo ========================================
echo.
echo 這個批次檔會指引您如何清理 Vercel 上的舊部署
echo.
echo ========================================
echo 步驟 1：登入 Vercel Dashboard
echo ========================================
echo.
echo 1. 打開瀏覽器
echo 2. 訪問：https://vercel.com/dashboard
echo 3. 登入您的帳號
echo.
pause

echo.
echo ========================================
echo 步驟 2：選擇專案
echo ========================================
echo.
echo 1. 找到您的專案（例如：coolcool-ten）
echo 2. 點擊進入專案詳情頁
echo.
pause

echo.
echo ========================================
echo 步驟 3：查看部署歷史
echo ========================================
echo.
echo 1. 點擊頂部選單的 "Deployments" 標籤
echo 2. 您會看到所有部署歷史記錄
echo.
pause

echo.
echo ========================================
echo 步驟 4：刪除舊部署
echo ========================================
echo.
echo 可以安全刪除的部署：
echo ✅ 所有失敗的部署（Status: Error）
echo ✅ 超過 30 天的舊部署
echo ✅ Preview 部署（如果不需要）
echo.
echo 不要刪除的部署：
echo ❌ 當前正在運行的部署（標記為 Production）
echo ❌ 最新的成功部署
echo.
echo 刪除方法：
echo 1. 找到要刪除的部署
echo 2. 點擊右側的 "⋯"（三個點）選單
echo 3. 選擇 "Delete" 或 "刪除"
echo 4. 確認刪除
echo.
pause

echo.
echo ========================================
echo 步驟 5：確認清理完成
echo ========================================
echo.
echo 清理後，您應該：
echo ✅ 保留最新的成功部署（Production）
echo ✅ 保留最近 3-5 個成功部署
echo ✅ 刪除所有失敗的部署
echo.
echo ========================================
echo 完成！
echo ========================================
echo.
echo 刪除舊部署不會影響：
echo ✅ 當前正在運行的應用程式
echo ✅ 資料庫資料
echo ✅ 環境變數設定
echo ✅ 網域設定
echo.
pause

