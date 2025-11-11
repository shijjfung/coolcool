import type { NextApiRequest, NextApiResponse } from 'next';
import { getFormByToken, reserveOrderNumber, ensureDatabaseInitialized } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formToken, sessionId } = req.body;

    if (!formToken || !sessionId) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    // 取得表單
    const form = await getFormByToken(formToken);
    if (!form) {
      return res.status(404).json({ error: '表單不存在' });
    }

    // 檢查是否有訂單限制
    if (!form.order_limit || form.order_limit <= 0) {
      return res.status(400).json({ error: '此表單沒有設定訂單限制' });
    }

    // 保留排序
    const result = await reserveOrderNumber(form.id, sessionId);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error || '保留排序失敗' });
    }

    return res.status(200).json({
      success: true,
      orderNumber: result.orderNumber,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5分鐘後過期
    });
  } catch (error: any) {
    console.error('保留訂單排序錯誤:', error);
    return res.status(500).json({ error: error.message || '伺服器錯誤' });
  }
}

