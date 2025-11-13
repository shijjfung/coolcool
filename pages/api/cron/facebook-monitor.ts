import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Facebook 自動監控定時任務
 * 每 3 分鐘自動掃描一次 Facebook 留言
 * 
 * 使用方式：
 * 1. 在 Vercel Cron Jobs 中設定：每 3 分鐘執行一次 (cron 表達式: 每 3 分鐘)
 * 2. 或在其他定時任務服務中呼叫此 API
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 驗證請求來源（可選，增加安全性）
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 呼叫 Facebook 留言掃描 API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                    'http://localhost:3000';
    
    const scanResponse = await fetch(`${baseUrl}/api/facebook/scan-comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const scanData = await scanResponse.json();

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      scanResult: scanData,
    });
  } catch (error: any) {
    console.error('Facebook 監控定時任務錯誤:', error);
    return res.status(500).json({
      error: '定時任務執行失敗',
      details: error.message,
    });
  }
}


