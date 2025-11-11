import type { NextApiRequest, NextApiResponse } from 'next';
import { parseOrderMessage, mergeOrderItems, extractProductsFromForm } from '@/lib/message-parser';
import { getFormByToken, createOrder, ensureDatabaseInitialized, FormField } from '@/lib/db';

/**
 * 從 Facebook 貼文取得留言並建立訂單
 * POST /api/facebook/fetch-comments
 * 
 * 注意：這需要 Facebook Access Token 和貼文 ID
 * 實際使用時需要透過 Facebook Graph API 取得留言
 * 
 * Body:
 * {
 *   formToken: string,
 *   comments: Array<{ message: string, from: { name: string }, id: string }>,
 *   mode: 'groupbuy' | 'proxy'
 * }
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
    const { formToken, comments, mode = 'groupbuy' } = req.body;

    if (!formToken || !comments || !Array.isArray(comments)) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    // 取得表單
    const form = await getFormByToken(formToken);
    if (!form) {
      return res.status(404).json({ error: '表單不存在' });
    }

    // 檢查截止時間
    const deadline = new Date(form.deadline);
    const now = new Date();
    if (now > deadline) {
      return res.status(400).json({ error: '表單已超過截止時間' });
    }

    const results = [];
    const availableProducts = extractProductsFromForm(form.fields);

    // 處理每筆留言
    for (const comment of comments) {
      if (!comment.message || !comment.message.trim()) {
        continue;
      }

      try {
        // 移除表單代碼（如果有的話）
        const cleanMessage = comment.message.replace(/@\w+\s*/, '').trim();

        // 解析訊息
        const parsed = parseOrderMessage(
          cleanMessage,
          availableProducts,
          undefined,
          mode
        );

        if (!parsed || parsed.items.length === 0) {
          results.push({
            commentId: comment.id,
            message: comment.message,
            success: false,
            error: '無法解析訂單訊息',
          });
          continue;
        }

        // 合併相同商品
        const mergedItems = mergeOrderItems(parsed.items);

        // 建立訂單資料
        const orderData: Record<string, any> = {};

        const productField = form.fields.find(
          (f: FormField) => f.label.includes('商品') || f.label.includes('品項') || f.label.includes('口味')
        );
        if (productField && mergedItems.length > 0) {
          orderData[productField.name] = mergedItems[0].productName;
        }

        const quantityField = form.fields.find(
          (f: FormField) => f.label.includes('數量') || f.label.includes('訂購數量')
        );
        if (quantityField) {
          const totalQuantity = mergedItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
          orderData[quantityField.name] = totalQuantity;
        }

        // 使用留言者的姓名
        const customerName = parsed.customerName || comment.from?.name;

        // 建立訂單
        const orderToken = await createOrder(
          form.id,
          orderData,
          customerName,
          parsed.customerPhone
        );

        results.push({
          commentId: comment.id,
          message: comment.message,
          success: true,
          orderToken,
          items: mergedItems,
          customerName,
        });
      } catch (error) {
        console.error('處理留言錯誤:', error);
        results.push({
          commentId: comment.id,
          message: comment.message,
          success: false,
          error: '處理時發生錯誤',
        });
      }
    }

    const successCount = results.filter((r: any) => r.success).length;
    const failCount = results.filter((r: any) => !r.success).length;

    return res.status(200).json({
      success: true,
      total: comments.length,
      successCount,
      failCount,
      results,
    });
  } catch (error) {
    console.error('處理留言錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}



