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

  useEffect(() => {
    if (token && typeof token === 'string') {
      fetchForm();
    }
  }, [token]);

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
    try {
      let orderToLoad = null;

      // 如果提供了訂單編號，直接使用它
      if (modifyOrderToken.trim()) {
        const res = await fetch(`/api/orders/${modifyOrderToken.trim()}?customerName=${encodeURIComponent(modifyName.trim())}&customerPhone=${encodeURIComponent(modifyPhone.trim())}`);
        const data = await res.json();
        
        if (res.ok) {
          orderToLoad = data;
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
          orderToLoad = data.order;
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
      }
    } catch (error) {
      console.error('載入訂單錯誤:', error);
      alert('載入訂單時發生錯誤');
    } finally {
      setVerifying(false);
    }
  };

  // 載入訂單資訊（用於刪除）
  const handleLoadOrderForDelete = async () => {
    if (!deleteOrderToken.trim() && (!deleteName.trim() || !deletePhone.trim())) {
      alert('請輸入訂單編號，或姓名和電話');
      return;
    }

    setLoadingOrderForDelete(true);
    setLoadedOrderForDelete(null);
    
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
          orderTokenToUse = data.order.order_token;
          setLoadedOrderForDelete(data.order);
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
          setLoadedOrderForDelete(data.order);
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <Head>
        <title>{form.name} - 涼涼冰品團購</title>
      </Head>
      <div className="container mx-auto px-2 sm:px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:p-8">
          <div className="mb-4 sm:mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">涼涼冰品團購</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-2">吼哩涼涼ㄟ妹!</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-4 mb-2">
              [{form.name}]
            </p>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 text-center">
            結單及停止下單時間：{new Date(form.deadline).toLocaleString('zh-TW', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}
            {form.pickup_time && (
              <>
                <br />
                <span className="text-xs text-green-600 font-semibold">
                  📦 取貨時間：{form.pickup_time}
                </span>
              </>
            )}
          </p>

          {/* 三個主要按鈕 */}
          <div className="mt-8 space-y-4">
            <Link
              href={`/form/${token}/order`}
              className="block w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors text-center text-lg font-semibold shadow-md"
            >
              🛒 購物下單
            </Link>
            
            <button
              onClick={() => setShowModifyDialog(true)}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-md"
            >
              ✏️ 修改訂單
            </button>
            
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 transition-colors text-lg font-semibold shadow-md"
            >
              🗑️ 刪除訂單
            </button>
          </div>
        </div>
      </div>

      {/* 修改訂單對話框 */}
      {showModifyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">修改訂單</h2>
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
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  disabled={verifying}
                >
                  取消
                </button>
                <button
                  onClick={handleModifyOrder}
                  disabled={verifying}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {verifying ? '驗證中...' : '確認'}
                </button>
              </div>
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
              
              {!loadedOrderForDelete ? (
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
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      disabled={loadingOrderForDelete}
                    >
                      取消
                    </button>
                    <button
                      onClick={handleLoadOrderForDelete}
                      disabled={loadingOrderForDelete}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                      {loadedOrderForDelete.order_data && typeof loadedOrderForDelete.order_data === 'object' && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-gray-600 mb-1">訂單內容：</div>
                          <div className="text-gray-800">
                            {Object.entries(loadedOrderForDelete.order_data).map(([key, value]: [string, any]) => (
                              <div key={key} className="flex justify-between">
                                <span>{key}：</span>
                                <span className="font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
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
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
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
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      disabled={deleting}
                    >
                      取消
                    </button>
                    <button
                      onClick={handleDeleteOrder}
                      disabled={deleting}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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

