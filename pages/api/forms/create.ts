import type { NextApiRequest, NextApiResponse } from 'next';
import { createForm, FormField, getFormById, ensureDatabaseInitialized } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, fields, deadline, orderDeadline } = req.body;

    if (!name || !fields || !deadline) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ error: '欄位設定不正確' });
    }

    const formId = await createForm(name, fields as FormField[], deadline, orderDeadline);
    const form = await getFormById(formId);

    return res.status(200).json({ success: true, formId, formToken: form?.form_token });
  } catch (error) {
    console.error('建立表單錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}

