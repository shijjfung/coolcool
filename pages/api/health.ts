import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * 健康檢查 API
 * GET /api/health
 * 
 * 用於確認 API 路由是否正常工作
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    success: true,
    message: 'API 路由正常工作',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
  });
}

