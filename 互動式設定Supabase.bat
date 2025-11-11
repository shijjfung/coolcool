
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo Supabase 互動式設定助手
echo ========================================
echo.

cd /d "%~dp0"

:MAIN_MENU
cls
echo ========================================
echo Supabase 互動式設定助手
echo ========================================
echo.
echo 目前狀態：
if exist ".env.local" (
    echo ✅ .env.local 檔案存在
    findstr /C:"DATABASE_TYPE" .env.local >nul 2>&1
    if !errorlevel!==0 (
        echo ✅ DATABASE_TYPE 已設定
    ) else (
        echo ❌ DATABASE_TYPE 未設定
    )
    findstr /C:"NEXT_PUBLIC_SUPABASE_URL" .env.local >nul 2>&1
    if !errorlevel!==0 (
        echo ✅ NEXT_PUBLIC_SUPABASE_URL 已設定
    ) else (
        echo ❌ NEXT_PUBLIC_SUPABASE_URL 未設定
    )
    findstr /C:"NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local >nul 2>&1
    if !errorlevel!==0 (
        echo ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY 已設定
    ) else (
        echo ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 未設定
    )
    findstr /C:"SUPABASE_SERVICE_ROLE_KEY" .env.local >nul 2>&1
    if !errorlevel!==0 (
        echo ✅ SUPABASE_SERVICE_ROLE_KEY 已設定
    ) else (
        echo ❌ SUPABASE_SERVICE_ROLE_KEY 未設定
    )
) else (
    echo ❌ .env.local 檔案不存在
)
echo.
echo ========================================
echo 請選擇操作：
echo.
echo [1] 建立/編輯 .env.local 檔案
echo [2] 查看 .env.local 內容（隱藏敏感資訊）
echo [3] 取得 Supabase 設定值的指引
echo [4] 複製 SQL 腳本到剪貼簿
echo [5] 檢查必要檔案
echo [6] 檢查 API Keys 格式
echo [0] 退出
echo.
set /p choice="請輸入選項 (0-6): "

if "%choice%"=="1" goto SETUP_ENV
if "%choice%"=="2" goto VIEW_ENV
if "%choice%"=="3" goto SHOW_GUIDE
if "%choice%"=="4" goto COPY_SQL
if "%choice%"=="5" goto CHECK_FILES
if "%choice%"=="6" goto CHECK_KEYS
if "%choice%"=="0" goto END
goto MAIN_MENU

:SETUP_ENV
cls
echo ========================================
echo 建立/編輯 .env.local 檔案
echo ========================================
echo.

if exist ".env.local" (
    echo 發現現有的 .env.local 檔案
    echo.
    set /p overwrite="是否要重新設定？(Y/N): "
    if /i not "%overwrite%"=="Y" (
        goto MAIN_MENU
    )
)

echo.
echo 請輸入您的 Supabase 設定值：
echo.
echo [提示] 這些值可以在以下位置取得：
echo   https://app.supabase.com → 選擇專案 → Settings → API
echo.

set /p supabase_url="請輸入 NEXT_PUBLIC_SUPABASE_URL: "
if "%supabase_url%"=="" (
    echo ❌ URL 不能為空
    pause
    goto SETUP_ENV
)

echo.
echo 您是否已經有 API Keys？
set /p has_keys="(Y/N，如果選 N 會提示您輸入): "
if /i "%has_keys%"=="Y" (
    echo.
    echo 請貼上您的 anon public key（以 eyJ 開頭）：
    set /p supabase_anon_key="NEXT_PUBLIC_SUPABASE_ANON_KEY: "
    if "%supabase_anon_key%"=="" (
        echo ❌ Anon Key 不能為空
        pause
        goto SETUP_ENV
    )
    echo.
    echo 請貼上您的 service_role key（以 eyJ 開頭）：
    set /p supabase_service_key="SUPABASE_SERVICE_ROLE_KEY: "
    if "%supabase_service_key%"=="" (
        echo ❌ Service Role Key 不能為空
        pause
        goto SETUP_ENV
    )
) else (
    echo.
    echo 請輸入您的 API Keys：
    set /p supabase_anon_key="請輸入 NEXT_PUBLIC_SUPABASE_ANON_KEY: "
    if "%supabase_anon_key%"=="" (
        echo ❌ Anon Key 不能為空
        pause
        goto SETUP_ENV
    )
    
    set /p supabase_service_key="請輸入 SUPABASE_SERVICE_ROLE_KEY: "
    if "%supabase_service_key%"=="" (
        echo ❌ Service Role Key 不能為空
        pause
        goto SETUP_ENV
    )
)

echo.
echo 正在建立 .env.local 檔案...

(
    echo DATABASE_TYPE=supabase
    echo NEXT_PUBLIC_SUPABASE_URL=%supabase_url%
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=%supabase_anon_key%
    echo SUPABASE_SERVICE_ROLE_KEY=%supabase_service_key%
) > .env.local

echo.
echo ✅ 已成功建立 .env.local 檔案！
echo.
echo ⚠️  重要提醒：
echo    1. 這個檔案只適用於本地開發測試
echo    2. 您還需要在 Vercel Dashboard 設定相同的環境變數
echo    3. 請不要將 .env.local 提交到 Git
echo.
pause
goto MAIN_MENU

:VIEW_ENV
cls
echo ========================================
echo 查看 .env.local 內容（隱藏敏感資訊）
echo ========================================
echo.

if not exist ".env.local" (
    echo ❌ .env.local 檔案不存在
    echo.
    echo 請選擇 [1] 建立 .env.local 檔案
    pause
    goto MAIN_MENU
)

set "file_empty=1"
for /f "usebackq delims=" %%a in (".env.local") do (
    set "file_empty=0"
    goto :check_content
)

