/**
 * 訊息解析引擎
 * 解析「韭菜+2」、「高麗菜+1」、「+1」等自然語言訊息
 */

export interface ParsedOrder {
  items: OrderItem[];
  customerName?: string;
  customerPhone?: string;
  source: 'line' | 'facebook';
  rawMessage: string;
}

export interface OrderItem {
  productName: string;
  quantity: number;
}

/**
 * 解析訊息中的訂單資訊（團購模式）
 * 支援格式：
 * - 「韭菜+2」→ { productName: '韭菜', quantity: 2 }
 * - 「高麗菜+1」→ { productName: '高麗菜', quantity: 1 }
 * - 「韭菜2」→ { productName: '韭菜', quantity: 2 }
 * - 「韭菜 2」→ { productName: '韭菜', quantity: 2 }
 * - 「+1」→ { productName: '預設商品', quantity: 1 }
 * - 「我要買韭菜2個」→ { productName: '韭菜', quantity: 2 }
 */
export function parseOrderMessage(
  message: string,
  availableProducts: string[] = [],
  defaultProduct?: string,
  mode: 'groupbuy' | 'proxy' = 'groupbuy'
): ParsedOrder | null {
  // 清理訊息
  const cleanedMessage = message.trim();

  // 如果訊息太短，可能是無效訊息
  if (cleanedMessage.length < 1) {
    return null;
  }

  const items: OrderItem[] = [];
  let customerName: string | undefined;
  let customerPhone: string | undefined;

  // 提取電話號碼（台灣手機格式）
  const phoneRegex = /(0\d{1,2}[-]?\d{6,8}|09\d{8})/g;
  const phoneMatch = cleanedMessage.match(phoneRegex);
  if (phoneMatch) {
    customerPhone = phoneMatch[0].replace(/[-]/g, '');
  }

  // 提取姓名（如果訊息開頭有「我是XXX」或「XXX+」）
  const namePatterns = [
    /^我是\s*([^\s+]+)/,
    /^([^\s+]+)\s*\+/,
    /^([^\s+]+)\s*：/,
    /^([^\s+]+)\s*:/,
  ];
  for (const pattern of namePatterns) {
    const match = cleanedMessage.match(pattern);
    if (match && match[1] && match[1].length <= 10) {
      customerName = match[1];
      break;
    }
  }

  // 解析商品和數量
  // 模式 1: 「商品名+數字」或「商品名 數字」或「商品名數字」
  const productPatterns = [
    // 「韭菜+2」、「高麗菜+1」
    /([^\s+]+)\+(\d+)/g,
    // 「韭菜2」、「高麗菜1」
    /([^\s]+?)(\d+)(?=\s|$|，|,)/g,
    // 「韭菜 2」、「高麗菜 1」
    /([^\s]+?)\s+(\d+)(?=\s|$|，|,)/g,
  ];

  const foundProducts = new Set<string>();

  for (const pattern of productPatterns) {
    let match;
    while ((match = pattern.exec(cleanedMessage)) !== null) {
      const productName = match[1].trim();
      const quantity = parseInt(match[2], 10);

      // 如果商品名稱太長，可能是誤判
      if (productName.length > 20) continue;

      // 如果數量不合理，跳過
      if (quantity < 1 || quantity > 999) continue;

      // 如果有指定可用商品列表，檢查是否匹配
      if (availableProducts.length > 0) {
        const matchedProduct = availableProducts.find(
          p => productName.includes(p) || p.includes(productName)
        );
        if (matchedProduct && !foundProducts.has(matchedProduct)) {
          items.push({ productName: matchedProduct, quantity });
          foundProducts.add(matchedProduct);
        }
      } else {
        // 沒有指定商品列表，直接使用
        if (!foundProducts.has(productName)) {
          items.push({ productName, quantity });
          foundProducts.add(productName);
        }
      }
    }
  }

  // 模式 2: 簡單的「+數字」或「+1」
  if (items.length === 0) {
    const simplePlusPattern = /\+(\d+)/;
    const match = cleanedMessage.match(simplePlusPattern);
    if (match) {
      const quantity = parseInt(match[1], 10);
      if (quantity >= 1 && quantity <= 999) {
        const productName = defaultProduct || '預設商品';
        items.push({ productName, quantity });
      }
    }
  }

  // 模式 3: 「我要買XXX」或「買XXX」
  if (items.length === 0) {
    const buyPatterns = [
      /我要買\s*([^\s]+?)(\d+)/,
      /買\s*([^\s]+?)(\d+)/,
      /我要\s*([^\s]+?)(\d+)/,
    ];

    for (const pattern of buyPatterns) {
      const match = cleanedMessage.match(pattern);
      if (match) {
        const productName = match[1].trim();
        const quantity = parseInt(match[2], 10);
        if (productName.length <= 20 && quantity >= 1 && quantity <= 999) {
          items.push({ productName, quantity });
          break;
        }
      }
    }
  }

  // 代購模式：如果沒有解析到商品，嘗試更寬鬆的解析
  if (items.length === 0 && mode === 'proxy') {
    // 代購模式：解析「我要買XXX」、「買XXX」、「XXX」等
    const proxyPatterns = [
      // 「我要買牛奶」、「我要買牛奶一罐」
      /我要買\s*([^\s]+?)(?:\s*(?:一|1)?\s*(?:罐|瓶|包|個|盒|袋|條|支|片|份))?/,
      // 「買牛奶」、「買牛奶一罐」
      /買\s*([^\s]+?)(?:\s*(?:一|1)?\s*(?:罐|瓶|包|個|盒|袋|條|支|片|份))?/,
      // 「牛奶」、「牛奶一罐」
      /^([^\s+]+?)(?:\s*(?:一|1)?\s*(?:罐|瓶|包|個|盒|袋|條|支|片|份))?$/,
      // 「牛奶一罐」、「牛奶一瓶」
      /([^\s]+?)\s*(?:一|1)\s*(罐|瓶|包|個|盒|袋|條|支|片|份)/,
    ];

    for (const pattern of proxyPatterns) {
      const match = cleanedMessage.match(pattern);
      if (match && match[1]) {
        const productName = match[1].trim();
        // 過濾掉常見的無意義詞
        const ignoreWords = ['我要', '買', '要', '的', '了', '嗎', '？', '?'];
        if (ignoreWords.includes(productName) || productName.length < 1) {
          continue;
        }
        // 如果商品名稱太長，可能是誤判
        if (productName.length > 30) continue;
        
        // 代購模式預設數量為 1
        items.push({ productName, quantity: 1 });
        break;
      }
    }

    // 如果還是沒有解析到，嘗試提取所有可能的商品名稱
    if (items.length === 0) {
      // 移除常見的無意義詞
      const cleaned = cleanedMessage
        .replace(/我要買|買|要|的|了|嗎|？|\?/g, '')
        .trim();
      
      // 如果清理後的訊息看起來像商品名稱
      if (cleaned.length >= 2 && cleaned.length <= 30) {
        // 檢查是否包含數字（可能是數量）
        const quantityMatch = cleaned.match(/(\d+)/);
        const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;
        
        // 移除數量部分，取得商品名稱
        const productName = cleaned.replace(/\d+/g, '').trim();
        
        if (productName.length >= 1) {
          items.push({ productName, quantity });
        }
      }
    }
  }

  // 如果沒有解析到任何商品，返回 null
  if (items.length === 0) {
    return null;
  }

  return {
    items,
    customerName,
    customerPhone,
    source: 'line', // 預設，實際使用時會根據來源設定
    rawMessage: cleanedMessage,
  };
}


/**
 * 合併多個訂單項目（相同商品合併數量）
 */
export function mergeOrderItems(items: OrderItem[]): OrderItem[] {
  const merged = new Map<string, number>();

  for (const item of items) {
    const existing = merged.get(item.productName) || 0;
    merged.set(item.productName, existing + item.quantity);
  }

  return Array.from(merged.entries()).map(([productName, quantity]) => ({
    productName,
    quantity,
  }));
}

/**
 * 從表單欄位中提取可用商品列表
 */
export function extractProductsFromForm(fields: any[]): string[] {
  const products: string[] = [];

  for (const field of fields) {
    // 如果欄位名稱包含「商品」、「口味」、「種類」等關鍵字
    // 注意：select 類型已移除，現在只從欄位標籤判斷
    if (
      field.label &&
      (field.label.includes('商品') ||
        field.label.includes('口味') ||
        field.label.includes('種類') ||
        field.label.includes('品項'))
    ) {
      // 如果欄位有選項（保留向後相容性）
      if (field.options && Array.isArray(field.options)) {
        products.push(...field.options);
      }
    }
  }

  return products;
}

