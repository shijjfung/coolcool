import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * 取得客戶端資訊 API
 * GET /api/client-info
 * 
 * 返回客戶端的 IP 地址
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 取得客戶 IP 地址
    const clientIp = 
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';

    return res.status(200).json({
      ip: clientIp,
    });
  } catch (error) {
    console.error('取得客戶端資訊錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}

