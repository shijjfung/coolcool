import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ensureDatabaseInitialized,
  getOutstandingPickupsByCustomer,
  getOrCreatePickupToken,
} from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { name, phone } = req.body || {};
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';

  if (!trimmedName || !trimmedPhone) {
    return res.status(400).json({ success: false, error: '請輸入姓名與電話' });
  }

  try {
    await ensureDatabaseInitialized();
    const orders = await getOutstandingPickupsByCustomer(trimmedName, trimmedPhone);
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: '查無已結單且未取貨的商品',
      });
    }

    const tokenInfo = await getOrCreatePickupToken(trimmedName, trimmedPhone);
    return res.status(200).json({
      success: true,
      token: tokenInfo.token,
      expiresAt: tokenInfo.expiresAt,
      name: trimmedName,
      phone: trimmedPhone,
      orders,
    });
  } catch (error: any) {
    console.error('pickup search error', error);
    return res.status(500).json({
      success: false,
      error: error?.message || '查詢取貨資訊時發生錯誤',
    });
  }
}

