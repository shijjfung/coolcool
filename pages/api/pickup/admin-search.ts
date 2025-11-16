import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ensureDatabaseInitialized,
  getOutstandingPickupsByCustomer,
  getOrCreatePickupToken,
  PickupStatusFilter,
} from '@/lib/db';

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

  const { name, phone, status } = req.body || {};
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';

  if (!trimmedName || !trimmedPhone) {
    return res.status(400).json({ success: false, error: '請輸入姓名與電話' });
  }

  const statusFilter = parseStatus(status);

  try {
    await ensureDatabaseInitialized();
    const orders = await getOutstandingPickupsByCustomer(trimmedName, trimmedPhone, statusFilter);
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: '查無符合條件的訂單',
      });
    }

    const tokenInfo = await getOrCreatePickupToken(trimmedName, trimmedPhone);
    return res.status(200).json({
      success: true,
      token: tokenInfo.token,
      expiresAt: tokenInfo.expiresAt,
      name: trimmedName,
      phone: trimmedPhone,
      status: statusFilter,
      orders,
    });
  } catch (error: any) {
    console.error('pickup admin search error', error);
    return res.status(500).json({
      success: false,
      error: error?.message || '查詢取貨資訊時發生錯誤',
    });
  }
}

