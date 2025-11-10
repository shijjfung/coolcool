import { useState } from 'react';
import Head from 'next/head';

export default function TestParser() {
  const [message, setMessage] = useState('');
  const [formToken, setFormToken] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'groupbuy' | 'proxy'>('groupbuy');

  const handleTest = async () => {
    if (!message || !formToken) {
      alert('請填寫訊息和表單代碼');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders/parse-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formToken,
          message,
          source: 'line',
          mode,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('測試錯誤:', error);
      alert('測試失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>測試訊息解析器</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">測試訊息解析器</h1>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                表單代碼
              </label>
              <input
                type="text"
                value={formToken}
                onChange={(e) => setFormToken(e.target.value)}
                placeholder="輸入表單代碼"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                模式選擇
              </label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="groupbuy"
                    checked={mode === 'groupbuy'}
                    onChange={(e) => setMode(e.target.value as 'groupbuy' | 'proxy')}
                    className="mr-2"
                  />
                  <span>團購模式</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="proxy"
                    checked={mode === 'proxy'}
                    onChange={(e) => setMode(e.target.value as 'groupbuy' | 'proxy')}
                    className="mr-2"
                  />
                  <span>代購模式</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                測試訊息
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={mode === 'proxy' 
                  ? "例如：我要買牛奶、牛奶一罐、牛奶、牛奶2罐"
                  : "例如：韭菜+2、高麗菜+1、韭菜2、+1"}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleTest}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '測試中...' : '測試解析'}
            </button>
          </div>

          {result && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">解析結果</h2>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-6 mt-6">
            <h3 className="font-bold mb-2">支援的訊息格式：</h3>
            {mode === 'proxy' ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code>我要買牛奶</code> → 牛奶 x1</li>
                <li><code>牛奶一罐</code> → 牛奶 x1</li>
                <li><code>牛奶一瓶</code> → 牛奶 x1</li>
                <li><code>牛奶</code> → 牛奶 x1</li>
                <li><code>牛奶2罐</code> → 牛奶 x2</li>
                <li><code>買麵包</code> → 麵包 x1</li>
                <li><code>我是張三 我要買牛奶</code> → 姓名：張三，牛奶 x1</li>
              </ul>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code>韭菜+2</code> → 韭菜 x2</li>
                <li><code>高麗菜+1</code> → 高麗菜 x1</li>
                <li><code>韭菜2</code> → 韭菜 x2</li>
                <li><code>韭菜 2</code> → 韭菜 x2</li>
                <li><code>+1</code> → 預設商品 x1</li>
                <li><code>我要買韭菜2個</code> → 韭菜 x2</li>
                <li><code>我是張三 韭菜+2</code> → 姓名：張三，韭菜 x2</li>
                <li><code>韭菜+2 高麗菜+1</code> → 韭菜 x2、高麗菜 x1</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

