import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllForms, ensureDatabaseInitialized } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const forms = await getAllForms();
    return res.status(200).json(forms);
  } catch (error) {
    console.error('取得表單列表錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}

