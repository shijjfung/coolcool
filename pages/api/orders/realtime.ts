import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersByFormId, ensureDatabaseInitialized } from '@/lib/db';

/**
 * 獲取表單的最新訂單（用於即時通知）
 * GET /api/orders/realtime?formId=123&limit=1
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await ensureDatabaseInitialized();
    
    const { formId, limit = '1' } = req.query;
    
    if (!formId || typeof formId !== 'string') {
      return res.status(400).json({ error: '缺少 formId 參數' });
    }
    
    const formIdNum = parseInt(formId, 10);
    if (isNaN(formIdNum)) {
      return res.status(400).json({ error: '無效的 formId' });
    }
    
    const limitNum = parseInt(limit as string, 10) || 1;
    
    // 獲取訂單
    const orders = await getOrdersByFormId(formIdNum);
    
    // 按創建時間排序（最新的在前）
    const sortedOrders = orders.sort((a: any, b: any) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return timeB - timeA;
    });
    
    // 只返回最新的幾筆
    const latestOrders = sortedOrders.slice(0, limitNum);
    
    return res.status(200).json({
      success: true,
      orders: latestOrders,
    });
  } catch (error: any) {
    console.error('獲取即時訂單錯誤:', error);
    return res.status(500).json({ 
      error: '伺服器錯誤',
      details: error.message 
    });
  }
}

