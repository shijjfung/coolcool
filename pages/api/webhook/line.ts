import type { NextApiRequest, NextApiResponse } from 'next';
import { parseOrderMessage, mergeOrderItems, extractProductsFromForm } from '@/lib/message-parser';
import { getFormByToken, createOrder, ensureDatabaseInitialized } from '@/lib/db';

/**
 * LINE Webhook API
 * 接收 LINE Bot 的訊息並自動建立訂單
 * 
 * 設定方式：
 * 1. 在 LINE Developers Console 建立 Bot
 * 2. 設定 Webhook URL: https://your-domain.com/api/webhook/line
 * 3. 設定 Channel Secret 和 Channel Access Token（環境變數）
 */

// LINE Messaging API 的訊息格式
interface LineEvent {
  type: string;
  message?: {
    type: string;
    text?: string;
  };
  source: {
    type: string;
    userId?: string;
    groupId?: string;
  };
  replyToken?: string;
}

interface LineWebhookBody {
  events: LineEvent[];
}

// 簡化的 LINE API 回應（實際使用時需要安裝 @line/bot-sdk）
async function replyMessage(replyToken: string, message: string, channelAccessToken: string) {
  try {
    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [
          {
            type: 'text',
            text: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('LINE API 錯誤:', await response.text());
    }
  } catch (error) {
    console.error('回覆 LINE 訊息錯誤:', error);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 驗證 LINE Webhook（實際使用時需要驗證簽章）
    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const formToken = process.env.LINE_FORM_TOKEN; // 預設表單代碼

    if (!channelSecret || !channelAccessToken) {
      console.warn('LINE 環境變數未設定，無法處理 LINE 訊息');
      return res.status(200).json({ message: 'LINE 未設定' });
    }

    const body: LineWebhookBody = req.body;

    // 處理每個事件
    for (const event of body.events) {
      // 只處理文字訊息
      if (event.type !== 'message' || event.message?.type !== 'text') {
        continue;
      }

      const messageText = event.message.text;
      if (!messageText) continue;

      // 取得表單（如果沒有設定預設表單，需要從訊息中提取）
      let targetFormToken = formToken;

      // 如果訊息包含表單代碼（例如：「@abc123 韭菜+2」）
      const formTokenMatch = messageText.match(/@(\w+)/);
      if (formTokenMatch) {
        targetFormToken = formTokenMatch[1];
      }

      if (!targetFormToken) {
        await replyMessage(
          event.replyToken!,
          '請先設定表單代碼，或使用格式：@表單代碼 商品+數量',
          channelAccessToken
        );
        continue;
      }

      // 取得表單
      const form = await getFormByToken(targetFormToken);
      if (!form) {
        await replyMessage(
          event.replyToken!,
          '找不到指定的表單，請確認表單代碼是否正確',
          channelAccessToken
        );
        continue;
      }

      // 檢查截止時間
      const deadline = new Date(form.deadline);
      const now = new Date();
      if (now > deadline) {
        await replyMessage(
          event.replyToken!,
          '此表單已超過截止時間',
          channelAccessToken
        );
        continue;
      }

      // 移除表單代碼部分（如果有的話）
      const cleanMessage = messageText.replace(/@\w+\s*/, '').trim();

      // 判斷模式：如果訊息包含「+數字」或「數字+」，使用團購模式；否則使用代購模式
      const hasGroupbuyPattern = /[\+\d]/.test(cleanMessage) && !/我要買|買\s/.test(cleanMessage);
      const mode = hasGroupbuyPattern ? 'groupbuy' : 'proxy';

      // 解析訊息
      const availableProducts = extractProductsFromForm(form.fields);
      const parsed = parseOrderMessage(cleanMessage, availableProducts, undefined, mode);

      if (!parsed || parsed.items.length === 0) {
        const suggestion = mode === 'proxy'
          ? '無法解析訂單訊息。請使用格式：商品名稱（例如：我要買牛奶、牛奶一罐）'
          : '無法解析訂單訊息。請使用格式：商品名+數量（例如：韭菜+2、高麗菜+1）';
        await replyMessage(
          event.replyToken!,
          suggestion,
          channelAccessToken
        );
        continue;
      }

      // 合併相同商品
      const mergedItems = mergeOrderItems(parsed.items);

      // 建立訂單資料
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

      // 建立訂單
      const orderToken = await createOrder(
        form.id,
        orderData,
        parsed.customerName,
        parsed.customerPhone
      );

      // 回覆確認訊息
      const itemsText = mergedItems
        .map(item => `${item.productName} x${item.quantity}`)
        .join('、');
      await replyMessage(
        event.replyToken!,
        `✅ 訂單已建立！\n\n商品：${itemsText}\n訂單代碼：${orderToken}\n\n您可以使用此代碼修改訂單。`,
        channelAccessToken
      );
    }

    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    console.error('LINE Webhook 錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}

