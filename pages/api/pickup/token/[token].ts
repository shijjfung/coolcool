import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ensureDatabaseInitialized,
  getOutstandingPickupsByToken,
  PickupStatusFilter,
} from '@/lib/db';

const parseStatus = (value: any): PickupStatusFilter => {
  if (value === 'picked') return 'picked';
  if (value === 'all') return 'all';
  return 'pending';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ success: false, error: '缺少取貨憑證代碼' });
  }

  const statusFilter = parseStatus(req.query.status);

  try {
    await ensureDatabaseInitialized();
    const result = await getOutstandingPickupsByToken(token.trim(), statusFilter);
    if (!result) {
      return res.status(404).json({ success: false, error: '取貨憑證不存在或已過期' });
    }

    return res.status(200).json({
      success: true,
      token: result.token,
      name: result.name,
      phone: result.phone,
      expiresAt: result.expiresAt,
      status: statusFilter,
      orders: result.orders,
    });
  } catch (error: any) {
    console.error('pickup token fetch error', error);
    return res.status(500).json({
      success: false,
      error: error?.message || '取得取貨資訊時發生錯誤',
    });
  }
}