:check_content
if !file_empty!==1 (
    echo ⚠️  .env.local 檔案是空的
    echo.
    echo 請選擇 [1] 建立/編輯 .env.local 檔案
    pause
    goto MAIN_MENU
)

echo 檔案內容：
echo ----------------------------------------
for /f "usebackq tokens=1,2 delims==" %%a in (".env.local") do (
    if "%%a"=="DATABASE_TYPE" (
        echo DATABASE_TYPE=%%b
    ) else if "%%a"=="NEXT_PUBLIC_SUPABASE_URL" (
        set "url=%%b"
        echo NEXT_PUBLIC_SUPABASE_URL=!url:~0,30!...
    ) else if "%%a"=="NEXT_PUBLIC_SUPABASE_ANON_KEY" (
        set "key=%%b"
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=!key:~0,20!...（已隱藏）
    ) else if "%%a"=="SUPABASE_SERVICE_ROLE_KEY" (
        set "key=%%b"
        echo SUPABASE_SERVICE_ROLE_KEY=!key:~0,20!...（已隱藏）
    ) else (
        echo %%a=%%b
    )
)
echo ----------------------------------------
echo.
pause
goto MAIN_MENU

:SHOW_GUIDE
cls
echo ========================================
echo 如何取得 Supabase 設定值
echo ========================================
echo.
echo [步驟 1] 登入 Supabase Dashboard
echo   https://app.supabase.com
echo.
echo [步驟 2] 選擇您的專案（或建立新專案）
echo.
echo [步驟 3] 點擊左側選單的「Settings」
echo.
echo [步驟 4] 點擊「API」
echo.
echo [步驟 5] 在「Project URL」區塊：
echo   - 複製「Project URL」→ 這是 NEXT_PUBLIC_SUPABASE_URL
echo   - 格式：https://xxxxx.supabase.co
echo.
echo [步驟 6] 在「Project API keys」區塊：
echo   - 複製「anon public」key → 這是 NEXT_PUBLIC_SUPABASE_ANON_KEY
echo     以 eyJ 開頭，長度約 200+ 字符
echo.
echo   - 複製「service_role」key → 這是 SUPABASE_SERVICE_ROLE_KEY
echo     以 eyJ 開頭，長度約 200+ 字符
echo     注意：service_role key 有完整權限，請保密！
echo.
echo [提示]
echo   - 每個 key 旁邊通常有複製按鈕
echo   - 或手動選擇整個字串後按 Ctrl+C 複製
echo   - 確認複製完整（key 很長，不要遺漏）
echo.
echo ========================================
echo.
echo 取得值後，請回到主選單選擇 [1] 建立 .env.local 檔案
echo.
echo 建立完成後，可以使用選項 [6] 檢查格式
echo.
set /p open_guide="是否要開啟詳細指引檔案？(Y/N): "
if /i "%open_guide%"=="Y" (
    if exist "Supabase_API_Keys取得詳細指引.md" (
        start "" "Supabase_API_Keys取得詳細指引.md"
    ) else (
        echo 詳細指引檔案不存在
    )
)
echo.
pause
goto MAIN_MENU

:COPY_SQL
cls
echo ========================================
echo 複製 SQL 腳本到剪貼簿
echo ========================================
echo.

if not exist "supabase-complete-schema.sql" (
    echo ❌ 找不到 supabase-complete-schema.sql
    pause
    goto MAIN_MENU
)

type "supabase-complete-schema.sql" | clip
echo ✅ 已複製 supabase-complete-schema.sql 到剪貼簿！
echo.
echo 現在您可以：
echo 1. 登入 Supabase Dashboard
echo 2. 進入 SQL Editor → New Query
echo 3. 按 Ctrl+V 貼上
echo 4. 點擊 Run 執行
echo.
pause
goto MAIN_MENU

:CHECK_FILES
cls
echo ========================================
echo 檢查必要檔案
echo ========================================
echo.

set "all_ok=1"

if exist "supabase-complete-schema.sql" (
    echo ✅ supabase-complete-schema.sql
) else (
    echo ❌ supabase-complete-schema.sql 不存在
    set "all_ok=0"
)

if exist "lib\supabase.ts" (
    echo ✅ lib\supabase.ts
) else (
    echo ❌ lib\supabase.ts 不存在
    set "all_ok=0"
)

if exist "lib\db-supabase.ts" (
    echo ✅ lib\db-supabase.ts
) else (
    echo ❌ lib\db-supabase.ts 不存在
    set "all_ok=0"
)

if exist "pages\api\debug\check-env.ts" (
    echo ✅ pages\api\debug\check-env.ts
) else (
    echo ❌ pages\api\debug\check-env.ts 不存在
    set "all_ok=0"
)

echo.
if %all_ok%==1 (
    echo ✅ 所有必要檔案都存在！
    echo.
    echo 檔案位置確認：
    echo - 當前目錄: %CD%
    echo - supabase-complete-schema.sql: 
    if exist "supabase-complete-schema.sql" (
        echo   完整路徑: %CD%\supabase-complete-schema.sql
    ) else (
        echo   檔案不存在
    )
) else (
    echo ❌ 有檔案缺失，請檢查
    echo.
    echo 當前目錄: %CD%
    echo 請確認您在專案根目錄執行此批次檔
)
echo.
pause
goto MAIN_MENU

:CHECK_KEYS
cls
if exist "檢查API_Keys格式.bat" (
    call "檢查API_Keys格式.bat"
) else (
    echo ❌ 找不到「檢查API_Keys格式.bat」檔案
    echo.
    echo 請確認檔案存在於專案根目錄
    pause
)
goto MAIN_MENU

:END
echo.
echo 感謝使用！
echo.
pause
exit /b 0

