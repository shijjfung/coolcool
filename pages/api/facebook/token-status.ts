import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Facebook Token 狀態檢查 API
 * GET /api/facebook/token-status
 * 
 * 檢查 Facebook Access Token 的狀態和有效期
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!token) {
      return res.status(200).json({
        configured: false,
        message: '未設定 Facebook Access Token',
      });
    }

    // 使用 Facebook API 檢查 Token 狀態
    const debugUrl = `https://graph.facebook.com/v18.0/debug_token?input_token=${token}&access_token=${token}`;

    const response = await fetch(debugUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(200).json({
        configured: true,
        valid: false,
        message: 'Token 無效或已過期',
        error: '無法驗證 Token',
      });
    }

    const data = await response.json();

    if (data.data && data.data.is_valid) {
      const expiresAt = data.data.expires_at 
        ? new Date(data.data.expires_at * 1000)
        : null;
      const now = new Date();
      const daysRemaining = expiresAt 
        ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return res.status(200).json({
        configured: true,
        valid: true,
        expires_at: expiresAt?.toISOString() || null,
        days_remaining: daysRemaining,
        scopes: data.data.scopes || [],
        app_id: data.data.app_id,
        user_id: data.data.user_id,
        message: daysRemaining !== null 
          ? `Token 有效，剩餘 ${daysRemaining} 天`
          : 'Token 有效',
      });
    } else {
      return res.status(200).json({
        configured: true,
        valid: false,
        message: 'Token 無效',
        error: data.data?.error?.message || '未知錯誤',
      });
    }
  } catch (error: any) {
    console.error('檢查 Facebook Token 狀態錯誤:', error);
    return res.status(500).json({
      error: '伺服器錯誤',
      details: error.message,
    });
  }
}

