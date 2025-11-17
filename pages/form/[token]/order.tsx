import { useState, useEffect, useRef, ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'costco';
  required: boolean;
  options?: string[];
  price?: number; // 價格欄位（可選）
}

interface Form {
  id: number;
  name: string;
  fields: FormField[];
  deadline: string;
  order_limit?: number; // 訂單數量限制（可選）
  pickup_time?: string; // 取貨時間（可選）
  created_at: string;
  form_token: string;
  facebook_comment_url?: string;
  line_comment_url?: string;
}

interface Order {
  order_token?: string;
  order_data: Record<string, any>;
}

const IPHONE_MODEL_MAP: Record<string, string> = {
  'iphone18,1': 'iPhone 17',
  'iphone18,2': 'iPhone 17 Plus',
  'iphone18,3': 'iPhone 17 Pro',
  'iphone18,4': 'iPhone 17 Pro Max',
  'iphone17,1': 'iPhone 16 Pro',
  'iphone17,2': 'iPhone 16 Pro Max',
  'iphone17,3': 'iPhone 16',
  'iphone17,4': 'iPhone 16 Plus',
  'iphone16,1': 'iPhone 15 Pro',
  'iphone16,2': 'iPhone 15 Pro Max',
  'iphone15,4': 'iPhone 15',
  'iphone15,5': 'iPhone 15 Plus',
  'iphone15,2': 'iPhone 14 Pro',
  'iphone15,3': 'iPhone 14 Pro Max',
  'iphone14,7': 'iPhone 14',
  'iphone14,8': 'iPhone 14 Plus',
  'iphone14,2': 'iPhone 13 Pro',
  'iphone14,3': 'iPhone 13 Pro Max',
  'iphone13,2': 'iPhone 12 Pro',
  'iphone13,3': 'iPhone 12 Pro Max',
  'iphone12,8': 'iPhone SE (第2代)',
  'iphone11,8': 'iPhone XR',
  'iphone11,2': 'iPhone XS',
  'iphone11,6': 'iPhone XS Max',
  'iphone10,3': 'iPhone X',
  'iphone10,6': 'iPhone X',
  'iphone9,1': 'iPhone 7',
  'iphone9,2': 'iPhone 7 Plus',
  'iphone9,3': 'iPhone 7',
  'iphone9,4': 'iPhone 7 Plus',
  'iphone8,1': 'iPhone 6s',
  'iphone8,2': 'iPhone 6s Plus',
  'iphone8,4': 'iPhone SE',
  'iphone7,1': 'iPhone 6 Plus',
  'iphone7,2': 'iPhone 6',
};

const describeIphoneModel = (userAgent: string): string | null => {
  const normalized = userAgent.toLowerCase();
  const codeMatch = normalized.match(/iphone\d+,\d+/);
  if (!codeMatch) return null;
  const code = codeMatch[0];
  if (IPHONE_MODEL_MAP[code]) {
    return IPHONE_MODEL_MAP[code];
  }
  const seriesMatch = code.match(/iphone(\d+),/);
  if (seriesMatch) {
    const series = parseInt(seriesMatch[1], 10);
    if (!Number.isNaN(series)) {
      return `iPhone ${series}`;
    }
  }
  return `iPhone (${code.replace('iphone', 'iPhone ').toUpperCase()})`;
};

const describeAndroidModel = (userAgent: string): string | null => {
  const normalized = userAgent.toLowerCase();
  const samsungMatch = normalized.match(/sm-[a-z0-9]+/);
  if (samsungMatch) {
    const code = samsungMatch[0].toUpperCase();
    if (code.startsWith('SM-S91')) return 'Samsung Galaxy S23';
    if (code.startsWith('SM-S92')) return 'Samsung Galaxy S24';
    if (code.startsWith('SM-S93')) return 'Samsung Galaxy S25';
    if (code.startsWith('SM-N')) return `Samsung Galaxy Note (${code})`;
    if (code.startsWith('SM-A')) return `Samsung Galaxy A 系列 (${code})`;
    return `Samsung (${code})`;
  }
  const pixelMatch = userAgent.match(/Pixel\s?[0-9a-zA-Z ]+/);
  if (pixelMatch) {
    return pixelMatch[0].trim();
  }
  const genericMatch = userAgent.match(/;\s*([^;()]+?)\s*(?:Build|\))/);
  if (genericMatch) {
    const candidate = genericMatch[1].trim();
    if (candidate && !candidate.toLowerCase().includes('android')) {
      return candidate;
    }
  }
  return null;
};

