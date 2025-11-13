import type { NextApiRequest, NextApiResponse } from 'next';
import { createForm, FormField, getFormById, ensureDatabaseInitialized } from '@/lib/db';

// 確保響應頭設置為 JSON
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
  // 立即設置 JSON 響應頭 - 必須在函數開始時設置
  setJsonHeaders(res);

  try {
    // 先檢查 HTTP 方法
    if (req.method !== 'POST') {
      setJsonHeaders(res);
      return res.status(405).json({ 
        error: 'Method not allowed', 
        allowedMethods: ['POST'],
        receivedMethod: req.method || 'unknown'
      });
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
        const { name, fields, deadline, orderDeadline, orderLimit, pickupTime, facebookCommentUrl, lineCommentUrl, facebookPostUrl, facebookPostAuthor, facebookKeywords, facebookAutoMonitor, facebookReplyMessage, linePostAuthor } = req.body;

        if (!name || !fields || !deadline) {
          setJsonHeaders(res);
          return res.status(400).json({ error: '缺少必要欄位' });
        }

        if (!Array.isArray(fields) || fields.length === 0) {
          setJsonHeaders(res);
          return res.status(400).json({ error: '欄位設定不正確' });
        }

        // 驗證訂單數量限制
        if (orderLimit !== undefined && orderLimit !== null) {
          const limit = parseInt(String(orderLimit));
          if (isNaN(limit) || limit < 1) {
            setJsonHeaders(res);
            return res.status(400).json({ error: '訂單數量限制必須是大於 0 的整數' });
          }
        }

        const formId = await createForm(
          name,
          fields as FormField[],
          deadline,
          orderDeadline,
          orderLimit ? parseInt(String(orderLimit)) : undefined,
          pickupTime,
          facebookCommentUrl,
          lineCommentUrl,
          facebookPostUrl,
          facebookPostAuthor,
          facebookKeywords,
          facebookAutoMonitor ? 1 : 0,
          facebookReplyMessage,
          linePostAuthor
        );
        const form = await getFormById(formId);

        setJsonHeaders(res);
        return res.status(200).json({ success: true, formId, formToken: form?.form_token });
      } catch (error: any) {
        console.error('建立表單錯誤:', error);
        setJsonHeaders(res);
        return res.status(500).json({ 
          error: '伺服器錯誤',
          details: error?.message || '建立表單時發生錯誤',
          hint: '請檢查 Supabase 連線設定和資料庫表結構'
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
