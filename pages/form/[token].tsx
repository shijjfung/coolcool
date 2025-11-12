import { useState, useEffect, useRef, useMemo } from 'react';
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
  const [clientIp, setClientIp] = useState<string>('');
  const [deviceType, setDeviceType] = useState<string>('');
  const [orderCount, setOrderCount] = useState<number>(0);
  const [orderNumber, setOrderNumber] = useState<number | null>(null); // 當前訂單的排序號
  const [isOrderFull, setIsOrderFull] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [reservedExpiresAt, setReservedExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // 剩餘秒數
  const [source, setSource] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 用於保存每個數字輸入欄位的前一個有效值
  const previousValues = useRef<Record<string, string>>({});

  useEffect(() => {
    if (router.isReady) {
      const sourceParam = Array.isArray(router.query.source) ? router.query.source[0] : router.query.source;
      if (sourceParam && typeof sourceParam === 'string') {
        setSource(sourceParam);
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
    if (order.order_token && form?.order_limit && form.order_limit > 0) {
      checkOrderCount();
    }
  }, [order.order_token, form?.order_limit]);

  // 取得客戶端 IP
  const fetchClientInfo = async () => {
    try {
      const res = await fetch('/api/client-info');
      const data = await res.json();
      if (res.ok && data.ip) {
        setClientIp(data.ip);
      }
    } catch (error) {
      console.error('取得客戶端資訊錯誤:', error);
    }
  };

  // 檢測設備類型（精準版）
  const detectDeviceType = () => {
    const ua = navigator.userAgent;
    const uaLower = ua.toLowerCase();
    const platform = (navigator as any).platform?.toLowerCase() || '';
    const maxTouchPoints = (navigator as any).maxTouchPoints || 0;
    const isTouchDevice = 'ontouchstart' in window || maxTouchPoints > 0;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    
    let device = '其他';
    let browser = '';
    let osVersion = '';
    let deviceModel = '';

    // 檢測瀏覽器
    if (uaLower.includes('edg/')) {
      browser = 'Edge';
      const match = ua.match(/edg\/([\d.]+)/i);
      if (match) browser += ` ${match[1]}`;
    } else if (uaLower.includes('chrome/') && !uaLower.includes('edg/')) {
      browser = 'Chrome';
      const match = ua.match(/chrome\/([\d.]+)/i);
      if (match) browser += ` ${match[1]}`;
    } else if (uaLower.includes('safari/') && !uaLower.includes('chrome/')) {
      browser = 'Safari';
      const match = ua.match(/version\/([\d.]+)/i);
      if (match) browser += ` ${match[1]}`;
    } else if (uaLower.includes('firefox/')) {
      browser = 'Firefox';
      const match = ua.match(/firefox\/([\d.]+)/i);
      if (match) browser += ` ${match[1]}`;
    } else if (uaLower.includes('opera/') || uaLower.includes('opr/')) {
      browser = 'Opera';
      const match = ua.match(/(?:opera|opr)\/([\d.]+)/i);
      if (match) browser += ` ${match[1]}`;
    }

    // 1. 優先檢測 iPhone（最明確）
    if (uaLower.includes('iphone')) {
      // 嘗試提取 iPhone 型號
      const modelMatch = ua.match(/iphone\s*os\s*([\d_]+)/i);
      if (modelMatch) {
        const iosVersion = modelMatch[1].replace(/_/g, '.');
        osVersion = `iOS ${iosVersion}`;
      }
      
      // 嘗試從 User-Agent 中提取更具體的型號資訊
      if (uaLower.includes('iphone15,2') || uaLower.includes('iphone15,3')) {
        deviceModel = 'iPhone 14 Pro';
      } else if (uaLower.includes('iphone15,4') || uaLower.includes('iphone15,5')) {
        deviceModel = 'iPhone 14 Pro Max';
      } else if (uaLower.includes('iphone14,2') || uaLower.includes('iphone14,3')) {
        deviceModel = 'iPhone 13 Pro';
      } else if (uaLower.includes('iphone14,4') || uaLower.includes('iphone14,5')) {
        deviceModel = 'iPhone 13 Pro Max';
      } else if (uaLower.includes('iphone13,1') || uaLower.includes('iphone13,2')) {
        deviceModel = 'iPhone 12 mini';
      } else if (uaLower.includes('iphone13,3') || uaLower.includes('iphone13,4')) {
        deviceModel = 'iPhone 12 Pro';
      } else if (uaLower.includes('iphone12,1') || uaLower.includes('iphone12,3')) {
        deviceModel = 'iPhone 11';
      } else if (uaLower.includes('iphone12,5') || uaLower.includes('iphone12,8')) {
        deviceModel = 'iPhone 11 Pro';
      } else if (uaLower.includes('iphone11,2') || uaLower.includes('iphone11,4') || uaLower.includes('iphone11,6') || uaLower.includes('iphone11,8')) {
        deviceModel = 'iPhone XS/XS Max/XR';
      } else if (uaLower.includes('iphone10,1') || uaLower.includes('iphone10,2') || uaLower.includes('iphone10,3') || uaLower.includes('iphone10,4') || uaLower.includes('iphone10,5') || uaLower.includes('iphone10,6')) {
        deviceModel = 'iPhone 8/X';
      } else {
        deviceModel = 'iPhone';
      }
      
      device = `📱 ${deviceModel}${osVersion ? ` (${osVersion})` : ''}${browser ? ` - ${browser}` : ''}`;
    }
    // 2. 檢測 iPad（包括 iPadOS 13+）
    else if (
      uaLower.includes('ipad') ||
      (platform === 'macintel' && maxTouchPoints > 1 && isTouchDevice) ||
      (uaLower.includes('mac') && maxTouchPoints > 1 && isTouchDevice && screenWidth >= 768)
    ) {
      const modelMatch = ua.match(/os\s*([\d_]+)/i);
      if (modelMatch) {
        const iosVersion = modelMatch[1].replace(/_/g, '.');
        osVersion = `iPadOS ${iosVersion}`;
      }
      
      // 嘗試識別 iPad 型號
      if (uaLower.includes('ipad13,1') || uaLower.includes('ipad13,2')) {
        deviceModel = 'iPad Air 4';
      } else if (uaLower.includes('ipad13,16') || uaLower.includes('ipad13,17')) {
        deviceModel = 'iPad Air 5';
      } else if (uaLower.includes('ipad14,1') || uaLower.includes('ipad14,2')) {
        deviceModel = 'iPad mini 6';
      } else if (uaLower.includes('ipad11,1') || uaLower.includes('ipad11,2')) {
        deviceModel = 'iPad 10.2"';
      } else if (uaLower.includes('ipad8,1') || uaLower.includes('ipad8,2') || uaLower.includes('ipad8,3') || uaLower.includes('ipad8,4')) {
        deviceModel = 'iPad Pro 11"';
      } else if (uaLower.includes('ipad8,5') || uaLower.includes('ipad8,6') || uaLower.includes('ipad8,7') || uaLower.includes('ipad8,8')) {
        deviceModel = 'iPad Pro 12.9"';
      } else {
        deviceModel = 'iPad';
      }
      
      device = `📱 ${deviceModel}${osVersion ? ` (${osVersion})` : ''}${browser ? ` - ${browser}` : ''}`;
    }
    // 3. 檢測 Android 設備
    else if (uaLower.includes('android')) {
      // 提取 Android 版本
      const androidMatch = ua.match(/android\s*([\d.]+)/i);
      if (androidMatch) {
        osVersion = `Android ${androidMatch[1]}`;
      }
      
      // 檢測品牌和型號
      let brand = '';
      let model = '';
      
      // Samsung
      if (uaLower.includes('samsung') || uaLower.includes('sm-')) {
        brand = 'Samsung';
        const smMatch = ua.match(/sm-([a-z0-9]+)/i);
        if (smMatch) {
          model = smMatch[1].toUpperCase();
        } else if (uaLower.includes('galaxy s')) {
          model = 'Galaxy S';
          const sMatch = ua.match(/galaxy\s*s(\d+)/i);
          if (sMatch) model += sMatch[1];
        } else if (uaLower.includes('galaxy note')) {
          model = 'Galaxy Note';
          const noteMatch = ua.match(/galaxy\s*note\s*(\d+)/i);
          if (noteMatch) model += noteMatch[1];
        } else if (uaLower.includes('galaxy a')) {
          model = 'Galaxy A';
          const aMatch = ua.match(/galaxy\s*a(\d+)/i);
          if (aMatch) model += aMatch[1];
        }
      }
      // Xiaomi
      else if (uaLower.includes('xiaomi') || uaLower.includes('redmi') || uaLower.includes('mi\s')) {
        brand = 'Xiaomi';
        if (uaLower.includes('redmi')) {
          model = 'Redmi';
          const redmiMatch = ua.match(/redmi\s*(\w+)/i);
          if (redmiMatch) model += ` ${redmiMatch[1]}`;
        } else if (uaLower.includes('mi\s')) {
          model = 'Mi';
          const miMatch = ua.match(/mi\s*(\d+)/i);
          if (miMatch) model += miMatch[1];
        }
      }
      // Huawei
      else if (uaLower.includes('huawei') || uaLower.includes('honor')) {
        brand = uaLower.includes('honor') ? 'Honor' : 'Huawei';
        const huaweiMatch = ua.match(/(?:huawei|honor)\s*([a-z0-9\s]+)/i);
        if (huaweiMatch) model = huaweiMatch[1];
      }
      // OPPO
      else if (uaLower.includes('oppo')) {
        brand = 'OPPO';
        const oppoMatch = ua.match(/oppo\s*([a-z0-9\s]+)/i);
        if (oppoMatch) model = oppoMatch[1];
      }
      // vivo
      else if (uaLower.includes('vivo')) {
        brand = 'vivo';
        const vivoMatch = ua.match(/vivo\s*([a-z0-9\s]+)/i);
        if (vivoMatch) model = vivoMatch[1];
      }
      // OnePlus
      else if (uaLower.includes('oneplus')) {
        brand = 'OnePlus';
        const oneplusMatch = ua.match(/oneplus\s*([a-z0-9\s]+)/i);
        if (oneplusMatch) model = oneplusMatch[1];
      }
      // Google Pixel
      else if (uaLower.includes('pixel')) {
        brand = 'Google';
        model = 'Pixel';
        const pixelMatch = ua.match(/pixel\s*(\d+)/i);
        if (pixelMatch) model += ` ${pixelMatch[1]}`;
      }
      // 其他 Android 品牌
      else {
        const brandMatch = ua.match(/android.*?;\s*([a-z]+)\s*/i);
        if (brandMatch) {
          brand = brandMatch[1].charAt(0).toUpperCase() + brandMatch[1].slice(1);
        }
      }
      
      // 判斷是手機還是平板
      const isTablet = !uaLower.includes('mobile') && (screenWidth >= 600 || uaLower.includes('tablet'));
      
      if (isTablet) {
        device = `📱 ${brand || 'Android'} 平板${model ? ` ${model}` : ''}${osVersion ? ` (${osVersion})` : ''}${browser ? ` - ${browser}` : ''}`;
      } else {
        device = `📱 ${brand || 'Android'} 手機${model ? ` ${model}` : ''}${osVersion ? ` (${osVersion})` : ''}${browser ? ` - ${browser}` : ''}`;
      }
    }
    // 4. 檢測 Windows 設備
    else if (uaLower.includes('windows')) {
      // 檢測 Windows 版本
      if (uaLower.includes('windows nt 10.0')) {
        osVersion = 'Windows 10/11';
      } else if (uaLower.includes('windows nt 6.3')) {
        osVersion = 'Windows 8.1';
      } else if (uaLower.includes('windows nt 6.2')) {
        osVersion = 'Windows 8';
      } else if (uaLower.includes('windows nt 6.1')) {
        osVersion = 'Windows 7';
      } else if (uaLower.includes('windows nt 6.0')) {
        osVersion = 'Windows Vista';
      } else if (uaLower.includes('windows nt 5.1')) {
        osVersion = 'Windows XP';
      } else {
        osVersion = 'Windows';
      }
      
      if (uaLower.includes('phone') || (isTouchDevice && screenWidth < 1024)) {
        device = `📱 Windows Phone${browser ? ` - ${browser}` : ''}`;
      } else if (uaLower.includes('tablet') || (isTouchDevice && screenWidth < 1366 && screenWidth >= 768)) {
        device = `📱 Windows 平板 (${osVersion})${browser ? ` - ${browser}` : ''}`;
      } else {
        device = `💻 Windows PC (${osVersion})${browser ? ` - ${browser}` : ''}`;
      }
    }
    // 5. 檢測 macOS（排除 iPad）
    else if (uaLower.includes('mac os x') || uaLower.includes('macintosh')) {
      // 再次確認不是 iPad（iPadOS 13+ 會偽裝成 Mac）
      if (maxTouchPoints > 1 && isTouchDevice && screenWidth >= 768) {
        device = `📱 iPad (偽裝為 Mac)${browser ? ` - ${browser}` : ''}`;
      } else {
        // 提取 macOS 版本
        const macMatch = ua.match(/mac\s*os\s*x\s*([\d_]+)/i);
        if (macMatch) {
          const version = macMatch[1].replace(/_/g, '.');
          osVersion = `macOS ${version}`;
        }
        
        // 嘗試檢測 Mac 型號
        if (uaLower.includes('intel')) {
          deviceModel = 'Mac (Intel)';
        } else if (uaLower.includes('arm') || uaLower.includes('apple silicon')) {
          deviceModel = 'Mac (Apple Silicon)';
        } else {
          deviceModel = 'Mac';
        }
        
        device = `💻 ${deviceModel}${osVersion ? ` (${osVersion})` : ''}${browser ? ` - ${browser}` : ''}`;
      }
    }
    // 6. 檢測 Linux
    else if (uaLower.includes('linux') && !uaLower.includes('android')) {
      if (uaLower.includes('ubuntu')) {
        osVersion = 'Ubuntu';
      } else if (uaLower.includes('fedora')) {
        osVersion = 'Fedora';
      } else if (uaLower.includes('debian')) {
        osVersion = 'Debian';
      } else if (uaLower.includes('arch')) {
        osVersion = 'Arch Linux';
      } else {
        osVersion = 'Linux';
      }
      device = `💻 ${osVersion}${browser ? ` - ${browser}` : ''}`;
    }
    // 7. 檢測其他移動設備
    else if (uaLower.includes('mobile') || (isTouchDevice && screenWidth < 768)) {
      device = `📱 手機${browser ? ` - ${browser}` : ''}`;
    }
    // 8. 默認為電腦
    else {
      device = `💻 電腦${browser ? ` - ${browser}` : ''}`;
    }

    setDeviceType(device);
  };

  const fetchForm = async (sid?: string) => {
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
        
        // 如果有訂單限制，先保留排序
        if (data.order_limit && data.order_limit > 0 && (sid || sessionId)) {
          const currentSessionId = sid || sessionId;
          if (currentSessionId) {
            await reserveOrderNumberWithSession(currentSessionId);
          }
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

  // 使用指定的 sessionId 保留排序
  const reserveOrderNumberWithSession = async (sid: string) => {
    if (!token) return;
    
    try {
      const res = await fetch('/api/orders/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formToken: token,
          sessionId: sid,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setOrderNumber(data.orderNumber);
        setReservedExpiresAt(new Date(data.expiresAt));
        // 開始倒計時
        startCountdown(new Date(data.expiresAt));
        // 檢查訂單數量
        await checkOrderCount();
      } else if (data.error && data.error.includes('已達')) {
        setIsOrderFull(true);
      }
    } catch (error) {
      console.error('保留訂單排序錯誤:', error);
    }
  };

  // 保留訂單排序（使用當前的 sessionId）
  const reserveOrderNumber = async () => {
    if (!sessionId || !token) return;
    await reserveOrderNumberWithSession(sessionId);
  };

  // 開始倒計時
  const startCountdown = (expiresAt: Date) => {
    const updateCountdown = () => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        // 時間到，重新檢查並嘗試保留
        if (form && form.order_limit && form.order_limit > 0 && sessionId) {
          reserveOrderNumberWithSession(sessionId);
        }
      } else {
        setTimeout(updateCountdown, 1000);
      }
    };
    updateCountdown();
  };

  // 檢查訂單數量和排序
  const checkOrderCount = async () => {
    try {
      const res = await fetch(`/api/orders/count?formToken=${token}`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setOrderCount(data.currentCount);
        setIsOrderFull(data.isFull);
        
        // 如果當前訂單已送出，找到對應的排序號
        if (order.order_token) {
          const currentOrder = data.orders.find((o: any) => o.order_token === order.order_token);
          if (currentOrder) {
            setOrderNumber(currentOrder.order_number);
          }
        }
      }
    } catch (error) {
      console.error('檢查訂單數量錯誤:', error);
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

  // 計算單項總計（數量 × 價格）
  const calculateItemTotal = (field: FormField): number => {
    if (!field.price || field.price <= 0) return 0;
    const quantity = parseInt(String(order.order_data[field.name] || 0), 10) || 0;
    return quantity * field.price;
  };

  // 計算總計價格
  const calculateTotal = (): number => {
    if (!form) return 0;
    return form.fields.reduce((total, field) => {
      return total + calculateItemTotal(field);
    }, 0);
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
              if (field.required) {
                alert(`「${field.label}」不能為空`);
                return false;
              }
            }
          } else if (field.type === 'costco') {
            // 支持數組格式（物品名稱和數量）
            if (Array.isArray(value)) {
              if (value.length === 0) {
                if (field.required) {
                  alert(`「${field.label}」至少需要一個項目`);
                  return false;
                }
              } else {
                // 檢查每個項目是否有物品名稱
                const hasEmptyName = value.some((item: any) => !item.name || !item.name.trim());
                if (hasEmptyName) {
                  alert(`「${field.label}」的項目名稱不能為空`);
                  return false;
                }
              }
            } else {
              if (field.required) {
                alert(`「${field.label}」至少需要一個項目`);
                return false;
              }
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
            source,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          // 跳轉到訂單確認頁面
          const successUrl = source ? `/order/success/${data.orderToken}?source=${encodeURIComponent(source)}` : `/order/success/${data.orderToken}`;
          router.push(successUrl);
        } else {
          // 檢查是否是因為額滿而失敗
          if (data.error && data.error.includes('額滿')) {
            setIsOrderFull(true);
            // 重新檢查訂單數量
            if (form?.order_limit && form.order_limit > 0) {
              await checkOrderCount();
            }
          }
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

  const showToast = (message: string) => {
    if (!message) return;
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3000);
  };

  const namePlaceholder = useMemo(() => {
    if (source === 'facebook') {
      return '請正確輸入您 Facebook 的名稱或暱稱，避免無法通知你取貨';
    }
    if (source === 'line') {
      return '請正確輸入您 LINE 的名稱或暱稱，避免無法通知你取貨';
    }
    return '請正確輸入您的姓名，避免無法通知你取貨';
  }, [source]);

  const phonePlaceholder = '請正確輸入您的聯繫方式避免無法通知您取貨';

  const handleNameFocus = () => {
    if (source === 'facebook') {
      showToast('請正確輸入臉書名稱（暱稱），避免取貨通知發送不到。');
    } else if (source === 'line') {
      showToast('請正確輸入 LINE 群組內名稱（暱稱），避免取貨通知發送不到。');
    }
  };

  const handlePhoneFocus = () => {
    showToast('請正確輸入您的聯繫方式避免無法通知您取貨');
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

  // 檢查訂單是否已額滿
  if (isOrderFull && form && form.order_limit && form.order_limit > 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">本訂單已達{form.order_limit}單</h1>
          <p className="text-gray-600 mb-2">
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <Head>
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

          <div className="mb-4 sm:mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">涼涼冰品團購</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-2">吼哩涼涼ㄟ妹!</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-4 mb-2">
              [{form.name}]
            </p>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            結單及停止下單時間：{new Date(form.deadline).toLocaleString('zh-TW', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}
            {form.order_limit && form.order_limit > 0 && (
              <>
                <br />
                <span className="text-xs text-gray-500">
                  訂單限額：{form.order_limit} 單
                  {orderCount > 0 && (
                    <span className="ml-2">
                      （目前已達 {orderCount} 單）
                    </span>
                  )}
                </span>
                {orderNumber && !order.order_token && (
                  <>
                    <br />
                    <div className="flex items-center justify-between gap-2 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <span className="text-sm text-blue-700 font-semibold">
                        你搶到第 {orderNumber} 張單，請於5分鐘內送出表單
                      </span>
                      {timeRemaining > 0 && (
                        <span className="text-sm text-orange-600 font-bold whitespace-nowrap">
                          剩餘 {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
            {form.pickup_time && (
              <>
                <br />
                <span className="text-xs text-green-600 font-semibold">
                  📦 取貨時間：{form.pickup_time}
                </span>
              </>
            )}
            <br />
            <span className="text-xs text-gray-500">在結單時間之前，您可以填寫和修改訂單</span>
          </p>

          {/* 客戶端資訊顯示 */}
          {(deviceType || clientIp || order.order_token || orderNumber) && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  {orderNumber && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600">訂單排序：</span>
                      <span className="font-bold text-blue-600">第 {orderNumber} 張</span>
                    </div>
                  )}
                  {order.order_token && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600">訂單編號：</span>
                      <span className="font-mono font-medium text-gray-800">{order.order_token}</span>
                    </div>
                  )}
                  {deviceType && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600">您的設備類型：</span>
                      <span className="font-medium text-gray-800">{deviceType}</span>
                    </div>
                  )}
                  {clientIp && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600">您的IP地址：</span>
                      <span className="font-mono font-medium text-gray-800">{clientIp}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isEditMode && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                您正在編輯訂單（訂單代碼：{order.order_token}）
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 試算表風格的表單 */}
            <div className="mb-6 overflow-x-auto -mx-2 sm:mx-0">
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b border-gray-200">
                        欄位
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b border-gray-200">
                        內容
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* 姓名欄位 */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 bg-gray-50">
                        姓名
                        <span className="text-red-500 text-xs ml-1">*</span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          onFocus={handleNameFocus}
                          className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                          placeholder={namePlaceholder}
                          required
                        />
                      </td>
                    </tr>
                    
                    {/* 電話欄位 */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 bg-gray-50">
                        電話
                        <span className="text-red-500 text-xs ml-1">*</span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          onFocus={handlePhoneFocus}
                          className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                          placeholder={phonePlaceholder}
                          required
                        />
                      </td>
                    </tr>

                    {/* 動態欄位 */}
                    {form.fields.map((field) => (
                      <tr key={field.name} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 bg-gray-50">
                          {field.label}
                          {field.price !== undefined && field.price !== null && (
                            <span className="text-blue-600 font-semibold ml-1 text-xs sm:text-sm">
                              ({field.price}元)
                            </span>
                          )}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          {field.type === 'costco' && (() => {
                            // 將數據轉換為數組格式（如果還沒有）
                            const items = Array.isArray(order.order_data[field.name])
                              ? order.order_data[field.name]
                              : order.order_data[field.name]
                                ? [{ name: String(order.order_data[field.name]), quantity: '' }]
                                : [{ name: '', quantity: '' }];

                            const updateItems = (newItems: Array<{ name: string; quantity: string }>) => {
                              handleFieldChange(field.name, newItems);
                            };

                            const addItem = () => {
                              updateItems([...items, { name: '', quantity: '' }]);
                            };

                            const removeItem = (index: number) => {
                              if (items.length > 1) {
                                updateItems(items.filter((_: any, i: number) => i !== index));
                              }
                            };

                            const updateItem = (index: number, field: 'name' | 'quantity', value: string) => {
                              const newItems = [...items];
                              newItems[index] = { ...newItems[index], [field]: value };
                              updateItems(newItems);
                            };

                            return (
                              <div className="space-y-3">
                                {items.map((item: any, index: number) => (
                                  <div key={index} className="flex gap-2 items-start">
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                      <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                                        className="px-2 sm:px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                                        placeholder="物品名稱"
                                        required={field.required && index === 0}
                                      />
                                      <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          // 只接受整數
                                          if (value === '' || (parseInt(value, 10) > 0 && !value.includes('.'))) {
                                            updateItem(index, 'quantity', value);
                                          } else if (value.includes('.')) {
                                            alert('數量只能輸入整數');
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === '.' || e.key === ',') {
                                            e.preventDefault();
                                            alert('數量只能輸入整數');
                                          }
                                        }}
                                        className="px-2 sm:px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                                        placeholder="數量"
                                        min="0"
                                        step="1"
                                        required={field.required && index === 0}
                                      />
                                    </div>
                                    {items.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors text-sm font-medium"
                                        title="刪除此項目"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={addItem}
                                  className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                                >
                                  + 新增項目
                                </button>
                              </div>
                            );
                          })()}
                          {field.type === 'number' && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={order.order_data[field.name] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const fieldName = field.name;
                                  
                                  // 允許空值
                                  if (value === '') {
                                    previousValues.current[fieldName] = '';
                                    handleFieldChange(fieldName, '');
                                    return;
                                  }
                                  
                                  // 檢查是否包含小數點或逗號
                                  if (value.includes('.') || value.includes(',')) {
                                    alert('只能輸入整數，請勿輸入小數點');
                                    // 恢復到前一個有效值
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
                                  
                                  // 檢查是否為有效的整數
                                  const intValue = parseInt(value, 10);
                                  if (!isNaN(intValue) && intValue >= 0) {
                                    // 保存當前有效值
                                    previousValues.current[fieldName] = String(intValue);
                                    handleFieldChange(fieldName, intValue);
                                  } else if (value === '-') {
                                    // 允許輸入負號（但最終會被拒絕，因為 min="0"）
                                    previousValues.current[fieldName] = '';
                                    handleFieldChange(fieldName, '');
                                  } else {
                                    // 如果不是有效數字，拒絕輸入並恢復
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
                                }}
                                onKeyDown={(e) => {
                                  // 阻止輸入小數點
                                  if (e.key === '.' || e.key === ',') {
                                    e.preventDefault();
                                    alert('只能輸入整數，請勿輸入小數點');
                                  }
                                }}
                                className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                                required={field.required}
                                min="0"
                                step="1"
                                placeholder="0"
                              />
                              {field.price !== undefined && field.price !== null && field.price > 0 && (
                                <div className="text-xs sm:text-sm text-gray-600 min-w-[60px] sm:min-w-[80px] text-right">
                                  {(() => {
                                    const quantity = parseInt(String(order.order_data[field.name] || 0), 10) || 0;
                                    const itemTotal = quantity * field.price;
                                    return itemTotal > 0 ? (
                                      <span className="text-green-600 font-semibold">
                                        = {itemTotal.toFixed(0)}元
                                      </span>
                                    ) : null;
                                  })()}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* 總計價格行 */}
                    {form.fields.some(f => f.price !== undefined && f.price !== null && f.price > 0) && (
                      <tr className="bg-green-50 border-t-2 border-green-200">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-gray-800 bg-green-50" colSpan={2}>
                          <div className="flex justify-between items-center">
                            <span>總計價格：</span>
                            <span className="text-green-600 text-base sm:text-lg font-bold">
                              {calculateTotal().toFixed(0)} 元
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
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
                      
                      // 處理好事多代購類型（數組格式）
                      if (field.type === 'costco' && Array.isArray(value)) {
                        return (
                          <div key={field.name} className="border-b border-gray-200 pb-3">
                            <div className="text-sm font-medium text-gray-700 mb-2">{field.label}</div>
                            <div className="space-y-2">
                              {value.map((item: any, idx: number) => (
                                <div key={idx} className="text-base text-gray-900 bg-gray-50 p-2 rounded">
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
                        <div key={field.name} className="border-b border-gray-200 pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-700 mb-1">
                                {field.label}
                                {field.price !== undefined && field.price !== null && field.price > 0 && (
                                  <span className="text-blue-600 font-semibold ml-1">
                                    ({field.price}元/單位)
                                  </span>
                                )}
                              </div>
                              <div className="text-base text-gray-900">
                                {String(value)}
                                {field.type === 'number' && quantity > 0 && (
                                  <span className="text-gray-500 ml-1">單位</span>
                                )}
                              </div>
                            </div>
                            {itemTotal > 0 && (
                              <div className="text-right ml-4">
                                <div className="text-sm text-gray-600">小計</div>
                                <div className="text-lg font-bold text-green-600">
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
                      <div className="border-t-2 border-green-200 pt-4 mt-4 bg-green-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-bold text-gray-800">總計價格：</div>
                          <div className="text-2xl font-bold text-green-600">
                            {calculateTotal().toFixed(0)} 元
                          </div>
                        </div>
                      </div>
                    )}
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

