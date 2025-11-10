import type { NextApiRequest, NextApiResponse } from 'next';
import { permanentlyDeleteForm, getFormById, ensureDatabaseInitialized } from '@/lib/db';

/**
 * 永久刪除表單 API（從垃圾桶中永久刪除）
 * DELETE /api/forms/[id]/delete
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: '無效的表單 ID' });
    }

    const formId = parseInt(id, 10);
    if (isNaN(formId)) {
      return res.status(400).json({ error: '無效的表單 ID' });
    }

    // 檢查表單是否存在（包含已刪除的）
    const form = await getFormById(formId, true);
    if (!form) {
      return res.status(404).json({ error: '表單不存在' });
    }

    // 永久刪除表單（同時刪除相關訂單）
    const result = await permanentlyDeleteForm(formId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: '表單已永久刪除',
        deletedOrders: result.deletedOrders,
        formName: form.name,
      });
    } else {
      return res.status(500).json({ error: '刪除失敗' });
    }
  } catch (error) {
    console.error('永久刪除表單錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}

