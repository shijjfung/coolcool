import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzePostType, extractFormInfo } from '@/lib/facebook-analyzer';
import { parseOrderMessage, mergeOrderItems, extractProductsFromForm } from '@/lib/message-parser';
import { 
  getFormByToken, 
  createOrder, 
  ensureDatabaseInitialized,
  getFormsReadyForReport,
  markReportGenerated,
  getOrdersByFormId,
} from '@/lib/db';

/**
 * 自動監控 Facebook 貼文並處理訂單
 * POST /api/facebook/auto-monitor
 * 
 * Body:
 * {
 *   postText: string,           // 貼文內容
 *   authorName: string,         // 發文者名稱（例如：愛買）
 *   comments: Array<{           // 留言列表
 *     message: string,
 *     from: { name: string },
 *     id: string
 *   }>,
 *   formToken?: string          // 可選：指定表單代碼
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
    const { postText, authorName, comments, formToken } = req.body;

    if (!postText || !authorName || !comments || !Array.isArray(comments)) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    // 分析貼文
    const analysis = analyzePostType(postText);
    const formInfo = extractFormInfo(postText);

    // 如果沒有指定表單代碼，需要建立新表單或使用現有表單
    let targetFormToken = formToken;

    if (!targetFormToken) {
      // 這裡可以實作自動建立表單的邏輯
      // 目前先返回錯誤，要求提供表單代碼
      return res.status(400).json({ 
        error: '請提供表單代碼',
        suggestion: '建議先建立表單，然後使用表單代碼',
        analysis,
        formInfo,
      });
    }

    // 取得表單
    const form = await getFormByToken(targetFormToken);
    if (!form) {
      return res.status(404).json({ error: '表單不存在' });
    }

    // 檢查截止時間
    const deadline = new Date(form.deadline);
    const now = new Date();
    if (now > deadline) {
      return res.status(400).json({ error: '表單已超過截止時間' });
    }

    // 處理留言
    const mode = analysis.type === 'proxy' ? 'proxy' : 'groupbuy';
    const availableProducts = extractProductsFromForm(form.fields);
    const results = [];

    for (const comment of comments) {
      if (!comment.message || !comment.message.trim()) {
        continue;
      }

      try {
        const cleanMessage = comment.message.replace(/@\w+\s*/, '').trim();
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

        const mergedItems = mergeOrderItems(parsed.items);
        const orderData: Record<string, any> = {};

        const productField = form.fields.find(
          f => f.label.includes('商品') || f.label.includes('品項') || f.label.includes('口味')
        );
        if (productField && mergedItems.length > 0) {
          orderData[productField.name] = mergedItems[0].productName;
        }

        const quantityField = form.fields.find(
          f => f.label.includes('數量') || f.label.includes('訂購數量')
        );
        if (quantityField) {
          const totalQuantity = mergedItems.reduce((sum, item) => sum + item.quantity, 0);
          orderData[quantityField.name] = totalQuantity;
        }

        const customerName = parsed.customerName || comment.from?.name;
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

    // 檢查是否需要生成報表
    let reportGenerated = false;
    if (formInfo.orderDeadline) {
      const orderDeadline = new Date(formInfo.orderDeadline);
      if (now >= orderDeadline && form.report_generated === 0) {
        // 自動生成報表
        await markReportGenerated(form.id);
        reportGenerated = true;
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return res.status(200).json({
      success: true,
      author: authorName,
      analysis,
      formInfo,
      processing: {
        total: comments.length,
        successCount,
        failCount,
        results,
      },
      reportGenerated,
      reportUrl: reportGenerated ? `/admin/forms/${form.id}` : null,
    });
  } catch (error) {
    console.error('自動監控錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}



