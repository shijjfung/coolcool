import type { NextApiRequest, NextApiResponse } from 'next';
import { moveFormToTrash, ensureDatabaseInitialized } from '@/lib/db';

/**
 * 批量移到垃圾桶 API
 * POST /api/forms/batch-trash
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
      return res.status(400).json({ error: '請提供要移到垃圾桶的表單 ID 列表' });
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const formId of formIds) {
      try {
        const success = await moveFormToTrash(formId);
        if (success) {
          successCount++;
          results.push({ formId, success: true });
        } else {
          failCount++;
          results.push({ formId, success: false, error: '移到垃圾桶失敗' });
        }
      } catch (error: any) {
        failCount++;
        results.push({ formId, success: false, error: error.message || '移到垃圾桶失敗' });
      }
    }

    return res.status(200).json({
      success: true,
      successCount,
      failCount,
      total: formIds.length,
      results,
    });
  } catch (error: any) {
    console.error('批量移到垃圾桶錯誤:', error);
    return res.status(500).json({ error: error.message || '伺服器錯誤' });
  }
}

