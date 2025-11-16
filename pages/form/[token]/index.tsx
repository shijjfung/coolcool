import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

interface Form {
  id: number;
  name: string;
  fields: any[];
  deadline: string;
  order_limit?: number;
  pickup_time?: string;
  created_at: string;
  form_token: string;
}

type PickupItemStatus = 'pending' | 'picked';

interface PickupOrderItem {
  itemKey: string;
  fieldLabel: string;
  itemLabel: string;
  orderedQuantity: number;
  pickedQuantity: number;
  remainingQuantity: number;
  status: PickupItemStatus;
  unitPrice?: number;
  orderedTotalPrice?: number;
  pickedTotalPrice?: number;
  remainingTotalPrice?: number;
}

interface PickupOrderSummary {
  orderId: number;
  orderToken: string;
  formId: number;
  formName: string;
  formToken: string;
  orderCreatedAt: string;
  items: PickupOrderItem[];
}

interface PickupSearchResult {
  token: string;
  expiresAt: string;
  name?: string;
  phone?: string;
  orders: PickupOrderSummary[];
}

export default function FormEntry() {
  const router = useRouter();
  const { token } = router.query;
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [modifyOrderToken, setModifyOrderToken] = useState('');
  const [modifyName, setModifyName] = useState('');
  const [modifyPhone, setModifyPhone] = useState('');
  const [deleteOrderToken, setDeleteOrderToken] = useState('');
  const [deleteName, setDeleteName] = useState('');
  const [deletePhone, setDeletePhone] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingOrderForDelete, setLoadingOrderForDelete] = useState(false);
  const [loadedOrderForDelete, setLoadedOrderForDelete] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupName, setPickupName] = useState('');
  const [pickupPhone, setPickupPhone] = useState('');
  const [pickupLoading, setPickupLoading] = useState(false);
  const [pickupError, setPickupError] = useState('');
  const [pickupResult, setPickupResult] = useState<PickupSearchResult | null>(null);
  const [pickupQr, setPickupQr] = useState('');
  const [pickupVerifyUrl, setPickupVerifyUrl] = useState('');
  const [modifyOrderOptions, setModifyOrderOptions] = useState<any[]>([]);
  const [deleteOrderOptions, setDeleteOrderOptions] = useState<any[]>([]);
  const [selectedDeleteOrderTokens, setSelectedDeleteOrderTokens] = useState<string[]>([]);

  const normalizeOrderData = (raw: any) => {
    if (!raw) return {};
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch (error) {
        console.error('解析訂單資料錯誤:', error);
        return {};
      }
    }
    return raw;
  };

  const normalizeOrderRecord = (order: any) => {
    if (!order) return order;
    return {
      ...order,
      order_data: normalizeOrderData(order.order_data),
    };
  };

  const formatOrderDateTime = (value?: string) => {
    if (!value) return '時間未知';
    try {
      return new Date(value).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return value;
    }
  };

  const renderOrderItems = (orderData: any) => {
    if (!form) return null;

    let data = orderData;
    if (typeof data === 'string') {
      data = normalizeOrderData(data);
    }
    if (!data || typeof data !== 'object') {
      return <div className="text-sm text-gray-500">無法解析訂單內容</div>;
    }

    const rows: JSX.Element[] = [];
    const processedKeys = new Set<string>();

    form.fields.forEach((field) => {
      processedKeys.add(field.name);
      const fieldValue = data[field.name];

      if (field.type === 'costco') {
        const items = Array.isArray(fieldValue) ? fieldValue : [];
        items.forEach((item, index) => {
          if (!item || !item.name) return;
          const trimmedName = String(item.name).trim();
          if (!trimmedName) return;
          const quantity = parseFloat(String(item.quantity ?? 0)) || 0;
          rows.push(
            <div key={`${field.name}-${index}`} className="flex justify-between text-sm">
              <span>{`${field.label} - ${trimmedName}`}</span>
              <span className="font-semibold text-gray-900">
                {quantity > 0 ? `x ${quantity}` : ''}
              </span>
            </div>
          );
        });
      } else if (field.type === 'number') {
        const quantity = parseFloat(String(fieldValue ?? 0)) || 0;
        if (quantity > 0) {
          rows.push(
            <div key={field.name} className="flex justify-between text-sm">
              <span>{field.label}</span>
              <span className="font-semibold text-gray-900">x {quantity}</span>
            </div>
          );
        }
      } else {
        const textValue = typeof fieldValue === 'string' ? fieldValue.trim() : fieldValue;
        if (textValue !== undefined && textValue !== null && String(textValue).trim() !== '') {
          rows.push(
            <div key={field.name} className="flex justify-between text-sm">
              <span>{field.label}</span>
              <span className="font-semibold text-gray-900">{String(textValue)}</span>
            </div>
          );
        }
      }
    });

    Object.entries(data).forEach(([key, value]) => {
      if (processedKeys.has(key)) return;
      if (value === undefined || value === null || value === '') return;
      rows.push(
        <div key={`extra-${key}`} className="flex justify-between text-sm">
          <span>{key}</span>
          <span className="font-semibold text-gray-900">
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </span>
        </div>
      );
    });

    if (rows.length === 0) {
      return <div className="text-sm text-gray-500">尚無可顯示的訂單內容</div>;
    }

    return rows;
  };

  useEffect(() => {
    if (token && typeof token === 'string') {
      fetchForm();
    }
  }, [token]);

  // 倒數計時器
  useEffect(() => {
    if (!form || isExpired) {
      setTimeRemaining(null);
      return;
    }

    const updateCountdown = () => {
      const deadline = new Date(form.deadline);
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    // 立即執行一次
    updateCountdown();

    // 每秒更新一次
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [form, isExpired]);

  const fetchForm = async () => {
    try {
      const res = await fetch(`/api/forms/token/${token}`);
      const data = await res.json();

      if (res.ok) {
        setForm(data);
        // 檢查是否超過截止時間
        const deadline = new Date(data.deadline);
        const now = new Date();
        if (now > deadline) {
          setIsExpired(true);
        }
      } else {
        alert(data.error || '表單不存在');
      }
    } catch (error) {
      console.error('取得表單錯誤:', error);
      alert('載入表單時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleModifyOrder = async () => {
    if (!modifyOrderToken.trim() && (!modifyName.trim() || !modifyPhone.trim())) {
      alert('請輸入訂單編號，或姓名和電話');
      return;
    }

    setVerifying(true);
    setModifyOrderOptions([]);
    try {
      let orderToLoad = null;

      // 如果提供了訂單編號，直接使用它
      if (modifyOrderToken.trim()) {
        const res = await fetch(`/api/orders/${modifyOrderToken.trim()}?customerName=${encodeURIComponent(modifyName.trim())}&customerPhone=${encodeURIComponent(modifyPhone.trim())}`);
        const data = await res.json();
        
        if (res.ok) {
          const fetchedOrder = data.order || data;
          if (!fetchedOrder) {
            alert('找不到符合的訂單');
            setVerifying(false);
            return;
          }
          orderToLoad = normalizeOrderRecord(fetchedOrder);
        } else {
          alert(data.error || '驗證失敗，請確認訂單編號、姓名或電話是否正確');
          setVerifying(false);
          return;
        }
      } else {
        // 如果沒有提供訂單編號，使用姓名和電話查找
        const res = await fetch('/api/orders/find', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formToken: token,
            customerName: modifyName.trim(),
            customerPhone: modifyPhone.trim(),
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          const matchedOrders = Array.isArray(data.orders)
            ? data.orders
            : data.order
            ? [data.order]
            : [];

          if (matchedOrders.length === 0) {
            alert('找不到訂單，請確認姓名和電話是否正確');
            setVerifying(false);
            return;
          }

          if (matchedOrders.length > 1) {
            setModifyOrderOptions(matchedOrders.map(normalizeOrderRecord));
            setVerifying(false);
            return;
          }

          orderToLoad = normalizeOrderRecord(matchedOrders[0]);
        } else {
          alert(data.error || '找不到訂單，請確認姓名和電話是否正確');
          setVerifying(false);
          return;
        }
      }

      // 載入訂單到表單
      if (orderToLoad) {
        // 跳轉到下單頁面並帶上訂單資訊
        const orderData = encodeURIComponent(JSON.stringify({
          orderToken: orderToLoad.order_token,
          customerName: orderToLoad.customer_name,
          customerPhone: orderToLoad.customer_phone,
          orderData: orderToLoad.order_data,
        }));
        router.push(`/form/${token}/order?edit=true&orderData=${orderData}`);
        setShowModifyDialog(false);
        setModifyOrderOptions([]);
      }
    } catch (error) {
      console.error('載入訂單錯誤:', error);
      alert('載入訂單時發生錯誤');
    } finally {
      setVerifying(false);
    }
  };

  const handleSelectModifyOption = (order: any) => {
    if (!order) return;
    const normalized = normalizeOrderRecord(order);
    const orderData = encodeURIComponent(JSON.stringify({
      orderToken: normalized.order_token,
      customerName: normalized.customer_name,
      customerPhone: normalized.customer_phone,
      orderData: normalized.order_data,
    }));
    router.push(`/form/${token}/order?edit=true&orderData=${orderData}`);
    setShowModifyDialog(false);
    setModifyOrderOptions([]);
    setVerifying(false);
  };

  const handleClearModifySelection = () => {
    setModifyOrderOptions([]);
  };

  // 載入訂單資訊（用於刪除）
  const handleLoadOrderForDelete = async () => {
    if (!deleteOrderToken.trim() && (!deleteName.trim() || !deletePhone.trim())) {
      alert('請輸入訂單編號，或姓名和電話');
      return;
    }

    setLoadingOrderForDelete(true);
    setLoadedOrderForDelete(null);
    setDeleteOrderOptions([]);
    setSelectedDeleteOrderTokens([]);
    
    try {
      let orderTokenToUse = deleteOrderToken.trim();

      // 如果沒有提供訂單編號，使用姓名和電話查找
      if (!orderTokenToUse) {
        const res = await fetch('/api/orders/find', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formToken: token,
            customerName: deleteName.trim(),
            customerPhone: deletePhone.trim(),
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          const matchedOrders = Array.isArray(data.orders)
            ? data.orders
            : data.order
            ? [data.order]
            : [];

          if (matchedOrders.length === 0) {
            alert(data.error || '找不到訂單，請確認姓名和電話是否正確');
            setLoadingOrderForDelete(false);
            return;
          }

          if (matchedOrders.length > 1) {
            const normalized = matchedOrders.map(normalizeOrderRecord);
            setDeleteOrderOptions(normalized);
            setLoadingOrderForDelete(false);
            return;
          }

          const onlyOrder = normalizeOrderRecord(matchedOrders[0]);
          orderTokenToUse = onlyOrder.order_token;
          setLoadedOrderForDelete(onlyOrder);
        } else {
          alert(data.error || '找不到訂單，請確認姓名和電話是否正確');
          setLoadingOrderForDelete(false);
          return;
        }
      } else {
        // 如果有訂單編號，直接查詢訂單資訊
        const res = await fetch(`/api/orders/${orderTokenToUse}`);
        const data = await res.json();
        
        if (res.ok && data.order) {
          setLoadedOrderForDelete(normalizeOrderRecord(data.order));
          setDeleteOrderOptions([]);
          setSelectedDeleteOrderTokens([]);
        } else {
          alert(data.error || '找不到訂單，請確認訂單編號是否正確');
          setLoadingOrderForDelete(false);
          return;
        }
      }
    } catch (error) {
      console.error('載入訂單錯誤:', error);
      alert('載入訂單時發生錯誤');
    } finally {
      setLoadingOrderForDelete(false);
    }
  };

  const handleToggleDeleteSelection = (orderToken: string) => {
    setSelectedDeleteOrderTokens((prev) => {
      if (prev.includes(orderToken)) {
        return prev.filter((tokenValue) => tokenValue !== orderToken);
      }
      return [...prev, orderToken];
    });
  };

  const handleDeleteSelectedOrders = async () => {
    if (selectedDeleteOrderTokens.length === 0) {
      alert('請先勾選要刪除的訂單');
      return;
    }

    const confirmed = window.confirm(`確定要刪除已勾選的 ${selectedDeleteOrderTokens.length} 筆訂單嗎？此操作無法復原！`);
    if (!confirmed) return;

    setDeleting(true);
    const failures: string[] = [];
    const successTokens: string[] = [];

    for (const orderToken of selectedDeleteOrderTokens) {
      const targetOrder = deleteOrderOptions.find((order) => order.order_token === orderToken);
      if (!targetOrder) continue;
      try {
        const res = await fetch(`/api/orders/${orderToken}/delete`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: targetOrder.customer_name,
            customerPhone: targetOrder.customer_phone,
            orderToken,
            formToken: token,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          successTokens.push(orderToken);
        } else {
          failures.push(orderToken);
        }
      } catch (error) {
        console.error('刪除訂單錯誤:', error);
        failures.push(orderToken);
      }
    }

    if (successTokens.length > 0) {
      alert(`已成功刪除 ${successTokens.length} 筆訂單`);
    }
    if (failures.length > 0) {
      alert(`有 ${failures.length} 筆訂單刪除失敗，請稍後再試或確認資料`);
    }

    const remaining = deleteOrderOptions.filter((order) => !successTokens.includes(order.order_token));
    setDeleteOrderOptions(remaining);
    setSelectedDeleteOrderTokens((prev) => prev.filter((tokenValue) => !successTokens.includes(tokenValue)));

    if (remaining.length === 0) {
      setShowDeleteDialog(false);
      setDeleteOrderToken('');
      setDeleteName('');
      setDeletePhone('');
    }

    setDeleting(false);
  };

  // 確認刪除訂單
  const handleDeleteOrder = async () => {
    if (!loadedOrderForDelete) {
      alert('請先載入訂單');
      return;
    }

    // 確認刪除
    const confirmed = window.confirm('確定要刪除此訂單嗎？此操作無法復原！');
    if (!confirmed) return;

    setDeleting(true);
    try {
      const orderTokenToUse = loadedOrderForDelete.order_token;

      // 刪除訂單
      const res = await fetch(`/api/orders/${orderTokenToUse}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: deleteName.trim(),
          customerPhone: deletePhone.trim(),
          orderToken: orderTokenToUse,
          formToken: token,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert('訂單已成功刪除！');
        setShowDeleteDialog(false);
        setDeleteOrderToken('');
        setDeleteName('');
        setDeletePhone('');
        setLoadedOrderForDelete(null);
      } else {
        alert(data.error || '刪除失敗，請確認訂單編號、姓名或電話是否正確');
      }
    } catch (error) {
      console.error('刪除訂單錯誤:', error);
      alert('刪除訂單時發生錯誤');
    } finally {
      setDeleting(false);
    }
  };

  const handleClosePickupModal = () => {
    setShowPickupModal(false);
    setPickupLoading(false);
    setPickupError('');
    setPickupResult(null);
    setPickupQr('');
    setPickupVerifyUrl('');
  };

  const handlePickupSearch = async () => {
    if (!pickupName.trim() || !pickupPhone.trim()) {
      setPickupError('請輸入姓名與電話');
      return;
    }

    setPickupLoading(true);
    setPickupError('');
    setPickupResult(null);
    setPickupQr('');
    setPickupVerifyUrl('');

    try {
      const res = await fetch('/api/pickup/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pickupName.trim(),
          phone: pickupPhone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPickupError(data.error || '查無可取貨的資料');
        return;
      }

      const result: PickupSearchResult = {
        token: data.token,
        expiresAt: data.expiresAt,
        orders: data.orders || [],
      };
      setPickupResult(result);

      if (typeof window !== 'undefined') {
        const verifyUrl = `${window.location.origin}/pickup/verify?token=${result.token}`;
        setPickupVerifyUrl(verifyUrl);
        const qrRes = await fetch('/api/qrcode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: verifyUrl }),
        });
        const qrData = await qrRes.json();
        if (qrRes.ok && qrData.qrCode) {
          setPickupQr(qrData.qrCode);
        } else {
          setPickupQr('');
        }
      }
    } catch (error) {
      console.error('pickup search error', error);
      setPickupError('查詢時發生錯誤，請稍後再試');
    } finally {
      setPickupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">表單不存在</h1>
          <p className="text-gray-600">請確認您輸入的網址是否正確</p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {form ? `${form.name}的單已收單截止` : '表單已截止'}
          </h1>
          <p className="text-gray-600 mb-2">
            此表單的結單及停止下單時間為：{form && new Date(form.deadline).toLocaleString('zh-TW', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false
            })}
          </p>
          <p className="text-gray-600 mt-4">
            若有疑問可電 <a href="tel:087663016" className="text-blue-600 hover:text-blue-800 underline">(08)7663016</a> 洽詢 涼涼古早味冰品團購
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 sm:py-10">
      <Head>
        <title>{form.name} - 涼涼古早味創意冰品-團購</title>
      </Head>
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        {/* 主卡片 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* 頂部裝飾條 */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="p-6 sm:p-8 lg:p-10">
            {/* 標題區域 */}
            <div className="mb-8 text-center">
              <div className="inline-block mb-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  涼涼古早味創意冰品-團購
                </h1>
                <div className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>
              <p className="text-base sm:text-lg text-indigo-600 font-medium mb-4">咻揪來涼涼ㄚ妹!</p>
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full border-2 border-indigo-200">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                  {form.name}
                </p>
              </div>
            </div>

            {/* 時間資訊卡片 */}
            <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm sm:text-base font-semibold text-gray-700">
                  結單及停止下單時間
                </p>
              </div>
              <p className="text-base sm:text-lg font-bold text-gray-800 text-center mb-3">
                {new Date(form.deadline).toLocaleString('zh-TW', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })}
              </p>
              
              {/* 倒數計時器 */}
              {timeRemaining !== null && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm sm:text-base font-semibold text-gray-700">
                      剩餘可下單時間
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                    {timeRemaining.days > 0 && (
                      <div className="flex flex-col items-center px-3 py-2 bg-white rounded-lg border-2 border-orange-300 shadow-sm min-w-[60px]">
                        <span className="text-2xl sm:text-3xl font-extrabold text-orange-600">
                          {timeRemaining.days}
                        </span>
                        <span className="text-xs text-gray-600 font-medium">天</span>
                      </div>
                    )}
                    <div className="flex flex-col items-center px-3 py-2 bg-white rounded-lg border-2 border-orange-300 shadow-sm min-w-[60px]">
                      <span className="text-2xl sm:text-3xl font-extrabold text-orange-600">
                        {String(timeRemaining.hours).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-gray-600 font-medium">時</span>
                    </div>
                    <div className="flex flex-col items-center px-3 py-2 bg-white rounded-lg border-2 border-orange-300 shadow-sm min-w-[60px]">
                      <span className="text-2xl sm:text-3xl font-extrabold text-orange-600">
                        {String(timeRemaining.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-gray-600 font-medium">分</span>
                    </div>
                    <div className="flex flex-col items-center px-3 py-2 bg-white rounded-lg border-2 border-orange-300 shadow-sm min-w-[60px]">
                      <span className="text-2xl sm:text-3xl font-extrabold text-orange-600">
                        {String(timeRemaining.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-gray-600 font-medium">秒</span>
                    </div>
                  </div>
                </div>
              )}
              
              {form.pickup_time && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-sm text-green-700 font-semibold">
                      取貨時間：{form.pickup_time}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 三個主要按鈕 */}
            <div className="mt-10 space-y-4">
              {/* 購物下單按鈕（全寬，最突出） */}
              <Link
                href={`/form/${token}/order`}
                className="block w-full group relative overflow-hidden"
              >
                <div className="relative bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-600 text-white px-8 py-5 rounded-full border-2 border-emerald-300/60 shadow-[0_18px_35px_rgba(16,185,129,0.55),0_10px_25px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-emerald-500 hover:via-lime-500 hover:to-emerald-700 hover:shadow-[0_28px_55px_rgba(16,185,129,0.65),0_18px_35px_rgba(16,185,129,0.5),inset_0_1px_0_rgba(255,255,255,0.35)] hover:-translate-y-1.5 hover:scale-[1.01] active:shadow-[0_8px_22px_rgba(16,185,129,0.45),inset_0_2px_4px_rgba(0,0,0,0.25)] transition-all duration-400 transform text-center text-lg sm:text-xl font-bold">
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="drop-shadow-md">開始購物下單</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* 修改訂單和刪除訂單按鈕（左右對稱） */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowModifyDialog(true)}
                  className="w-full relative bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 text-white px-6 py-4 rounded-full border-2 border-blue-300/50 shadow-[0_14px_28px_rgba(59,130,246,0.5),0_6px_14px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-sky-500 hover:via-blue-600 hover:to-indigo-700 hover:shadow-[0_22px_42px_rgba(59,130,246,0.6),0_12px_24px_rgba(59,130,246,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] hover:-translate-y-1.5 hover:scale-[1.01] active:shadow-[0_6px_18px_rgba(59,130,246,0.4),inset_0_2px_6px_rgba(0,0,0,0.2)] transition-all duration-400 transform text-base sm:text-lg font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="drop-shadow-md">修改訂單</span>
                </button>
                
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full relative bg-gradient-to-r from-rose-500 via-red-500 to-rose-700 text-white px-6 py-4 rounded-full border-2 border-rose-300/50 shadow-[0_14px_30px_rgba(244,63,94,0.5),0_6px_14px_rgba(244,63,94,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-rose-600 hover:via-red-600 hover:to-rose-800 hover:shadow-[0_22px_46px_rgba(244,63,94,0.65),0_12px_26px_rgba(244,63,94,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] hover:-translate-y-1.5 hover:scale-[1.01] active:shadow-[0_6px_18px_rgba(244,63,94,0.4),inset_0_2px_6px_rgba(0,0,0,0.2)] transition-all duration-400 transform text-base sm:text-lg font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="drop-shadow-md">刪除訂單</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setShowPickupModal(true);
                  setPickupError('');
                }}
                className="w-full relative bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-700 text-white px-6 py-4 rounded-full border-2 border-purple-300/60 shadow-[0_18px_36px_rgba(168,85,247,0.5),0_10px_20px_rgba(168,85,247,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-purple-600 hover:via-fuchsia-600 hover:to-purple-800 hover:shadow-[0_26px_48px_rgba(168,85,247,0.6),0_14px_28px_rgba(168,85,247,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] hover:-translate-y-1.5 hover:scale-[1.01] active:shadow-[0_6px_20px_rgba(168,85,247,0.4),inset_0_2px_6px_rgba(0,0,0,0.2)] transition-all duration-400 transform text-base sm:text-lg font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="drop-shadow-md">我要取貨</span>
              </button>
              <p className="text-sm text-gray-600 text-center">
                查詢未取貨商品並生成專屬 QR Code，請於取貨時出示給店家掃描
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 修改訂單對話框 */}
      {showModifyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">修改訂單</h2>
              {modifyOrderOptions.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    找到 {modifyOrderOptions.length} 筆符合條件的訂單，請選擇要修改的訂單：
                  </p>
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                    {modifyOrderOptions.map((order) => (
                      <div key={order.order_token} className="border border-gray-200 rounded-xl p-4 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              訂單編號：{order.order_token}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              下單時間：{formatOrderDateTime(order.created_at)}
                            </p>
                          </div>
                          <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                            {order.form_name || form.name}
                          </span>
                        </div>
                        <div className="text-gray-800 space-y-1">
                          {renderOrderItems(order.order_data)}
                        </div>
                        <button
                          onClick={() => handleSelectModifyOption(order)}
                          className="w-full mt-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                          修改這筆訂單
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 justify-end mt-6">
                    <button
                      onClick={handleClearModifySelection}
                      className="px-6 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-full border-2 border-gray-300/50 shadow-[0_4px_8px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:from-gray-400 hover:to-gray-500 hover:shadow-[0_6px_12px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-0 transition-all duration-200 font-medium"
                    >
                      返回重新搜尋
                    </button>
                  </div>
                </>
              ) : (
                <>
              <p className="text-sm text-gray-600 mb-4">
                請輸入以下任一方式進行驗證：
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    訂單編號
                  </label>
                  <input
                    type="text"
                    value={modifyOrderToken}
                    onChange={(e) => setModifyOrderToken(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="輸入訂單編號"
                    disabled={verifying}
                  />
                </div>
                
                <div className="text-center text-sm text-gray-500">或</div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    姓名
                  </label>
                  <input
                    type="text"
                    value={modifyName}
                    onChange={(e) => setModifyName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="輸入姓名"
                    disabled={verifying}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話
                  </label>
                  <input
                    type="tel"
                    value={modifyPhone}
                    onChange={(e) => setModifyPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="輸入電話"
                    disabled={verifying}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowModifyDialog(false);
                    setModifyOrderToken('');
                    setModifyName('');
                    setModifyPhone('');
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-full border-2 border-gray-300/50 shadow-[0_4px_8px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:from-gray-400 hover:to-gray-500 hover:shadow-[0_6px_12px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-0 transition-all duration-200 font-medium"
                  disabled={verifying}
                >
                  取消
                </button>
                <button
                  onClick={handleModifyOrder}
                  disabled={verifying}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full border-2 border-blue-500/30 shadow-[0_6px_12px_rgba(59,130,246,0.4),0_3px_6px_rgba(59,130,246,0.3)] hover:from-blue-700 hover:to-blue-800 hover:shadow-[0_8px_16px_rgba(59,130,246,0.5),0_4px_8px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 active:shadow-[0_3px_6px_rgba(59,130,246,0.3)] active:translate-y-0 disabled:from-gray-400 disabled:to-gray-500 disabled:border-gray-400/30 disabled:shadow-[0_2px_4px_rgba(0,0,0,0.1)] disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200 font-medium"
                >
                  {verifying ? '驗證中...' : '確認'}
                </button>
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 我要取貨對話框 */}
      {showPickupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.4),_transparent_60%)]"></div>
            <div className="relative p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">我要取貨</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    請輸入下單時填寫的姓名與電話，即可查詢所有未取貨的商品
                  </p>
                </div>
                <button
                  onClick={handleClosePickupModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名
                  </label>
                  <input
                    value={pickupName}
                    onChange={(e) => setPickupName(e.target.value)}
                    placeholder="請輸入下單人姓名"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話
                  </label>
                  <input
                    value={pickupPhone}
                    onChange={(e) => setPickupPhone(e.target.value)}
                    placeholder="請輸入下單人電話"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                  />
                </div>
              </div>

              {pickupError && (
                <p className="text-sm text-red-500 mt-3">{pickupError}</p>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
                <button
                  onClick={handlePickupSearch}
                  disabled={pickupLoading}
                  className="flex-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-700 text-white font-semibold py-3 rounded-xl shadow-md hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pickupLoading ? '查詢中…' : '查詢未取貨商品'}
                </button>
                <button
                  onClick={handleClosePickupModal}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
              </div>

              {pickupResult && pickupResult.orders.length > 0 && (
                <div className="mt-6 space-y-5">
                  <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl">
                    <p className="text-sm text-purple-700 font-semibold">
                      共有 {pickupResult.orders.length} 筆已結單且未取貨的訂單
                    </p>
                    <p className="text-xs text-purple-500 mt-1">
                      QR Code 有效期限：{new Date(pickupResult.expiresAt).toLocaleString('zh-TW', { hour12: false })}
                    </p>
                  </div>

                  {pickupResult.orders.map((order) => (
                    <div key={order.orderId} className="border border-gray-100 rounded-2xl shadow-sm p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-gray-800">{order.formName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            下單時間：{new Date(order.orderCreatedAt).toLocaleString('zh-TW', { hour12: false })}
                          </p>
                        </div>
                        <span className="text-sm px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full font-semibold">
                          {order.items.length} 項待取貨
                        </span>
                      </div>

                      <div className="mt-4 space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.itemKey}
                            className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border border-gray-100"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{item.itemLabel}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                未取貨：<span className="font-semibold text-indigo-600">{item.remainingQuantity}</span>
                              </p>
                            </div>
                            <span className="text-lg font-bold text-indigo-600">
                              {item.remainingQuantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {pickupQr && (
                    <div className="mt-6 p-4 bg-white border border-purple-200 rounded-2xl text-center shadow-inner">
                      <p className="text-sm text-gray-600 mb-3">
                        請在取貨時出示此 QR Code 給店家掃描
                      </p>
                      <img
                        src={pickupQr}
                        alt="Pickup QR Code"
                        className="mx-auto w-48 h-48 border-4 border-white rounded-2xl shadow-lg"
                      />
                      {pickupVerifyUrl && (
                        <p className="text-xs text-gray-500 mt-3 break-all">
                          連結：<a href={pickupVerifyUrl} className="text-indigo-600 underline">{pickupVerifyUrl}</a>
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        * 此 QR Code 僅供店家於後台掃描使用，顧客自行掃描不會顯示取貨資訊。
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 刪除訂單對話框 */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">刪除訂單</h2>
              
              {deleteOrderOptions.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    找到 {deleteOrderOptions.length} 筆符合條件的訂單，請勾選要刪除的訂單：
                  </p>
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {deleteOrderOptions.map((order) => {
                      const checked = selectedDeleteOrderTokens.includes(order.order_token);
                      return (
                        <label
                          key={order.order_token}
                          className={`flex items-start gap-3 border rounded-xl p-4 transition-colors cursor-pointer ${
                            checked ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleDeleteSelection(order.order_token)}
                            className="mt-1 w-4 h-4 text-red-500 rounded focus:ring-red-500"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-gray-800">
                                  訂單編號：{order.order_token}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  下單時間：{formatOrderDateTime(order.created_at)}
                                </p>
                              </div>
                              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                                {order.form_name || form.name}
                              </span>
                            </div>
                            <div className="text-gray-800 space-y-1">
                              {renderOrderItems(order.order_data)}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex gap-3 justify-end mt-6">
                    <button
                      onClick={() => {
                        setDeleteOrderOptions([]);
                        setSelectedDeleteOrderTokens([]);
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-full border-2 border-gray-300/50 shadow-[0_4px_8px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:from-gray-400 hover:to-gray-500 hover:shadow-[0_6px_12px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-0 transition-all duration-200 font-medium"
                      disabled={deleting}
                    >
                      返回重新搜尋
                    </button>
                    <button
                      onClick={handleDeleteSelectedOrders}
                      disabled={deleting || selectedDeleteOrderTokens.length === 0}
                      className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full border-2 border-red-500/30 shadow-[0_6px_12px_rgba(239,68,68,0.4),0_3px_6px_rgba(239,68,68,0.3)] hover:from-red-700 hover:to-red-800 hover:shadow-[0_8px_16px_rgba(239,68,68,0.5),0_4px_8px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 active:shadow-[0_3px_6px_rgba(239,68,68,0.3)] active:translate-y-0 disabled:from-gray-400 disabled:to-gray-500 disabled:border-gray-400/30 disabled:shadow-[0_2px_4px_rgba(0,0,0,0.1)] disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200 font-medium"
                    >
                      {deleting ? '刪除中...' : `刪除勾選訂單（${selectedDeleteOrderTokens.length}）`}
                    </button>
                  </div>
                </>
              ) : !loadedOrderForDelete ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    請輸入以下任一方式進行驗證：
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        訂單編號
                      </label>
                      <input
                        type="text"
                        value={deleteOrderToken}
                        onChange={(e) => setDeleteOrderToken(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="輸入訂單編號"
                        disabled={loadingOrderForDelete}
                      />
                    </div>
                    
                    <div className="text-center text-sm text-gray-500">或</div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        姓名
                      </label>
                      <input
                        type="text"
                        value={deleteName}
                        onChange={(e) => setDeleteName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="輸入姓名"
                        disabled={loadingOrderForDelete}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        電話
                      </label>
                      <input
                        type="tel"
                        value={deletePhone}
                        onChange={(e) => setDeletePhone(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="輸入電話"
                        disabled={loadingOrderForDelete}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end mt-6">
                    <button
                      onClick={() => {
                        setShowDeleteDialog(false);
                        setDeleteOrderToken('');
                        setDeleteName('');
                        setDeletePhone('');
                        setLoadedOrderForDelete(null);
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-full border-2 border-gray-300/50 shadow-[0_4px_8px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:from-gray-400 hover:to-gray-500 hover:shadow-[0_6px_12px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-0 transition-all duration-200 font-medium"
                      disabled={loadingOrderForDelete}
                    >
                      取消
                    </button>
                    <button
                      onClick={handleLoadOrderForDelete}
                      disabled={loadingOrderForDelete}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full border-2 border-blue-500/30 shadow-[0_6px_12px_rgba(59,130,246,0.4),0_3px_6px_rgba(59,130,246,0.3)] hover:from-blue-700 hover:to-blue-800 hover:shadow-[0_8px_16px_rgba(59,130,246,0.5),0_4px_8px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 active:shadow-[0_3px_6px_rgba(59,130,246,0.3)] active:translate-y-0 disabled:from-gray-400 disabled:to-gray-500 disabled:border-gray-400/30 disabled:shadow-[0_2px_4px_rgba(0,0,0,0.1)] disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200 font-medium"
                    >
                      {loadingOrderForDelete ? '載入中...' : '載入訂單'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">訂單資訊</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">訂單編號：</span>
                        <span className="font-medium text-gray-800">{loadedOrderForDelete.order_token}</span>
                      </div>
                      {loadedOrderForDelete.customer_name && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">姓名：</span>
                          <span className="font-medium text-gray-800">{loadedOrderForDelete.customer_name}</span>
                        </div>
                      )}
                      {loadedOrderForDelete.customer_phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">電話：</span>
                          <span className="font-medium text-gray-800">{loadedOrderForDelete.customer_phone}</span>
                        </div>
                      )}
                      {loadedOrderForDelete.order_data && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-gray-600 mb-2">訂單內容：</div>
                          <div className="text-gray-800 space-y-1">{renderOrderItems(loadedOrderForDelete.order_data)}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end mt-6">
                    <button
                      onClick={() => {
                        setLoadedOrderForDelete(null);
                        setDeleteOrderToken('');
                        setDeleteName('');
                        setDeletePhone('');
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-full border-2 border-gray-300/50 shadow-[0_4px_8px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:from-gray-400 hover:to-gray-500 hover:shadow-[0_6px_12px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-0 transition-all duration-200 font-medium"
                      disabled={deleting}
                    >
                      重新輸入
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteDialog(false);
                        setDeleteOrderToken('');
                        setDeleteName('');
                        setDeletePhone('');
                        setLoadedOrderForDelete(null);
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-full border-2 border-gray-300/50 shadow-[0_4px_8px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:from-gray-400 hover:to-gray-500 hover:shadow-[0_6px_12px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-0 transition-all duration-200 font-medium"
                      disabled={deleting}
                    >
                      取消
                    </button>
                    <button
                      onClick={handleDeleteOrder}
                      disabled={deleting}
                      className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full border-2 border-red-500/30 shadow-[0_6px_12px_rgba(239,68,68,0.4),0_3px_6px_rgba(239,68,68,0.3)] hover:from-red-700 hover:to-red-800 hover:shadow-[0_8px_16px_rgba(239,68,68,0.5),0_4px_8px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 active:shadow-[0_3px_6px_rgba(239,68,68,0.3)] active:translate-y-0 disabled:from-gray-400 disabled:to-gray-500 disabled:border-gray-400/30 disabled:shadow-[0_2px_4px_rgba(0,0,0,0.1)] disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200 font-medium"
                    >
                      {deleting ? '刪除中...' : '確定刪除'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

