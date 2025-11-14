import type { NextApiRequest, NextApiResponse } from 'next';
import { createOrder, getFormByToken, getOrdersByFormId, confirmReservedOrder, ensureDatabaseInitialized, generateSessionId } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await ensureDatabaseInitialized();
  } catch (error: any) {
    console.error('資料庫初始化錯誤:', error);
    return res.status(500).json({ 
      error: '資料庫初始化失敗',
      details: error?.message || '無法連接到資料庫'
    });
  }

  try {
    const { formToken, orderData, customerName, customerPhone, sessionId, source } = req.body;

    if (!formToken || !orderData) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    // 檢查表單是否存在
    const form = await getFormByToken(formToken);
    if (!form) {
      return res.status(404).json({ error: '表單不存在' });
    }

    // 檢查是否超過截止時間
    const deadline = new Date(form.deadline);
    const now = new Date();
    if (now > deadline) {
      return res.status(400).json({ error: '表單已超過結單時間' });
    }

    // 檢查訂單數量限制
    if (form.order_limit && form.order_limit > 0) {
      // 如果有 sessionId，確認保留的排序
      if (sessionId) {
        await confirmReservedOrder(form.id, sessionId, ''); // 先清空，稍後會更新
      }
      
      const orders = await getOrdersByFormId(form.id);
      if (orders.length >= form.order_limit) {
        return res.status(400).json({ 
          error: `本訂單已達${form.order_limit}單，無法再下單，您可以稍等再試看是否有其他客戶刪除訂單。` 
        });
      }
    }

    // 取得客戶 IP 地址
    const clientIp = 
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';

    // 取得 User-Agent（設備資訊）
    const userAgent = req.headers['user-agent'] || 'unknown';

    const orderToken = await createOrder(
      form.id,
      orderData,
      customerName,
      customerPhone,
      clientIp,
      userAgent,
      source,
      form,
      undefined // 傳入 form 以便提取物品清單，Facebook 留言 ID 無
    );

    // 如果有 sessionId，確認保留的排序已提交
    if (sessionId && form.order_limit && form.order_limit > 0) {
      await confirmReservedOrder(form.id, sessionId, orderToken);
    }

    return res.status(200).json({ success: true, orderToken });
  } catch (error: any) {
    console.error('建立訂單錯誤:', error);
    return res.status(500).json({ 
      error: '伺服器錯誤',
      details: error?.message || '建立訂單時發生錯誤'
    });
  }
}

