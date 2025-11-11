import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllForms, ensureDatabaseInitialized } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 用 try-catch 包裹整個處理函數，確保所有錯誤都返回 JSON
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
    // 最外層錯誤處理，確保所有未預期的錯誤都返回 JSON
    console.error('API 處理函數錯誤:', error);
    return res.status(500).json({ 
      error: '伺服器內部錯誤',
      details: error?.message || '處理請求時發生未預期的錯誤'
    });
  }
}
