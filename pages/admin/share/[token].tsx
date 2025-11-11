import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ShareForm() {
  const router = useRouter();
  const { token } = router.query;
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [formUrl, setFormUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    if (token && typeof token === 'string') {
      const url = `${window.location.origin}/form/${token}`;
      setFormUrl(url);
      generateQRCode(url);
    }
  }, [token]);

  const generateQRCode = async (url: string) => {
    try {
      const res = await fetch('/api/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.qrCode) {
        setQrCode(data.qrCode);
      }
    } catch (error) {
      console.error('生成 QR code 錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = async () => {
    try {
      // 嘗試使用現代 API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formUrl);
      } else {
        // 降級方案：使用傳統方法
        const textArea = document.createElement('textarea');
        textArea.value = formUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('複製失敗:', error);
      // 如果複製失敗，讓用戶可以手動選擇
      const input = document.querySelector('input[readonly]') as HTMLInputElement;
      if (input) {
        input.select();
        input.setSelectionRange(0, formUrl.length);
      }
      alert('請手動選擇並複製網址');
    }
  };

  const shareToLine = () => {
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(`請填寫表單：${formUrl}`)}`;
    window.open(lineUrl, '_blank');
  };

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`請填寫表單：${formUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(formUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareViaNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '請填寫表單',
          text: '請點擊連結填寫表單',
          url: formUrl,
        });
      } catch (error) {
        // 用戶取消分享
        if ((error as Error).name !== 'AbortError') {
          console.error('分享失敗:', error);
        }
      }
    } else {
      // 如果不支援原生分享，顯示分享選單
      setShowShareMenu(!showShareMenu);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-2xl">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-8 text-center">分享表單</h1>

        <div className="bg-white rounded-lg shadow p-4 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">
              ✅ 表單已建立成功！
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              請將下方的 QR code 或網址分享給客戶
            </p>

            {qrCode && (
              <div className="mb-4 sm:mb-6">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="mx-auto border-4 border-gray-200 rounded-lg w-full max-w-[250px] sm:max-w-[300px] h-auto"
                />
                <p className="text-xs text-gray-500 mt-2">客戶可以掃描此 QR Code 填寫表單</p>
              </div>
            )}

            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                表單網址
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={formUrl}
                  readOnly
                  onClick={(e) => {
                    (e.target as HTMLInputElement).select();
                    copyUrl();
                  }}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  title="點擊選擇全部並複製"
                />
                <button
                  onClick={copyUrl}
                  className={`px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base font-medium touch-manipulation min-h-[44px] ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                  }`}
                >
                  {copied ? '✓ 已複製' : '📋 複製連結'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-left">
                💡 提示：點擊網址框可快速選擇並複製
              </p>
            </div>

            {/* 分享按鈕區 */}
            <div className="mb-4 sm:mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">快速分享到：</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <button
                  onClick={shareViaNative}
                  className="bg-blue-500 text-white px-3 sm:px-4 py-2.5 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors text-sm touch-manipulation min-h-[44px] flex items-center justify-center gap-1"
                >
                  <span>📤</span>
                  <span>分享</span>
                </button>
                <button
                  onClick={shareToLine}
                  className="bg-green-500 text-white px-3 sm:px-4 py-2.5 rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors text-sm touch-manipulation min-h-[44px] flex items-center justify-center gap-1"
                >
                  <span>💬</span>
                  <span>LINE</span>
                </button>
                <button
                  onClick={shareToWhatsApp}
                  className="bg-green-600 text-white px-3 sm:px-4 py-2.5 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm touch-manipulation min-h-[44px] flex items-center justify-center gap-1"
                >
                  <span>📱</span>
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={shareToFacebook}
                  className="bg-blue-700 text-white px-3 sm:px-4 py-2.5 rounded-lg hover:bg-blue-800 active:bg-blue-900 transition-colors text-sm touch-manipulation min-h-[44px] flex items-center justify-center gap-1"
                >
                  <span>👤</span>
                  <span>Facebook</span>
                </button>
              </div>
            </div>

            {/* 分享選單（當原生分享不可用時） */}
            {showShareMenu && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 mb-2">選擇分享方式：</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={shareToLine}
                    className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors text-sm touch-manipulation min-h-[40px]"
                  >
                    LINE
                  </button>
                  <button
                    onClick={shareToWhatsApp}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm touch-manipulation min-h-[40px]"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={shareToFacebook}
                    className="flex-1 bg-blue-700 text-white px-3 py-2 rounded-lg hover:bg-blue-800 active:bg-blue-900 transition-colors text-sm touch-manipulation min-h-[40px]"
                  >
                    Facebook
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6">
              <button
                onClick={() => router.push('/admin')}
                className="bg-gray-300 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg hover:bg-gray-400 active:bg-gray-500 transition-colors text-sm sm:text-base touch-manipulation min-h-[44px]"
              >
                返回管理頁面
              </button>
              <button
                onClick={() => window.open(formUrl, '_blank')}
                className="bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm sm:text-base touch-manipulation min-h-[44px]"
              >
                👁️ 預覽表單
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

