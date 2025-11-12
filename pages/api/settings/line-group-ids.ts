import type { NextApiRequest, NextApiResponse } from 'next';
import { getSetting, setSetting, ensureDatabaseInitialized } from '@/lib/db';

interface SavedGroupId {
  id: string;
  name: string;
  groupId: string;
}

/**
 * LINE 群組 ID 列表設定 API
 * GET: 取得 LINE 群組 ID 列表
 * POST: 保存 LINE 群組 ID 列表
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
      const savedData = await getSetting('line_group_ids');
      let groupIds: SavedGroupId[] = [];
      
      if (savedData) {
        try {
          groupIds = JSON.parse(savedData);
        } catch (e) {
          console.error('解析群組 ID 列表失敗:', e);
          groupIds = [];
        }
      }
      
      return res.status(200).json({ 
        success: true,
        groupIds: groupIds || []
      });
    } catch (error) {
      console.error('取得群組 ID 列表錯誤:', error);
      return res.status(500).json({ error: '伺服器錯誤' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { groupIds } = req.body;

      if (!Array.isArray(groupIds)) {
        return res.status(400).json({ error: '請提供有效的群組 ID 列表' });
      }

      // 驗證每個群組 ID 的格式
      for (const item of groupIds) {
        if (!item.id || !item.name || !item.groupId) {
          return res.status(400).json({ error: '群組 ID 格式不正確，必須包含 id、name 和 groupId' });
        }
      }

      const success = await setSetting('line_group_ids', JSON.stringify(groupIds));
      
      if (success) {
        return res.status(200).json({ 
          success: true, 
          message: '群組 ID 列表已儲存到雲端',
          groupIds: groupIds
        });
      } else {
        return res.status(500).json({ error: '儲存群組 ID 列表失敗' });
      }
    } catch (error: any) {
      console.error('儲存群組 ID 列表錯誤:', error);
      return res.status(500).json({ error: error.message || '伺服器錯誤' });
    }
  }
}

