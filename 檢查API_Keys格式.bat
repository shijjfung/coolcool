@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
echo ========================================
echo 檢查 Supabase API Keys 格式
echo ========================================
echo.

if not exist ".env.local" (
    echo ❌ .env.local 檔案不存在
    echo 請先使用「互動式設定Supabase.bat」建立檔案
    pause
    exit /b 1
)

set "file_empty=1"
for /f "usebackq delims=" %%a in (".env.local") do (
    set "file_empty=0"
    goto :start_check
)

:start_check
if !file_empty!==1 (
    echo ⚠️  .env.local 檔案是空的
    echo.
    echo 請先使用「互動式設定Supabase.bat」建立檔案並填入設定值
    pause
    exit /b 1
)

echo 正在檢查 .env.local 中的 API Keys 格式...
echo.

set "has_error=0"

for /f "usebackq tokens=1,2 delims==" %%a in (".env.local") do (
    if "%%a"=="NEXT_PUBLIC_SUPABASE_URL" (
        echo [檢查] NEXT_PUBLIC_SUPABASE_URL
        if "%%b"=="" (
            echo ❌ 值為空
            set "has_error=1"
        ) else (
            echo %%b | findstr /R /C:"https://" >nul 2>&1
            if !errorlevel!==0 (
                echo %%b | findstr /R /C:"supabase.co" >nul 2>&1
                if !errorlevel!==0 (
                    echo ✅ 格式正確
                ) else (
                    echo ❌ 格式可能不正確（應該包含 supabase.co）
                    echo    實際值: %%b
                    set "has_error=1"
                )
            ) else (
                echo ❌ 格式可能不正確（應該以 https:// 開頭）
                echo    實際值: %%b
                set "has_error=1"
            )
        )
    )
    
    if "%%a"=="NEXT_PUBLIC_SUPABASE_ANON_KEY" (
        echo [檢查] NEXT_PUBLIC_SUPABASE_ANON_KEY
        if "%%b"=="" (
            echo ❌ 值為空
            set "has_error=1"
        ) else (
            echo %%b | findstr /R "^eyJ" >nul 2>&1
            if !errorlevel!==0 (
                set "anon_len=%%b"
                call :check_length "!anon_len!"
                if !len! GTR 100 (
                    echo ✅ 格式正確（長度: !len! 字符）
                ) else (
                    echo ⚠️  長度可能太短（應該是 200+ 字符）
                )
            ) else (
                echo ❌ 格式不正確（應該以 eyJ 開頭）
                set "has_error=1"
            )
        )
    )
    
    if "%%a"=="SUPABASE_SERVICE_ROLE_KEY" (
        echo [檢查] SUPABASE_SERVICE_ROLE_KEY
        if "%%b"=="" (
            echo ❌ 值為空
            set "has_error=1"
        ) else (
            echo %%b | findstr /R "^eyJ" >nul 2>&1
            if !errorlevel!==0 (
                set "service_len=%%b"
                call :check_length "!service_len!"
                if !len! GTR 100 (
                    echo ✅ 格式正確（長度: !len! 字符）
                ) else (
                    echo ⚠️  長度可能太短（應該是 200+ 字符）
                )
            ) else (
                echo ❌ 格式不正確（應該以 eyJ 開頭）
                set "has_error=1"
            )
        )
    )
)

echo.
echo ========================================
if !has_error!==0 (
    echo ✅ 所有 API Keys 格式檢查通過
    echo.
    echo 下一步：
    echo 1. 在 Vercel Dashboard 設定相同的環境變數
    echo 2. 在 Supabase Dashboard 執行 SQL 腳本
    echo 3. 重新部署 Vercel
) else (
    echo ❌ 發現格式問題，請檢查並修正
    echo.
    echo 提示：
    echo - URL 應該是 https://xxxxx.supabase.co
    echo - Keys 應該以 eyJ 開頭，長度 200+ 字符
)
echo ========================================
echo.

pause
exit /b 0

:check_length
set "str=%~1"
set "len=0"
:count_loop
if defined str (
    set "str=%str:~1%"
    set /a len+=1
    goto count_loop
)
exit /b

