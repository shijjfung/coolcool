import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderByToken, getFormById, ensureDatabaseInitialized } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: '缺少訂單代碼' });
    }

    // 取得訂單
    const order = await getOrderByToken(token);
    if (!order) {
      return res.status(404).json({ error: '訂單不存在' });
    }

    // 取得表單
    const form = await getFormById(order.form_id);
    if (!form) {
      return res.status(404).json({ error: '表單不存在' });
    }

    // 生成訂單明細 HTML
    const htmlContent = generateOrderDetailHTML(form, order);

    // 設定回應標頭
    res.setHeader('Content-Type', 'text/html;charset=utf-8');
    
    // 處理中文檔名
    const dateStr = new Date().toISOString().split('T')[0];
    const safeFileName = `order_${token.substring(0, 8)}_${dateStr}.html`;
    const encodedFileName = encodeURIComponent(`訂單明細_${token.substring(0, 8)}_${dateStr}.html`);
    
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`
    );

    return res.status(200).send(htmlContent);
  } catch (error: any) {
    console.error('下載訂單明細錯誤:', error);
    return res.status(500).json({ error: error.message || '伺服器錯誤' });
  }
}

function generateOrderDetailHTML(form: any, order: any): string {
  const orderDate = new Date(order.created_at).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const deadline = new Date(form.deadline).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  let itemsHTML = '';
  let totalPrice = 0;

  form.fields.forEach((field: any) => {
    const value = order.order_data[field.name];
    if (value === null || value === undefined || value === '') return;

    const quantity = field.type === 'number' ? (parseFloat(String(value)) || 0) : 0;
    const itemTotal = field.price && field.price > 0 && quantity > 0 
      ? quantity * field.price 
      : 0;
    totalPrice += itemTotal;

    itemsHTML += `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${field.label}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ${String(value)}
          ${field.type === 'number' && quantity > 0 ? ' 單位' : ''}
        </td>
        ${field.price && field.price > 0 ? `
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ${field.price} 元/單位
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #059669; font-weight: bold;">
            ${itemTotal > 0 ? `${itemTotal.toFixed(0)} 元` : '-'}
          </td>
        ` : '<td colspan="2"></td>'}
      </tr>
    `;
  });

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>訂單明細 - ${form.name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #1f2937;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .info-section {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #6b7280;
    }
    .info-value {
      color: #1f2937;
      font-weight: 500;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #3b82f6;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .total-row {
      background: #d1fae5;
      font-weight: bold;
      font-size: 1.1em;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 0.9em;
    }
    @media print {
      body {
        background: white;
      }
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${form.name} - 訂單明細</h1>
    
    <div class="info-section">
      <div class="info-row">
        <span class="info-label">訂單編號：</span>
        <span class="info-value">${order.order_token}</span>
      </div>
      <div class="info-row">
        <span class="info-label">下單時間：</span>
        <span class="info-value">${orderDate}</span>
      </div>
      ${order.customer_name ? `
      <div class="info-row">
        <span class="info-label">客戶姓名：</span>
        <span class="info-value">${order.customer_name}</span>
      </div>
      ` : ''}
      ${order.customer_phone ? `
      <div class="info-row">
        <span class="info-label">聯絡電話：</span>
        <span class="info-value">${order.customer_phone}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span class="info-label">結單時間：</span>
        <span class="info-value">${deadline}</span>
      </div>
      ${form.pickup_time ? `
      <div class="info-row">
        <span class="info-label">取貨時間：</span>
        <span class="info-value" style="color: #059669; font-weight: bold;">${form.pickup_time}</span>
      </div>
      ` : ''}
    </div>

    <h2 style="margin-top: 30px; color: #1f2937;">訂單內容</h2>
    <table>
      <thead>
        <tr>
          <th>項目</th>
          <th style="text-align: right;">數量/內容</th>
          ${form.fields.some((f: any) => f.price && f.price > 0) ? `
          <th style="text-align: right;">單價</th>
          <th style="text-align: right;">小計</th>
          ` : ''}
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
        ${totalPrice > 0 ? `
        <tr class="total-row">
          <td colspan="${form.fields.some((f: any) => f.price && f.price > 0) ? '3' : '1'}" style="text-align: right; font-size: 1.2em;">
            總計價格：
          </td>
          <td style="text-align: right; font-size: 1.3em; color: #059669;">
            ${totalPrice.toFixed(0)} 元
          </td>
        </tr>
        ` : ''}
      </tbody>
    </table>

    <div class="footer">
      <p>此訂單明細由系統自動生成</p>
      <p>列印時間：${new Date().toLocaleString('zh-TW')} 涼涼古早味冰品團購</p>
    </div>
  </div>
</body>
</html>`;
}

