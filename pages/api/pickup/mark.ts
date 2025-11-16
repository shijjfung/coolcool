import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureDatabaseInitialized, markPickupItem, PickupStatusFilter } from '@/lib/db';

const parseStatus = (value: any): PickupStatusFilter => {
  if (value === 'picked') return 'picked';
  if (value === 'all') return 'all';
  return 'pending';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { token, orderId, itemKey, performedBy, status } = req.body || {};

  if (!token || typeof token !== 'string' || !itemKey || typeof itemKey !== 'string') {
    return res.status(400).json({ success: false, error: '缺少必要參數' });
  }
  const orderIdNumber = Number(orderId);
  if (!orderIdNumber) {
    return res.status(400).json({ success: false, error: '訂單資料有誤' });
  }

  const statusFilter = parseStatus(status);

  try {
    await ensureDatabaseInitialized();
    const { orders } = await markPickupItem(
      token.trim(),
      orderIdNumber,
      itemKey.trim(),
      statusFilter,
      performedBy
    );
    return res.status(200).json({ success: true, status: statusFilter, orders });
  } catch (error: any) {
    console.error('pickup mark error', error);
    return res.status(400).json({
      success: false,
      error: error?.message || '更新取貨狀態失敗',
    });
  }
}

