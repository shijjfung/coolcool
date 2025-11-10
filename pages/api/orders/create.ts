import type { NextApiRequest, NextApiResponse } from 'next';
import { createOrder, getFormByToken, ensureDatabaseInitialized } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formToken, orderData, customerName, customerPhone } = req.body;

    if (!formToken || !orderData) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    // 檢查表單是否存在
    const form = await getFormByToken(formToken);
    if (!form) {
      return res.status(404).json({ error: '表單不存在' });
    }

    // 檢查是否超過截止時間
    const deadline = new Date(form.deadline);
    const now = new Date();
    if (now > deadline) {
      return res.status(400).json({ error: '表單已超過截止時間' });
    }

    const orderToken = await createOrder(
      form.id,
      orderData,
      customerName,
      customerPhone
    );

    return res.status(200).json({ success: true, orderToken });
  } catch (error) {
    console.error('建立訂單錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}

