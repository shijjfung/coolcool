import type { NextApiRequest, NextApiResponse } from 'next';
import { getFormById, ensureDatabaseInitialized } from '@/lib/db';

// 確保響應頭設置為 JSON
function setJsonHeaders(res: NextApiResponse) {
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json');
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 立即設置 JSON 響應頭
  setJsonHeaders(res);

  // 用 try-catch 包裹整個處理函數
  try {
    // 先檢查 HTTP 方法
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed', allowedMethods: ['GET'] });
    }

    try {
      await ensureDatabaseInitialized();
    } catch (error: any) {
      console.error('資料庫初始化錯誤:', error);
      return res.status(500).json({ 
        error: '資料庫初始化失敗',
        details: error?.message || '無法連接到資料庫',
        hint: '請檢查 Supabase 環境變數設定'
      });
    }

    try {
      const { id } = req.query;

      // 如果 id 是已知的靜態路由名稱，返回 404 讓 Next.js 繼續匹配其他路由
      const staticRoutes = ['list', 'create', 'trash', 'batch-delete', 'batch-trash', 'token'];
      if (!id || typeof id !== 'string' || staticRoutes.includes(id) || isNaN(Number(id))) {
        return res.status(404).json({ error: '表單不存在' });
      }

      const form = await getFormById(Number(id));
      
      if (!form) {
        return res.status(404).json({ error: '表單不存在' });
      }

      return res.status(200).json(form);
    } catch (error: any) {
      console.error('取得表單錯誤:', error);
      return res.status(500).json({ 
        error: '伺服器錯誤',
        details: error?.message || '取得表單時發生錯誤'
      });
    }
  } catch (error: any) {
    // 最外層錯誤處理
    console.error('API 處理函數錯誤:', error);
    return res.status(500).json({ 
      error: '伺服器內部錯誤',
      details: error?.message || '處理請求時發生未預期的錯誤'
    });
  }
}


