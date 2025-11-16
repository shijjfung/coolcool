import { ComponentType, CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';

type QrReaderProps = {
  onResult?: (result: unknown, error: unknown) => void;
  constraints?: MediaTrackConstraints;
  containerStyle?: CSSProperties;
  videoStyle?: CSSProperties;
};

const QrReader = dynamic(
  () => import('react-qr-reader').then((mod: any) => mod.QrReader ?? mod.default),
  { ssr: false }
) as ComponentType<QrReaderProps>;

type PickupStatusFilter = 'pending' | 'picked' | 'all';

interface PickupOrderItem {
  itemKey: string;
  itemLabel: string;
  fieldLabel: string;
  orderedQuantity: number;
  pickedQuantity: number;
  remainingQuantity: number;
  status: 'pending' | 'picked';
  unitPrice?: number;
  orderedTotalPrice?: number;
  pickedTotalPrice?: number;
  remainingTotalPrice?: number;
  lastEventId?: number;
  lastEventQuantity?: number;
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

interface PickupTokenPayload {
  token: string;
  name: string;
  phone: string;
  expiresAt: string;
  orders: PickupOrderSummary[];
  status?: PickupStatusFilter;
}

export default function PickupVerifyPage() {
  const router = useRouter();
  const { token } = router.query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState<PickupTokenPayload | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PickupStatusFilter>('pending');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualError, setManualError] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'token' | 'manual' | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [lastManualQuery, setLastManualQuery] = useState<{ name: string; phone: string } | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [scannerKey, setScannerKey] = useState(0);
  const scanProcessingRef = useRef(false);

  const openScanner = useCallback(() => {
    if (!isAdmin) {
      setError('請先登入後台後再使用 QR Code 掃描功能。');
      return;
    }
    setScannerError('');
    setScannerKey((prev) => prev + 1);
    scanProcessingRef.current = false;
    setShowScanner(true);
  }, [isAdmin]);

  const closeScanner = useCallback(
    (options?: { preserveProcessing?: boolean }) => {
      setShowScanner(false);
      setScannerError('');
      if (!options?.preserveProcessing) {
        scanProcessingRef.current = false;
      }
      if (router.query.scan) {
        const { scan: _scan, ...rest } = router.query;
        router.replace(
          {
            pathname: router.pathname,
            query: { ...rest },
          },
          undefined,
          { shallow: true }
        );
      }
    },
    [router]
  );

  const extractTokenFromPayload = (raw: string): string | null => {
    if (!raw) return null;
    const trimmed = raw.trim();
    try {
      const parsed = new URL(trimmed);
      const tokenFromQuery = parsed.searchParams.get('token');
      if (tokenFromQuery) return tokenFromQuery;
      const segments = parsed.pathname.split('/').filter(Boolean);
      const verifyIndex = segments.lastIndexOf('verify');
      if (verifyIndex !== -1 && segments.length > verifyIndex + 1) {
        return segments[verifyIndex + 1];
      }
      return segments.pop() || trimmed;
    } catch {
      const tokenMatch = trimmed.match(/token=([^&]+)/i);
      if (tokenMatch?.[1]) {
        return tokenMatch[1];
      }
      return trimmed || null;
    }
  };

  const handleScanSuccess = (rawValue: string) => {
    if (scanProcessingRef.current) return;
    const extracted = extractTokenFromPayload(rawValue);
    if (!extracted) {
      setScannerError('無法解析 QR Code，請重新掃描');
      return;
    }
    scanProcessingRef.current = true;
    closeScanner({ preserveProcessing: true });
    router.push(
      `/pickup/verify?token=${encodeURIComponent(extracted)}&status=${statusFilter}`
    );
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authenticated = sessionStorage.getItem('admin_authenticated') === 'true';
      setIsAdmin(authenticated);
      setAuthChecked(true);
      if (!authenticated) {
        setLoading(false);
        setManualLoading(false);
      }
    }
  }, []);

  const fetchByToken = async (
    tokenValue: string,
    statusValue: PickupStatusFilter,
    showSpinner: boolean = true
  ) => {
    if (!tokenValue) return;
    if (!isAdmin) {
      setError('請先登入後台後再查看取貨資訊。');
      return;
    }
    if (showSpinner) setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/pickup/token/${tokenValue}?status=${statusValue}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || '無法取得取貨資訊');
        setPayload(null);
        return;
      }
      setPayload(data);
      setActiveToken(tokenValue);
      setViewMode('token');
      setInitialized(true);
    } catch (err) {
      console.error('pickup verify error', err);
      setError('系統忙碌中，請稍後再試');
      setPayload(null);
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  };

  const fetchByManual = async (
    nameValue: string,
    phoneValue: string,
    statusValue: PickupStatusFilter,
    showSpinner: boolean = true
  ) => {
    if (!isAdmin) {
      setManualError('請先登入後台後再查詢客戶訂單。');
      return;
    }
    const trimmedName = nameValue.trim();
    const trimmedPhone = phoneValue.trim();
    if (!trimmedName || !trimmedPhone) {
      setManualError('請輸入姓名與電話');
      return;
    }
    setManualError('');
    setError('');
    if (showSpinner) setLoading(true);
    setManualLoading(true);
    try {
      const res = await fetch('/api/pickup/admin-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          status: statusValue,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setManualError(data.error || '查無符合條件的訂單');
        setPayload(null);
        return;
      }
      setPayload(data);
      setActiveToken(data.token);
      setViewMode('manual');
      setLastManualQuery({ name: trimmedName, phone: trimmedPhone });
      setInitialized(true);
    } catch (err) {
      console.error('pickup admin search error', err);
      setManualError('查詢時發生錯誤，請稍後再試');
      setPayload(null);
    } finally {
      setManualLoading(false);
      if (showSpinner) {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = (nextStatus: PickupStatusFilter) => {
    if (nextStatus === statusFilter || !isAdmin) return;
    setStatusFilter(nextStatus);
    if (viewMode === 'token' && activeToken) {
      fetchByToken(activeToken, nextStatus, true);
    } else if (viewMode === 'manual' && lastManualQuery) {
      fetchByManual(lastManualQuery.name, lastManualQuery.phone, nextStatus);
    }
  };

  useEffect(() => {
    if (!router.isReady || !authChecked) return;
    if (!isAdmin) {
      if (typeof token === 'string' && token.trim()) {
        setError('此 QR Code 需由店家登入後台後掃描才會生效。');
      }
      return;
    }
    if (typeof token === 'string' && token.trim()) {
      setViewMode('token');
      setActiveToken(token);
      setLastManualQuery(null);
      fetchByToken(token, statusFilter, true);
    }
  }, [router.isReady, token, statusFilter, isAdmin, authChecked]);

  useEffect(() => {
    scanProcessingRef.current = false;
  }, [activeToken]);

  const handleManualSearch = async () => {
    await fetchByManual(manualName, manualPhone, statusFilter);
  };

  const resolveToken = () => {
    if (activeToken) return activeToken;
    if (typeof token === 'string' && token.trim()) return token;
    return payload?.token || null;
  };

  const handleMarkPicked = async (orderId: number, item: PickupOrderItem) => {
    if (!isAdmin) {
      alert('請先登入後台才能標記取貨');
      return;
    }
    const effectiveToken = resolveToken();
    if (!effectiveToken) {
      alert('目前沒有可用的取貨憑證，請重新掃描或查詢。');
      return;
    }
    if (item.remainingQuantity <= 0) {
      alert('此商品目前沒有待取貨的數量。');
      return;
    }

    const totalPrice =
      item.remainingTotalPrice !== undefined
        ? item.remainingTotalPrice
        : item.unitPrice
        ? item.unitPrice * item.remainingQuantity
        : undefined;
    const confirmMessage = item.unitPrice
      ? `請確認以下商品已完成領取：\n• 商品：${item.itemLabel}\n• 數量：${item.remainingQuantity}\n• 單價：${item.unitPrice} 元\n• 總計：${totalPrice?.toFixed(0) ?? '-'} 元`
      : `確認已將「${item.itemLabel}」的 ${item.remainingQuantity} 件商品交付給客人嗎？`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const loadingKey = `mark:${orderId}:${item.itemKey}`;
    setActionLoading(loadingKey);
    try {
      const res = await fetch('/api/pickup/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: effectiveToken,
          orderId,
          itemKey: item.itemKey,
          status: statusFilter,
          performedBy: 'admin',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || '標記失敗，請稍後再試');
        return;
      }
      setPayload((prev) =>
        prev
          ? {
              ...prev,
              orders: data.orders,
            }
          : prev
      );
    } catch (err) {
      console.error('mark pickup error', err);
      alert('標記取貨時發生錯誤，請稍後再試');
    } finally {
      setActionLoading((current) => (current === loadingKey ? null : current));
    }
  };

  const handleUndoPickup = async (orderId: number, item: PickupOrderItem) => {
    if (!isAdmin) {
      alert('請先登入後台才能取消取貨紀錄');
      return;
    }
    if (!item.lastEventId) {
      alert('目前沒有可取消的取貨紀錄');
      return;
    }
    const effectiveToken = resolveToken();
    if (!effectiveToken) {
      alert('目前沒有可用的取貨憑證，請重新掃描或查詢。');
      return;
    }

    const confirmMessage = item.unitPrice
      ? `要取消「${item.itemLabel}」最近一次的取貨紀錄嗎？\n單價：${item.unitPrice} 元`
      : `要取消「${item.itemLabel}」最近一次的取貨紀錄嗎？`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const loadingKey = `undo:${orderId}:${item.itemKey}`;
    setActionLoading(loadingKey);
    try {
      const res = await fetch('/api/pickup/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: effectiveToken,
          orderId,
          itemKey: item.itemKey,
          status: statusFilter,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || '取消失敗，請稍後再試');
        return;
      }
      setPayload((prev) =>
        prev
          ? {
              ...prev,
              orders: data.orders,
            }
          : prev
      );
    } catch (err) {
      console.error('undo pickup error', err);
      alert('取消取貨紀錄時發生錯誤，請稍後再試');
    } finally {
      setActionLoading((current) => (current === loadingKey ? null : current));
    }
  };

  const statusOptions: Array<{ value: PickupStatusFilter; label: string; hint: string }> = [
    { value: 'pending', label: '未領取', hint: '僅顯示尚未領取的商品' },
    { value: 'picked', label: '已領取', hint: '檢視已完成領取的商品' },
    { value: 'all', label: '全部', hint: '顯示所有已結單商品' },
  ];

  const emptyMessage =
    statusFilter === 'pending'
      ? '此客戶目前沒有待取貨的商品。'
      : statusFilter === 'picked'
      ? '目前尚未有已領取的紀錄。'
      : '目前沒有符合篩選條件的商品。';

  const renderContent = () => {
    if (!authChecked) {
      return (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-gray-600">驗證權限中，請稍候...</p>
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div className="p-6 rounded-2xl bg-yellow-50 border border-yellow-100 text-center space-y-3">
          <p className="text-yellow-700 font-semibold">此頁面僅限商家登入後台後使用。</p>
          <p className="text-sm text-yellow-600">
            請返回首頁輸入管理密碼，登入後台後再由商家裝置掃描 QR Code 或搜尋客戶。
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-yellow-600 text-white text-sm font-semibold hover:bg-yellow-700 transition-colors"
          >
            前往登入頁
          </Link>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-gray-600">資料載入中，請稍候...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 text-center">
          <p className="text-rose-600 font-semibold">{error}</p>
          <button
            onClick={() => {
              if (viewMode === 'token' && activeToken) {
                fetchByToken(activeToken, statusFilter, true);
              } else if (viewMode === 'manual' && lastManualQuery) {
                fetchByManual(lastManualQuery.name, lastManualQuery.phone, statusFilter);
              } else {
                router.reload();
              }
            }}
            className="mt-3 inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-full text-sm font-semibold hover:bg-rose-700"
          >
            重新整理
          </button>
        </div>
      );
    }

    if (!payload) {
      return (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-gray-600">
            請先掃描客戶 QR Code，或使用上方「手動查詢」功能搜尋客戶後再操作。
          </p>
        </div>
      );
    }

    const hasItems =
      payload.orders && payload.orders.length > 0 && payload.orders.some((order) => order.items.length > 0);

    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
            <p className="text-xs text-gray-500">客戶姓名</p>
            <p className="text-lg font-semibold text-gray-800 mt-1">{payload.name}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
            <p className="text-xs text-gray-500">聯絡電話</p>
            <p className="text-lg font-semibold text-gray-800 mt-1">{payload.phone}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
            <p className="text-xs text-gray-500">憑證有效期限</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">
              {new Date(payload.expiresAt).toLocaleString('zh-TW', { hour12: false })}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col gap-1">
            <p className="text-xs text-gray-500">資料來源</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 w-fit">
              {viewMode === 'manual' ? '手動查詢' : 'QR Code 掃描'}
            </span>
            <span className="text-xs text-gray-500">
              篩選條件：{statusOptions.find((opt) => opt.value === statusFilter)?.label}
            </span>
          </div>
        </div>

        {hasItems ? (
          <div className="space-y-5">
            {payload.orders.map((order) => (
              <div key={order.orderId} className="border border-slate-200 rounded-2xl shadow-sm p-5 bg-white">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{order.formName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      訂單建立：{new Date(order.orderCreatedAt).toLocaleString('zh-TW', { hour12: false })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold inline-block">
                      {order.items.length} 項商品
                    </span>
                    <p className="text-xs text-gray-400 mt-1">訂單代碼：{order.orderToken}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {order.items.map((item) => {
                    const isPending = item.status === 'pending';
                    const loadingMark = actionLoading === `mark:${order.orderId}:${item.itemKey}`;
                    const loadingUndo = actionLoading === `undo:${order.orderId}:${item.itemKey}`;
                    return (
                      <div
                        key={item.itemKey}
                        className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-r from-slate-50 to-white flex flex-col gap-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{item.itemLabel}</p>
                            <p className="text-xs text-gray-500">
                              訂購數量：{item.orderedQuantity}　|　已取貨：{item.pickedQuantity}
                              {isPending && (
                                <span className="ml-2">
                                  未取貨：<span className="text-indigo-600 font-semibold">{item.remainingQuantity}</span>
                                </span>
                              )}
                            </p>
                            {item.unitPrice !== undefined && (
                              <p className="text-xs text-gray-500">
                                單價：{item.unitPrice} 元　|　總額：{item.orderedTotalPrice?.toFixed(0) ?? '-'} 元
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              isPending ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isPending ? '未領取' : '已領取'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {isPending && (
                            <button
                              disabled={!isAdmin || loadingMark}
                              onClick={() => handleMarkPicked(order.orderId, item)}
                              className={`px-4 py-2 rounded-full text-sm font-semibold text-white transition-colors ${
                                isAdmin
                                  ? 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300'
                                  : 'bg-gray-300 cursor-not-allowed'
                              }`}
                            >
                              {loadingMark ? '更新中…' : '已取貨'}
                            </button>
                          )}
                          {!isPending && item.lastEventId && (
                            <button
                              disabled={!isAdmin || loadingUndo}
                              onClick={() => handleUndoPickup(order.orderId, item)}
                              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                                isAdmin
                                  ? 'bg-rose-500 text-white hover:bg-rose-600 disabled:bg-rose-300'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {loadingUndo ? '取消中…' : '取消'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
            <p className="text-emerald-600 font-semibold">{emptyMessage}</p>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 py-8 px-4">
      <Head>
        <title>取貨驗證 - 涼涼古早味</title>
      </Head>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-white/70 p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-purple-200 rounded-full opacity-30 blur-3xl pointer-events-none"></div>
          <div className="relative space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-purple-500 font-semibold">Pickup Verification</p>
                <h1 className="text-3xl font-bold text-gray-800 mt-1">取貨驗證中心</h1>
                <p className="text-sm text-gray-500 mt-2">
                  掃描 QR Code 或輸入姓名／電話，即可檢視客戶的未取貨與已取貨明細
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    isAdmin ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {isAdmin ? '已登入後台' : '尚未登入後台'}
                </span>
                {!isAdmin && (
                  <Link
                    href="/"
                    className="text-sm font-semibold text-purple-600 hover:text-purple-800 underline"
                  >
                    前往登入
                  </Link>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {isAdmin && (
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">手動查詢客戶訂單</h3>
                    <p className="text-sm text-gray-500">
                      客戶若無法出示 QR Code，可改用姓名與電話查詢
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    查詢成功後即可直接在下方標記「已取貨」或「取消」
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <input
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none text-sm"
                    placeholder="客戶姓名"
                  />
                  <input
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none text-sm"
                    placeholder="聯絡電話"
                  />
                </div>
                {manualError && <p className="text-sm text-red-500 mt-2">{manualError}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleManualSearch}
                    disabled={manualLoading || !manualName.trim() || !manualPhone.trim()}
                    className="px-5 py-2.5 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {manualLoading ? '查詢中…' : '查詢客戶訂單'}
                  </button>
                  <button
                    onClick={() => openScanner()}
                    className="px-5 py-2.5 rounded-full border border-purple-300 text-sm font-semibold text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-2"
                  >
                    📷 開啟 QR Code 掃描
                  </button>
                  <span className="text-xs text-gray-500">
                    已查詢的客戶會自動產生取貨憑證，可直接進行領貨操作
                  </span>
                </div>
              </div>
              )}

              {isAdmin && (
                <div className="p-4 rounded-2xl border border-indigo-100 bg-white/70 shadow-sm">
                <p className="text-sm font-semibold text-gray-700 mb-3">篩選顯示範圍</p>
                <div className="flex flex-wrap gap-3">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      disabled={!initialized}
                      className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
                        statusFilter === option.value
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                      } ${!initialized ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {statusOptions.find((opt) => opt.value === statusFilter)?.hint}
                </p>
              </div>
              )}

              {renderContent()}
            </div>
          </div>
        </div>
      </div>
      {showScanner && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
            <button
              onClick={() => closeScanner()}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="關閉掃描視窗"
            >
              ✕
            </button>
            <div className="p-6">
              <p className="text-xs font-semibold text-purple-500 uppercase tracking-[0.3em] mb-1">
                QR SCAN
              </p>
              <h3 className="text-xl font-bold text-gray-900">開啟 QR Code 掃描</h3>
              <p className="text-sm text-gray-500 mt-1">請允許瀏覽器使用相機，並將 QR Code 對準畫面中央。</p>
              {scannerError && (
                <p className="mt-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {scannerError}
                </p>
              )}
              <div className="mt-4 rounded-2xl overflow-hidden bg-black">
                {QrReader ? (
                  <QrReader
                    key={scannerKey}
                    onResult={(result, error) => {
                      if (result) {
                        const payload =
                          typeof (result as any).getText === 'function'
                            ? (result as any).getText()
                            : (result as any).text ?? (result as any);
                        if (typeof payload === 'string' && payload.trim()) {
                          handleScanSuccess(payload);
                        }
                      }
                      if (error && (error as { name?: string }).name !== 'NotFoundException') {
                        setScannerError('掃描失敗，請確認鏡頭是否被遮擋或重新對準。');
                      }
                    }}
                    videoStyle={{ width: '100%' }}
                    containerStyle={{ width: '100%' }}
                  />
                ) : (
                  <div className="py-20 text-center text-gray-500">載入掃描器中…</div>
                )}
              </div>
              <button
                onClick={() => closeScanner()}
                className="mt-4 w-full px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                關閉掃描視窗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
