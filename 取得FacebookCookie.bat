@echo off
chcp 65001 >nul
echo ========================================
echo   Facebook Cookie 取得工具
echo ========================================
echo.

REM 檢查 Node.js 是否安裝
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [錯誤] 未找到 Node.js，請先安裝 Node.js
    echo 下載網址：https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] 檢查環境變數...
if "%FACEBOOK_EMAIL%"=="" (
    echo.
    echo 請輸入您的 Facebook 帳號資訊：
    set /p FACEBOOK_EMAIL="Facebook 帳號（Email 或電話）："
    set /p FACEBOOK_PASSWORD="Facebook 密碼："
    echo.
) else (
    echo 使用環境變數中的帳號資訊
    echo.
)

if "%FACEBOOK_EMAIL%"=="" (
    echo [錯誤] 未提供 Facebook 帳號
    pause
    exit /b 1
)

if "%FACEBOOK_PASSWORD%"=="" (
    echo [錯誤] 未提供 Facebook 密碼
    pause
    exit /b 1
)

echo [2/3] 啟動 Puppeteer 取得 Cookie...
echo 注意：這會開啟瀏覽器視窗，請在瀏覽器中完成登入
echo.

REM 建立臨時腳本
set TEMP_SCRIPT=%TEMP%\get-cookies-%RANDOM%.js
(
echo const { getFacebookCookies } = require('./lib/facebook-puppeteer'^);
echo.
echo async function main(^) {
echo   const email = process.env.FACEBOOK_EMAIL;
echo   const password = process.env.FACEBOOK_PASSWORD;
echo.
echo   if (!email ^|^| !password^) {
echo     console.error('請設定 FACEBOOK_EMAIL 和 FACEBOOK_PASSWORD 環境變數'^);
echo     process.exit(1^);
echo   }
echo.
echo   try {
echo     const cookies = await getFacebookCookies(email, password^);
echo     console.log('\n========================================'^);
echo     console.log('✅ Cookie 取得成功！'^);
echo     console.log('========================================\n'^);
echo     console.log('請將以下內容複製到環境變數 FACEBOOK_COOKIES：\n'^);
echo     console.log(cookies^);
echo     console.log('\n========================================\n'^);
echo   } catch (error^) {
echo     console.error('❌ 取得 Cookie 失敗:', error.message^);
echo     process.exit(1^);
echo   }
echo }
echo.
echo main(^);
) > "%TEMP_SCRIPT%"

REM 執行腳本
set FACEBOOK_EMAIL=%FACEBOOK_EMAIL%
set FACEBOOK_PASSWORD=%FACEBOOK_PASSWORD%
node "%TEMP_SCRIPT%"

REM 清理臨時檔案
del "%TEMP_SCRIPT%" >nul 2>&1

echo.
echo [3/3] 完成！
echo.
echo 下一步：
echo 1. 複製上面顯示的 Cookie JSON 字串
echo 2. 將它保存到 .env.local 檔案中的 FACEBOOK_COOKIES 變數
echo 3. 或執行「設定Cookie環境變數.bat」來自動設定
echo.
pause