const describeDeviceFromUserAgent = (userAgent: string): string => {
  if (!userAgent) return '未知裝置';
  if (/ipad/i.test(userAgent)) {
    const osMatch = userAgent.match(/cpu os (\d+)_(\d+)/i);
    if (osMatch) {
      return `iPad (iPadOS ${osMatch[1]}.${osMatch[2]})`;
    }
    return 'iPad';
  }
  if (/iphone/i.test(userAgent)) {
    const model = describeIphoneModel(userAgent);
    if (model) return model;
    const iosMatch = userAgent.match(/os (\d+)_(\d+)/i);
    if (iosMatch) {
      return `iPhone (iOS ${iosMatch[1]}.${iosMatch[2]})`;
    }
    return 'iPhone';
  }
  if (/android/i.test(userAgent) && !/tablet/i.test(userAgent)) {
    const androidModel = describeAndroidModel(userAgent);
    if (androidModel) return androidModel;
    return 'Android 手機';
  }
  if (/android/i.test(userAgent)) {
    return 'Android 平板';
  }
  if (/macintosh|mac os x/i.test(userAgent)) {
    const macMatch = userAgent.match(/mac os x (\d+)[._](\d+)/i);
    if (macMatch) {
      const major = parseInt(macMatch[1], 10);
      const minor = parseInt(macMatch[2], 10);
      if (major >= 15) return `macOS (版本 ${major}.${minor})`;
      const versionNames: Record<number, string> = {
        14: 'macOS Sonoma',
        13: 'macOS Ventura',
        12: 'macOS Monterey',
        11: 'macOS Big Sur',
      };
      if (versionNames[major]) return versionNames[major];
    }
    return 'Mac 電腦';
  }
  if (/windows/i.test(userAgent)) {
    if (/windows nt 10.0/i.test(userAgent)) {
      return 'Windows 10/11';
    }
    if (/windows nt 6.3/i.test(userAgent)) {
      return 'Windows 8.1';
    }
    if (/windows nt 6.2/i.test(userAgent)) {
      return 'Windows 8';
    }
    if (/windows nt 6.1/i.test(userAgent)) {
      return 'Windows 7';
    }
    return 'Windows';
  }
  if (/linux/i.test(userAgent)) {
    return 'Linux';
  }
  return '未知裝置';
};

