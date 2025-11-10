import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersByFormId, getFormById, ensureDatabaseInitialized } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formId } = req.query;

    if (!formId || typeof formId !== 'string') {
      return res.status(400).json({ error: '無效的表單 ID' });
    }

    const orders = await getOrdersByFormId(parseInt(formId));

    // 統計資料
    const statistics: Record<string, any> = {};
    
    if (orders.length > 0) {
      // 取得表單欄位定義
      const form = await getFormById(parseInt(formId));
      
      if (form) {
        form.fields.forEach(field => {
          if (field.type === 'number') {
            // 數字欄位統計總和、平均
            const values = orders
              .map(order => parseFloat(order.order_data[field.name] || '0'))
              .filter(v => !isNaN(v));
            
            if (values.length > 0) {
              statistics[field.name] = {
                label: field.label,
                total: values.reduce((a, b) => a + b, 0),
                average: values.reduce((a, b) => a + b, 0) / values.length,
                count: values.length,
              };
            }
          } else if (field.type === 'select') {
            // 選項欄位統計各選項數量
            const counts: Record<string, number> = {};
            orders.forEach(order => {
              const value = order.order_data[field.name];
              if (value) {
                counts[value] = (counts[value] || 0) + 1;
              }
            });
            statistics[field.name] = {
              label: field.label,
              counts,
            };
          }
        });
      }
    }

    return res.status(200).json({
      orders,
      statistics,
      totalOrders: orders.length,
    });
  } catch (error) {
    console.error('取得報表錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}

