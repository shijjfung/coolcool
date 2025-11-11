import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureDatabaseInitialized } from '@/lib/db';

// 確保響應頭設置為 JSON
function setJsonHeaders(res: NextApiResponse) {
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
}

/**
 * 測試資料庫連線 API
 * GET /api/test-db
 * 
 * 用於診斷資料庫連線問題
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 立即設置 JSON 響應頭
  setJsonHeaders(res);

  try {
    if (req.method !== 'GET') {
      setJsonHeaders(res);
      return res.status(405).json({ 
        error: 'Method not allowed', 
        allowedMethods: ['GET'] 
      });
    }

    // 檢查環境變數
    const databaseType = process.env.DATABASE_TYPE || 'sqlite';
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const envCheck = {
      DATABASE_TYPE: databaseType,
      SUPABASE_URL: supabaseUrl ? '✅ 已設定' : '❌ 未設定',
      SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? '✅ 已設定' : '❌ 未設定',
      SUPABASE_ANON_KEY: supabaseAnonKey ? '✅ 已設定' : '❌ 未設定',
    };

    // 嘗試初始化資料庫
    try {
      await ensureDatabaseInitialized();
      
      setJsonHeaders(res);
      return res.status(200).json({
        success: true,
        message: '資料庫連線正常',
        environment: envCheck,
        databaseType,
      });
    } catch (error: any) {
      setJsonHeaders(res);
      return res.status(500).json({
        success: false,
        message: '資料庫連線失敗',
        error: error?.message || '未知錯誤',
        environment: envCheck,
        databaseType,
        hint: '請檢查 Supabase 環境變數設定和資料庫表結構',
      });
    }
  } catch (error: any) {
    // 最外層錯誤處理
    console.error('測試 API 錯誤:', error);
    setJsonHeaders(res);
    return res.status(500).json({
      success: false,
      message: 'API 處理錯誤',
      error: error?.message || '未知錯誤',
    });
  }
}
