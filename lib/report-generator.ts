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

/**
 * 合併多個表單的報表
 * 按照表單順序，將所有訂單合併到一張報表中
 */
export function generateMergedReportCSV(
  formsWithOrders: Array<{ form: Form; orders: Order[] }>
): string {
  if (formsWithOrders.length === 0) {
    return '';
  }

  // 收集所有欄位（使用欄位名稱作為 key，保持順序）
  const allHeaders = new Map<string, { header: string; getValue: (order: Order, form: Form) => string }>();
  
  // 先添加客戶姓名和電話（如果需要的話）
  let hasCustomerNameField = false;
  let hasCustomerPhoneField = false;
  
  // 檢查所有表單，看是否有客戶姓名和電話欄位
  for (const { form } of formsWithOrders) {
    if (form.fields.some(f => f.name === 'customer_name' || f.label.includes('姓名') || f.label.includes('客戶姓名'))) {
      hasCustomerNameField = true;
    }
    if (form.fields.some(f => f.name === 'customer_phone' || f.label.includes('電話') || f.label.includes('手機'))) {
      hasCustomerPhoneField = true;
    }
  }

  // 如果沒有客戶姓名欄位，添加
  if (!hasCustomerNameField) {
    allHeaders.set('__customer_name__', {
      header: '客戶姓名',
      getValue: (order) => order.customer_name || ''
    });
  }

  // 如果沒有電話欄位，添加
  if (!hasCustomerPhoneField) {
    allHeaders.set('__customer_phone__', {
      header: '電話',
      getValue: (order) => order.customer_phone || ''
    });
  }

  // 添加「表單名稱」欄位（用於區分不同表單的訂單）
  allHeaders.set('__form_name__', {
    header: '表單名稱',
    getValue: (order, form) => form.name
  });

  // 收集所有表單的所有欄位（按照第一個表單的順序，然後添加其他表單的新欄位）
  const headerOrder: string[] = [];
  
  // 先按照第一個表單的欄位順序
  if (formsWithOrders.length > 0) {
    formsWithOrders[0].form.fields.forEach(field => {
      if (!allHeaders.has(field.name)) {
        allHeaders.set(field.name, {
          header: field.label,
          getValue: (order, form) => {
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
        headerOrder.push(field.name);
      }
    });
  }

  // 然後添加其他表單的新欄位
  for (let i = 1; i < formsWithOrders.length; i++) {
    formsWithOrders[i].form.fields.forEach(field => {
      if (!allHeaders.has(field.name)) {
        allHeaders.set(field.name, {
          header: field.label,
          getValue: (order, form) => {
            if (field.name === 'customer_name' || field.label.includes('姓名') || field.label.includes('客戶姓名')) {
              return order.order_data[field.name] || order.customer_name || '';
            }
            if (field.name === 'customer_phone' || field.label.includes('電話') || field.label.includes('手機')) {
              return order.order_data[field.name] || order.customer_phone || '';
            }
            return order.order_data[field.name] || '';
          }
        });
        headerOrder.push(field.name);
      }
    });
  }

  // 建立標題行（按照順序）
  const headers: string[] = [];
  if (allHeaders.has('__customer_name__')) {
    headers.push(allHeaders.get('__customer_name__')!.header);
  }
  if (allHeaders.has('__customer_phone__')) {
    headers.push(allHeaders.get('__customer_phone__')!.header);
  }
  headers.push(allHeaders.get('__form_name__')!.header);
  headers.push(...headerOrder.map(key => allHeaders.get(key)!.header));
  
  // 建立所有訂單的資料行（按照表單順序）
  const allRows: string[] = [];
  
  for (const { form, orders } of formsWithOrders) {
    for (const order of orders) {
      const row: string[] = [];
      
      // 客戶姓名
      if (allHeaders.has('__customer_name__')) {
        row.push(escapeCSVValue(allHeaders.get('__customer_name__')!.getValue(order, form)));
      }
      
      // 電話
      if (allHeaders.has('__customer_phone__')) {
        row.push(escapeCSVValue(allHeaders.get('__customer_phone__')!.getValue(order, form)));
      }
      
      // 表單名稱
      row.push(escapeCSVValue(allHeaders.get('__form_name__')!.getValue(order, form)));
      
      // 表單欄位
      for (const key of headerOrder) {
        const mapping = allHeaders.get(key);
        if (mapping) {
          // 檢查這個欄位是否屬於當前表單
          const field = form.fields.find(f => f.name === key);
          if (field) {
            row.push(escapeCSVValue(mapping.getValue(order, form)));
          } else {
            // 不屬於當前表單的欄位，留空
            row.push('');
          }
        }
      }
      
      allRows.push(row.join(','));
    }
  }

  // 生成 CSV 內容
  const csvRows = [
    headers.join(','),
    ...allRows,
  ];

  const csvContent = csvRows.join('\n');
  const bom = '\ufeff'; // UTF-8 BOM for Excel
  return bom + csvContent;
}

