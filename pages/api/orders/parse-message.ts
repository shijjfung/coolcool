import type { NextApiRequest, NextApiResponse } from 'next';
import { parseOrderMessage, mergeOrderItems, extractProductsFromForm } from '@/lib/message-parser';
import { getFormByToken, createOrder, ensureDatabaseInitialized, FormField } from '@/lib/db';

/**
 * API: 解析訊息並自動建立訂單
 * POST /api/orders/parse-message
 * 
 * Body:
 * {
 *   formToken: string,        // 表單代碼
 *   message: string,          // 要解析的訊息（如「韭菜+2」）
 *   customerName?: string,    // 客戶姓名（可選，會嘗試從訊息中提取）
 *   customerPhone?: string,   // 客戶電話（可選，會嘗試從訊息中提取）
 *   source: 'line' | 'facebook' // 訊息來源
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
    const { formToken, message, customerName, customerPhone, source = 'line', mode = 'groupbuy' } = req.body;

    if (!formToken || !message) {
      return res.status(400).json({ error: '缺少必要欄位：formToken 和 message' });
    }

    // 取得表單資訊
    const form = await getFormByToken(formToken);
    if (!form) {
      return res.status(404).json({ error: '表單不存在' });
    }

    // 檢查是否超過截止時間
    const deadline = new Date(form.deadline);
    const now = new Date();
    if (now > deadline) {
      return res.status(400).json({ error: '表單已超過截止時間' });
    }

    // 從表單欄位中提取可用商品列表
    const availableProducts = extractProductsFromForm(form.fields);

      // 解析訊息（支援團購和代購模式）
      const parsed = parseOrderMessage(
        message,
        availableProducts,
        '預設商品', // 如果沒有指定商品，使用預設名稱
        mode === 'proxy' ? 'proxy' : 'groupbuy' // 代購模式或團購模式
      );

    if (!parsed || parsed.items.length === 0) {
      const suggestion = mode === 'proxy' 
        ? '請使用格式：商品名稱（例如：我要買牛奶、牛奶一罐、牛奶）'
        : '請使用格式：商品名+數量（例如：韭菜+2、高麗菜+1）';
      return res.status(400).json({
        error: '無法解析訂單訊息',
        suggestion,
      });
    }

    // 合併相同商品
    const mergedItems = mergeOrderItems(parsed.items);

    // 使用提供的客戶資訊，或從訊息中提取的資訊
    const finalCustomerName = customerName || parsed.customerName;
    const finalCustomerPhone = customerPhone || parsed.customerPhone;

    // 將訂單項目轉換為表單格式
    const orderData: Record<string, any> = {};

    // 如果有商品欄位，填入第一個商品
    const productField = form.fields.find(
      (f: FormField) => f.label.includes('商品') || f.label.includes('品項') || f.label.includes('口味')
    );
    if (productField && mergedItems.length > 0) {
      orderData[productField.name] = mergedItems[0].productName;
    }

    // 如果有數量欄位，填入總數量
    const quantityField = form.fields.find(
      (f: FormField) => f.label.includes('數量') || f.label.includes('訂購數量')
    );
    if (quantityField) {
      const totalQuantity = mergedItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
      orderData[quantityField.name] = totalQuantity;
    }

    // 如果有姓名欄位，填入姓名
    const nameField = form.fields.find(
      (f: FormField) => f.label.includes('姓名') || f.label.includes('名字')
    );
    if (nameField && finalCustomerName) {
      orderData[nameField.name] = finalCustomerName;
    }

    // 如果有電話欄位，填入電話
    const phoneField = form.fields.find(
      (f: FormField) => f.label.includes('電話') || f.label.includes('手機')
    );
    if (phoneField && finalCustomerPhone) {
      orderData[phoneField.name] = finalCustomerPhone;
    }

    // 如果有多個商品，將所有商品資訊存入一個欄位
    if (mergedItems.length > 1) {
      const allItemsText = mergedItems
        .map((item: any) => `${item.productName} x${item.quantity}`)
        .join('、');
      // 嘗試找到「備註」或「其他」欄位
      const noteField = form.fields.find(
        (f: FormField) => f.label.includes('備註') || f.label.includes('其他') || f.label.includes('備註')
      );
      if (noteField) {
        orderData[noteField.name] = `多項商品：${allItemsText}`;
      } else {
        // 如果沒有備註欄位，使用第一個欄位
        const firstField = form.fields[0];
        if (firstField) {
          orderData[firstField.name] = `${orderData[firstField.name] || ''} (${allItemsText})`;
        }
      }
    }

    // 建立訂單
    const orderToken = await createOrder(
      form.id,
      orderData,
      finalCustomerName,
      finalCustomerPhone,
      undefined,
      undefined,
      source,
      form
    );

    return res.status(200).json({
      success: true,
      orderToken,
      parsed: {
        items: mergedItems,
        customerName: finalCustomerName,
        customerPhone: finalCustomerPhone,
      },
      message: '訂單已自動建立',
    });
  } catch (error) {
    console.error('解析訊息錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}

