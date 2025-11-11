import type { NextApiRequest, NextApiResponse } from 'next';
import { getFormById, getOrdersByFormId, ensureDatabaseInitialized } from '@/lib/db';

/**
 * 計算兩個字串的相似度（0-1之間，1表示完全相同）
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;
  
  // 方法1：共同字符比例
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  // 計算共同字符數
  let commonChars = 0;
  const shorterSet = new Set(shorter.split(''));
  for (const char of longer.split('')) {
    if (shorterSet.has(char)) {
      commonChars++;
    }
  }
  const charSimilarity = commonChars / longer.length;
  
  // 方法2：檢查是否包含相同的關鍵字（至少2個字符）
  const keywords1 = extractKeywords(s1);
  const keywords2 = extractKeywords(s2);
  const commonKeywords = keywords1.filter(k => keywords2.includes(k));
  const keywordSimilarity = commonKeywords.length > 0 
    ? commonKeywords.length / Math.max(keywords1.length, keywords2.length)
    : 0;
  
  // 方法3：檢查是否有相同的連續子字串（至少2個字符）
  let maxCommonSubstring = 0;
  for (let i = 0; i <= s1.length - 2; i++) {
    for (let j = 0; j <= s2.length - 2; j++) {
      let k = 0;
      while (i + k < s1.length && j + k < s2.length && s1[i + k] === s2[j + k]) {
        k++;
      }
      if (k >= 2) {
        maxCommonSubstring = Math.max(maxCommonSubstring, k);
      }
    }
  }
  const substringSimilarity = maxCommonSubstring > 0 
    ? maxCommonSubstring / Math.max(s1.length, s2.length)
    : 0;
  
  // 綜合相似度（加權平均）
  return (charSimilarity * 0.3 + keywordSimilarity * 0.4 + substringSimilarity * 0.3);
}

/**
 * 提取關鍵字（至少2個字符的連續中文字或英文單詞）
 */
function extractKeywords(str: string): string[] {
  const keywords: string[] = [];
  // 匹配中文字（至少2個字符）
  const chineseMatches = str.match(/[\u4e00-\u9fa5]{2,}/g);
  if (chineseMatches) {
    keywords.push(...chineseMatches);
  }
  // 匹配英文單詞（至少2個字符）
  const englishMatches = str.match(/[a-zA-Z]{2,}/g);
  if (englishMatches) {
    keywords.push(...englishMatches.map(w => w.toLowerCase()));
  }
  return keywords;
}

/**
 * 智能排序：將相似名稱的物品排列在一起
 */
function smartSortItems(items: Array<{ name: string; quantity: number }>): Array<{ name: string; quantity: number }> {
  if (items.length <= 1) return items;
  
  const sorted: Array<{ name: string; quantity: number }> = [];
  const used = new Set<number>();
  const similarityThreshold = 0.3; // 相似度閾值（30%以上視為相似）
  
  // 先按數量降序排列（作為初始順序）
  const sortedByQuantity = [...items].sort((a, b) => b.quantity - a.quantity);
  
  // 遍歷每個物品
  for (let i = 0; i < sortedByQuantity.length; i++) {
    if (used.has(i)) continue;
    
    const current = sortedByQuantity[i];
    sorted.push(current);
    used.add(i);
    
    // 尋找與當前物品相似的其他物品
    const similarItems: Array<{ index: number; similarity: number }> = [];
    
    for (let j = i + 1; j < sortedByQuantity.length; j++) {
      if (used.has(j)) continue;
      
      const similarity = calculateSimilarity(current.name, sortedByQuantity[j].name);
      if (similarity >= similarityThreshold) {
        similarItems.push({ index: j, similarity });
      }
    }
    
    // 按相似度降序排列相似物品，然後加入結果
    similarItems.sort((a, b) => b.similarity - a.similarity);
    
    for (const similar of similarItems) {
      sorted.push(sortedByQuantity[similar.index]);
      used.add(similar.index);
    }
  }
  
  return sorted;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formId } = req.query;

    if (!formId || isNaN(Number(formId))) {
      return res.status(400).json({ error: '無效的表單 ID' });
    }

    const form = await getFormById(Number(formId));
    if (!form) {
      return res.status(404).json({ error: '表單不存在' });
    }

    const orders = await getOrdersByFormId(Number(formId));

    // 統計物品名稱和數量
    const itemStatistics: Record<string, number> = {};

    for (const order of orders) {
      // 從 items_summary 中提取物品（如果存在）
      if (order.items_summary && Array.isArray(order.items_summary)) {
        for (const item of order.items_summary) {
          if (item.name && item.quantity) {
            const itemName = item.name.trim();
            itemStatistics[itemName] = (itemStatistics[itemName] || 0) + item.quantity;
          }
        }
      }
    }

    // 轉換為數組格式
    const statistics = Object.entries(itemStatistics)
      .map(([name, quantity]) => ({ name, quantity }));

    // 智能排序：將相似名稱排列在一起
    const sortedStatistics = smartSortItems(statistics);

    // 生成 CSV 內容
    const csvRows: string[] = [];
    csvRows.push('物品名稱,總數量');
    for (const stat of sortedStatistics) {
      csvRows.push(`"${stat.name.replace(/"/g, '""')}",${stat.quantity}`);
    }

    const csvContent = csvRows.join('\n');

    // 設定回應標頭
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');

    // 處理中文檔名
    const dateStr = new Date().toISOString().split('T')[0];
    const safeFormName = form.name.replace(/[^\x20-\x7E]/g, '_');
    const safeFileName = `items_statistics_${safeFormName}_${dateStr}.csv`;
    const encodedFileName = encodeURIComponent(`物品統計_${form.name}_${dateStr}.csv`);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`
    );

    return res.status(200).send(csvContent);
  } catch (error: any) {
    console.error('下載物品統計錯誤:', error);
    return res.status(500).json({ error: error.message || '伺服器錯誤' });
  }
}

