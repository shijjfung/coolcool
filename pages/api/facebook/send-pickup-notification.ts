import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ensureDatabaseInitialized,
  getOrdersByIds,
  markFacebookPickupNotified,
  getFormByIdLite,
  type Order,
} from '@/lib/db';
import { callAutomationPickupNotifications } from '@/lib/facebook-automation';

interface SuccessResult {
  orderId: number;
  commentId: string;
  notifiedAt: string;
}

interface FailedResult {
  orderId: number;
  commentId?: string;
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderIds, message } = req.body as {
      orderIds?: number[];
      message?: string;
    };

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: '缺少訂單資料' });
    }

    const trimmedMessage = (message || '').trim();
    if (!trimmedMessage) {
      return res.status(400).json({ error: '請輸入通知訊息' });
    }

    await ensureDatabaseInitialized();

    const orders = await getOrdersByIds(orderIds);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: '找不到對應的訂單' });
    }

    const targets = orders.filter(
      (order: Order) =>
        (order.order_source || '').toLowerCase() === 'facebook' &&
        order.facebook_comment_id
    );

    if (targets.length === 0) {
      return res.status(400).json({
        error: '選擇的訂單沒有符合條件的 Facebook 留言',
      });
    }

    const success: SuccessResult[] = [];
    const failed: FailedResult[] = [];

    const formCache = new Map<number, { facebook_post_url?: string } | null>();
    const automationOrders: Array<{ orderId: number; commentId: string; postUrl: string }> = [];

    for (const order of targets) {
      const commentId = order.facebook_comment_id!;
      let form = formCache.get(order.form_id);
      if (form === undefined) {
        form = await getFormByIdLite(order.form_id);
        formCache.set(order.form_id, form);
      }
      if (!form || !form.facebook_post_url) {
        failed.push({
          orderId: order.id,
          commentId,
          error: '找不到表單或尚未設定 Facebook 貼文 URL',
        });
        continue;
      }
      automationOrders.push({
        orderId: order.id,
        commentId,
        postUrl: form.facebook_post_url,
      });
    }

    if (automationOrders.length === 0) {
      return res.status(400).json({
        success: false,
        error: '沒有符合條件的訂單可通知',
        results: { success, failed },
      });
    }

    let automationResponse: {
      results?: {
        success?: Array<{ orderId: number; commentId?: string }>;
        failed?: Array<{ orderId: number; commentId?: string; error?: string }>;
      };
    } | null = null;

    try {
      automationResponse = await callAutomationPickupNotifications({
        message: trimmedMessage,
        orders: automationOrders,
      });
    } catch (automationError: any) {
      console.error('Facebook 取貨通知自動化錯誤:', automationError);
      return res.status(500).json({
        success: false,
        error: automationError?.message || '取貨通知服務錯誤',
      });
    }

    const automationSuccess = automationResponse?.results?.success || [];
    const automationFailed = automationResponse?.results?.failed || [];

    for (const entry of automationSuccess) {
      const notifiedAt = new Date().toISOString();
      await markFacebookPickupNotified(entry.orderId, notifiedAt);
      success.push({
        orderId: entry.orderId,
        commentId: entry.commentId || automationOrders.find((o) => o.orderId === entry.orderId)?.commentId || '',
        notifiedAt,
      });
    }

    for (const entry of automationFailed) {
      failed.push({
        orderId: entry.orderId,
        commentId: entry.commentId,
        error: entry.error || '通知失敗',
      });
    }

    const successCount = success.length;
    const failedCount = failed.length;

    return res.status(200).json({
      success: true,
      message: failedCount === 0
        ? `已成功通知 ${successCount} 位客戶！`
        : `已成功通知 ${successCount} 位客戶，${failedCount} 位客戶通知失敗。`,
      results: {
        success,
        failed,
      },
    });
  } catch (error: any) {
    console.error('Facebook 取貨通知錯誤:', error);
    return res.status(500).json({
      error: '伺服器錯誤',
      details: error?.message || '處理請求時發生未預期的錯誤',
    });
  }
}


