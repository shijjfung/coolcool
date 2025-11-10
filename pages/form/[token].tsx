import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select';
  required: boolean;
  options?: string[];
}

interface Form {
  id: number;
  name: string;
  fields: FormField[];
  deadline: string;
  created_at: string;
  form_token: string;
}

interface Order {
  order_token?: string;
  order_data: Record<string, any>;
}

export default function CustomerForm() {
  const router = useRouter();
  const { token } = router.query;
  const [form, setForm] = useState<Form | null>(null);
  const [order, setOrder] = useState<Order>({ order_data: {} });
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [modifyOrderToken, setModifyOrderToken] = useState('');
  const [modifyName, setModifyName] = useState('');
  const [modifyPhone, setModifyPhone] = useState('');
  const [deleteOrderToken, setDeleteOrderToken] = useState('');
  const [deleteName, setDeleteName] = useState('');
  const [deletePhone, setDeletePhone] = useState('');
  const [deleting, setDeleting] = useState(false);

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

  const handleFieldChange = (fieldName: string, value: any) => {
    setOrder({
      ...order,
      order_data: {
        ...order.order_data,
        [fieldName]: value,
      },
    });
  };

  const validateForm = (): boolean => {
    // 驗證姓名（必填）
    if (!customerName.trim()) {
      alert('請填寫「姓名」');
      return false;
    }

    // 驗證電話（必填）
    if (!customerPhone.trim()) {
      alert('請填寫「電話」');
      return false;
    }

    // 驗證表單欄位
    if (form) {
      for (const field of form.fields) {
        const value = order.order_data[field.name];
        
        // 必填欄位檢查
        if (field.required) {
          if (value === null || value === undefined || value === '') {
            alert(`請填寫「${field.label}」`);
            return false;
          }
        }

        // 根據欄位類型進行額外檢查
        if (value !== null && value !== undefined && value !== '') {
          if (field.type === 'number') {
            const numValue = Number(value);
            if (isNaN(numValue) || numValue <= 0) {
              alert(`「${field.label}」必須輸入大於 0 的數字`);
              return false;
            }
          } else if (field.type === 'text') {
            if (typeof value !== 'string' || value.trim() === '') {
              alert(`「${field.label}」不能為空`);
              return false;
            }
          } else if (field.type === 'select') {
            if (!value || value.trim() === '') {
              alert(`請選擇「${field.label}」`);
              return false;
            }
          }
        }
      }
    }

    // 檢查是否至少有一個表單欄位有值（避免空表單）
    if (form && form.fields.length > 0) {
      const hasAnyValue = form.fields.some(field => {
        const value = order.order_data[field.name];
        return value !== null && value !== undefined && value !== '';
      });
      if (!hasAnyValue) {
        alert('請至少填寫一個表單欄位');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 先進行驗證
    if (!validateForm()) {
      return;
    }

    // 顯示確認畫面
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);

    try {
      if (isEditMode && order.order_token) {
        // 更新現有訂單（使用訂單編號驗證）
        const res = await fetch(`/api/orders/${order.order_token}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderData: order.order_data,
            formToken: token,
            orderToken: order.order_token, // 使用訂單編號驗證
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
          }),
        });

        const data = await res.json();
        if (res.ok) {
          alert('訂單已更新成功！');
          setIsEditMode(false);
        } else {
          alert(data.error || '更新訂單失敗');
        }
      } else {
        // 建立新訂單
        const res = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formToken: token,
            orderData: order.order_data,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setOrder({ ...order, order_token: data.orderToken });
          alert('訂單已送出成功！您可以稍後使用訂單代碼修改訂單。');
          // 清空表單
          setCustomerName('');
          setCustomerPhone('');
          setOrder({ order_data: {} });
        } else {
          alert(data.error || '送出訂單失敗');
        }
      }
    } catch (error) {
      console.error('送出訂單錯誤:', error);
      alert('送出訂單時發生錯誤');
    } finally {
      setSubmitting(false);
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
        setOrder(orderToLoad);
        setCustomerName(orderToLoad.customer_name || '');
        setCustomerPhone(orderToLoad.customer_phone || '');
        setIsEditMode(true);
        setShowModifyDialog(false);
        setModifyOrderToken('');
        setModifyName('');
        setModifyPhone('');
      }
    } catch (error) {
      console.error('載入訂單錯誤:', error);
      alert('載入訂單時發生錯誤');
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrderToken.trim() && (!deleteName.trim() || !deletePhone.trim())) {
      alert('請輸入訂單編號，或姓名和電話');
      return;
    }

    // 確認刪除
    const confirmed = window.confirm('確定要刪除此訂單嗎？此操作無法復原！');
    if (!confirmed) return;

    setDeleting(true);
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
        } else {
          alert(data.error || '找不到訂單，請確認姓名和電話是否正確');
          setDeleting(false);
          return;
        }
      }

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
        // 清空表單
        setCustomerName('');
        setCustomerPhone('');
        setOrder({ order_data: {} });
        setIsEditMode(false);
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
        <div className="text-center">載入中...</div>
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
          <h1 className="text-2xl font-bold text-gray-800 mb-4">表單已截止</h1>
          <p className="text-gray-600">
            此表單的截止時間為：{new Date(form.deadline).toLocaleString('zh-TW', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:p-8">
          {/* 修改和刪除訂單按鈕 */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowModifyDialog(true)}
              className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              ✏️ 修改訂單
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              🗑️ 刪除訂單
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{form.name}</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            截止時間：{new Date(form.deadline).toLocaleString('zh-TW', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}
            <br />
            <span className="text-xs text-gray-500">在截止時間之前，您可以填寫和修改訂單</span>
          </p>


          {isEditMode && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                您正在編輯訂單（訂單代碼：{order.order_token}）
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 試算表風格的表單 */}
            <div className="mb-6 overflow-x-auto">
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                        欄位
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                        內容
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* 姓名欄位 */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                        姓名
                        <span className="text-red-500 text-xs ml-1">*</span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="請輸入您的姓名"
                          required
                        />
                      </td>
                    </tr>
                    
                    {/* 電話欄位 */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                        電話
                        <span className="text-red-500 text-xs ml-1">*</span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="請輸入您的電話"
                          required
                        />
                      </td>
                    </tr>

                    {/* 動態欄位 */}
                    {form.fields.map((field) => (
                      <tr key={field.name} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {field.type === 'text' && (
                            <input
                              type="text"
                              value={order.order_data[field.name] || ''}
                              onChange={(e) =>
                                handleFieldChange(field.name, e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              required={field.required}
                              placeholder={`請輸入${field.label}`}
                            />
                          )}
                          {field.type === 'number' && (
                            <input
                              type="number"
                              value={order.order_data[field.name] || ''}
                              onChange={(e) =>
                                handleFieldChange(field.name, parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              required={field.required}
                              min="0"
                              step="0.01"
                              placeholder="0"
                            />
                          )}
                          {field.type === 'select' && (
                            <select
                              value={order.order_data[field.name] || ''}
                              onChange={(e) =>
                                handleFieldChange(field.name, e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                              required={field.required}
                            >
                              <option value="">請選擇</option>
                              {field.options?.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {submitting
                  ? '處理中...'
                  : isEditMode
                  ? '更新訂單'
                  : '送出訂單'}
              </button>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMode(false);
                    setOrder({ order_data: {} });
                    setCustomerName('');
                    setCustomerPhone('');
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  取消編輯
                </button>
              )}
            </div>
          </form>

          {/* 結單日期顯示 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <div>
                <div className="text-sm font-medium text-blue-900">本次訂單結單日期</div>
                <div className="text-lg font-bold text-blue-700">
                  {new Date(form.deadline).toLocaleString('zh-TW', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  請在結單日期前完成訂單填寫
                </div>
              </div>
            </div>
          </div>

          {/* 確認畫面 */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">確認訂單資訊</h2>
                  <p className="text-sm text-gray-600 mb-6">請確認以下訂單資訊是否正確：</p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="border-b border-gray-200 pb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">姓名</div>
                      <div className="text-base text-gray-900">{customerName}</div>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">電話</div>
                      <div className="text-base text-gray-900">{customerPhone}</div>
                    </div>
                    {form && form.fields.map((field) => {
                      const value = order.order_data[field.name];
                      if (value === null || value === undefined || value === '') return null;
                      return (
                        <div key={field.name} className="border-b border-gray-200 pb-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">{field.label}</div>
                          <div className="text-base text-gray-900">
                            {field.type === 'select' ? value : String(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      返回修改
                    </button>
                    <button
                      onClick={handleConfirmSubmit}
                      disabled={submitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {submitting ? '送出中...' : '確認送出'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                      }}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleDeleteOrder}
                      disabled={deleting}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {deleting ? '刪除中...' : '確認刪除'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {order.order_token && !isEditMode && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                您的訂單代碼：<strong>{order.order_token}</strong>
              </p>
              <p className="text-xs text-yellow-700">
                請記住此代碼，您可以使用它來修改訂單
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