export default function CustomerForm() {
  const router = useRouter();
  const { token } = router.query;
  const [form, setForm] = useState<Form | null>(null);
  const [order, setOrder] = useState<Order>({ order_data: {} });
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clientIp, setClientIp] = useState<string>('');
  const [deviceType, setDeviceType] = useState<string>('');
  const [orderCount, setOrderCount] = useState<number>(0);
  const [orderNumber, setOrderNumber] = useState<number | null>(null); // 當前訂單的排序號
  const [isOrderFull, setIsOrderFull] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [reservedExpiresAt, setReservedExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // 剩餘秒數（用於訂單預約倒數）
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null); // 表單截止時間倒數計時器
  const [source, setSource] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState('');
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  // 用於保存每個數字輸入欄位的前一個有效值
  const previousValues = useRef<Record<string, string>>({});
  const setFieldRef = (fieldName: string, element: HTMLElement | null) => {
    if (element) {
      fieldRefs.current[fieldName] = element;
    }
  };

  const scrollToField = (fieldName: string) => {
    const target = fieldRefs.current[fieldName];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if ('focus' in target && typeof (target as HTMLElement & { focus?: () => void }).focus === 'function') {
        (target as HTMLElement & { focus: () => void }).focus();
      }
    }
  };

  useEffect(() => {
    if (router.isReady) {
      const sourceParam = Array.isArray(router.query.source) ? router.query.source[0] : router.query.source;
      if (sourceParam && typeof sourceParam === 'string') {
        setSource(sourceParam);
      }
      
      // 檢查是否從入口頁面帶來了編輯訂單的參數
      const editParam = Array.isArray(router.query.edit) ? router.query.edit[0] : router.query.edit;
      const orderDataParam = Array.isArray(router.query.orderData) ? router.query.orderData[0] : router.query.orderData;
      
      if (editParam === 'true' && orderDataParam && typeof orderDataParam === 'string') {
        try {
          const orderData = JSON.parse(decodeURIComponent(orderDataParam));
          setOrder({
            order_token: orderData.orderToken,
            order_data: orderData.orderData || {},
          });
          setCustomerName(orderData.customerName || '');
          setCustomerPhone(orderData.customerPhone || '');
          setIsEditMode(true);
        } catch (error) {
          console.error('解析訂單資料錯誤:', error);
        }
      }
    }
    if (token && typeof token === 'string') {
      // 生成或取得 session ID
      let sid = sessionStorage.getItem(`session_${token}`);
      if (!sid) {
        sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        sessionStorage.setItem(`session_${token}`, sid);
      }
      setSessionId(sid);
      
      fetchForm(sid);
      fetchClientInfo();
      detectDeviceType();
    }
  }, [token, sessionId, router]);

  // 當訂單送出後，重新檢查訂單數量
  useEffect(() => {
    if (!submitting && order.order_token) {
      fetchOrderCount();
    }
  }, [submitting, order.order_token, token]);

  // 訂單預約倒數計時器（5分鐘倒數）
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  // 表單截止時間倒數計時器
  useEffect(() => {
    if (!form || isExpired) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const deadline = new Date(form.deadline);
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    // 立即執行一次
    updateCountdown();

    // 每秒更新一次
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [form, isExpired]);

  // 顯示 Toast 訊息
  useEffect(() => {
    if (toastMessage) {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    }

    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [toastMessage]);

  const fetchForm = async (sid: string) => {
    if (!token || typeof token !== 'string') return;
    try {
      const res = await fetch(`/api/forms/token/${token}?sessionId=${sid}`);
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

  const fetchOrderCount = async () => {
    if (!token || typeof token !== 'string') return;
    try {
      const res = await fetch(`/api/orders/count?formToken=${typeof token === 'string' ? token : ''}`);
      const data = await res.json();
      if (res.ok) {
        setOrderCount(data.count || 0);
      }
    } catch (error) {
      console.error('取得訂單數量錯誤:', error);
    }
  };

  const fetchClientInfo = async () => {
    try {
      const res = await fetch('/api/client-info');
      const data = await res.json();
      if (res.ok) {
        setClientIp(data.ip || '');
      }
    } catch (error) {
      console.error('取得客戶資訊錯誤:', error);
    }
  };

  const detectDeviceType = () => {
    const userAgent = navigator.userAgent || '';
    setDeviceType(describeDeviceFromUserAgent(userAgent));
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setOrder((prev) => ({
      ...prev,
      order_data: {
        ...prev.order_data,
        [fieldName]: value,
      },
    }));
  };
  const findFirstMissingField = () => {
    if (!form) return null;
    for (const field of form.fields) {
      if (!field.required) continue;
      const value = order.order_data[field.name];
      if (field.type === 'costco') {
        const items = Array.isArray(value) ? value : [];
        const hasFilledItem =
          items.length > 0 && items.some((item) => item && typeof item.name === 'string' && item.name.trim() !== '');
        if (!hasFilledItem) return field;
      } else if (field.type === 'number') {
        if (value === undefined || value === null || value === '' || isNaN(Number(value))) {
          return field;
        }
      } else {
        if (!value || String(value).trim() === '') {
          return field;
        }
      }
    }
    return null;
  };

  const scrollToFirstProductField = () => {
    if (!form) return;
    const productField = form.fields.find(
      (field) => field.type === 'number' || field.type === 'costco'
    );
    if (productField) {
      scrollToField(productField.name);
    }
  };

  const renderFieldInput = (field: FormField) => {
    if (field.type === 'costco') {
      const rawValue = order.order_data[field.name];
      const items: Array<{ name: string; quantity: string }> = Array.isArray(rawValue)
        ? rawValue
        : rawValue
        ? [{ name: String(rawValue), quantity: '' }]
        : [{ name: '', quantity: '' }];

      const updateItems = (newItems: Array<{ name: string; quantity: string }>) => {
        handleFieldChange(field.name, newItems);
      };

      const addItem = () => {
        updateItems([...items, { name: '', quantity: '' }]);
      };

      const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        updateItems(newItems.length > 0 ? newItems : [{ name: '', quantity: '' }]);
      };

      const updateItem = (index: number, key: 'name' | 'quantity', value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [key]: value };
        updateItems(newItems);
      };

      return (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="商品名稱"
                ref={index === 0 ? (el) => setFieldRef(field.name, el) : undefined}
              />
              <input
                type="text"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                className="w-20 px-3 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="數量"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="px-3 py-2.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-base"
                >
                  刪除
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-base"
          >
            + 新增商品
          </button>
        </div>
      );
    }

    if (field.type === 'text') {
      return (
        <input
          type="text"
          value={order.order_data[field.name] || ''}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base shadow-sm"
          required={field.required}
          ref={(el) => setFieldRef(field.name, el)}
        />
      );
    }

    if (field.type === 'number') {
      const rawValue = order.order_data[field.name] ?? 0;
      const currentValue = parseInt(String(rawValue), 10) || 0;

      const handleIncrease = () => {
        handleFieldChange(field.name, currentValue + 1);
      };

      const handleDecrease = () => {
        if (currentValue > 0) {
          handleFieldChange(field.name, currentValue - 1);
        }
      };

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fieldName = field.name;
        const value = e.target.value;

        if (value === '') {
          previousValues.current[fieldName] = '';
          handleFieldChange(fieldName, '');
          return;
        }

        if (value.includes('.') || value.includes(',')) {
          alert('只能輸入整數，請勿輸入小數點');
          const prevValue = previousValues.current[fieldName] || '';
          if (prevValue === '') {
            handleFieldChange(fieldName, '');
          } else {
            const prevInt = parseInt(prevValue, 10);
            if (!isNaN(prevInt) && prevInt >= 0) {
              handleFieldChange(fieldName, prevInt);
            } else {
              handleFieldChange(fieldName, '');
            }
          }
          return;
        }

        const intValue = parseInt(value, 10);
        if (!isNaN(intValue) && intValue >= 0) {
          previousValues.current[fieldName] = String(intValue);
          handleFieldChange(fieldName, intValue);
        } else if (value === '-') {
          previousValues.current[fieldName] = '';
          handleFieldChange(fieldName, '');
        } else {
          alert('只能輸入大於等於 0 的整數');
          const prevValue = previousValues.current[fieldName] || '';
          if (prevValue === '') {
            handleFieldChange(fieldName, '');
          } else {
            const prevInt = parseInt(prevValue, 10);
            if (!isNaN(prevInt) && prevInt >= 0) {
              handleFieldChange(fieldName, prevInt);
            } else {
              handleFieldChange(fieldName, '');
            }
          }
        }
      };

      const showPriceInfo = field.price !== undefined && field.price !== null && field.price > 0;
      const itemTotal = showPriceInfo ? currentValue * (field.price || 0) : 0;

      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={currentValue <= 0}
            className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 active:from-gray-400 active:to-gray-500 disabled:from-gray-100 disabled:to-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-full border-2 border-gray-300/50 shadow-[0_4px_8px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_12px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-0 disabled:shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:translate-y-0 transition-all duration-200 text-lg sm:text-xl font-bold text-gray-700 min-w-[44px] sm:min-w-[48px] touch-manipulation"
            aria-label="減少數量"
          >
            −
          </button>
          <input
            type="number"
            value={currentValue || ''}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === '.' || e.key === ',') {
                e.preventDefault();
                alert('只能輸入整數，請勿輸入小數點');
              }
            }}
            className="w-20 sm:w-24 px-3 py-2.5 text-center border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-base font-medium shadow-sm"
            required={field.required}
            min="0"
            step="1"
            placeholder="0"
            ref={(el) => setFieldRef(field.name, el)}
          />
          <button
            type="button"
            onClick={handleIncrease}
            className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 active:from-gray-400 active:to-gray-500 rounded-full border-2 border-gray-300/50 shadow-[0_4px_8px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_12px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-0 transition-all duration-200 text-lg sm:text-xl font-bold text-gray-700 min-w-[44px] sm:min-w-[48px] touch-manipulation"
            aria-label="增加數量"
          >
            +
          </button>
          {showPriceInfo && (
            <div className="text-sm sm:text-base text-gray-600 min-w-[70px] sm:min-w-[90px] text-right">
              {itemTotal > 0 && (
                <span className="text-green-600 font-bold">
                  = {itemTotal.toFixed(0)}元
                </span>
              )}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const namePlaceholder = '請輸入您的姓名（範例：王小明）';
  const phonePlaceholder = '請輸入您的電話（範例：0912345678）';

  const handleNameFocus = () => {
    if (!namePlaceholder.includes('範例')) {
      return;
    }
    const newPlaceholder = namePlaceholder.replace('（範例：王小明）', '');
    // 這裡可以更新 placeholder，但由於是常數，我們不修改它
  };

  const handlePhoneFocus = () => {
    if (!phonePlaceholder.includes('範例')) {
      return;
    }
    const newPlaceholder = phonePlaceholder.replace('（範例：0912345678）', '');
    // 這裡可以更新 placeholder，但由於是常數，我們不修改它
  };

  const calculateTotal = () => {
    if (!form) return 0;
    let total = 0;
    form.fields.forEach((field) => {
      if (field.price && field.price > 0) {
        const value = order.order_data[field.name];
        if (field.type === 'number') {
          const quantity = parseInt(String(value), 10) || 0;
          total += quantity * field.price;
        }
      }
    });
    return total;
  };

  // 檢查是否有購買至少一個商品
  const hasPurchasedItems = () => {
    if (!form) return false;
    return form.fields.some((field) => {
      const value = order.order_data[field.name];
      if (field.type === 'number') {
        const quantity = parseInt(String(value), 10) || 0;
        return quantity > 0;
      } else if (field.type === 'costco') {
        if (Array.isArray(value)) {
          return value.some((item: { name: string; quantity: string }) => 
            item.name && item.name.trim() !== ''
          );
        }
        return value && String(value).trim() !== '';
      } else if (field.type === 'text') {
        return value && String(value).trim() !== '';
      }
      return false;
    });
  };

  // 驗證電話號碼
  const validatePhone = (phone: string): boolean => {
    const trimmedPhone = phone.trim();
    if (trimmedPhone.length < 7) {
      setPhoneError('請輸入正確聯絡號碼（至少7碼）');
      return false;
    }
    if (!/^\d+$/.test(trimmedPhone)) {
      setPhoneError('電話僅能輸入數字');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateName = (name: string): boolean => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('請輸入姓名');
      return false;
    }
    const namePattern = /^[A-Za-z\u4e00-\u9fa5\s]+$/;
    if (!namePattern.test(trimmedName)) {
      setNameError('姓名僅能輸入中文或英文');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('請填寫姓名');
      scrollToField('customerName');
      return;
    }
    if (!validateName(customerName)) {
      scrollToField('customerName');
      return;
    }
    if (!customerPhone.trim()) {
      alert('請填寫電話');
      scrollToField('customerPhone');
      return;
    }

    // 驗證電話號碼
    if (!validatePhone(customerPhone)) {
      scrollToField('customerPhone');
      return;
    }

    const missingField = findFirstMissingField();
    if (missingField) {
      alert(`${missingField.label}為必填欄位，請先完成填寫`);
      scrollToField(missingField.name);
      return;
    }

    // 檢查是否有購買商品
    if (!hasPurchasedItems()) {
      setToastMessage('你沒有選擇商品數量');
      scrollToFirstProductField();
      return;
    }

    // 檢查是否超過截止時間
    if (form) {
      const deadline = new Date(form.deadline);
      const now = new Date();
      if (now > deadline) {
        alert('表單已截止，無法再下單');
        setIsExpired(true);
        return;
      }
    }

    // 如果是編輯模式，直接提交
    if (isEditMode) {
      setShowConfirm(true);
      return;
    }

    // 檢查訂單限額
    if (form && form.order_limit && form.order_limit > 0) {
      try {
        const res = await fetch(`/api/orders/reserve?formToken=${typeof token === 'string' ? token : ''}&sessionId=${sessionId}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setOrderNumber(data.orderNumber);
          setTimeRemaining(data.timeRemaining || 300); // 預設 5 分鐘
          setReservedExpiresAt(new Date(data.reservedExpiresAt));
          setShowConfirm(true);
        } else {
          if (data.error === 'ORDER_LIMIT_REACHED') {
            setIsOrderFull(true);
            setOrderCount(data.currentCount || 0);
          } else {
            alert(data.error || '預約訂單失敗，請稍後再試');
          }
        }
      } catch (error) {
        console.error('預約訂單錯誤:', error);
        alert('預約訂單時發生錯誤，請稍後再試');
      }
    } else {
      // 沒有訂單限額，直接顯示確認畫面
      setShowConfirm(true);
    }
  };

  const renderFormRow = (
    key: string,
    {
      label,
      icon,
      accent = 'from-blue-50 to-indigo-50',
      required,
      subtitle,
      children,
    }: {
      label: string;
      icon: ReactNode;
      accent?: string;
      required?: boolean;
      subtitle?: ReactNode;
      children: ReactNode;
    }
  ) => (
    <div key={key} className="flex flex-col lg:grid lg:grid-cols-[240px_minmax(0,1fr)] gap-0">
      <div className={`px-4 sm:px-6 py-4 bg-gradient-to-r ${accent}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-blue-600">{icon}</div>
          <div className="flex flex-col gap-1">
            <span className="text-base sm:text-lg font-bold text-gray-800">{label}</span>
            {subtitle}
            {required && <span className="text-xs text-red-500 font-semibold">(必填)</span>}
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 py-4 bg-white">{children}</div>
    </div>
  );

  const handleConfirmSubmit = async () => {
    if (!validateName(customerName)) {
      scrollToField('customerName');
      return;
    }

    // 再次驗證電話號碼
    if (!validatePhone(customerPhone)) {
      scrollToField('customerPhone');
      return;
    }

    const missingField = findFirstMissingField();
    if (missingField) {
      alert(`${missingField.label}為必填欄位，請先完成填寫`);
      scrollToField(missingField.name);
      return;
    }

    // 再次檢查是否有購買商品
    if (!hasPurchasedItems()) {
      setToastMessage('你沒有選擇商品數量');
      scrollToFirstProductField();
      return;
    }

    setSubmitting(true);
    try {
      const url = isEditMode ? `/api/orders/${order.order_token}` : '/api/orders/create';
      const method = isEditMode ? 'PUT' : 'POST';

      const body: any = {
        formToken: typeof token === 'string' ? token : '',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderData: order.order_data,
        source: source,
        deviceType: deviceType,
        clientIp: clientIp,
      };

      if (!isEditMode && form && form.order_limit && form.order_limit > 0) {
        body.sessionId = sessionId;
        body.orderNumber = orderNumber;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        const createdOrderToken = data.orderToken || data.order_token;
        const nextOrderToken = createdOrderToken || order.order_token;
        if (isEditMode) {
          if (!nextOrderToken) {
            alert('訂單已成功更新，但未取得訂單代碼，請聯絡客服。');
            setShowConfirm(false);
            setIsEditMode(false);
            fetchOrderCount();
            setSubmitting(false);
            return;
          }
          setToastMessage('訂單已成功更新！');
          setShowConfirm(false);
          setIsEditMode(false);
          setOrder((prev) => ({ ...prev, order_token: nextOrderToken }));
          fetchOrderCount();
          const params = new URLSearchParams();
          if (source) {
            params.set('source', source);
          }
          params.set('updated', 'true');
          const successUrl = params.toString()
            ? `/order/success/${nextOrderToken}?${params.toString()}`
            : `/order/success/${nextOrderToken}`;
          router.push(successUrl);
        } else {
          if (!createdOrderToken) {
            alert('送出訂單成功，但未取得訂單代碼，請聯絡客服。');
            setShowConfirm(false);
            setIsEditMode(false);
          fetchOrderCount();
            setSubmitting(false);
            return;
          }
          const params = new URLSearchParams();
          if (source) {
            params.set('source', source);
          }
          const successUrl = params.toString()
            ? `/order/success/${createdOrderToken}?${params.toString()}`
            : `/order/success/${createdOrderToken}`;
          setOrder({ ...order, order_token: createdOrderToken });
          setToastMessage('訂單已成功送出！');
          fetchOrderCount();
        setShowConfirm(false);
        setIsEditMode(false);
          router.push(successUrl);
        }
      } else {
        if (data.error === 'ORDER_LIMIT_REACHED') {
          setIsOrderFull(true);
          setOrderCount(data.currentCount || 0);
          setShowConfirm(false);
        } else if (data.error === 'RESERVATION_EXPIRED') {
          alert('您的預約已過期，請重新下單');
          setShowConfirm(false);
          setOrderNumber(null);
          setTimeRemaining(0);
        } else {
          alert(data.error || '送出訂單失敗，請稍後再試');
        }
      }
    } catch (error) {
      console.error('送出訂單錯誤:', error);
      alert('送出訂單時發生錯誤');
    } finally {
      setSubmitting(false);
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

  if (isOrderFull) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            訂單已滿
          </h1>
          <p className="text-gray-600 mb-2">
            目前訂單數量已達上限（{form.order_limit} 單），
            無法再下單
          </p>
          <p className="text-sm text-gray-500">
            您可以稍等再試，看是否有其他客戶刪除訂單。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 sm:py-10">
      <Head>
        <title>{form.name} - 涼涼古早味創意冰品-團購</title>
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

          .toast-enter {
            animation: fadeInDown 0.3s ease-out;
          }
        `}</style>
      </Head>
      {toastMessage && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 toast-enter">
          <div className="rounded-lg bg-blue-600 text-white px-4 py-3 shadow-lg text-sm sm:text-base">
            {toastMessage}
          </div>
        </div>
      )}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
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
            <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
              {/* 倒數計時器 */}
              {countdown !== null && (
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <span className="text-base sm:text-lg font-semibold text-gray-700">剩餘</span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {countdown.days > 0 && (
                        <div className="flex flex-col items-center px-3 py-2 bg-white rounded-lg border-2 border-orange-300 shadow-sm min-w-[60px]">
                          <span className="text-2xl sm:text-3xl font-extrabold text-orange-600">
                            {countdown.days}
                          </span>
                          <span className="text-xs text-gray-600 font-medium">天</span>
                        </div>
                      )}
                      <div className="flex flex-col items-center px-3 py-2 bg-white rounded-lg border-2 border-orange-300 shadow-sm min-w-[60px]">
                        <span className="text-2xl sm:text-3xl font-extrabold text-orange-600">
                          {String(countdown.hours).padStart(2, '0')}
                        </span>
                        <span className="text-xs text-gray-600 font-medium">時</span>
                      </div>
                      <div className="flex flex-col items-center px-3 py-2 bg-white rounded-lg border-2 border-orange-300 shadow-sm min-w-[60px]">
                        <span className="text-2xl sm:text-3xl font-extrabold text-orange-600">
                          {String(countdown.minutes).padStart(2, '0')}
                        </span>
                        <span className="text-xs text-gray-600 font-medium">分</span>
                      </div>
                      <div className="flex flex-col items-center px-3 py-2 bg-white rounded-lg border-2 border-orange-300 shadow-sm min-w-[60px]">
                        <span className="text-2xl sm:text-3xl font-extrabold text-orange-600">
                          {String(countdown.seconds).padStart(2, '0')}
                        </span>
                        <span className="text-xs text-gray-600 font-medium">秒</span>
                      </div>
                    </div>
                    <span className="text-base sm:text-lg font-semibold text-gray-700">可下單</span>
                  </div>
                </div>
              )}
            {form.order_limit && form.order_limit > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm text-gray-700 font-medium">
                      訂單限額：<span className="font-bold text-indigo-700">{form.order_limit}</span> 單
                  {orderCount > 0 && (
                        <span className="ml-2 text-gray-600">
                          （目前已達 <span className="font-bold text-orange-600">{orderCount}</span> 單）
                    </span>
                  )}
                </span>
                  </div>
                {orderNumber && !order.order_token && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border-2 border-orange-200">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-orange-800 font-bold">
                          🎉 你搶到第 {orderNumber} 張單，請於5分鐘內送出表單
                      </span>
                      {timeRemaining > 0 && (
                          <span className="text-base text-orange-600 font-extrabold whitespace-nowrap bg-white px-3 py-1 rounded-lg border-2 border-orange-300">
                            ⏰ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    </div>
                )}
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

          {/* 客戶端資訊顯示 */}
          {(deviceType || clientIp || order.order_token || orderNumber) && (
            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm">
                <div className="flex flex-wrap items-center gap-4">
                  {orderNumber && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-lg">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="text-gray-700 font-medium">訂單排序：</span>
                      <span className="font-bold text-blue-700">第 {orderNumber} 張</span>
                    </div>
                  )}
                  {order.order_token && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 rounded-lg">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2m-7 4h.01M9 16h.01" />
                      </svg>
                      <span className="text-gray-700 font-medium">訂單編號：</span>
                      <span className="font-mono font-semibold text-indigo-800">{order.order_token}</span>
                    </div>
                  )}
                  {deviceType && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-lg">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700 font-medium">設備：</span>
                      <span className="font-semibold text-purple-800">{deviceType}</span>
                    </div>
                  )}
                  {clientIp && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <span className="text-gray-700 font-medium">IP：</span>
                      <span className="font-mono font-semibold text-gray-800">{clientIp}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isEditMode && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="text-sm font-semibold text-green-800">
                  您正在編輯訂單（訂單代碼：<span className="font-mono">{order.order_token}</span>）
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 試算表風格的表單 */}
            <div className="mb-6">
              <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
                <div className="divide-y divide-gray-100">
                  {renderFormRow('customerName', {
                    label: '姓名',
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                    ),
                    accent: 'from-blue-50 to-indigo-50',
                    required: true,
                    children: (
                      <div>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => {
                            setCustomerName(e.target.value);
                            if (nameError) {
                              setNameError('');
                            }
                          }}
                          onFocus={handleNameFocus}
                          onBlur={() => {
                            if (customerName.trim()) {
                              validateName(customerName);
                            }
                          }}
                          className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base sm:text-lg shadow-sm"
                          placeholder={namePlaceholder}
                          required
                          ref={(el) => setFieldRef('customerName', el)}
                        />
                        {nameError && (
                          <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {nameError}
                          </p>
                        )}
                      </div>
                    ),
                  })}

                  {renderFormRow('customerPhone', {
                    label: '電話',
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                    ),
                    accent: 'from-blue-50 to-indigo-50',
                    required: true,
                    children: (
                        <div>
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => {
                              setCustomerPhone(e.target.value);
                              if (phoneError) {
                                setPhoneError('');
                              }
                            }}
                            onBlur={() => {
                              if (customerPhone.trim()) {
                                validatePhone(customerPhone);
                              }
                            }}
                            onFocus={handlePhoneFocus}
                            className={`w-full px-4 py-3.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-base sm:text-lg shadow-sm ${
                            phoneError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                            }`}
                            placeholder={phonePlaceholder}
                            required
                          ref={(el) => setFieldRef('customerPhone', el)}
                          />
                          {phoneError && (
                            <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {phoneError}
                            </p>
                          )}
                        </div>
                    ),
                  })}

                  {form.fields.map((field) =>
                    renderFormRow(field.name, {
                      label: field.label,
                      icon:
                        field.type === 'number' ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m-4 6h12M9 9v2m-4 6h12m-6-2v2" />
                            </svg>
                        ) : field.type === 'costco' ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5m1.6 8L6 21h12l-1-8M7 13h10" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20l9-5-9-5-9 5 9 5zm0-10l9-5-9-5-9 5 9 5z" />
                          </svg>
                        ),
                      accent:
                        field.type === 'number'
                          ? 'from-indigo-50 to-purple-50'
                          : field.type === 'costco'
                          ? 'from-purple-50 to-pink-50'
                          : 'from-blue-50 to-sky-50',
                      required: field.required,
                      subtitle:
                        field.price && field.price > 0 ? (
                          <span className="text-xs text-blue-600 font-semibold">單價：{field.price.toLocaleString('zh-TW')} 元</span>
                        ) : null,
                      children: (
                        <div className="space-y-3">
                          {renderFieldInput(field)}
                          {field.type === 'number' && field.price && field.price > 0 && (
                            <p className="text-sm text-gray-500">
                              小計：{((order.order_data[field.name] || 0) * field.price).toFixed(0)} 元
                            </p>
                          )}
                          </div>
                      ),
                    })
                  )}

                  {form.fields.some((f) => f.price !== undefined && f.price !== null && f.price > 0) && (
                    <div className="flex flex-col lg:grid lg:grid-cols-[240px_minmax(0,1fr)] bg-gradient-to-r from-green-50 to-emerald-50">
                      <div className="px-4 sm:px-6 py-4 flex items-center gap-2 text-gray-800 font-bold">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                        <span className="text-lg sm:text-xl">總計價格</span>
                            </div>
                      <div className="px-4 sm:px-6 py-4 flex items-center justify-end">
                        <span className="text-2xl sm:text-3xl font-extrabold text-green-600">{calculateTotal().toFixed(0)} 元</span>
                          </div>
                    </div>
                    )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-8 py-4 rounded-full border-2 border-blue-500/30 shadow-[0_10px_25px_rgba(59,130,246,0.5),0_5px_10px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 hover:shadow-[0_15px_35px_rgba(59,130,246,0.6),0_8px_15px_rgba(59,130,246,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] hover:-translate-y-1 active:shadow-[0_5px_15px_rgba(59,130,246,0.4),inset_0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-0 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 disabled:border-gray-400/30 disabled:shadow-[0_2px_4px_rgba(0,0,0,0.1)] disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-300 transform font-bold text-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="drop-shadow-md">處理中...</span>
                  </>
                ) : isEditMode ? (
                  <>
                    <svg className="w-5 h-5 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="drop-shadow-md">更新訂單</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="drop-shadow-md">送出訂單</span>
                  </>
                )}
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
                  className="relative bg-gradient-to-r from-gray-300 via-gray-300 to-gray-400 text-gray-700 px-6 py-4 rounded-full border-2 border-gray-300/30 shadow-[0_6px_15px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.3)] hover:from-gray-400 hover:via-gray-400 hover:to-gray-500 hover:shadow-[0_10px_25px_rgba(0,0,0,0.3),0_5px_10px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] hover:-translate-y-1 active:shadow-[0_3px_8px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(0,0,0,0.15)] active:translate-y-0 transition-all duration-300 transform font-semibold"
                >
                  <span className="drop-shadow-md">取消編輯</span>
                </button>
              )}
            </div>
          </form>

          {/* 確認畫面 */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
                {/* 頂部裝飾條 */}
                <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">確認訂單資訊</h2>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 pl-11">請確認以下訂單資訊是否正確：</p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div className="text-sm font-semibold text-gray-700">姓名</div>
                    </div>
                      <div className="text-lg font-bold text-gray-900">{customerName}</div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div className="text-sm font-semibold text-gray-700">電話</div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">{customerPhone}</div>
                    </div>
                    {form && form.fields.map((field) => {
                      const value = order.order_data[field.name];
                      if (value === null || value === undefined || value === '') return null;
                      
                      // 處理好事多代購類型（數組格式）
                      if (field.type === 'costco' && Array.isArray(value)) {
                        return (
                          <div key={field.name} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <div className="text-base sm:text-lg font-bold text-gray-800">{field.label}</div>
                            </div>
                            <div className="space-y-2">
                              {value.map((item: { name: string; quantity: string }, idx: number) => (
                                <div key={idx} className="text-base text-gray-900 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                  {item.name} {item.quantity ? `× ${item.quantity}` : ''}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      
                      // 計算單項總計
                      const quantity = field.type === 'number' ? (parseInt(String(value), 10) || 0) : 0;
                      const itemTotal = field.price && field.price > 0 && quantity > 0 
                        ? quantity * field.price 
                        : 0;
                      
                      return (
                          <div key={field.name} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <div className="text-base sm:text-lg font-bold text-gray-800">
                                {field.label}
                                {field.price !== undefined && field.price !== null && field.price > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 ml-2 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                    {field.price}/單位
                                  </span>
                                )}
                              </div>
                              </div>
                              <div className="text-lg font-semibold text-gray-900">
                                {String(value)}
                                {field.type === 'number' && quantity > 0 && (
                                  <span className="text-gray-500 ml-1 text-sm">單位</span>
                                )}
                              </div>
                            </div>
                            {itemTotal > 0 && (
                              <div className="text-right ml-4 p-3 bg-white rounded-lg border-2 border-green-200 shadow-sm">
                                <div className="text-xs text-gray-600 mb-1">小計</div>
                                <div className="text-xl font-extrabold text-green-600">
                                  {itemTotal.toFixed(0)} 元
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* 總計價格 */}
                    {form && form.fields.some(f => {
                      const value = order.order_data[f.name];
                      const quantity = f.type === 'number' ? (parseInt(String(value), 10) || 0) : 0;
                      return f.price && f.price > 0 && quantity > 0;
                    }) && (
                      <div className="border-t-4 border-green-400 pt-6 mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-lg">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-xl sm:text-2xl font-extrabold text-gray-800">總計價格：</div>
                          </div>
                          <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {calculateTotal().toFixed(0)} 元
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 justify-end mt-8">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="relative px-6 py-3 bg-gradient-to-r from-gray-300 via-gray-300 to-gray-400 text-gray-700 rounded-full border-2 border-gray-300/30 shadow-[0_6px_15px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.3)] hover:from-gray-400 hover:via-gray-400 hover:to-gray-500 hover:shadow-[0_10px_25px_rgba(0,0,0,0.3),0_5px_10px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] hover:-translate-y-1 active:shadow-[0_3px_8px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(0,0,0,0.15)] active:translate-y-0 transition-all duration-300 transform font-semibold"
                    >
                      <span className="drop-shadow-md">返回修改</span>
                    </button>
                    <button
                      onClick={handleConfirmSubmit}
                      disabled={submitting}
                      className="relative w-1/2 max-w-xs px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-full border-2 border-blue-500/30 shadow-[0_10px_25px_rgba(59,130,246,0.5),0_5px_10px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 hover:shadow-[0_15px_35px_rgba(59,130,246,0.6),0_8px_15px_rgba(59,130,246,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] hover:-translate-y-1 active:shadow-[0_5px_15px_rgba(59,130,246,0.4),inset_0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-0 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 disabled:border-gray-400/30 disabled:shadow-[0_2px_4px_rgba(0,0,0,0.1)] disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-300 transform font-bold flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="drop-shadow-md">送出中...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="drop-shadow-md">確認送出</span>
                        </>
                      )}
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
    </div>
  );
}
