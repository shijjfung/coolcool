import type { NextApiRequest, NextApiResponse } from 'next';
import { moveFormToTrash, restoreForm, getFormById, ensureDatabaseInitialized } from '@/lib/db';

/**
 * 將表單移到垃圾桶或還原
 * POST /api/forms/trash/[id] - 移到垃圾桶
 * PUT /api/forms/trash/[id] - 還原表單
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '無效的表單 ID' });
  }

  const formId = parseInt(id, 10);
  if (isNaN(formId)) {
    return res.status(400).json({ error: '無效的表單 ID' });
  }

  // 檢查表單是否存在
  const form = await getFormById(formId, true); // 包含已刪除的表單
  if (!form) {
    return res.status(404).json({ error: '表單不存在' });
  }

  if (req.method === 'POST') {
    // 移到垃圾桶
    try {
      // 檢查表單是否已經在垃圾桶
      if (form.deleted === 1) {
        return res.status(400).json({ error: '表單已經在垃圾桶中' });
      }

      console.log(`嘗試將表單 ${formId} 移到垃圾桶...`);
      console.log(`表單資訊:`, { id: form.id, name: form.name, deleted: form.deleted });
      
      const success = await moveFormToTrash(formId);
      console.log(`移到垃圾桶結果: ${success}`);
      
      if (success) {
        // 驗證是否真的更新成功
        const updatedForm = await getFormById(formId, true);
        console.log(`更新後表單狀態:`, { id: updatedForm?.id, deleted: updatedForm?.deleted, deleted_at: updatedForm?.deleted_at });
        
        return res.status(200).json({
          success: true,
          message: '表單已移到垃圾桶',
          formName: form.name,
        });
      } else {
        console.error(`移到垃圾桶失敗，表單 ID: ${formId}`);
        // 檢查表單是否存在
        const checkForm = await getFormById(formId, true);
        console.error(`檢查表單:`, checkForm ? '存在' : '不存在');
        
        return res.status(500).json({ 
          error: '移到垃圾桶失敗',
          details: '資料庫更新未成功，可能是資料庫欄位未建立或表單不存在',
          formExists: !!checkForm
        });
      }
    } catch (error: any) {
      console.error('移到垃圾桶錯誤:', error);
      console.error('錯誤訊息:', error.message);
      console.error('錯誤堆疊:', error.stack);
      
      // 提供更清楚的錯誤訊息
      let errorMsg = '伺服器錯誤';
      if (error.message) {
        if (error.message.includes('no such column')) {
          errorMsg = '資料庫欄位未建立，請重新啟動伺服器';
        } else if (error.message.includes('no such table')) {
          errorMsg = '資料庫表不存在，請重新啟動伺服器';
        } else {
          errorMsg = error.message;
        }
      }
      
      return res.status(500).json({ 
        error: errorMsg,
        details: error.message || String(error)
      });
    }
  } else if (req.method === 'PUT') {
    // 還原表單
    try {
      const success = await restoreForm(formId);
      if (success) {
        return res.status(200).json({
          success: true,
          message: '表單已還原',
          formName: form.name,
        });
      } else {
        return res.status(500).json({ error: '還原失敗' });
      }
    } catch (error) {
      console.error('還原表單錯誤:', error);
      return res.status(500).json({ error: '伺服器錯誤' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

