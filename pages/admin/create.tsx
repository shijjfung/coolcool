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
  const [authChecked, setAuthChecked] = useState(false);

  // 驗證管理員身份
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStatus = sessionStorage.getItem('admin_authenticated');
      if (authStatus !== 'true') {
        router.push('/');
        return;
      }
      setAuthChecked(true);
    }
  }, [router]);
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
  const [facebookCommentUrl, setFacebookCommentUrl] = useState('');
  const [lineCommentUrl, setLineCommentUrl] = useState('');
  const [formToken, setFormToken] = useState('');
  // Facebook 自動監控設定
  const [facebookPostUrl, setFacebookPostUrl] = useState('');
  const [facebookPostAuthor, setFacebookPostAuthor] = useState('');
  const [facebookTargetUrl, setFacebookTargetUrl] = useState('');
  const [facebookPostTemplate, setFacebookPostTemplate] = useState('');
  const [facebookVendorContent, setFacebookVendorContent] = useState('');
  const [facebookPostImagesInput, setFacebookPostImagesInput] = useState('');
  const [facebookKeywords, setFacebookKeywords] = useState<string[]>(['+1', '+2', '+3', '加一', '加1']);
  const [facebookAutoMonitor, setFacebookAutoMonitor] = useState(false);
  const [facebookReplyMessage, setFacebookReplyMessage] = useState('已登記');
  const [facebookScanInterval, setFacebookScanInterval] = useState<number>(3); // 掃描間隔（分鐘）
  const [facebookAutoDeadlineScan, setFacebookAutoDeadlineScan] = useState(false);
  const [facebookManualStrictDeadline, setFacebookManualStrictDeadline] = useState(true);
  const [facebookAllowOverdue, setFacebookAllowOverdue] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  // LINE 自動監控設定
  const [lineAutoMonitor, setLineAutoMonitor] = useState(false);
  const [linePostAuthor, setLinePostAuthor] = useState('');
  const [lineKeywords, setLineKeywords] = useState<string[]>(['+1', '+2', '+3', '加一', '加1']);
  const [newLineKeyword, setNewLineKeyword] = useState('');
  const [useCustomLineIdentifier, setUseCustomLineIdentifier] = useState(false);
  const [lineCustomIdentifier, setLineCustomIdentifier] = useState('');
  // 表單頁面會自動顯示「姓名」和「電話」欄位，所以這裡不需要預設欄位
  const [fields, setFields] = useState<FormField[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  // 批量商品自動帶入
  const [bulkInputText, setBulkInputText] = useState('');
  const [useBulkInput, setUseBulkInput] = useState(false);

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
        setFormToken(form.form_token || '');
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
        setFacebookCommentUrl(form.facebook_comment_url || '');
        setLineCommentUrl(form.line_comment_url || '');
        // Facebook 自動監控設定
        setFacebookPostUrl(form.facebook_post_url || '');
        setFacebookPostAuthor(form.facebook_post_author || '');
        setFacebookTargetUrl(form.facebook_target_url || '');
        setFacebookPostTemplate(form.facebook_post_template || '');
        setFacebookVendorContent(form.facebook_vendor_content || '');
        setFacebookPostImagesInput(form.facebook_post_images || '');
        setFacebookKeywords(form.facebook_keywords ? JSON.parse(form.facebook_keywords) : ['+1', '+2', '+3', '加一', '加1']);
        setFacebookAutoMonitor(form.facebook_auto_monitor === 1);
        setFacebookReplyMessage(form.facebook_reply_message || '已登記');
        setFacebookScanInterval(form.facebook_scan_interval || 3);
        setFacebookAutoDeadlineScan(form.facebook_auto_deadline_scan === 1);
        setFacebookManualStrictDeadline(
          form.facebook_manual_strict_deadline === undefined
            ? true
            : form.facebook_manual_strict_deadline === 1
        );
        setFacebookAllowOverdue(form.facebook_allow_overdue === 1);
        // LINE 自動監控設定
        // 如果有設定 LINE 發文者姓名，則認為已啟用 LINE 自動監控
        setLineAutoMonitor(!!form.line_post_author);
        setLinePostAuthor(form.line_post_author || '');
        setLineKeywords(['+1', '+2', '+3', '加一', '加1']); // LINE 關鍵字暫時使用預設值
        setUseCustomLineIdentifier(!!form.line_use_custom_identifier);
        setLineCustomIdentifier(form.line_custom_identifier || '');
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

  /**
   * 解析批量輸入的商品文字，提取商品名稱和價格
   * 支援格式：
   * - 青花椒粉$150👑 → 名稱：青花椒粉，價格：150
   * - 紅花椒粉（大紅袍）$150 → 名稱：紅花椒粉（大紅袍），價格：150
   * - 五香粉X2$300 → 名稱：五香粉X2，價格：300
   * - 五香粉*2 300 → 名稱：五香粉*2，價格：300
   * - 十三香粉$150 → 名稱：十三香粉，價格：150
   * - 香蒜粉$100 → 名稱：香蒜粉，價格：100
   */
  const parseBulkInput = (text: string): Array<{ name: string; price: number | undefined }> => {
    // 使用代理對範圍移除常見 emoji，避免依賴 ES6 /u flag
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    const sanitizedText = text.replace(emojiRegex, '');
    const normalizedText = sanitizedText
      .replace(/(\$[0-9]{2,})(?=\s*\S)/g, '$1\n')
      .replace(/(\d{2,})(?=\s*[A-Z])/g, '$1\n');
    const lines = normalizedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const results: Array<{ name: string; price: number | undefined }> = [];

    for (const line of lines) {
      // 移除 emoji 和特殊符號（保留中文、英文、數字、括號、空格、X、*）
      let cleanedLine = line.replace(emojiRegex, '').trim();
      
      let productName = cleanedLine;
      let price: number | undefined = undefined;

      // 策略1: 匹配 $價格 格式（最常見）
      // 例如：青花椒粉$150、五香粉X2$300
      const dollarMatch = cleanedLine.match(/\$(\d+)/);
      if (dollarMatch) {
        price = parseInt(dollarMatch[1], 10);
        // 移除 $價格 及之後的所有內容（包括可能的特殊符號）
        productName = cleanedLine.replace(/\$(\d+).*$/, '').trim();
      } else {
        // 策略2: 匹配 X數量$價格 或 *數量$價格 格式
        // 例如：五香粉X2$300
        const quantityDollarMatch = cleanedLine.match(/([Xx*]\d+)\$(\d+)/);
        if (quantityDollarMatch) {
          price = parseInt(quantityDollarMatch[2], 10);
          // 保留 X數量 或 *數量 在名稱中，只移除 $價格 部分
          productName = cleanedLine.replace(/\$(\d+).*$/, '').trim();
        } else {
          // 策略3: 匹配 X數量 價格 或 *數量 價格 格式（價格在空格後，2位數以上）
          // 例如：五香粉*2 300
          const quantitySpaceMatch = cleanedLine.match(/([Xx*]\d+)\s+(\d{2,})/);
          if (quantitySpaceMatch) {
            price = parseInt(quantitySpaceMatch[2], 10);
            // 保留 X數量 或 *數量 在名稱中，只移除空格後的價格
            productName = cleanedLine.replace(/\s+(\d{2,}).*$/, '').trim();
          } else {
            // 策略4: 匹配 商品名 價格 格式（價格是2位數以上，在空格後）
            // 例如：十三香粉 150
            // 注意：要避免誤判，價格必須是2位數以上（10、25、100等）
            const spacePriceMatch = cleanedLine.match(/^(.+?)\s+(\d{2,})$/);
            if (spacePriceMatch) {
              const potentialPrice = parseInt(spacePriceMatch[2], 10);
              // 確認是價格（2位數以上，通常是10、25、50、100等）
              // 數量通常只有1個，所以單個數字不會是價格
              if (potentialPrice >= 10) {
                price = potentialPrice;
                productName = spacePriceMatch[1].trim();
              }
            }
          }
        }
      }

      // 清理商品名稱：移除多餘空格，保留括號、X、*等
      productName = productName.replace(/\s+/g, ' ').trim();

      // 如果商品名稱不為空，添加到結果
      if (productName.length > 0) {
        results.push({ name: productName, price });
      }
    }

    return results;
  };

  const addFieldsFromText = (sourceText: string, sourceLabel: string): number => {
    if (!sourceText.trim()) {
      alert(`請先輸入${sourceLabel}`);
      return 0;
    }

    const parsedItems = parseBulkInput(sourceText);

    if (parsedItems.length === 0) {
      alert('無法解析商品列表，請檢查格式是否正確');
      return 0;
    }

    const cleanedItems = parsedItems
      .map((item) => ({
        name: (item.name || '').trim(),
        price: item.price,
      }))
      .filter((item) => item.name.length > 0);

    if (cleanedItems.length === 0) {
      alert('無法解析有效的商品名稱，請檢查輸入內容');
      return 0;
    }

    const uniqueItems = cleanedItems.filter(
      (item, index, array) => array.findIndex((other) => other.name === item.name) === index
    );

    if (uniqueItems.length === 0) {
      alert('未找到可新增的商品欄位');
      return 0;
    }

    const newFields: FormField[] = uniqueItems.map((item, index) => ({
      name: `field_${fields.length + index + 1}`,
      label: item.name,
      type: 'number' as const,
      required: false,
      price: item.price,
    }));

    setFields([...fields, ...newFields]);
    return newFields.length;
  };

  /**
   * 批量創建欄位
   */
  const createFieldsFromBulkInput = () => {
    const count = addFieldsFromText(bulkInputText, '商品列表');
    if (!count) return;
    setBulkInputText('');
    setUseBulkInput(false);
    alert(`已成功創建 ${count} 個欄位！`);
  };

  const handleGenerateFieldsFromVendorContent = () => {
    const count = addFieldsFromText(facebookVendorContent, '貼文內容');
    if (count) {
      alert(`已成功從貼文內容建立 ${count} 個商品欄位`);
    }
  };

  const handleInsertTemplateToken = (token: string) => {
    setFacebookPostTemplate((prev) => {
      if (!prev) return token;
      const needsSpace = !/\s$/.test(prev);
      return `${prev}${needsSpace ? ' ' : ''}${token}`;
    });
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

        if (useCustomLineIdentifier) {
          if (!lineCustomIdentifier.trim()) {
            alert('請輸入 LINE 賣文識別碼（例如：#679）');
            setSaving(false);
            return;
          }
          if (lineCustomIdentifier.trim().length > 50) {
            alert('LINE 賣文識別碼長度請勿超過 50 個字元');
            setSaving(false);
            return;
          }
        }

        // 驗證 Facebook 發文/監控設定
        if (facebookAutoMonitor) {
          if (!facebookTargetUrl.trim()) {
            alert('請輸入 Facebook 社團或粉專貼文目標連結');
            setSaving(false);
            return;
          }
          if (!facebookPostTemplate.trim()) {
            alert('請輸入 Facebook 貼文內容');
            setSaving(false);
            return;
          }
        }

        // 驗證 LINE 自動監控設定
        if (lineAutoMonitor) {
          if (!linePostAuthor.trim()) {
            alert('請輸入 LINE 發文者姓名');
            setSaving(false);
            return;
          }
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
            facebookCommentUrl: facebookCommentUrl.trim() || undefined,
            lineCommentUrl: lineCommentUrl.trim() || undefined,
            facebookPostUrl: facebookAutoMonitor ? (facebookPostUrl.trim() || undefined) : undefined,
            facebookPostAuthor: facebookAutoMonitor ? (facebookPostAuthor.trim() || undefined) : undefined,
            facebookTargetUrl: facebookAutoMonitor ? (facebookTargetUrl.trim() || undefined) : undefined,
            facebookPostTemplate: facebookAutoMonitor ? facebookPostTemplate.trim() : undefined,
            facebookVendorContent: facebookAutoMonitor ? facebookVendorContent.trim() : undefined,
            facebookPostImages: facebookAutoMonitor ? (facebookPostImagesInput.trim() || undefined) : undefined,
            facebookKeywords: facebookAutoMonitor ? JSON.stringify(facebookKeywords) : undefined,
            facebookAutoMonitor: facebookAutoMonitor ? 1 : 0,
            facebookReplyMessage: facebookAutoMonitor ? (facebookReplyMessage.trim() || undefined) : undefined,
            facebookScanInterval: facebookAutoMonitor ? (facebookScanInterval || 3) : undefined,
            facebookAutoDeadlineScan: facebookAutoDeadlineScan,
            facebookManualStrictDeadline: facebookManualStrictDeadline,
            facebookAllowOverdue: facebookAllowOverdue,
            linePostAuthor: lineAutoMonitor ? (linePostAuthor.trim() || undefined) : undefined,
            lineCustomIdentifier: lineAutoMonitor && useCustomLineIdentifier ? lineCustomIdentifier.trim() : undefined,
            useCustomLineIdentifier: lineAutoMonitor && useCustomLineIdentifier,
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
            facebookCommentUrl: facebookCommentUrl.trim() || undefined,
            lineCommentUrl: lineCommentUrl.trim() || undefined,
            facebookPostUrl: facebookAutoMonitor ? (facebookPostUrl.trim() || undefined) : undefined,
            facebookPostAuthor: facebookAutoMonitor ? (facebookPostAuthor.trim() || undefined) : undefined,
            facebookTargetUrl: facebookAutoMonitor ? (facebookTargetUrl.trim() || undefined) : undefined,
            facebookPostTemplate: facebookAutoMonitor ? facebookPostTemplate.trim() : undefined,
            facebookVendorContent: facebookAutoMonitor ? facebookVendorContent.trim() : undefined,
            facebookPostImages: facebookAutoMonitor ? (facebookPostImagesInput.trim() || undefined) : undefined,
            facebookKeywords: facebookAutoMonitor ? JSON.stringify(facebookKeywords) : undefined,
            facebookAutoMonitor: facebookAutoMonitor ? 1 : 0,
            facebookReplyMessage: facebookAutoMonitor ? (facebookReplyMessage.trim() || undefined) : undefined,
            facebookAutoDeadlineScan: facebookAutoDeadlineScan,
            facebookManualStrictDeadline: facebookManualStrictDeadline,
            facebookAllowOverdue: facebookAllowOverdue,
            linePostAuthor: lineAutoMonitor ? (linePostAuthor.trim() || undefined) : undefined,
            lineCustomIdentifier: lineAutoMonitor && useCustomLineIdentifier ? lineCustomIdentifier.trim() : undefined,
            useCustomLineIdentifier: lineAutoMonitor && useCustomLineIdentifier,
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

  // 如果尚未驗證，顯示載入中
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">驗證中...</div>
      </div>
    );
  }

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
            <label className="block text-base font-bold text-gray-700 mb-2">
              社群留言連結（選填）
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook 貼文連結
                </label>
                <input
                  type="url"
                  value={facebookCommentUrl}
                  onChange={(e) => setFacebookCommentUrl(e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="貼上本次團購的 Facebook 貼文網址"
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 客戶下單完成後會看到「臉書留言 +1」按鈕，導向這個貼文。
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LINE 群組連結
                </label>
                <input
                  type="url"
                  value={lineCommentUrl}
                  onChange={(e) => setLineCommentUrl(e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="貼上 LINE 群組或官方帳號連結"
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 客戶下單完成後會看到「LINE 留言 +1」按鈕，導向這個群組。
                </p>
              </div>
            </div>
          </div>

          {/* Facebook 自動監控設定 */}
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="facebookAutoMonitor"
                checked={facebookAutoMonitor}
                onChange={(e) => setFacebookAutoMonitor(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="facebookAutoMonitor" className="text-base font-bold text-gray-700 cursor-pointer">
                🤖 Facebook 自動監控留言
              </label>
            </div>
            {facebookAutoMonitor && (
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      社團/粉專目標連結 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={facebookTargetUrl}
                      onChange={(e) => setFacebookTargetUrl(e.target.value)}
                      className="w-full px-3 py-2.5 text-base border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                      placeholder="https://www.facebook.com/groups/xxx"
                      autoComplete="off"
                      required={facebookAutoMonitor}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ✅ 發布與抓文都會前往這個連結（建議填社團網址或預計貼文位置）。
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      已發布貼文連結
                    </label>
                    <input
                      type="url"
                      value={facebookPostUrl}
                      onChange={(e) => setFacebookPostUrl(e.target.value)}
                      className="w-full px-3 py-2.5 text-base border border-gray-200 rounded bg-gray-50 focus:ring-2 focus:ring-purple-500"
                      placeholder="按「發布貼文」後會自動回填，也可手動貼上"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 如果你已經手動貼文，也可以把實際貼文連結貼回來，之後直接抓留言。
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    廠商原始文章 / 價格清單
                  </label>
                  <textarea
                    value={facebookVendorContent}
                    onChange={(e) => setFacebookVendorContent(e.target.value)}
                    className="w-full px-3 py-3 text-base border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    rows={6}
                    placeholder="貼上廠商提供的完整文章、價格、規格..."
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleGenerateFieldsFromVendorContent}
                      className="px-4 py-2 text-sm font-semibold rounded bg-purple-600 text-white hover:bg-purple-700"
                    >
                      解析貼文並建立商品欄位
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBulkInputText(facebookVendorContent);
                        setUseBulkInput(true);
                      }}
                      className="px-4 py-2 text-sm font-semibold rounded border border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      複製到批量輸入區
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ✨ 系統會嘗試從這段文字分析商品與價格，並自動建立欄位與貼文內容。
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook 貼文內容模板 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={facebookPostTemplate}
                    onChange={(e) => setFacebookPostTemplate(e.target.value)}
                    className="w-full px-3 py-3 text-base border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    rows={6}
                    placeholder="例如：\n大家好，這次開團內容如下...\n訂購連結：{{formUrl}}\n截止時間：{{deadline}}"
                    required={facebookAutoMonitor}
                  />
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    {[
                      { token: '{{formUrl}}', label: '表單連結' },
                      { token: '{{deadline}}', label: '截止時間' },
                      { token: '{{pickupTime}}', label: '取貨時間' },
                    ].map(({ token, label }) => (
                      <button
                        type="button"
                        key={token}
                        onClick={() => handleInsertTemplateToken(token)}
                        className="px-3 py-1 border border-purple-300 rounded-full text-purple-700 hover:bg-purple-50"
                      >
                        插入 {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 系統會在發文時自動替換占位符（例如把 {{'{{formUrl}}'}} 改成實際表單網址）。
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    貼文圖片（每行一個 URL，可選）
                  </label>
                  <textarea
                    value={facebookPostImagesInput}
                    onChange={(e) => setFacebookPostImagesInput(e.target.value)}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    📎 目前支援貼上圖片連結，之後會加入直接上傳圖片的功能。
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      發文備註（可選）
                    </label>
                    <input
                      type="text"
                      value={facebookPostAuthor}
                      onChange={(e) => setFacebookPostAuthor(e.target.value)}
                      className="w-full px-3 py-2.5 text-base border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                      placeholder="例如：愛買小編、代理商、廠商"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      掃描間隔（分鐘） <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={facebookScanInterval}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (!isNaN(value) && value >= 1 && value <= 60) {
                          setFacebookScanInterval(value);
                        }
                      }}
                      className="w-full px-3 py-2.5 text-base border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                      placeholder="3"
                      required={facebookAutoMonitor}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 建議 3-10 分鐘，可視留言量調整。
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    關鍵字列表 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {facebookKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => {
                            setFacebookKeywords(facebookKeywords.filter((_, i) => i !== index));
                          }}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newKeyword.trim()) {
                          e.preventDefault();
                          if (!facebookKeywords.includes(newKeyword.trim())) {
                            setFacebookKeywords([...facebookKeywords, newKeyword.trim()]);
                            setNewKeyword('');
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2.5 text-base border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                      placeholder="輸入關鍵字後按 Enter 新增（例如：烤雞半隻+1）"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newKeyword.trim() && !facebookKeywords.includes(newKeyword.trim())) {
                          setFacebookKeywords([...facebookKeywords, newKeyword.trim()]);
                          setNewKeyword('');
                        }
                      }}
                      className="px-4 py-2.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      新增
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 系統會自動匹配包含這些關鍵字的留言（例如：烤雞半隻+1、半隻+1、半隻加一、+1半隻）
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    自動回覆訊息
                  </label>
                  <input
                    type="text"
                    value={facebookReplyMessage}
                    onChange={(e) => setFacebookReplyMessage(e.target.value)}
                    className="w-full px-3 py-2.5 text-base border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    placeholder="已登記"
                    autoComplete="off"
                  />
                  <div className="text-xs text-gray-600 mt-2 space-y-1">
                    <p className="font-medium">💬 自動回覆說明：</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>當系統抓到符合關鍵字的留言時，會自動在該留言下方回覆此訊息</li>
                      <li>回覆使用的帳號是 <code className="bg-gray-100 px-1 rounded">FACEBOOK_ACCESS_TOKEN</code> 對應的 Facebook 帳號</li>
                      <li>如果留空，預設回覆「已登記」</li>
                    </ul>
                    <p className="text-purple-600 mt-2">
                      ✅ 範例：客戶留言「+1」→ 系統自動回覆「已登記」
                    </p>
                    <p className="text-orange-600 mt-1">
                      ⚠️ 重要：請確保 FACEBOOK_ACCESS_TOKEN 對應的帳號有該社團的回覆權限
                    </p>
                  </div>
                </div>
              <div className="p-4 bg-white/80 rounded-lg border border-purple-100 space-y-3">
                <p className="text-sm font-semibold text-purple-700">截止與抓留言策略</p>
                <label className="flex items-start gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    checked={facebookAutoDeadlineScan}
                    onChange={(e) => setFacebookAutoDeadlineScan(e.target.checked)}
                  />
                  <span>
                    截止時間一到自動抓留言並留言「本單已截止，符合時間的已登記」
                    <span className="block text-xs text-gray-500">
                      deadline 到時自動跑一次，無須手動守在電腦前。
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    checked={facebookManualStrictDeadline}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFacebookManualStrictDeadline(checked);
                      if (checked) {
                        setFacebookAllowOverdue(false);
                      }
                    }}
                  />
                  <span>
                    手動抓留言時只登記截止前的留言，並留言「已登記到 XX 為止」
                    <span className="block text-xs text-gray-500">
                      12:00 後的留言會標記為「逾期」不入單，避免客戶誤會。
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    checked={facebookAllowOverdue}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFacebookAllowOverdue(checked);
                      if (checked) {
                        setFacebookManualStrictDeadline(false);
                      }
                    }}
                  />
                  <span>
                    不管是否超過截止時間都登記（延長 / 加開模式）
                    <span className="block text-xs text-gray-500">
                      適合還有庫存的情況；若勾選此項，將忽略「只登記截止前留言」設定。
                    </span>
                  </span>
                </label>
              </div>
              </div>
            )}
          </div>

          {/* LINE 自動監控設定 */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="lineAutoMonitor"
                checked={lineAutoMonitor}
                onChange={(e) => setLineAutoMonitor(e.target.checked)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="lineAutoMonitor" className="text-base font-bold text-gray-700 cursor-pointer">
                🤖 LINE 自動監控留言
            </label>
            </div>
            {lineAutoMonitor && (
              <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LINE 發文者姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={linePostAuthor}
                  onChange={(e) => setLinePostAuthor(e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                  placeholder="例如：愛買（系統會根據此姓名識別要監控的賣文）"
                  autoComplete="off"
                    required={lineAutoMonitor}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 當 LINE 群組中有此發文者的賣文時，系統會自動監控該賣文下方的留言
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  關鍵字列表（用於匹配留言）
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {lineKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => {
                          setLineKeywords(lineKeywords.filter((_, i) => i !== index));
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLineKeyword}
                    onChange={(e) => setNewLineKeyword(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newLineKeyword.trim()) {
                        e.preventDefault();
                        if (!lineKeywords.includes(newLineKeyword.trim())) {
                          setLineKeywords([...lineKeywords, newLineKeyword.trim()]);
                          setNewLineKeyword('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2.5 text-base border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                    placeholder="輸入關鍵字後按 Enter 新增（例如：水果1斤+1、5斤+1）"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newLineKeyword.trim() && !lineKeywords.includes(newLineKeyword.trim())) {
                        setLineKeywords([...lineKeywords, newLineKeyword.trim()]);
                        setNewLineKeyword('');
                      }
                    }}
                    className="px-4 py-2.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    新增
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  💡 系統會自動匹配包含這些關鍵字的留言（例如：+1、+2、水果1斤+1、5斤+1、烤雞半隻+1）
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  ⚠️ 重要：系統會根據「LINE 發文者姓名」和「關鍵字」來精準匹配表單，避免入錯單
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  💡 提示：如果群組內同時有多個賣文，系統會根據關鍵字匹配度選擇最符合的表單
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-green-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LINE 賣文識別碼
                </label>
                <div className="bg-white border border-green-100 rounded-lg p-3 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-sm text-gray-700 font-medium">
                      預設代碼：
                    </span>
                    <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                      {formToken ? `@${formToken}` : '儲存後系統會自動產生 6 碼代碼'}
                    </code>
            </div>
                  <p className="text-xs text-gray-600">
                    💡 請在賣文中加入這組代碼（建議放在文頭或文尾），系統會根據它鎖定對應的表單。
                  </p>
                  <p className="text-xs text-gray-600">
                    ✅ 當系統偵測到含有識別碼的賣文時，會回覆「小幫手已經收到闆娘要上班的訊息啦!」提醒你 BOT 已開始監控。
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <input
                    id="useCustomLineIdentifier"
                    type="checkbox"
                    checked={useCustomLineIdentifier}
                    onChange={(e) => {
                      setUseCustomLineIdentifier(e.target.checked);
                      if (!e.target.checked) {
                        setLineCustomIdentifier('');
                      }
                    }}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <label
                    htmlFor="useCustomLineIdentifier"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    使用自訂識別碼
                  </label>
                </div>
                {useCustomLineIdentifier && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={lineCustomIdentifier}
                      onChange={(e) => setLineCustomIdentifier(e.target.value)}
                      className="w-full px-3 py-2.5 text-base border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      placeholder="例如：#679 或 [鹹水雞679]"
                      autoComplete="off"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      建議選擇群組裡獨一無二的字串。賣文內務必包含此字串，系統會同時接受預設代碼與自訂代碼。
                    </p>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <label className="block text-base font-bold text-gray-700">
                表單欄位
              </label>
              <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addField}
                className="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm sm:text-base touch-manipulation min-h-[44px] font-medium"
              >
                + 新增欄位
              </button>
              </div>
            </div>

            {/* 批量商品自動帶入 */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="useBulkInput"
                  checked={useBulkInput}
                  onChange={(e) => setUseBulkInput(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="useBulkInput" className="text-base font-bold text-gray-700 cursor-pointer">
                  批量商品自動帶入
                </label>
              </div>
              {useBulkInput && (
                <div className="space-y-3 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      批量輸入商品列表（每行一個商品）
                    </label>
                    <textarea
                      value={bulkInputText}
                      onChange={(e) => setBulkInputText(e.target.value)}
                      className="w-full px-3 py-2.5 text-base border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder={`範例格式：
青花椒粉$150👑
紅花椒粉（大紅袍）$150
五香粉X2$300
五香粉*2 300
十三香粉$150
香蒜粉$100
A原味無蝦米$150B原味有蝦米$150🦐C薑黃無蝦米180`}
                      rows={8}
                      autoComplete="off"
                    />
                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                      <p className="font-medium">💡 支援的格式：</p>
                      <ul className="list-disc list-inside ml-2 space-y-0.5">
                        <li>商品名$價格（例如：青花椒粉$150）</li>
                        <li>商品名X數量$價格（例如：五香粉X2$300）</li>
                        <li>商品名*數量 價格（例如：五香粉*2 300）</li>
                        <li>商品名 價格（例如：十三香粉 150）</li>
                        <li>可一次貼上無換行的長字串，系統會自動分段（例如：A原味$150B原味$150C薑黃180）</li>
                      </ul>
                      <p className="mt-1 text-gray-500">系統會自動識別商品名稱和價格，$符號和特殊符號（如👑）會自動移除</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={createFieldsFromBulkInput}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm sm:text-base touch-manipulation min-h-[44px] font-medium"
                    >
                      ✨ 創建欄位
                    </button>
                  </div>
                </div>
              )}
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
                          <option value="text">文字選項</option>
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
                          onChange={(e) => {
                            const value = e.target.value;
                            // 只接受正整數
                            if (value === '') {
                              updateField(index, { price: undefined });
                            } else if (value.includes('.') || value.includes(',')) {
                              alert('價格只能輸入整數，請勿輸入小數點');
                              // 恢復到前一個有效值
                              const prevPrice = field.price !== undefined ? field.price : '';
                              if (prevPrice === '') {
                                updateField(index, { price: undefined });
                              } else {
                                const prevInt = parseInt(String(prevPrice), 10);
                                if (!isNaN(prevInt) && prevInt >= 0) {
                                  updateField(index, { price: prevInt });
                                } else {
                                  updateField(index, { price: undefined });
                                }
                              }
                            } else {
                              const intValue = parseInt(value, 10);
                              if (!isNaN(intValue) && intValue >= 0) {
                                updateField(index, { price: intValue });
                              } else if (value === '') {
                                updateField(index, { price: undefined });
                              }
                            }
                          }}
                          className="w-full px-3 py-2.5 text-base border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="例如：90（留空表示無價格）"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          onWheel={(e) => {
                            // 避免滾輪誤觸改變數值
                            e.currentTarget.blur();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                              e.preventDefault();
                            }
                          }}
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
