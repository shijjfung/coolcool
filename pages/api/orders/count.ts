import type { NextApiRequest, NextApiResponse } from 'next';
import { getFormByToken, getOrdersByFormId } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formToken } = req.query;

    if (!formToken || typeof formToken !== 'string') {
      return res.status(400).json({ error: '表單代碼不能為空' });
    }

    // 取得表單
    const form = await getFormByToken(formToken);
    if (!form) {
      return res.status(404).json({ error: '表單不存在' });
    }

    // 取得所有訂單
    const orders = await getOrdersByFormId(form.id);

    // 計算當前訂單數量
    const currentCount = orders.length;

    // 檢查是否已額滿
    const isFull = form.order_limit && form.order_limit > 0 
      ? currentCount >= form.order_limit 
      : false;

    // 為每個訂單添加排序號
    const ordersWithNumber = orders.map((order: any, index: number) => ({
      ...order,
      order_number: index + 1,
    }));

    return res.status(200).json({
      success: true,
      currentCount,
      limit: form.order_limit || null,
      isFull,
      orders: ordersWithNumber,
    });
  } catch (error: any) {
    console.error('檢查訂單數量錯誤:', error);
    return res.status(500).json({ error: error.message || '檢查訂單數量時發生錯誤' });
  }
}
