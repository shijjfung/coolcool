import type { NextApiRequest, NextApiResponse } from 'next';
import { getFormById, ensureDatabaseInitialized } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: '無效的表單 ID' });
    }

    const form = await getFormById(Number(id));
    
    if (!form) {
      return res.status(404).json({ error: '表單不存在' });
    }

    return res.status(200).json(form);
  } catch (error: any) {
    console.error('取得表單錯誤:', error);
    return res.status(500).json({ error: error.message || '伺服器錯誤' });
  }
}

