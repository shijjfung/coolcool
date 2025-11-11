@echo off
chcp 65001 >nul
echo ========================================
echo 測試 API 路由
echo ========================================
echo.

echo 正在測試 API 端點...
echo.

echo [測試 1] /api/health
echo 訪問：https://coolcool-ten.vercel.app/api/health
echo.
curl -s https://coolcool-ten.vercel.app/api/health 2>&1
echo.
echo.

echo [測試 2] /api/forms/list
echo 訪問：https://coolcool-ten.vercel.app/api/forms/list
echo.
curl -s https://coolcool-ten.vercel.app/api/forms/list 2>&1
echo.
echo.

echo ========================================
echo 測試完成
echo ========================================
echo.
echo 如果返回 404，可能是：
echo 1. Vercel 路由配置問題
echo 2. 需要清除 Vercel 快取
echo 3. 需要手動觸發重新部署
echo.
echo ========================================
echo.

pause

