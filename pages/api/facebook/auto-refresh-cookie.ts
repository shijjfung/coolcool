import type { NextApiRequest, NextApiResponse } from 'next';
import { getFacebookCookies } from '@/lib/facebook-puppeteer';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Facebook Cookie 自動刷新 API
 * POST /api/facebook/auto-refresh-cookie
 * 
 * 功能：
 * 1. 檢查現有 Cookie 是否過期
 * 2. 如果過期，使用帳號密碼自動重新取得 Cookie
 * 3. 自動更新 .env.local 檔案
 * 
 * 使用方式：
 * 1. 設定環境變數：FACEBOOK_EMAIL 和 FACEBOOK_PASSWORD
 * 2. 設定定時任務（Cron Job）定期呼叫此 API
 * 3. 建議每週執行一次檢查
 */

interface CookieInfo {
  expires?: number;
  expirationDate?: number;
  name: string;
  value: string;
}

/**
 * 檢查 Cookie 是否過期
 */
function isCookieExpired(cookies: string): boolean {
  try {
    const cookieArray: CookieInfo[] = JSON.parse(cookies);
    const now = Math.floor(Date.now() / 1000); // 當前時間（秒）
    
    // 檢查所有 Cookie 的過期時間
    for (const cookie of cookieArray) {
      const expires = cookie.expires || cookie.expirationDate;
      
      if (expires) {
        // 如果任何一個重要 Cookie 過期，就認為整個 Cookie 過期
        // 重要 Cookie：c_user, xs
        if ((cookie.name === 'c_user' || cookie.name === 'xs') && expires < now) {
          console.log(`[Cookie] Cookie ${cookie.name} 已過期（過期時間：${new Date(expires * 1000).toLocaleString('zh-TW')}）`);
          return true;
        }
        
        // 如果過期時間在 7 天內，也認為需要更新
        const daysUntilExpiry = (expires - now) / (24 * 60 * 60);
        if (daysUntilExpiry < 7) {
          console.log(`[Cookie] Cookie ${cookie.name} 將在 ${Math.floor(daysUntilExpiry)} 天後過期`);
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('[Cookie] 檢查 Cookie 過期狀態時發生錯誤:', error);
    // 如果無法解析，認為需要更新
    return true;
  }
}

/**
 * 更新 .env.local 檔案中的 Cookie
 */
function updateEnvFile(newCookiesJson: string): boolean {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    let content = '';
    
    // 讀取現有檔案
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf-8');
    }
    
    // 移除舊的 FACEBOOK_COOKIES
    content = content.replace(/^FACEBOOK_COOKIES=.*$/gm, '');
    content = content.replace(/^# Facebook Cookie.*$/gm, '');
    
    // 清理多餘空行
    content = content.replace(/\n{3,}/g, '\n\n');
    content = content.trim();
    
    // 添加新的 Cookie（newCookiesJson 已經是 JSON 字串，直接使用）
    if (content && !content.endsWith('\n')) {
      content += '\n';
    }
    content += '\n# Facebook Cookie for Puppeteer (自動更新)\n';
    // 注意：newCookiesJson 已經是 JSON 字串，不需要再次 JSON.stringify
    // 但需要確保格式正確（移除換行，變成單行）
    const singleLineCookies = newCookiesJson.replace(/\s+/g, ' ').trim();
    content += `FACEBOOK_COOKIES=${singleLineCookies}\n`;
    content += 'FACEBOOK_USE_PUPPETEER=true\n';
    
    // 寫入檔案
    fs.writeFileSync(envPath, content, 'utf-8');
    
    console.log('[Cookie] ✅ 已更新 .env.local 檔案');
    return true;
  } catch (error) {
    console.error('[Cookie] 更新 .env.local 檔案時發生錯誤:', error);
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 驗證請求來源（建議設定 CRON_SECRET）
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 取得帳號密碼（從環境變數或請求 body）
    const email = process.env.FACEBOOK_EMAIL || req.body.email;
    const password = process.env.FACEBOOK_PASSWORD || req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        error: '缺少必要參數',
        hint: '請設定環境變數 FACEBOOK_EMAIL 和 FACEBOOK_PASSWORD，或在請求 body 中提供',
        solution: '在 .env.local 中設定：FACEBOOK_EMAIL=your-email@example.com 和 FACEBOOK_PASSWORD=your-password',
      });
    }

    // 檢查現有 Cookie 是否過期
    const currentCookies = process.env.FACEBOOK_COOKIES;
    let needsRefresh = true;

    if (currentCookies) {
      console.log('[Cookie] 檢查現有 Cookie 是否過期...');
      needsRefresh = isCookieExpired(currentCookies);
      
      if (!needsRefresh) {
        console.log('[Cookie] ✅ Cookie 仍然有效，無需更新');
        return res.status(200).json({
          success: true,
          message: 'Cookie 仍然有效，無需更新',
          refreshed: false,
        });
      }
      
      console.log('[Cookie] ⚠️ Cookie 已過期或即將過期，需要更新');
    } else {
      console.log('[Cookie] 未找到現有 Cookie，開始取得新 Cookie...');
    }

    // 使用 Puppeteer 取得新 Cookie
    console.log('[Cookie] 開始使用 Puppeteer 取得新 Cookie...');
    const newCookiesJson = await getFacebookCookies(email, password);

    if (!newCookiesJson || newCookiesJson.trim().length === 0) {
      return res.status(500).json({
        error: '取得 Cookie 失敗',
        hint: '請檢查帳號密碼是否正確，或是否需要處理驗證碼',
      });
    }

    // getFacebookCookies 已經返回 JSON 字串，直接使用
    // 更新 .env.local 檔案
    const updateSuccess = updateEnvFile(newCookiesJson);

    if (!updateSuccess) {
      return res.status(500).json({
        error: '更新環境變數檔案失敗',
        cookies: newCookiesJson, // 返回 Cookie，讓用戶手動更新
        hint: '請手動將 Cookie 更新到 .env.local 檔案中',
      });
    }

    // 更新環境變數（當前進程）
    process.env.FACEBOOK_COOKIES = newCookiesJson;

    console.log('[Cookie] ✅ Cookie 已成功更新');

    return res.status(200).json({
      success: true,
      message: 'Cookie 已成功更新',
      refreshed: true,
      hint: '請重新啟動開發伺服器以載入新的 Cookie',
      warning: '⚠️ 請妥善保管 Cookie，不要洩露給他人',
    });
  } catch (error: any) {
    console.error('[Cookie] 自動刷新 Cookie 錯誤:', error);
    return res.status(500).json({
      error: '自動刷新 Cookie 失敗',
      details: error.message,
      hint: '請檢查帳號密碼是否正確，或是否需要處理驗證碼',
    });
  }
}

