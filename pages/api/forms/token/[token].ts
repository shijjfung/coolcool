import type { NextApiRequest, NextApiResponse } from 'next';
import { getFormByToken, ensureDatabaseInitialized } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: '無效的表單代碼' });
    }

    const form = await getFormByToken(token);

    if (!form) {
      return res.status(404).json({ error: '表單不存在' });
    }

    return res.status(200).json(form);
  } catch (error) {
    console.error('取得表單錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}



