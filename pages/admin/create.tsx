import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'costco';
  required: boolean;
  options?: string[];
  price?: number; // 價格欄位（可選）
}

export default function CreateForm() {
  const router = useRouter();
  const { id } = router.query;
  const isEditMode = !!id;
  const [formName, setFormName] = useState('');
  const [deadlineDate, setDeadlineDate] = useState<string>(''); // 截止日期
  const [deadlineTime, setDeadlineTime] = useState<string>(''); // 截止時間
  const [isLimitedOrder, setIsLimitedOrder] = useState(false); // 是否為限額單
  const [orderLimit, setOrderLimit] = useState<string>(''); // 訂單數量限制
  const [pickupTime, setPickupTime] = useState<string>(''); // 取貨時間
  const [pickupDate, setPickupDate] = useState<string>(''); // 取貨日期
  const [pickupStartTime, setPickupStartTime] = useState<string>(''); // 取貨開始時間
  const [pickupEndTime, setPickupEndTime] = useState<string>(''); // 取貨結束時間
  const [pickupTimeMode, setPickupTimeMode] = useState<'single' | 'range'>('single'); // 單一時間或時間範圍
  // 表單頁面會自動顯示「姓名」和「電話」欄位，所以這裡不需要預設欄位
  const [fields, setFields] = useState<FormField[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // 載入現有表單資料（編輯模式）
  useEffect(() => {
    if (isEditMode && id) {
      loadFormData(Number(id));
    }
  }, [id, isEditMode]);

  const loadFormData = async (formId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/forms/${formId}`);
      const form = await res.json();
      
      if (res.ok && form) {
        setFormName(form.name || '');
        // 解析截止時間
        if (form.deadline) {
          const deadlineStr = form.deadline.replace(' ', 'T').substring(0, 16);
          const [date, time] = deadlineStr.split('T');
          setDeadlineDate(date || '');
          setDeadlineTime(time || '');
        }
        const hasOrderLimit = form.order_limit && form.order_limit > 0;
        setIsLimitedOrder(hasOrderLimit);
        setOrderLimit(hasOrderLimit ? String(form.order_limit) : '');
        // 嘗試解析現有的取貨時間格式
        const existingPickupTime = form.pickup_time || '';
        if (existingPickupTime) {
          // 嘗試解析格式：2024-12-25 14:00-18:00 或 2024-12-25 14:00
          const rangeMatch = existingPickupTime.match(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})-(\d{2}:\d{2})/);
          if (rangeMatch) {
            setPickupTimeMode('range');
            setPickupDate(rangeMatch[1]);
            setPickupStartTime(rangeMatch[2]);
            setPickupEndTime(rangeMatch[3]);
          } else {
            // 單一時間格式：2024-12-25 14:00
            const singleMatch = existingPickupTime.match(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/);
            if (singleMatch) {
              setPickupTimeMode('single');
              setPickupDate(singleMatch[1]);
              setPickupStartTime(singleMatch[2]);
            } else {
              // 如果無法解析，保留原始值（可能是自訂格式）
              setPickupTime(existingPickupTime);
            }
          }
        }
        setFields(form.fields || []);
      } else {
        alert('載入表單失敗');
        router.push('/admin');
      }
    } catch (error) {
      console.error('載入表單錯誤:', error);
      alert('載入表單時發生錯誤');
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };


  const addField = () => {
    setFields([
      ...fields,
      {
        name: `field_${fields.length + 1}`,
        label: '',
        type: 'text',
        required: false,
        price: undefined, // 預設沒有價格
      },
    ]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 驗證欄位名稱唯一性
      const fieldNames = fields.map(f => f.name);
      if (new Set(fieldNames).size !== fieldNames.length) {
        alert('欄位名稱不能重複');
        setSaving(false);
        return;
      }

      // 驗證必填欄位
      const hasEmptyLabel = fields.some(f => !f.label.trim());
      if (hasEmptyLabel) {
        alert('請填寫所有欄位的標籤');
        setSaving(false);
        return;
      }


        // 驗證限額單設定
        if (isLimitedOrder) {
          if (!orderLimit || orderLimit.trim() === '') {
            alert('請輸入限額筆數');
            setSaving(false);
            return;
          }
          const limit = parseInt(orderLimit, 10);
          if (isNaN(limit) || limit < 1) {
            alert('限額筆數必須是大於 0 的整數');
            setSaving(false);
            return;
          }
        }

        // 驗證截止時間
        if (!deadlineDate || !deadlineTime) {
          alert('請選擇截止日期和時間');
          setSaving(false);
          return;
        }

        // 組合截止時間（YYYY-MM-DDTHH:mm）
        const deadlineToSend = `${deadlineDate}T${deadlineTime}`;

        // 驗證日期和時間是否有效
        const dateObj = new Date(deadlineToSend);
        if (isNaN(dateObj.getTime())) {
          alert('截止時間無效！請檢查日期和時間是否正確。');
          setSaving(false);
          return;
        }

        // 驗證時間是否在未來（可選，給出警告）
        if (dateObj <= new Date()) {
          const confirmed = window.confirm('截止時間已過，確定要使用這個時間嗎？');
          if (!confirmed) {
            setSaving(false);
            return;
          }
        }

      if (isEditMode && id) {
        // 更新現有表單
        const res = await fetch(`/api/forms/${id}/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            fields: fields.map(f => ({
              ...f,
              name: f.name.trim() || `field_${fields.indexOf(f) + 1}`,
            })),
            deadline: deadlineToSend,
            orderDeadline: deadlineToSend, // 使用相同的截止時間作為報表生成時間
            orderLimit: isLimitedOrder && orderLimit ? parseInt(String(orderLimit)) : undefined, // 訂單數量限制（可選）
            pickupTime: (() => {
              // 組合取貨時間字串
              if (!pickupDate) return undefined;
              if (pickupTimeMode === 'single') {
                if (pickupStartTime) {
                  return `${pickupDate} ${pickupStartTime}`;
                }
                return undefined;
              } else {
                if (pickupStartTime && pickupEndTime) {
                  return `${pickupDate} ${pickupStartTime}-${pickupEndTime}`;
                }
                return undefined;
              }
            })(), // 取貨時間（可選）
          }),
        });

        const data = await res.json();

        if (res.ok) {
          alert('表單已成功更新！');
          router.push('/admin');
        } else {
          alert(data.error || '更新表單失敗');
        }
      } else {
        // 建立新表單
        const res = await fetch('/api/forms/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            fields: fields.map(f => ({
              ...f,
              name: f.name.trim() || `field_${fields.indexOf(f) + 1}`,
            })),
            deadline: deadlineToSend,
            orderDeadline: deadlineToSend, // 使用相同的截止時間作為報表生成時間
            orderLimit: isLimitedOrder && orderLimit ? parseInt(String(orderLimit)) : undefined, // 訂單數量限制（可選）
            pickupTime: (() => {
              // 組合取貨時間字串
              if (!pickupDate) return undefined;
              if (pickupTimeMode === 'single') {
                if (pickupStartTime) {
                  return `${pickupDate} ${pickupStartTime}`;
                }
                return undefined;
              } else {
                if (pickupStartTime && pickupEndTime) {
                  return `${pickupDate} ${pickupStartTime}-${pickupEndTime}`;
                }
                return undefined;
              }
            })(), // 取貨時間（可選）
          }),
        });

        if (!res.ok) {
          // 嘗試解析錯誤回應
          let errorData;
          try {
            errorData = await res.json();
          } catch {
            errorData = { error: `HTTP ${res.status}: ${res.statusText}` };
          }
          
          // 顯示更詳細的錯誤訊息
          const errorMsg = errorData.error || '建立表單失敗';
          const details = errorData.details ? `\n詳細資訊：${errorData.details}` : '';
          const hint = errorData.hint ? `\n\n提示：${errorData.hint}` : '';
          const fullError = `${errorMsg}${details}${hint}\n\n狀態碼：${res.status}`;
          alert(fullError);
          console.error('建立表單失敗:', {
            status: res.status,
            statusText: res.statusText,
            error: errorData,
            url: res.url
          });
          setSaving(false);
          return;
        }

        const data = await res.json();

        if (data.success && data.formToken) {
          router.push(`/admin/share/${data.formToken}`);
        } else {
          alert(`建立表單失敗：${data.error || '未知錯誤'}\n\n回應：${JSON.stringify(data, null, 2)}`);
          console.error('建立表單回應異常:', data);
        }
      }
    } catch (error: any) {
      console.error('建立表單錯誤:', error);
      const errorMsg = error?.message || '建立表單時發生錯誤';
      const errorType = error?.name || 'UnknownError';
      alert(`建立表單時發生錯誤\n\n錯誤類型：${errorType}\n錯誤訊息：${errorMsg}\n\n請檢查：\n1. 網路連線是否正常\n2. Vercel 部署是否正常\n3. Supabase 環境變數是否設定\n\n按 F12 查看 Console 獲取更多資訊。`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">
          {isEditMode ? '修改表單' : '建立團購單'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 sm:p-6">
          {/* 限額單設定 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isLimitedOrder"
                checked={isLimitedOrder}
                onChange={(e) => {
                  setIsLimitedOrder(e.target.checked);
                  if (!e.target.checked) {
                    setOrderLimit('');
                  }
                }}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isLimitedOrder" className="text-sm font-medium text-gray-700 cursor-pointer">
                本單限額
              </label>
              {isLimitedOrder && (
                <div className="flex items-center gap-2 ml-4">
                  <input
                    type="number"
                    id="orderLimit"
                    value={orderLimit}
                    onChange={(e) => {
                      const value = e.target.value;
                      // 只接受正整數
                      if (value === '' || (parseInt(value, 10) > 0 && !value.includes('.'))) {
                        setOrderLimit(value);
                      } else if (value.includes('.')) {
                        alert('限額筆數只能輸入整數');
                      }
                    }}
                    className="w-24 px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="筆數"
                    min="1"
                    step="1"
                    required={isLimitedOrder}
                    autoComplete="off"
                  />
                  <span className="text-sm text-gray-600">筆</span>
                </div>
              )}
            </div>
            {isLimitedOrder && (
              <p className="text-xs text-gray-500 mt-2 ml-8">
                💡 設定後，當訂單數量達到此限制時，客戶將無法再下單。
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-base font-bold text-gray-700 mb-2">
              建立本張團購單
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              autoComplete="off"
            />
          </div>

          <div className="mb-6">
            <label className="block text-base font-bold text-gray-700 mb-2">
              本單截止時間
            </label>

            {/* 日期選擇 */}
            <div className="mb-3">
              <label htmlFor="deadlineDate" className="block text-sm font-medium text-gray-700 mb-2">
                截止日期
              </label>
              <input
                type="date"
                id="deadlineDate"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* 時間選擇 */}
            <div className="mb-3">
              <label htmlFor="deadlineTime" className="block text-sm font-medium text-gray-700 mb-2">
                截止時間
              </label>
              <input
                type="time"
                id="deadlineTime"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                step="60"
              />
            </div>

            {/* 預覽 */}
            {(deadlineDate || deadlineTime) && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">預覽：</p>
                <p className="text-sm text-blue-700">
                  {(() => {
                    if (!deadlineDate) return '請選擇日期';
                    if (!deadlineTime) return `${new Date(deadlineDate).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}（請選擇時間）`;
                    const dateStr = new Date(deadlineDate).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short'
                    });
                    return `${dateStr} ${deadlineTime}`;
                  })()}
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              在截止時間之前，客戶可以填寫和修改訂單。時間一到，系統會自動生成報表並匯出。
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-base font-bold text-gray-700 mb-2">
              取貨時間（選填）
            </label>
            
            {/* 時間模式選擇 */}
            <div className="flex gap-3 mb-3">
              <button
                type="button"
                onClick={() => setPickupTimeMode('single')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  pickupTimeMode === 'single'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                單一時間
              </button>
              <button
                type="button"
                onClick={() => setPickupTimeMode('range')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  pickupTimeMode === 'range'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                時間範圍
              </button>
            </div>

            {/* 日期選擇 */}
            <div className="mb-3">
              <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-2">
                取貨日期
              </label>
              <input
                type="date"
                id="pickupDate"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* 時間選擇 */}
            {pickupTimeMode === 'single' ? (
              <div className="mb-3">
                <label htmlFor="pickupStartTime" className="block text-sm font-medium text-gray-700 mb-2">
                  取貨時間
                </label>
                <input
                  type="time"
                  id="pickupStartTime"
                  value={pickupStartTime}
                  onChange={(e) => setPickupStartTime(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="pickupStartTime" className="block text-sm font-medium text-gray-700 mb-2">
                    開始時間
                  </label>
                  <input
                    type="time"
                    id="pickupStartTime"
                    value={pickupStartTime}
                    onChange={(e) => setPickupStartTime(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="pickupEndTime" className="block text-sm font-medium text-gray-700 mb-2">
                    結束時間
                  </label>
                  <input
                    type="time"
                    id="pickupEndTime"
                    value={pickupEndTime}
                    onChange={(e) => setPickupEndTime(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* 預覽 */}
            {(pickupDate || pickupStartTime) && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-1">預覽：</p>
                <p className="text-sm text-green-700">
                  {(() => {
                    if (!pickupDate) return '請選擇日期';
                    const dateStr = new Date(pickupDate).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short'
                    });
                    if (pickupTimeMode === 'single') {
                      return pickupStartTime 
                        ? `${dateStr} ${pickupStartTime}`
                        : `${dateStr}（請選擇時間）`;
                    } else {
                      if (pickupStartTime && pickupEndTime) {
                        return `${dateStr} ${pickupStartTime} - ${pickupEndTime}`;
                      } else if (pickupStartTime) {
                        return `${dateStr} ${pickupStartTime} - （請選擇結束時間）`;
                      } else {
                        return `${dateStr}（請選擇時間）`;
                      }
                    }
                  })()}
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
              💡 填寫取貨時間後，客戶下單成功後可看到此資訊
            </p>
          </div>

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <label className="block text-base font-bold text-gray-700">
                表單欄位
              </label>
              <button
                type="button"
                onClick={addField}
                className="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm sm:text-base touch-manipulation min-h-[44px] font-medium"
              >
                + 新增欄位
              </button>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  點擊「+ 新增欄位」開始添加表單欄位
                </p>
                <p className="text-xs text-gray-400">
                  注意：表單會自動包含「姓名」和「電話」欄位，無需重複添加
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-white"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          欄位標籤
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) =>
                            updateField(index, { label: e.target.value })
                          }
                          className="w-full px-3 py-2.5 text-base border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="例如：商品名稱"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          欄位類型
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateField(index, {
                              type: e.target.value as FormField['type'],
                              options: undefined,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="text">文字</option>
                          <option value="number">數字</option>
                          <option value="costco">好事多代購</option>
                        </select>
                      </div>
                    </div>


                    {(field.type === 'number') && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          價格（元，選填）
                        </label>
                        <input
                          type="number"
                          value={field.price !== undefined ? field.price : ''}
                          onChange={(e) =>
                            updateField(index, {
                              price: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                          }
                          className="w-full px-3 py-2.5 text-base border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="例如：90（留空表示無價格）"
                          min="0"
                          step="0.01"
                          autoComplete="off"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          💡 設定價格後，客戶端會顯示「{field.label || '欄位名稱'} {field.price ? field.price : '價格'}元」，輸入數量後會自動計算總計
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) =>
                            updateField(index, { required: e.target.checked })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">必填</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="text-red-600 hover:text-red-700 active:text-red-800 text-sm px-3 py-2 rounded hover:bg-red-50 active:bg-red-100 transition-colors touch-manipulation min-h-[36px]"
                      >
                        刪除欄位
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-3.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-base touch-manipulation min-h-[48px]"
            >
                  {loading ? '載入中...' : saving ? (isEditMode ? '更新中...' : '建立中...') : (isEditMode ? '更新表單' : '建立')}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none bg-gray-300 text-gray-700 px-6 py-3.5 rounded-lg hover:bg-gray-400 active:bg-gray-500 transition-colors text-base touch-manipulation min-h-[48px]"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
