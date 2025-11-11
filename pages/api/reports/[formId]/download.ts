import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrdersByFormId, getFormById, ensureDatabaseInitialized } from '@/lib/db';
import { generateGroupBuyReportCSV, generateReportFileName } from '@/lib/report-generator';

/**
 * 下載報表 CSV
 * GET /api/reports/[formId]/download
 * 
 * 報表格式（團購專用）：
 * 客戶姓名、電話、商品名稱、數量、口味、尺寸等
 */
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

    if (!formId || typeof formId !== 'string') {
      return res.status(400).json({ error: '無效的表單 ID' });
    }

    const form = await getFormById(parseInt(formId));
    if (!form) {
      return res.status(404).json({ error: '表單不存在' });
    }

    const orders = await getOrdersByFormId(parseInt(formId));

    // 使用統一的報表生成函數
    const csvContent = generateGroupBuyReportCSV(form, orders);
    const fileName = generateReportFileName(form.name);

    // 設定回應標頭
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    
    // 處理中文檔名：生成安全的 ASCII fallback 檔名
    // 將中文轉換為拼音或使用英文檔名作為 fallback
    const dateStr = new Date().toISOString().split('T')[0];
    const safeFormName = form.name.replace(/[^\x20-\x7E]/g, '_'); // 移除非 ASCII 字元
    const safeFileName = `report_${safeFormName}_${dateStr}.csv`;
    
    // 編碼原始中文檔名（用於 filename* 參數）
    const encodedFileName = encodeURIComponent(fileName);
    
    // 使用 RFC 5987 格式，提供 ASCII fallback 和 UTF-8 編碼版本
    // filename 參數只包含 ASCII 字元（給舊瀏覽器）
    // filename* 參數包含 UTF-8 編碼的中文檔名（給現代瀏覽器）
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`
    );

    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('下載報表錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}



