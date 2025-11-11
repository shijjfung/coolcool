@echo off
chcp 65001 >nul
echo ========================================
echo 緊急診斷和修復
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 加入診斷工具...
git add pages/api/test-db.ts 2>&1
git add 診斷雲端API問題.md 2>&1
git add 測試API端點.bat 2>&1
git add -A 2>&1
echo.

echo [步驟 2] 提交診斷工具...
git commit -m "添加 API 診斷工具

- 創建 /api/test-db 端點用於測試資料庫連線
- 添加診斷指南和測試腳本
- 幫助快速定位問題" 2>&1
echo.

echo [步驟 3] 推送到 GitHub...
git push origin main 2>&1
echo.

echo ========================================
echo ✅ 診斷工具已推送
echo ========================================
echo.
echo 請按照以下步驟診斷問題：
echo.
echo [步驟 1] 等待 Vercel 重新部署（1-3 分鐘）
echo.
echo [步驟 2] 測試資料庫連線
echo   在瀏覽器中訪問：
echo   https://您的網址.vercel.app/api/test-db
echo.
echo   應該會看到 JSON 回應，顯示：
echo   - 環境變數設定狀態
echo   - 資料庫連線狀態
echo.
echo [步驟 3] 如果資料庫連線失敗
echo   1. 檢查 Vercel 環境變數設定
echo   2. 檢查 Supabase 資料庫表結構
echo   3. 查看詳細說明：診斷雲端API問題.md
echo.
echo [步驟 4] 測試創建表單 API
echo   執行：測試API端點.bat
echo   按照指引在瀏覽器控制台測試
echo.
echo ========================================
echo.

pause

