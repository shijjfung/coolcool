@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
echo ========================================
echo 最終檢查 .env.local 設定
echo ========================================
echo.

cd /d "%~dp0"

if not exist ".env.local" (
    echo ❌ .env.local 檔案不存在
    echo 請先執行「更新env.local.bat」
    pause
    exit /b 1
)

echo 檢查 .env.local 檔案內容...
echo.

set "all_ok=1"

for /f "usebackq tokens=1,2 delims==" %%a in (".env.local") do (
    if "%%a"=="DATABASE_TYPE" (
        if "%%b"=="supabase" (
            echo ✅ DATABASE_TYPE = supabase
        ) else (
            echo ❌ DATABASE_TYPE = %%b （應該是 supabase）
            set "all_ok=0"
        )
    )
    
    if "%%a"=="NEXT_PUBLIC_SUPABASE_URL" (
        if "%%b"=="" (
            echo ❌ NEXT_PUBLIC_SUPABASE_URL 值為空
            set "all_ok=0"
        ) else (
            echo %%b | findstr /C:"https://" >nul 2>&1
            if !errorlevel!==0 (
                echo %%b | findstr /C:"supabase.co" >nul 2>&1
                if !errorlevel!==0 (
                    echo ✅ NEXT_PUBLIC_SUPABASE_URL = %%b
                ) else (
                    echo ❌ NEXT_PUBLIC_SUPABASE_URL 格式不正確（應該包含 supabase.co）
                    set "all_ok=0"
                )
            ) else (
                echo ❌ NEXT_PUBLIC_SUPABASE_URL 格式不正確（應該以 https:// 開頭）
                set "all_ok=0"
            )
        )
    )
    
    if "%%a"=="NEXT_PUBLIC_SUPABASE_ANON_KEY" (
        if "%%b"=="" (
            echo ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 值為空
            set "all_ok=0"
        ) else (
            echo %%b | findstr /R "^eyJ" >nul 2>&1
            if !errorlevel!==0 (
                set "key=%%b"
                set "len=0"
                for /l %%i in (0,1,1000) do (
                    if "!key:~%%i,1!" neq "" set /a len+=1
                )
                if !len! GTR 100 (
                    echo ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY = 已設定（長度: !len! 字符）
                ) else (
                    echo ⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY 長度可能太短（!len! 字符）
                )
            ) else (
                echo ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 格式不正確（應該以 eyJ 開頭）
                set "all_ok=0"
            )
        )
    )
    
    if "%%a"=="SUPABASE_SERVICE_ROLE_KEY" (
        if "%%b"=="" (
            echo ❌ SUPABASE_SERVICE_ROLE_KEY 值為空
            set "all_ok=0"
        ) else (
            echo %%b | findstr /R "^eyJ" >nul 2>&1
            if !errorlevel!==0 (
                set "key=%%b"
                set "len=0"
                for /l %%i in (0,1,1000) do (
                    if "!key:~%%i,1!" neq "" set /a len+=1
                )
                if !len! GTR 100 (
                    echo ✅ SUPABASE_SERVICE_ROLE_KEY = 已設定（長度: !len! 字符）
                ) else (
                    echo ⚠️  SUPABASE_SERVICE_ROLE_KEY 長度可能太短（!len! 字符）
                )
            ) else (
                echo ❌ SUPABASE_SERVICE_ROLE_KEY 格式不正確（應該以 eyJ 開頭）
                set "all_ok=0"
            )
        )
    )
)

echo.
echo ========================================
if !all_ok!==1 (
    echo ✅ 所有設定值都正確！
    echo.
    echo 您的 .env.local 檔案已正確設定
    echo.
    echo 下一步：
    echo 1. 在 Vercel Dashboard 設定相同的環境變數
    echo 2. 在 Supabase Dashboard 執行 SQL 腳本
    echo 3. 重新部署 Vercel
    echo 4. 測試連線（訪問 /api/debug/check-env）
) else (
    echo ❌ 發現設定問題，請檢查並修正
    echo.
    echo 建議執行「更新env.local.bat」重新設定
)
echo ========================================
echo.

pause

