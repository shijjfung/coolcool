@echo off
chcp 65001 >nul
echo ========================================
echo 完整程式碼清理與推送
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1] 檢查 Git 狀態...
git status
echo.

echo [步驟 2] 加入所有修改的檔案...
git add -A
echo.

echo [步驟 3] 提交所有清理和修復...
git commit -m "清理: 移除 select 類型相關程式碼、修復類型錯誤、比對資料庫結構

- 移除所有 select 類型相關程式碼
- 修復 TypeScript 類型錯誤
- 清理冗碼和空行
- 確保 SQLite 和 Supabase 資料庫結構一致
- 修復 Facebook API 檔案中的類型錯誤"
echo.

echo [步驟 4] 推送到 GitHub...
git push origin main
echo.

echo ========================================
echo ✅ 完成！
echo ========================================
echo.
echo 📋 已完成的清理項目：
echo   1. ✅ 移除 select 類型相關程式碼
echo   2. ✅ 修復所有 TypeScript 類型錯誤
echo   3. ✅ 清理冗碼和空行
echo   4. ✅ 比對資料庫結構（SQLite 和 Supabase 一致）
echo   5. ✅ 修復 Facebook API 檔案中的類型錯誤
echo.
echo 📊 資料庫結構已比對完成
echo   請在 Supabase Dashboard 執行 supabase-complete-schema.sql
echo.
echo 🚀 Vercel 會自動重新部署
echo ========================================
echo.

pause

