import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderByToken, updateOrder, getFormByToken, ensureDatabaseInitialized } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();
  
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: '無效的訂單代碼' });
  }

  if (req.method === 'GET') {
    try {
      const order = await getOrderByToken(token);
      if (!order) {
        return res.status(404).json({ error: '訂單不存在' });
      }
      
      // 如果有提供驗證資訊，進行驗證
      const { customerName, customerPhone } = req.query;
      if (customerName || customerPhone) {
        // 驗證姓名和電話
        const nameMatch = !customerName || 
          (order.customer_name && 
           order.customer_name.toLowerCase().trim() === String(customerName).toLowerCase().trim());
        const phoneMatch = !customerPhone || 
          (order.customer_phone && 
           order.customer_phone.trim() === String(customerPhone).trim());
        
        if (!nameMatch || !phoneMatch) {
          return res.status(403).json({ error: '驗證失敗，姓名或電話不正確' });
        }
      }
      
      return res.status(200).json(order);
    } catch (error) {
      console.error('取得訂單錯誤:', error);
      return res.status(500).json({ error: '伺服器錯誤' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { orderData, customerName, customerPhone, orderToken: providedToken } = req.body;

      if (!orderData) {
        return res.status(400).json({ error: '缺少訂單資料' });
      }

      // 檢查訂單是否存在
      const order = await getOrderByToken(token);
      if (!order) {
        return res.status(404).json({ error: '訂單不存在' });
      }

      // 驗證：使用姓名+電話或訂單編號
      let verified = false;

      // 方式1：使用訂單編號驗證（如果提供了 orderToken）
      if (providedToken && providedToken.trim() === token) {
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
      const form = await getFormByToken(req.body.formToken);
      if (form) {
        const deadline = new Date(form.deadline);
        const now = new Date();
        if (now > deadline) {
          return res.status(400).json({ error: '表單已超過截止時間，無法修改' });
        }
      }

      const success = await updateOrder(token, orderData);
      if (!success) {
        return res.status(404).json({ error: '更新失敗' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('更新訂單錯誤:', error);
      return res.status(500).json({ error: '伺服器錯誤' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

