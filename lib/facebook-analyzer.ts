/**
 * Facebook 貼文分析器
 * 分析貼文內容，判斷是團購還是代購
 */

export interface PostAnalysis {
  type: 'groupbuy' | 'proxy' | 'unknown';
  confidence: number;
  keywords: string[];
  products?: string[];
}

/**
 * 分析貼文內容，判斷是團購還是代購
 */
export function analyzePostType(postText: string): PostAnalysis {
  const text = postText.toLowerCase();
  
  // 團購關鍵字
  const groupbuyKeywords = [
    '團購', '團', '預購', '預訂', '訂購', '下單',
    '口味', '選項', '尺寸', '規格',
    '截止', '收單', '結單',
    '數量', '份', '組',
  ];
  
  // 代購關鍵字
  const proxyKeywords = [
    '代購', '代買', '幫忙買', '幫買',
    '要去', '會去', '會經過',
    '大賣場', '好市多', '全聯', '家樂福', '愛買',
    '超市', '賣場', '商場',
    '要買的', '需要的', '想要的',
  ];
  
  // 商品關鍵字（用於提取商品名稱）
  const productKeywords = [
    '水餃', '餃子', '麵', '飯', '便當',
    '牛奶', '雞蛋', '麵包', '衛生紙',
    't恤', '衣服', '褲子', '鞋子',
  ];
  
  let groupbuyScore = 0;
  let proxyScore = 0;
  const foundKeywords: string[] = [];
  const foundProducts: string[] = [];
  
  // 檢查團購關鍵字
  for (const keyword of groupbuyKeywords) {
    if (text.includes(keyword)) {
      groupbuyScore += 1;
      foundKeywords.push(keyword);
    }
  }
  
  // 檢查代購關鍵字
  for (const keyword of proxyKeywords) {
    if (text.includes(keyword)) {
      proxyScore += 1;
      foundKeywords.push(keyword);
    }
  }
  
  // 檢查商品關鍵字
  for (const keyword of productKeywords) {
    if (text.includes(keyword)) {
      foundProducts.push(keyword);
    }
  }
  
  // 判斷類型
  let type: 'groupbuy' | 'proxy' | 'unknown' = 'unknown';
  let confidence = 0;
  
  if (groupbuyScore > proxyScore && groupbuyScore > 0) {
    type = 'groupbuy';
    confidence = Math.min(groupbuyScore / 3, 1); // 最多3個關鍵字就100%信心
  } else if (proxyScore > groupbuyScore && proxyScore > 0) {
    type = 'proxy';
    confidence = Math.min(proxyScore / 3, 1);
  } else if (groupbuyScore === proxyScore && groupbuyScore > 0) {
    // 如果分數相同，根據更多線索判斷
    if (text.includes('底下留言') || text.includes('留言')) {
      type = 'groupbuy';
      confidence = 0.6;
    } else if (text.includes('要去') || text.includes('會去')) {
      type = 'proxy';
      confidence = 0.6;
    }
  }
  
  return {
    type,
    confidence,
    keywords: foundKeywords,
    products: foundProducts.length > 0 ? foundProducts : undefined,
  };
}

/**
 * 從貼文中提取表單相關資訊
 */
export function extractFormInfo(postText: string): {
  deadline?: string;
  orderDeadline?: string; // 結單時間
  products?: Array<{ name: string; price?: number; unit?: string }>;
  description?: string;
} {
  const text = postText;
  
  // 提取結單時間（例如：09點結單、9點結單、21:00結單）
  const orderDeadlinePatterns = [
    /(\d{1,2})[:：](\d{2})\s*結單/,
    /(\d{1,2})\s*點\s*結單/,
    /結單[：:]\s*(\d{1,2})[:：](\d{2})/,
    /結單[：:]\s*(\d{1,2})\s*點/,
  ];
  
  let orderDeadline: string | undefined;
  for (const pattern of orderDeadlinePatterns) {
    const match = text.match(pattern);
    if (match) {
      const hour = match[1].padStart(2, '0');
      const minute = match[2] ? match[2] : '00';
      // 假設是今天的時間，可以改進為指定日期
      const today = new Date();
      orderDeadline = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T${hour}:${minute}:00`;
      break;
    }
  }
  
  // 提取截止時間（一般格式）
  const deadlinePatterns = [
    /(\d{1,2}[月\/]\d{1,2}[日]?\s*\d{1,2}[:：]\d{2})/,
    /(截止[：:]\s*\d{1,2}[月\/]\d{1,2}[日]?\s*\d{1,2}[:：]\d{2})/,
    /(收單[：:]\s*\d{1,2}[月\/]\d{1,2}[日]?\s*\d{1,2}[:：]\d{2})/,
  ];
  
  let deadline: string | undefined;
  for (const pattern of deadlinePatterns) {
    const match = text.match(pattern);
    if (match) {
      deadline = match[1];
      break;
    }
  }
  
  // 提取商品和價格（例如：阿里水餃 辣味150、蔬菜餅 1包 30）
  const products: Array<{ name: string; price?: number; unit?: string }> = [];
  
  // 模式1: 商品名 規格價格（例如：阿里水餃 辣味150）
  const productPricePattern1 = /([^\s]+(?:\s+[^\s]+)?)\s+([^\s]+)\s*(\d+)/g;
  let match;
  while ((match = productPricePattern1.exec(text)) !== null) {
    const productName = match[1].trim();
    const variant = match[2].trim();
    const price = parseInt(match[3], 10);
    
    // 檢查是否包含常見商品關鍵字
    if (productName.includes('水餃') || productName.includes('餅') || 
        productName.includes('商品') || variant.includes('味') || 
        variant.includes('包') || variant.includes('個')) {
      products.push({
        name: `${productName} ${variant}`,
        price,
      });
    }
  }
  
  // 模式2: 商品名 數量單位 價格（例如：蔬菜餅 1包 30）
  const productPricePattern2 = /([^\s]+(?:\s+[^\s]+)?)\s+(\d+)\s*([^\s]+)\s*(\d+)/g;
  while ((match = productPricePattern2.exec(text)) !== null) {
    const productName = match[1].trim();
    const quantity = match[2];
    const unit = match[3].trim();
    const price = parseInt(match[4], 10);
    
    if (productName.includes('餅') || productName.includes('商品') || 
        unit.includes('包') || unit.includes('個')) {
      products.push({
        name: productName,
        price,
        unit: `${quantity}${unit}`,
      });
    }
  }
  
  // 如果沒有提取到商品，嘗試簡單模式
  if (products.length === 0) {
    const simpleProductPatterns = [
      /口味[：:]\s*([^\n]+)/,
      /商品[：:]\s*([^\n]+)/,
      /品項[：:]\s*([^\n]+)/,
    ];
    
    for (const pattern of simpleProductPatterns) {
      const match = text.match(pattern);
      if (match) {
        const productList = match[1].split(/[、,，]/).map(p => p.trim());
        products.push(...productList.map(name => ({ name })));
      }
    }
  }
  
  return {
    deadline,
    orderDeadline,
    products: products.length > 0 ? products : undefined,
    description: text.substring(0, 200),
  };
}

/**
 * 識別發文者
 */
export function identifyPostAuthor(postText: string, authorName?: string): {
  author: string | null;
  confidence: number;
} {
  if (authorName) {
    return {
      author: authorName,
      confidence: 1.0,
    };
  }
  
  // 嘗試從貼文中提取發文者資訊
  // 這是一個簡單版本，實際使用時應該從 Facebook API 取得
  return {
    author: null,
    confidence: 0,
  };
}

