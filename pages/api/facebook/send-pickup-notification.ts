import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ensureDatabaseInitialized,
  getOrdersByIds,
  markFacebookPickupNotified,
} from '@/lib/db';

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

    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(400).json({
        error: '缺少 Facebook Access Token，無法發送通知',
      });
    }

    await ensureDatabaseInitialized();

    const orders = await getOrdersByIds(orderIds);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: '找不到對應的訂單' });
    }

    const targets = orders.filter(
      (order) =>
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

    for (const order of targets) {
      const commentId = order.facebook_comment_id!;
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${commentId}/comments`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              message: trimmedMessage,
              access_token: accessToken,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          failed.push({
            orderId: order.id,
            commentId,
            error:
              errorText ||
              `Facebook API 錯誤 (HTTP ${response.status} ${response.statusText})`,
          });
          continue;
        }

        const notifiedAt = new Date().toISOString();
        await markFacebookPickupNotified(order.id, notifiedAt);
        success.push({
          orderId: order.id,
          commentId,
          notifiedAt,
        });
      } catch (error: any) {
        failed.push({
          orderId: order.id,
          commentId,
          error: error?.message || '未知錯誤',
        });
      }
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


