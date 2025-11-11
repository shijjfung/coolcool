import type { NextApiRequest, NextApiResponse } from 'next';
import { 
  getFormsReadyForReport, 
  markReportGenerated, 
  getOrdersByFormId,
  getFormById,
  getSetting,
  ensureDatabaseInitialized 
} from '@/lib/db';
import { generateGroupBuyReportCSV, generateReportFileName } from '@/lib/report-generator';
import fs from 'fs';
import path from 'path';

// 確保響應頭設置為 JSON
function setJsonHeaders(res: NextApiResponse) {
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 立即設置 JSON 響應頭 - 必須在函數開始時設置
  setJsonHeaders(res);

  try {
    // 先檢查 HTTP 方法
    if (req.method !== 'GET' && req.method !== 'POST') {
      setJsonHeaders(res);
      return res.status(405).json({ error: 'Method not allowed', allowedMethods: ['GET', 'POST'] });
    }

    // 資料庫初始化
    let dbInitialized = false;
    try {
      await ensureDatabaseInitialized();
      dbInitialized = true;
    } catch (error: any) {
      console.error('資料庫初始化錯誤:', error);
      setJsonHeaders(res);
      return res.status(500).json({ 
        error: '資料庫初始化失敗',
        details: error?.message || '無法連接到資料庫',
        hint: '請檢查 Supabase 環境變數設定：DATABASE_TYPE, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'
      });
    }

    // 處理請求
    if (dbInitialized) {
      try {
        // 取得已到達收單截止時間但尚未生成報表的表單
        const formsReady = await getFormsReadyForReport();

        if (formsReady.length === 0) {
          setJsonHeaders(res);
          return res.status(200).json({
            message: '沒有需要生成報表的表單',
            forms: [],
            generated: 0,
          });
        }

        const generatedForms = [];

        // 取得報表輸出資料夾設定
        const reportOutputFolder = await getSetting('report_output_folder');
        const shouldAutoSave = reportOutputFolder && reportOutputFolder.trim() !== '';

        // 為每個表單生成報表
        for (const form of formsReady) {
          // 取得完整的表單資料（包含欄位資訊）
          const fullForm = await getFormById(form.id);
          if (!fullForm) continue;

          // 取得訂單資料
          const orders = await getOrdersByFormId(form.id);

          // 使用統一的報表生成函數生成 CSV 內容
          const csvWithBom = generateGroupBuyReportCSV(fullForm, orders);

          // 如果設定了輸出資料夾，自動保存報表
          let savedPath = null;
          if (shouldAutoSave) {
            try {
              const outputFolder = reportOutputFolder!.trim();
              
              // 確保資料夾存在
              if (fs.existsSync(outputFolder)) {
                // 使用統一的檔案名稱生成函數
                const fileName = generateReportFileName(fullForm.name);
                const filePath = path.join(outputFolder, fileName);

                // 寫入檔案
                fs.writeFileSync(filePath, csvWithBom, 'utf8');
                savedPath = filePath;
                console.log(`✓ 報表已自動保存到: ${filePath}`);
              } else {
                console.warn(`⚠ 報表輸出資料夾不存在: ${outputFolder}`);
              }
            } catch (error: any) {
              console.error(`✗ 保存報表失敗:`, error.message);
            }
          }

          // 標記報表已生成
          await markReportGenerated(form.id);

          generatedForms.push({
            formId: form.id,
            formName: form.name,
            formToken: form.form_token,
            orderDeadline: form.order_deadline,
            totalOrders: orders.length,
            reportUrl: `/admin/forms/${form.id}`,
            downloadUrl: `/api/reports/${form.id}/download`,
            savedPath: savedPath,
          });
        }

        setJsonHeaders(res);
        return res.status(200).json({
          message: `已為 ${generatedForms.length} 個表單生成報表`,
          forms: generatedForms,
          generated: generatedForms.length,
        });
      } catch (error: any) {
        console.error('自動生成報表錯誤:', error);
        setJsonHeaders(res);
        return res.status(500).json({ 
          error: '伺服器錯誤',
          details: error?.message || '自動生成報表時發生錯誤',
          hint: '請檢查 Supabase 連線設定和資料庫表結構'
        });
      }
    }
  } catch (error: any) {
    // 最外層錯誤處理 - 捕獲所有未預期的錯誤
    console.error('API 處理函數錯誤:', error);
    setJsonHeaders(res);
    return res.status(500).json({ 
      error: '伺服器內部錯誤',
      details: error?.message || '處理請求時發生未預期的錯誤',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
}
