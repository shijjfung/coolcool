import type { NextApiRequest, NextApiResponse } from 'next';
import { getSetting, setSetting, ensureDatabaseInitialized } from '@/lib/db';

/**
 * 報表輸出資料夾設定 API
 * GET: 取得報表輸出資料夾路徑
 * POST: 設定報表輸出資料夾路徑
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 先檢查 HTTP 方法
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', allowedMethods: ['GET', 'POST'] });
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

  if (req.method === 'GET') {
    try {
      const folderPath = await getSetting('report_output_folder');
      return res.status(200).json({ 
        folderPath: folderPath || '',
        success: true 
      });
    } catch (error) {
      console.error('取得設定錯誤:', error);
      return res.status(500).json({ error: '伺服器錯誤' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { folderPath } = req.body;

      if (!folderPath || typeof folderPath !== 'string') {
        return res.status(400).json({ error: '請提供有效的資料夾路徑' });
      }

      // 驗證資料夾路徑是否存在（如果存在）
      const fs = require('fs');
      if (folderPath.trim() && !fs.existsSync(folderPath.trim())) {
        return res.status(400).json({ error: '指定的資料夾不存在，請先建立資料夾' });
      }

      const success = await setSetting('report_output_folder', folderPath.trim());
      
      if (success) {
        return res.status(200).json({ 
          success: true, 
          message: '設定已儲存',
          folderPath: folderPath.trim()
        });
      } else {
        return res.status(500).json({ error: '儲存設定失敗' });
      }
    } catch (error: any) {
      console.error('設定儲存錯誤:', error);
      return res.status(500).json({ error: error.message || '伺服器錯誤' });
    }
  }
}

