import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderByToken, deleteOrder, getFormByToken, ensureDatabaseInitialized } from '@/lib/db';

/**
 * 刪除訂單 API
 * DELETE /api/orders/[token]/delete
 * Body: { customerName?, customerPhone?, orderToken? }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;
    const { customerName, customerPhone, orderToken } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: '無效的訂單代碼' });
    }

    // 檢查訂單是否存在
    const order = await getOrderByToken(token);
    if (!order) {
      return res.status(404).json({ error: '訂單不存在' });
    }

    // 驗證：使用姓名+電話或訂單編號
    let verified = false;

    // 方式1：使用訂單編號驗證（如果提供了 orderToken）
    if (orderToken && orderToken.trim() === token) {
      verified = true;
    }

    // 方式2：使用姓名和電話驗證
    if (!verified && customerName && customerPhone) {
      const nameMatch = order.customer_name && 
        order.customer_name.toLowerCase().trim() === customerName.toLowerCase().trim();
      const phoneMatch = order.customer_phone && 
        order.customer_phone.trim() === customerPhone.trim();
      
      if (nameMatch && phoneMatch) {
        verified = true;
      }
    }

    if (!verified) {
      return res.status(403).json({ error: '驗證失敗，請提供正確的姓名和電話，或訂單編號' });
    }

    // 檢查表單是否超過截止時間
    const form = await getFormByToken(req.body.formToken || '');
    if (form) {
      const deadline = new Date(form.deadline);
      const now = new Date();
      if (now > deadline) {
        return res.status(400).json({ error: '表單已超過截止時間，無法刪除訂單' });
      }
    }

    // 刪除訂單
    const success = await deleteOrder(token);
    if (!success) {
      return res.status(404).json({ error: '刪除失敗' });
    }

    return res.status(200).json({ success: true, message: '訂單已刪除' });
  } catch (error: any) {
    console.error('刪除訂單錯誤:', error);
    return res.status(500).json({ error: error.message || '伺服器錯誤' });
  }
}

