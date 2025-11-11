import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllForms, ensureDatabaseInitialized } from '@/lib/db';

function setJsonHeaders(res: NextApiResponse) {
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  setJsonHeaders(res);

  try {
    if (req.method !== 'GET') {
      setJsonHeaders(res);
      return res.status(405).json({ error: 'Method not allowed', allowedMethods: ['GET'] });
    }

    let dbInitialized = false;
    try {
      await ensureDatabaseInitialized();
      dbInitialized = true;
    } catch (error: any) {
      console.error('資料庫初始化錯誤:', error);
      setJsonHeaders(res);
      return res.status(500).json({
        error: '資料庫初始化失敗',
        details: error?.message || '無法連接到資料庫',
        hint: '請檢查 Supabase 環境變數設定：DATABASE_TYPE, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'
      });
    }

    if (dbInitialized) {
      try {
        const forms = await getAllForms();
        setJsonHeaders(res);
        return res.status(200).json(forms);
      } catch (error: any) {
        console.error('取得表單列表錯誤:', error);
        setJsonHeaders(res);
        return res.status(500).json({
          error: '伺服器錯誤',
          details: error?.message || '取得表單列表時發生錯誤'
        });
      }
    }
  } catch (error: any) {
    console.error('API 處理函數錯誤:', error);
    setJsonHeaders(res);
    return res.status(500).json({
      error: '伺服器內部錯誤',
      details: error?.message || '處理請求時發生未預期的錯誤',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
}
