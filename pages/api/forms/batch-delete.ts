import type { NextApiRequest, NextApiResponse } from 'next';
import { permanentlyDeleteForm, ensureDatabaseInitialized } from '@/lib/db';

/**
 * 批量永久刪除 API
 * POST /api/forms/batch-delete
 * Body: { formIds: number[] }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formIds } = req.body;

    if (!Array.isArray(formIds) || formIds.length === 0) {
      return res.status(400).json({ error: '請提供要永久刪除的表單 ID 列表' });
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;
    let totalDeletedOrders = 0;

    for (const formId of formIds) {
      try {
        const result = await permanentlyDeleteForm(formId);
        if (result.success) {
          successCount++;
          totalDeletedOrders += result.deletedOrders;
          results.push({ 
            formId, 
            success: true, 
            deletedOrders: result.deletedOrders 
          });
        } else {
          failCount++;
          results.push({ formId, success: false, error: '永久刪除失敗' });
        }
      } catch (error: any) {
        failCount++;
        results.push({ formId, success: false, error: error.message || '永久刪除失敗' });
      }
    }

    return res.status(200).json({
      success: true,
      successCount,
      failCount,
      total: formIds.length,
      totalDeletedOrders,
      results,
    });
  } catch (error: any) {
    console.error('批量永久刪除錯誤:', error);
    return res.status(500).json({ error: error.message || '伺服器錯誤' });
  }
}

