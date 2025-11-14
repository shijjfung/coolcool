import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersByFormId, getFormById, ensureDatabaseInitialized } from '@/lib/db';
import { generateMergedReportCSV, generateReportFileName } from '@/lib/report-generator';

/**
 * 合併多個表單的報表
 * POST /api/reports/merge
 * Body: { formIds: number[] }
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
    const { formIds } = req.body;

    if (!formIds || !Array.isArray(formIds) || formIds.length === 0) {
      return res.status(400).json({ error: '請提供要合併的表單 ID 列表' });
    }

    // 取得所有表單和訂單資料
    const formsWithOrders = [];
    for (const formId of formIds) {
      const form = await getFormById(Number(formId));
      if (!form) {
        console.warn(`表單 ${formId} 不存在，跳過`);
        continue;
      }

      const orders = await getOrdersByFormId(Number(formId));
      formsWithOrders.push({ form, orders });
    }

    if (formsWithOrders.length === 0) {
      return res.status(400).json({ error: '沒有找到有效的表單' });
    }

    // 生成合併報表
    const csvContent = generateMergedReportCSV(formsWithOrders);
    
    // 生成檔名（使用第一個表單名稱和日期）
    const firstFormName = formsWithOrders[0].form.name;
    const fileName = `合併報表_${firstFormName}_${formsWithOrders.length}張_${new Date().toISOString().split('T')[0]}.csv`;

    // 設定回應標頭
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    
    // 處理中文檔名
    const dateStr = new Date().toISOString().split('T')[0];
    const safeFormName = firstFormName.replace(/[^\x20-\x7E]/g, '_');
    const safeFileName = `merged_report_${safeFormName}_${formsWithOrders.length}_${dateStr}.csv`;
    const encodedFileName = encodeURIComponent(fileName);
    
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`
    );

    return res.status(200).send(csvContent);
  } catch (error: any) {
    console.error('合併報表錯誤:', error);
    return res.status(500).json({
      error: '伺服器錯誤',
      details: error.message,
    });
  }
}

