import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderByToken, ensureDatabaseInitialized } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderToken, customerName, customerPhone } = req.body;

    if (!orderToken) {
      return res.status(400).json({ error: '缺少訂單代碼' });
    }

    // 如果提供了訂單編號，可以只驗證訂單編號（訂單編號本身就是驗證）
    // 如果沒有提供姓名和電話，但提供了訂單編號，直接返回訂單
    if (!customerName && !customerPhone) {
      // 只使用訂單編號驗證
      const order = await getOrderByToken(orderToken);
      if (!order) {
        return res.status(404).json({ error: '訂單不存在' });
      }
      return res.status(200).json({ 
        verified: true,
        order 
      });
    }

    const order = await getOrderByToken(orderToken);
    if (!order) {
      return res.status(404).json({ error: '訂單不存在' });
    }

    // 驗證姓名和電話
    // 如果訂單中有填寫姓名，則必須驗證姓名
    // 如果訂單中有填寫電話，則必須驗證電話
    // 如果訂單中沒有填寫，則不需要驗證該欄位
    
    let nameMatch = true;
    let phoneMatch = true;
    
    if (order.customer_name) {
      // 訂單有姓名，必須驗證
      if (!customerName) {
        nameMatch = false;
      } else {
        nameMatch = order.customer_name.toLowerCase().trim() === customerName.toLowerCase().trim();
      }
    }
    
    if (order.customer_phone) {
      // 訂單有電話，必須驗證
      if (!customerPhone) {
        phoneMatch = false;
      } else {
        phoneMatch = order.customer_phone.trim() === customerPhone.trim();
      }
    }
    
    // 如果訂單中既沒有姓名也沒有電話，至少需要提供一個驗證資訊
    if (!order.customer_name && !order.customer_phone) {
      if (!customerName && !customerPhone) {
        return res.status(400).json({ 
          error: '此訂單未填寫姓名或電話，無法驗證。請聯繫管理員。',
          verified: false 
        });
      }
    }
    
    if (!nameMatch || !phoneMatch) {
      return res.status(403).json({ 
        error: '驗證失敗，姓名或電話不正確',
        verified: false 
      });
    }

    return res.status(200).json({ 
      verified: true,
      order 
    });
  } catch (error) {
    console.error('驗證訂單錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}

