import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersByFormId, getFormByToken, ensureDatabaseInitialized } from '@/lib/db';

/**
 * 根據姓名和電話查找訂單 API
 * POST /api/orders/find
 * Body: { formToken, customerName, customerPhone }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formToken, customerName, customerPhone } = req.body;

    if (!formToken) {
      return res.status(400).json({ error: '缺少表單代碼' });
    }

    if (!customerName || !customerPhone) {
      return res.status(400).json({ error: '請提供姓名和電話' });
    }

    // 取得表單
    const form = await getFormByToken(formToken);
    if (!form) {
      return res.status(404).json({ error: '表單不存在' });
    }

    // 取得該表單的所有訂單
    const orders = await getOrdersByFormId(form.id);

    // 根據姓名和電話查找訂單
    const matchedOrder = orders.find((order: any) => {
      const nameMatch = order.customer_name && 
        order.customer_name.toLowerCase().trim() === customerName.toLowerCase().trim();
      const phoneMatch = order.customer_phone && 
        order.customer_phone.trim() === customerPhone.trim();
      return nameMatch && phoneMatch;
    });

    if (!matchedOrder) {
      return res.status(404).json({ error: '找不到符合的訂單，請確認姓名和電話是否正確' });
    }

    return res.status(200).json({ 
      success: true,
      order: matchedOrder 
    });
  } catch (error: any) {
    console.error('查找訂單錯誤:', error);
    return res.status(500).json({ error: error.message || '伺服器錯誤' });
  }
}

