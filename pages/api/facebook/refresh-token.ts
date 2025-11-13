import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Facebook Token 刷新 API
 * POST /api/facebook/refresh-token
 * 
 * 刷新 Facebook Access Token，延長有效期 60 天
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const currentToken = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!appId || !appSecret) {
      return res.status(400).json({
        error: '缺少 Facebook App ID 或 App Secret',
        hint: '請在環境變數中設定 FACEBOOK_APP_ID 和 FACEBOOK_APP_SECRET',
      });
    }

    if (!currentToken) {
      return res.status(400).json({
        error: '缺少 Facebook Access Token',
        hint: '請在環境變數中設定 FACEBOOK_ACCESS_TOKEN',
      });
    }

    // 使用 Facebook API 刷新 Token
    const refreshUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${currentToken}`;

    const response = await fetch(refreshUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook Token 刷新錯誤:', errorText);
      return res.status(response.status).json({
        error: '刷新 Token 失敗',
        details: errorText,
        hint: '請檢查 Token 是否有效，或是否已過期',
      });
    }

    const data = await response.json();

    if (!data.access_token) {
      return res.status(500).json({
        error: '刷新 Token 失敗',
        details: 'Facebook API 未返回新的 Token',
      });
    }

    const newToken = data.access_token;
    const expiresIn = data.expires_in || 5184000; // 預設 60 天（秒）
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return res.status(200).json({
      success: true,
      access_token: newToken,
      expires_in: expiresIn,
      expires_at: expiresAt.toISOString(),
      message: 'Token 已成功刷新',
      hint: '請將新的 Token 更新到環境變數 FACEBOOK_ACCESS_TOKEN',
    });
  } catch (error: any) {
    console.error('刷新 Facebook Token 錯誤:', error);
    return res.status(500).json({
      error: '伺服器錯誤',
      details: error.message,
    });
  }
}

