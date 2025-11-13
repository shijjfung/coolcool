import type { NextApiRequest, NextApiResponse } from 'next';
import { getFormById, updateForm, ensureDatabaseInitialized } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();
  
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: '無效的表單 ID' });
    }

    const formId = Number(id);
    const { name, fields, deadline, orderDeadline, orderLimit, pickupTime, facebookCommentUrl, lineCommentUrl, facebookPostUrl, facebookPostAuthor, facebookKeywords, facebookAutoMonitor, facebookReplyMessage, linePostAuthor } = req.body;

    if (!name || !fields || !deadline) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ error: '欄位設定不正確' });
    }

    // 檢查表單是否存在
    const existingForm = await getFormById(formId);
    if (!existingForm) {
      return res.status(404).json({ error: '表單不存在' });
    }

    // 驗證訂單數量限制
    if (orderLimit !== undefined && orderLimit !== null) {
      const limit = parseInt(String(orderLimit));
      if (isNaN(limit) || limit < 1) {
        return res.status(400).json({ error: '訂單數量限制必須是大於 0 的整數' });
      }
    }

    // 更新表單
    await updateForm(
      formId,
      name,
      fields,
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

    const updatedForm = await getFormById(formId);
    return res.status(200).json({ success: true, form: updatedForm });
  } catch (error: any) {
    console.error('更新表單錯誤:', error);
    return res.status(500).json({ error: error.message || '伺服器錯誤' });
  }
}

