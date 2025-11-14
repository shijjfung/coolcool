import { useState, useEffect, useRef, useMemo } from 'react';
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
  facebook_comment_url?: string;
  line_comment_url?: string;
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
  const [source, setSource] = useState<string | undefined>(undefined);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [downloadHintShown, setDownloadHintShown] = useState(false);

  useEffect(() => {
    if (token && typeof token === 'string') {
      fetchOrderData();
    }
    if (router.isReady) {
      const sourceParam = Array.isArray(router.query.source) ? router.query.source[0] : router.query.source;
      if (sourceParam && typeof sourceParam === 'string') {
        setSource(sourceParam);
      }
    }
  }, [token, router]);

  const commentMessage = useMemo(() => {
    if (!form || !order) return '';

    const lines: string[] = [];

    form.fields.forEach((field) => {
      const value = order.order_data[field.name];

      if (field.type === 'number') {
        const quantity = Number(value);
        if (!Number.isNaN(quantity) && quantity > 0) {
          lines.push(`${field.label}+${quantity}`);
        }
      } else if (field.type === 'costco') {
        if (Array.isArray(value)) {
          value.forEach((item: any) => {
            if (!item) return;
            const name = typeof item.name === 'string' ? item.name.trim() : '';
            const qtyRaw = item.quantity ?? '';
            const qtyNum = Number(qtyRaw);
            const quantity = !qtyRaw && qtyRaw !== 0 ? 1 : Number.isNaN(qtyNum) ? 1 : qtyNum;
            if (name && quantity > 0) {
              lines.push(`${name}+${quantity}`);
            }
          });
        }
      }
    });

    return lines.join('，');
  }, [form, order]);

  const copyToClipboard = async (text: string) => {
    if (!text) return false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.error('navigator.clipboard 寫入失敗', err);
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (err) {
      console.error('使用備援複製方式失敗', err);
      return false;
    }
  };

  const showCopyToast = (platform: 'facebook' | 'line') => {
    const label = platform === 'facebook' ? 'Facebook' : 'LINE';
    setCopyToast(`已幫你把內容打好了，請到 ${label} 貼上並送出即可！`);
    setTimeout(() => setCopyToast(null), 3000);
  };

  useEffect(() => {
    if (!downloadHintShown && !loading && order && form) {
      setCopyToast('下載圖片出示取貨更快速');
      setDownloadHintShown(true);
      setTimeout(() => setCopyToast(null), 3000);
    }
  }, [downloadHintShown, loading, order, form]);

  const handleShareClick = async (platform: 'facebook' | 'line') => {
    if (!form) return;
    const targetUrl = platform === 'facebook' ? form.facebook_comment_url : form.line_comment_url;
    if (!targetUrl) return;

    let copied = false;
    if (commentMessage) {
      copied = await copyToClipboard(commentMessage);
      if (copied) {
        showCopyToast(platform);
      } else {
        alert(`複製留言內容失敗，請手動複製：\n${commentMessage}`);
      }
    }

    if (!commentMessage && !copied) {
      alert('目前沒有可複製的購買項目，請自行留言補充。');
    }

    if (typeof window !== 'undefined') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

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
      // 動態導入 html2canvas（僅在需要時載入，兼容 default / named export）
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default ?? (html2canvasModule as any);
      if (typeof html2canvas !== 'function') {
        throw new Error('無法載入 html2canvas 套件，請確認是否已安裝。');
      }

      const canvas = await html2canvas(printRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        width: printRef.current.scrollWidth,
        height: printRef.current.scrollHeight,
      });

      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `訂單明細_${order?.order_token.substring(0, 8)}_${dateStr}.png`;

      // 檢測是否為移動設備
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((result) => resolve(result), 'image/png')
      );

      if (!blob) {
        alert('生成圖片失敗，請稍後再試');
        return;
      }

      if (isMobile) {
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], fileName, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: '訂單明細',
                text: '我的訂單明細',
              });
              return;
            } catch (err) {
              console.log('分享失敗，改用開新視窗:', err);
            }
          }
        }

        openImageInNewWindow(blob);
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      console.error('下載圖片錯誤:', error);
      alert('下載圖片失敗：' + (error?.message || '未知錯誤，請稍後再試'));
    }
  };

  // 在移動設備上打開圖片（讓用戶長按保存）
  const openImageInNewWindow = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow) {
      // 如果彈出窗口被阻止，顯示提示
      alert('請允許彈出窗口，或長按下方按鈕選擇「在新標籤頁中打開」');
      
      // 創建一個臨時的下載按鈕
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } else {
      // 清理 URL（延遲執行，確保圖片已載入）
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    }
  };

  // 列印
  const handlePrint = async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (isMobile) {
      await downloadAsImage();
    } else {
      window.print();
    }
  };

  const handleLeavePage = () => {
    if (typeof window === 'undefined') return;

    try {
      // 檢查視窗是否由腳本打開（可以關閉）
      const isOpenedByScript = window.opener !== null || window.history.length <= 1;
      
      if (isOpenedByScript) {
        // 嘗試關閉視窗（僅在由腳本打開時有效）
        try {
          window.close();
          // 如果關閉失敗，則導航到首頁
          setTimeout(() => {
            if (!document.hidden) {
              router.push('/');
            }
          }, 100);
        } catch (e) {
          // 關閉失敗，導航到首頁
          router.push('/');
        }
      } else {
        // 正常瀏覽情況，返回上一頁或導航到首頁
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      // 發生錯誤時，簡單地導航到首頁
      console.error('離開頁面時發生錯誤:', error);
      router.push('/');
    }
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
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translate3d(-50%, -10px, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(-50%, 0, 0);
            }
          }

          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }

          .animate-fade-in-down {
            animation: fadeInDown 0.3s ease-out;
          }

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
          <div className="no-print mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md flex items-center justify-center gap-2"
            >
              🖨️ 列印訂單
            </button>
            <div className="flex flex-col items-center sm:items-start">
              <button
                onClick={downloadAsImage}
                onTouchStart={(e) => {
                  // 確保觸摸事件不會被阻止
                  e.currentTarget.click();
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors font-medium shadow-md flex items-center justify-center gap-2 min-h-[44px] min-w-[120px] touch-manipulation"
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              >
                📥 下載為圖片
              </button>
            </div>
            <button
              onClick={handleLeavePage}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-md flex items-center justify-center gap-2"
            >
              🚪 離開本頁
            </button>
          </div>

          {copyToast && (
            <div className="no-print fixed left-1/2 top-6 z-50 -translate-x-1/2 animate-fade-in-down">
              <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm sm:text-base">
                {copyToast}
              </div>
            </div>
          )}

          {/* 社群留言引導（不列印） */}
          {(form.facebook_comment_url || form.line_comment_url) && (
            <div className="no-print mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-semibold text-blue-800 mb-3">
                ✨ 幫闆娘衝人氣！完成下單後也別忘記留言打卡
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                {form.facebook_comment_url && (
                  <button
                    type="button"
                    onClick={async () => {
                      await handleShareClick('facebook');
                    }}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm sm:text-base font-medium min-h-[44px] transition-colors shadow ${
                      source === 'facebook'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'
                    }`}
                  >
                    <span>👍 臉書留言 +1</span>
                    <span
                      className={`text-xs sm:text-sm font-normal ${
                        source === 'facebook' ? 'text-blue-100 sm:text-blue-200' : 'text-blue-500'
                      }`}
                    >
                      幫闆娘衝人氣
                    </span>
                  </button>
                )}
                {form.line_comment_url && (
                  <button
                    type="button"
                    onClick={async () => {
                      await handleShareClick('line');
                    }}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm sm:text-base font-medium min-h-[44px] transition-colors shadow ${
                      source === 'line'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-white text-green-700 border border-green-300 hover:bg-green-100'
                    }`}
                  >
                    <span>💬 LINE 留言 +1</span>
                    <span
                      className={`text-xs sm:text-sm font-normal ${
                        source === 'line' ? 'text-green-100 sm:text-green-200' : 'text-green-500'
                      }`}
                    >
                      幫闆娘衝人氣
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

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

