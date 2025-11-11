import type { NextApiRequest, NextApiResponse } from 'next';
import { cleanupExpiredReservations, ensureDatabaseInitialized } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await cleanupExpiredReservations();
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('清理過期保留錯誤:', error);
    return res.status(500).json({ error: error.message || '伺服器錯誤' });
  }
}

