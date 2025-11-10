// 演示腳本：建立測試表單和訂單
const http = require('http');

const baseURL = 'http://localhost:3000';

// 建立表單
function createForm() {
  return new Promise((resolve, reject) => {
    const formData = JSON.stringify({
      name: '演示訂單表單 - 2024年春季',
      deadline: '2024-12-31T23:59:00',
      fields: [
        { name: 'customer_name', label: '客戶姓名', type: 'text', required: true },
        { name: 'customer_phone', label: '電話', type: 'text', required: true },
        { name: 'product_name', label: '商品名稱', type: 'text', required: true },
        { name: 'quantity', label: '訂購數量', type: 'number', required: true },
        { name: 'spicy_level', label: '辣度', type: 'select', required: true, options: ['不辣', '微辣', '辣'] }
      ]
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/forms/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': formData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('✅ 表單建立成功！');
            console.log('表單 Token:', result.formToken);
            console.log('表單網址:', `${baseURL}/form/${result.formToken}`);
            resolve(result);
          } else {
            console.error('❌ 建立表單失敗:', result);
            reject(result);
          }
        } catch (e) {
          console.error('解析回應錯誤:', e);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('請求錯誤:', e.message);
      reject(e);
    });

    req.write(formData);
    req.end();
  });
}

// 建立訂單
function createOrder(formToken) {
  return new Promise((resolve, reject) => {
    const orderData = JSON.stringify({
      formToken: formToken,
      customerName: '張三',
      customerPhone: '0912345678',
      orderData: {
        customer_name: '張三',
        customer_phone: '0912345678',
        product_name: '麻辣燙',
        quantity: 3,
        spicy_level: '微辣'
      }
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/orders/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': orderData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('✅ 訂單建立成功！');
            console.log('訂單 Token:', result.orderToken);
            resolve(result);
          } else {
            console.error('❌ 建立訂單失敗:', result);
            reject(result);
          }
        } catch (e) {
          console.error('解析回應錯誤:', e);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('請求錯誤:', e.message);
      reject(e);
    });

    req.write(orderData);
    req.end();
  });
}

// 主函數
async function demo() {
  console.log('🚀 開始演示...\n');
  
  try {
    // 建立表單
    console.log('📝 步驟 1: 建立表單...');
    const formResult = await createForm();
    const formToken = formResult.formToken;
    
    console.log('\n📋 表單資訊:');
    console.log('  名稱: 演示訂單表單 - 2024年春季');
    console.log('  欄位: 客戶姓名、電話、商品名稱、訂購數量、辣度');
    console.log('  表單網址:', `${baseURL}/form/${formToken}`);
    console.log('  管理頁面:', `${baseURL}/admin`);
    
    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 建立訂單
    console.log('\n📦 步驟 2: 建立測試訂單...');
    const orderResult = await createOrder(formToken);
    
    console.log('\n✅ 演示完成！');
    console.log('\n📊 現在您可以：');
    console.log('  1. 訪問表單:', `${baseURL}/form/${formToken}`);
    console.log('  2. 訪問管理頁面:', `${baseURL}/admin`);
    console.log('  3. 使用訂單代碼測試驗證:', orderResult.orderToken);
    console.log('  4. 驗證資訊: 姓名=張三, 電話=0912345678');
    
  } catch (error) {
    console.error('❌ 演示失敗:', error);
  }
}

// 執行演示
demo();




