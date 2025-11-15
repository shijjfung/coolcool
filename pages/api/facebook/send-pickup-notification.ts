import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ensureDatabaseInitialized,
  getOrdersByIds,
  markFacebookPickupNotified,
  getFormById,
  type Order,
} from '@/lib/db';
import {
  replyToCommentWithPuppeteer,
  type PuppeteerConfig
} from '@/lib/facebook-puppeteer';

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

    // 檢查是否設定 Cookie（Puppeteer 需要）
    const cookies = process.env.FACEBOOK_COOKIES;
    if (!cookies) {
      return res.status(400).json({
        error: '缺少 Facebook Cookie，無法發送通知',
        hint: '請在環境變數中設定 FACEBOOK_COOKIES（從 Cookie-Editor 取得）',
      });
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

    for (const order of targets) {
      const commentId = order.facebook_comment_id!;
      try {
        // 取得表單以取得 Facebook 貼文 URL
        const form = await getFormById(order.form_id);
        if (!form || !form.facebook_post_url) {
          failed.push({
            orderId: order.id,
            commentId,
            error: '找不到表單或表單未設定 Facebook 貼文 URL',
          });
          continue;
        }

        // 使用 Puppeteer 回覆留言
        // 傳入貼文 URL 和留言 ID，讓 Puppeteer 自動構建留言 URL
        const postUrl = form.facebook_post_url;

        console.log(`[Puppeteer] 準備回覆留言：貼文 ${postUrl}，留言 ID ${commentId}`);

        const puppeteerConfig: PuppeteerConfig = {
          headless: process.env.FACEBOOK_PUPPETEER_HEADLESS !== 'false',
          cookies: cookies,
          timeout: parseInt(process.env.FACEBOOK_PUPPETEER_TIMEOUT || '60000', 10),
        };

        const replySuccess = await replyToCommentWithPuppeteer(
          postUrl,
          trimmedMessage,
          puppeteerConfig,
          commentId
        );

        if (replySuccess) {
          const notifiedAt = new Date().toISOString();
          await markFacebookPickupNotified(order.id, notifiedAt);
          success.push({
            orderId: order.id,
            commentId,
            notifiedAt,
          });
          console.log(`[Puppeteer] ✅ 已成功回覆留言 ${commentId}`);
        } else {
          failed.push({
            orderId: order.id,
            commentId,
            error: 'Puppeteer 回覆留言失敗',
          });
        }
      } catch (error: any) {
        console.error(`[Puppeteer] 回覆留言錯誤 (訂單 ${order.id}):`, error.message);
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


