import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ShareForm() {
  const router = useRouter();
  const { token } = router.query;
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [formUrl, setFormUrl] = useState('');

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

  const copyUrl = () => {
    navigator.clipboard.writeText(formUrl);
    alert('網址已複製到剪貼簿');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">分享表單</h1>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              表單已建立成功！
            </h2>
            <p className="text-gray-600 mb-6">
              請將下方的 QR code 或網址分享給客戶
            </p>

            {qrCode && (
              <div className="mb-6">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="mx-auto border-4 border-gray-200 rounded-lg w-[300px] h-[300px]"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                表單網址
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={copyUrl}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  複製
                </button>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/admin')}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                返回管理頁面
              </button>
              <button
                onClick={() => window.open(formUrl, '_blank')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                預覽表單
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

