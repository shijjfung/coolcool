import { useState } from 'react';
import { useRouter } from 'next/router';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select';
  required: boolean;
  options?: string[];
}

export default function CreateForm() {
  const router = useRouter();
  const [formName, setFormName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [dateInputMode, setDateInputMode] = useState<'picker' | 'manual'>('picker');
  // 表單頁面會自動顯示「姓名」和「電話」欄位，所以這裡不需要預設欄位
  const [fields, setFields] = useState<FormField[]>([]);
  const [saving, setSaving] = useState(false);

  // 切換輸入模式時的格式轉換
  const handleModeChange = (newMode: 'picker' | 'manual') => {
    if (newMode === dateInputMode) return;

    if (deadline) {
      if (newMode === 'manual') {
        // 從 datetime-local 格式 (YYYY-MM-DDTHH:mm) 轉換為手動輸入格式 (YYYY-MM-DD HH:mm)
        const converted = deadline.replace('T', ' ');
        setDeadline(converted);
      } else {
        // 從手動輸入格式 (YYYY-MM-DD HH:mm) 轉換為 datetime-local 格式 (YYYY-MM-DDTHH:mm)
        const converted = deadline.replace(' ', 'T');
        setDeadline(converted);
      }
    }
    setDateInputMode(newMode);
  };

  // 預設欄位模板
  const presetTemplates = {
    basic: [
      { name: 'customer_name', label: '客戶姓名', type: 'text' as const, required: true },
      { name: 'customer_phone', label: '電話', type: 'text' as const, required: true },
      { name: 'product_name', label: '商品名稱', type: 'text' as const, required: true },
      { name: 'quantity', label: '訂購數量', type: 'number' as const, required: true },
    ],
    spicy: [
      { name: 'customer_name', label: '客戶姓名', type: 'text' as const, required: true },
      { name: 'customer_phone', label: '電話', type: 'text' as const, required: true },
      { name: 'product_name', label: '商品名稱', type: 'text' as const, required: true },
      { name: 'quantity', label: '訂購數量', type: 'number' as const, required: true },
      { name: 'spicy_level', label: '辣度', type: 'select' as const, required: true, options: ['不辣', '微辣', '辣'] },
    ],
    size: [
      { name: 'customer_name', label: '客戶姓名', type: 'text' as const, required: true },
      { name: 'customer_phone', label: '電話', type: 'text' as const, required: true },
      { name: 'product_name', label: '商品名稱', type: 'text' as const, required: true },
      { name: 'quantity', label: '訂購數量', type: 'number' as const, required: true },
      { name: 'size', label: '尺寸', type: 'select' as const, required: true, options: ['S', 'M', 'L', 'XL'] },
    ],
    proxy: [
      { name: 'customer_name', label: '客戶姓名', type: 'text' as const, required: false },
      { name: 'customer_phone', label: '電話', type: 'text' as const, required: false },
      { name: 'product_name', label: '商品名稱', type: 'text' as const, required: true },
      { name: 'quantity', label: '數量', type: 'number' as const, required: false },
      { name: 'notes', label: '備註', type: 'text' as const, required: false },
    ],
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        name: `field_${fields.length + 1}`,
        label: '',
        type: 'text',
        required: false,
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

  const loadPreset = (templateKey: keyof typeof presetTemplates) => {
    const template = presetTemplates[templateKey];
    setFields(template.map((field, idx) => ({
      ...field,
      name: field.name || `field_${idx + 1}`,
    })));
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

      // 驗證選項欄位有選項
      const selectFieldsWithoutOptions = fields.filter(
        f => f.type === 'select' && (!f.options || f.options.length === 0)
      );
      if (selectFieldsWithoutOptions.length > 0) {
        alert('下拉選單欄位必須至少有一個選項');
        setSaving(false);
        return;
      }

      // 驗證截止時間格式（如果是手動輸入模式）
      let deadlineToSend = deadline;
      if (dateInputMode === 'manual') {
        // 驗證格式：YYYY-MM-DD HH:mm
        const manualDatePattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
        if (!manualDatePattern.test(deadline.trim())) {
          alert('截止時間格式錯誤！請使用格式：2024-12-31 23:59（年-月-日 時:分，24小時制）');
          setSaving(false);
          return;
        }

        // 轉換為 datetime-local 格式（YYYY-MM-DDTHH:mm）
        deadlineToSend = deadline.trim().replace(' ', 'T');

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
      }

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
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/admin/share/${data.formToken}`);
      } else {
        alert(data.error || '建立表單失敗');
      }
    } catch (error) {
      console.error('建立表單錯誤:', error);
      alert('建立表單時發生錯誤');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4 max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">建立新表單</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              表單名稱
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                截止時間
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleModeChange('picker')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    dateInputMode === 'picker'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📅 選擇時間
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('manual')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    dateInputMode === 'manual'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ⌨️ 手動輸入
                </button>
              </div>
            </div>

            {dateInputMode === 'picker' ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={deadline ? (deadline.includes('T') ? deadline.split('T')[0] : deadline.split(' ')[0]) : ''}
                    onChange={(e) => {
                      const date = e.target.value;
                      const time = deadline ? (deadline.includes('T') ? deadline.split('T')[1] : deadline.split(' ')[1] || '00:00') : '00:00';
                      setDeadline(`${date}T${time}`);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="time"
                    value={deadline ? (deadline.includes('T') ? deadline.split('T')[1] : deadline.split(' ')[1] || '00:00') : '00:00'}
                    onChange={(e) => {
                      const time = e.target.value;
                      const date = deadline ? (deadline.includes('T') ? deadline.split('T')[0] : deadline.split(' ')[0]) : new Date().toISOString().split('T')[0];
                      setDeadline(`${date}T${time}`);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    step="60"
                    lang="zh-TW"
                  />
                </div>
                {deadline && (
                  <p className="text-xs text-gray-500">
                    選擇的時間：{new Date(deadline.includes('T') ? deadline : deadline.replace(' ', 'T')).toLocaleString('zh-TW', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  💡 時間選擇器使用24小時制（00:00 - 23:59）
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="格式：2024-12-31 23:59 (24小時制)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  pattern="\d{4}-\d{2}-\d{2} \d{2}:\d{2}"
                />
                <p className="text-xs text-gray-500">
                  格式範例：2024-12-31 23:59（年-月-日 時:分，24小時制）
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              在截止時間之前，客戶可以填寫和修改訂單。時間一到，系統會自動生成報表並匯出。
            </p>
          </div>

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                表單欄位
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadPreset('basic')}
                  className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  📋 基本模板
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('spicy')}
                  className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  🌶️ 餐飲模板
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('size')}
                  className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  👕 服飾模板
                </button>
                <button
                  type="button"
                  onClick={addField}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  + 新增欄位
                </button>
              </div>
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
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="例如：商品名稱"
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
                              options: e.target.value === 'select' ? [''] : undefined,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="text">文字</option>
                          <option value="number">數字</option>
                          <option value="select">下拉選單</option>
                        </select>
                      </div>
                    </div>

                    {field.type === 'select' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          選項（每行一個）
                        </label>
                        <textarea
                          value={field.options?.join('\n') || ''}
                          onChange={(e) =>
                            updateField(index, {
                              options: e.target.value
                                .split('\n')
                                .filter((o) => o.trim()),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="選項1&#10;選項2&#10;選項3"
                        />
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
                        className="text-red-600 hover:text-red-700 text-sm px-3 py-1 rounded hover:bg-red-50 transition-colors"
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
              className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {saving ? '儲存中...' : '儲存表單'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

