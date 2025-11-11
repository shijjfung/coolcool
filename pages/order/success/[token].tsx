import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'costco';
  required: boolean;
  options?: string[];
  price?: number;
}

interface Form {
  id: number;
  name: string;
  fields: FormField[];
  deadline: string;
  pickup_time?: string;
  created_at: string;
  form_token: string;
}

interface Order {
  id: number;
  form_id: number;
  customer_name?: string;
  customer_phone?: string;
  order_data: Record<string, any>;
  created_at: string;
  order_token: string;
}

export default function OrderSuccess() {
  const router = useRouter();
  const { token } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token && typeof token === 'string') {
      fetchOrderData();
    }
  }, [token]);

  const fetchOrderData = async () => {
    try {
      // 取得訂單
      const orderRes = await fetch(`/api/orders/${token}`);
      const orderData = await orderRes.json();

      if (orderRes.ok && orderData.order) {
        setOrder(orderData.order);
        
        // 取得表單（通過 form_id）
        const formId = orderData.order.form_id;
        if (formId) {
          try {
            const formRes = await fetch(`/api/forms/${formId}`);
            if (formRes.ok) {
              const formData = await formRes.json();
              setForm(formData);
            }
          } catch (error) {
            console.error('取得表單錯誤:', error);
          }
        }
      } else {
        alert('訂單不存在');
        router.push('/');
      }
    } catch (error) {
      console.error('取得訂單資料錯誤:', error);
      alert('載入訂單資料時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  // 計算單項總計
  const calculateItemTotal = (field: FormField): number => {
    if (!field.price || field.price <= 0) return 0;
    if (!order) return 0;
    const quantity = parseFloat(order.order_data[field.name]) || 0;
    return quantity * field.price;
  };

  // 計算總計價格
  const calculateTotal = (): number => {
    if (!form) return 0;
    return form.fields.reduce((total, field) => {
      return total + calculateItemTotal(field);
    }, 0);
  };

  // 下載為圖片
  const downloadAsImage = async () => {
    if (!printRef.current) return;

    try {
      // 動態導入 html2canvas（僅在需要時載入）
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(printRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        width: printRef.current.scrollWidth,
        height: printRef.current.scrollHeight,
      });

      // 轉換為圖片並下載
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `訂單明細_${order?.order_token.substring(0, 8)}_${dateStr}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error('下載圖片錯誤:', error);
      if (error.message && error.message.includes('html2canvas')) {
        alert('下載圖片功能需要安裝 html2canvas 套件。請執行：npm install html2canvas');
      } else {
        alert('下載圖片失敗：' + (error.message || '未知錯誤'));
      }
    }
  };

  // 列印
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  if (!order || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">訂單不存在</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <>
      <Head>
        <title>訂單確認 - {form.name}</title>
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-content, .print-content * {
              visibility: visible;
            }
            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </Head>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* 操作按鈕（不列印） */}
          <div className="no-print mb-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md flex items-center justify-center gap-2"
            >
              🖨️ 列印訂單
            </button>
            <button
              onClick={downloadAsImage}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md flex items-center justify-center gap-2"
            >
              📥 下載為圖片
            </button>
            <button
              onClick={() => router.push(`/form/${form.form_token}`)}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-md flex items-center justify-center gap-2"
            >
              ← 返回表單
            </button>
          </div>

          {/* 訂單明細內容（可列印） */}
          <div ref={printRef} className="print-content bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{form.name}</h1>
              <p className="text-lg text-gray-600">訂單確認單</p>
            </div>

            {/* 訂單資訊 */}
            <div className="mb-6 space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-semibold text-gray-700">訂單編號：</span>
                <span className="text-gray-900 font-mono">{order.order_token}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-semibold text-gray-700">下單時間：</span>
                <span className="text-gray-900">{orderDate}</span>
              </div>
              {order.customer_name && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">客戶姓名：</span>
                  <span className="text-gray-900">{order.customer_name}</span>
                </div>
              )}
              {order.customer_phone && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">聯絡電話：</span>
                  <span className="text-gray-900">{order.customer_phone}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-semibold text-gray-700">結單時間：</span>
                <span className="text-gray-900">{deadline}</span>
              </div>
              {form.pickup_time && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">取貨時間：</span>
                  <span className="text-green-600 font-bold">{form.pickup_time}</span>
                </div>
              )}
            </div>

            {/* 訂單內容 */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
                訂單內容
              </h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold">項目</th>
                    <th className="px-4 py-3 text-left border border-gray-300 font-semibold">數量/內容</th>
                    {form.fields.some(f => f.price && f.price > 0) && (
                      <>
                        <th className="px-4 py-3 text-right border border-gray-300 font-semibold">單價</th>
                        <th className="px-4 py-3 text-right border border-gray-300 font-semibold">小計</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {form.fields.map((field) => {
                    const value = order.order_data[field.name];
                    if (value === null || value === undefined || value === '') return null;

                    // 處理好事多代購類型（數組格式）
                    if (field.type === 'costco' && Array.isArray(value)) {
                      return (
                        <tr key={field.name} className="border-b border-gray-200">
                          <td className="px-4 py-3 border border-gray-300">
                            {field.label}
                          </td>
                          <td className="px-4 py-3 border border-gray-300">
                            <div className="space-y-1">
                              {value.map((item: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  {item.name} {item.quantity ? `× ${item.quantity}` : ''}
                                </div>
                              ))}
                            </div>
                          </td>
                          {form.fields.some(f => f.price && f.price > 0) && (
                            <>
                              <td className="px-4 py-3 text-right border border-gray-300">-</td>
                              <td className="px-4 py-3 text-right border border-gray-300">-</td>
                            </>
                          )}
                        </tr>
                      );
                    }

                    const quantity = field.type === 'number' ? (parseFloat(String(value)) || 0) : 0;
                    const itemTotal = calculateItemTotal(field);

                    return (
                      <tr key={field.name} className="border-b border-gray-200">
                        <td className="px-4 py-3 border border-gray-300">
                          {field.label}
                          {field.price && field.price > 0 && (
                            <span className="text-blue-600 font-semibold ml-1">
                              ({field.price}元)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 border border-gray-300">
                          {String(value)}
                          {field.type === 'number' && quantity > 0 && (
                            <span className="text-gray-500 ml-1">單位</span>
                          )}
                        </td>
                        {form.fields.some(f => f.price && f.price > 0) && (
                          <>
                            <td className="px-4 py-3 text-right border border-gray-300">
                              {field.price && field.price > 0 ? `${field.price} 元` : '-'}
                            </td>
                            <td className="px-4 py-3 text-right border border-gray-300 font-semibold text-green-600">
                              {itemTotal > 0 ? `${itemTotal.toFixed(0)} 元` : '-'}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                  {form.fields.some(f => f.price && f.price > 0) && calculateTotal() > 0 && (
                    <tr className="bg-green-50 border-t-2 border-green-300">
                      <td className="px-4 py-4 text-right font-bold text-lg border border-gray-300" colSpan={3}>
                        總計價格：
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-xl text-green-600 border border-gray-300">
                        {calculateTotal().toFixed(0)} 元
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 備註 */}
            <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
              <p>此訂單明細由系統自動生成</p>
              <p>列印時間：{new Date().toLocaleString('zh-TW')} 涼涼古早味冰品團購</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

