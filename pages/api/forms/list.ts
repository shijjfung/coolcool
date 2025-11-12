import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllForms, ensureDatabaseInitialized } from '@/lib/db';

// 確保響應頭設置為 JSON
function setJsonHeaders(res: NextApiResponse) {
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
}

// 包裝處理函數，確保所有錯誤都返回 JSON
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 立即設置 JSON 響應頭 - 必須在函數開始時設置
  setJsonHeaders(res);

  // 使用 Promise 來捕獲所有未處理的錯誤
  try {
    // 先檢查 HTTP 方法
    if (req.method !== 'GET') {
      setJsonHeaders(res);
      return res.status(405).json({ error: 'Method not allowed', allowedMethods: ['GET'] });
    }

    // 資料庫初始化
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

    // 處理請求
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
    // 最外層錯誤處理 - 捕獲所有未預期的錯誤
    console.error('API 處理函數錯誤:', error);
    setJsonHeaders(res);
    return res.status(500).json({ 
      error: '伺服器內部錯誤',
      details: error?.message || '處理請求時發生未預期的錯誤',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
}
