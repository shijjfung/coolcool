import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllForms, ensureDatabaseInitialized } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 立即設置 JSON 響應頭 - 必須在函數開始時設置
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    // 先檢查 HTTP 方法
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed', allowedMethods: ['GET'] });
    }

    // 資料庫初始化
    try {
      await ensureDatabaseInitialized();
    } catch (error: any) {
      console.error('資料庫初始化錯誤:', error);
      return res.status(500).json({ 
        error: '資料庫初始化失敗',
        details: error?.message || '無法連接到資料庫',
        hint: '請檢查 Supabase 環境變數設定：DATABASE_TYPE, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'
      });
    }

    // 處理請求
    try {
      const forms = await getAllForms();
      return res.status(200).json(forms);
    } catch (error: any) {
      console.error('取得表單列表錯誤:', error);
      return res.status(500).json({ 
        error: '伺服器錯誤',
        details: error?.message || '取得表單列表時發生錯誤'
      });
    }
  } catch (error: any) {
    // 最外層錯誤處理
    console.error('API 處理函數錯誤:', error);
    // 確保響應頭已設置
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    return res.status(500).json({ 
      error: '伺服器內部錯誤',
      details: error?.message || '處理請求時發生未預期的錯誤'
    });
  }
}
