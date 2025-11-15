import type { NextApiRequest, NextApiResponse } from 'next';
import { getFacebookCookies } from '@/lib/facebook-puppeteer';

/**
 * Facebook Cookie 取得 API
 * POST /api/facebook/get-cookies
 * 
 * 使用 Puppeteer 登入 Facebook 並取得 Cookie
 * 這些 Cookie 可以用於後續的自動化操作
 * 
 * 注意：此 API 需要提供 Facebook 帳號密碼，請確保在安全環境下使用
 */
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: '缺少必要參數',
        hint: '請提供 email 和 password',
      });
    }

    console.log('[Facebook] 開始取得 Cookie...');
    
    // 注意：在生產環境中，建議不要直接傳遞密碼
    // 更好的做法是：在本地執行一次取得 Cookie，然後將 Cookie 保存到環境變數
    const cookies = await getFacebookCookies(email, password);

    return res.status(200).json({
      success: true,
      message: '已成功取得 Facebook Cookie',
      cookies: cookies,
      hint: '請將 cookies 內容保存到環境變數 FACEBOOK_COOKIES 中',
      warning: '⚠️ 請妥善保管 Cookie，不要洩露給他人',
    });
  } catch (error: any) {
    console.error('取得 Facebook Cookie 錯誤:', error);
    return res.status(500).json({
      error: '取得 Cookie 失敗',
      details: error.message,
      hint: '請檢查帳號密碼是否正確，或是否需要處理驗證碼',
    });
  }
}

