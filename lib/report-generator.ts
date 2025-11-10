import type { Form, Order } from './db';

/**
 * 生成團購報表 CSV 內容
 * 完全依照表單欄位順序輸出
 * 如果表單欄位中沒有客戶姓名/電話，會自動從訂單的 customer_name/customer_phone 取得
 */
export function generateGroupBuyReportCSV(form: Form, orders: Order[]): string {
  // 檢查表單欄位中是否已經有客戶姓名和電話欄位
  const hasCustomerNameField = form.fields.some(f => 
    f.name === 'customer_name' || f.label.includes('姓名') || f.label.includes('客戶姓名')
  );
  const hasCustomerPhoneField = form.fields.some(f => 
    f.name === 'customer_phone' || f.label.includes('電話') || f.label.includes('手機')
  );
  
  // 如果表單中沒有客戶姓名欄位，在前面加上
  const headers: string[] = [];
  const headerMappings: Array<{ header: string; getValue: (order: Order) => string }> = [];
  
  if (!hasCustomerNameField) {
    headers.push('客戶姓名');
    headerMappings.push({
      header: '客戶姓名',
      getValue: (order) => order.customer_name || ''
    });
  }
  
  if (!hasCustomerPhoneField) {
    headers.push('電話');
    headerMappings.push({
      header: '電話',
      getValue: (order) => order.customer_phone || ''
    });
  }
  
  // 然後按照表單欄位順序添加所有欄位
  form.fields.forEach(field => {
    headers.push(field.label);
    headerMappings.push({
      header: field.label,
      getValue: (order) => {
        // 如果是客戶姓名或電話欄位，優先從 order_data 取得，否則從 customer_name/customer_phone 取得
        if (field.name === 'customer_name' || field.label.includes('姓名') || field.label.includes('客戶姓名')) {
          return order.order_data[field.name] || order.customer_name || '';
        }
        if (field.name === 'customer_phone' || field.label.includes('電話') || field.label.includes('手機')) {
          return order.order_data[field.name] || order.customer_phone || '';
        }
        return order.order_data[field.name] || '';
      }
    });
  });
  
  // 生成 CSV 行
  const csvRows = [
    headers.join(','),
    ...orders.map((order) => {
      const row = headerMappings.map(mapping => 
        escapeCSVValue(mapping.getValue(order))
      );
      return row.join(',');
    }),
  ];
  
  const csvContent = csvRows.join('\n');
  const bom = '\ufeff'; // UTF-8 BOM for Excel
  return bom + csvContent;
}

/**
 * 轉義 CSV 值（處理逗號、引號等特殊字元）
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // 如果包含逗號、引號或換行符，需要用引號包起來
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * 生成報表檔案名稱
 */
export function generateReportFileName(formName: string, date?: Date): string {
  const dateStr = (date || new Date()).toISOString().split('T')[0];
  const safeFormName = formName.replace(/[<>:"/\\|?*]/g, '_'); // 移除檔案名稱不允許的字元
  return `訂單報表_${safeFormName}_${dateStr}.csv`;
}

