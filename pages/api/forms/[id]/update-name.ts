import type { NextApiRequest, NextApiResponse } from 'next';
import { updateFormName, getFormById, ensureDatabaseInitialized } from '@/lib/db';

/**
 * 更新表單名稱
 * PUT /api/forms/[id]/update-name
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

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: '表單名稱不能為空' });
    }

    // 檢查表單是否存在
    const form = await getFormById(formId);
    if (!form) {
      return res.status(404).json({ error: '表單不存在' });
    }

    // 更新表單名稱
    const success = await updateFormName(formId, name.trim());
    if (!success) {
      return res.status(500).json({ error: '更新失敗' });
    }

    return res.status(200).json({ success: true, message: '表單名稱已更新' });
  } catch (error) {
    console.error('更新表單名稱錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}

