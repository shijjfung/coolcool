import type { NextApiRequest, NextApiResponse } from 'next';
import { getDeletedForms, ensureDatabaseInitialized } from '@/lib/db';

/**
 * 取得垃圾桶中的表單列表
 * GET /api/forms/trash
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const forms = await getDeletedForms();
    return res.status(200).json(forms);
  } catch (error) {
    console.error('取得垃圾桶表單錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}



