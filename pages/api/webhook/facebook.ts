import type { NextApiRequest, NextApiResponse } from 'next';
import { parseOrderMessage, mergeOrderItems, extractProductsFromForm } from '@/lib/message-parser';
import { getFormByToken, createOrder, ensureDatabaseInitialized, FormField } from '@/lib/db';

/**
 * Facebook Webhook API
 * 接收 Facebook 貼文留言並自動建立訂單
 * 
 * 注意：Facebook Graph API 對社團留言的存取有限制
 * 需要：
 * 1. Facebook App 審核通過
 * 2. 適當的權限（可能需要社團管理員權限）
 * 3. Webhook 驗證
 */

interface FacebookWebhookBody {
  entry: Array<{
    id: string;
    time: number;
    changes?: Array<{
      value: {
        from: { id: string; name: string };
        message: string;
        post_id: string;
        comment_id: string;
      };
      field: string;
    }>;
  }>;
  object: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();

  // Facebook Webhook 驗證（GET 請求）
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).json({ error: '驗證失敗' });
    }
  }

  // 處理 Webhook 事件（POST 請求）
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: FacebookWebhookBody = req.body;
    const formToken = process.env.FACEBOOK_FORM_TOKEN; // 預設表單代碼

    if (!formToken) {
      console.warn('Facebook 表單代碼未設定');
      return res.status(200).json({ message: '未設定表單' });
    }

    // 處理每個 entry
    for (const entry of body.entry) {
      if (!entry.changes) continue;

      for (const change of entry.changes) {
        // 只處理留言（comments）
        if (change.field !== 'comments') continue;

        const comment = change.value;
        if (!comment.message) continue;

        // 取得表單
        const form = await getFormByToken(formToken);
        if (!form) {
          console.error('找不到表單:', formToken);
          continue;
        }

        // 檢查截止時間
        const deadline = new Date(form.deadline);
        const now = new Date();
        if (now > deadline) {
          console.log('表單已超過截止時間');
          continue;
        }

        // 解析留言訊息
        const availableProducts = extractProductsFromForm(form.fields);
        const parsed = parseOrderMessage(
          comment.message,
          availableProducts,
          '預設商品'
        );

        if (!parsed || parsed.items.length === 0) {
          console.log('無法解析留言:', comment.message);
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

        // 使用 Facebook 用戶名稱作為客戶姓名
        const customerName = parsed.customerName || comment.from.name;

        // 建立訂單
        const orderToken = await createOrder(
          form.id,
          orderData,
          customerName,
          parsed.customerPhone
        );

        console.log('Facebook 訂單已建立:', {
          orderToken,
          customerName,
          items: mergedItems,
        });
      }
    }

    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    console.error('Facebook Webhook 錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}



