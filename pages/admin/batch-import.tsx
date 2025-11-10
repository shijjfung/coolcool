import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function BatchImport() {
  const router = useRouter();
  const [formToken, setFormToken] = useState('');
  const [messages, setMessages] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'groupbuy' | 'proxy'>('groupbuy');

  const handleImport = async () => {
    if (!formToken || !messages.trim()) {
      alert('請填寫表單代碼和留言內容');
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      // 將留言內容按行分割
      const messageLines = messages
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const importResults = [];

      // 逐筆處理
      for (const message of messageLines) {
        try {
          const res = await fetch('/api/orders/parse-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              formToken,
              message,
              source: 'facebook',
              mode,
            }),
          });

          const data = await res.json();

          importResults.push({
            message,
            success: res.ok,
            data: res.ok ? data : { error: data.error },
          });
        } catch (error) {
          importResults.push({
            message,
            success: false,
            data: { error: '處理時發生錯誤' },
          });
        }
      }

      setResults(importResults);
    } catch (error) {
      console.error('批量匯入錯誤:', error);
      alert('批量匯入時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  return (
    <>
      <Head>
        <title>批量匯入留言</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:underline mb-4"
            >
              ← 返回
            </button>
            <h1 className="text-3xl font-bold">批量匯入留言</h1>
            <p className="text-gray-600 mt-2">
              從 Facebook 或其他平台複製留言，批量匯入並自動建立訂單
            </p>
          </div>

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
              <div className="flex gap-4">
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
                留言內容（每行一筆）
              </label>
              <textarea
                value={messages}
                onChange={(e) => setMessages(e.target.value)}
                placeholder={`例如：\n韭菜+2\n高麗菜+1\n我要買牛奶\n...`}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                每行一筆留言，系統會自動解析並建立訂單
              </p>
            </div>

            <button
              onClick={handleImport}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '處理中...' : `匯入 ${messages.split('\n').filter(l => l.trim()).length} 筆留言`}
            </button>
          </div>

          {results.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">匯入結果</h2>
                <div className="text-sm">
                  <span className="text-green-600">成功: {successCount}</span>
                  {' / '}
                  <span className="text-red-600">失敗: {failCount}</span>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border-l-4 ${
                      result.success
                        ? 'bg-green-50 border-green-400'
                        : 'bg-red-50 border-red-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-mono text-sm mb-1">
                          {result.message}
                        </div>
                        {result.success ? (
                          <div className="text-sm text-green-700">
                            ✅ 訂單已建立 - 代碼: {result.data.orderToken}
                          </div>
                        ) : (
                          <div className="text-sm text-red-700">
                            ❌ {result.data.error || '處理失敗'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {successCount > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded">
                  <p className="text-green-800 font-medium">
                    ✓ 成功匯入 {successCount} 筆訂單！
                  </p>
                  <button
                    onClick={() => router.push('/admin')}
                    className="mt-2 text-blue-600 hover:underline"
                  >
                    返回管理頁面查看訂單
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-6 mt-6">
            <h3 className="font-bold mb-2">使用說明：</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>在 Facebook 貼文底下複製所有留言</li>
              <li>貼到上面的「留言內容」欄位（每行一筆）</li>
              <li>選擇對應的表單代碼和模式</li>
              <li>點擊「匯入」按鈕</li>
              <li>系統會自動解析並建立訂單</li>
            </ol>
            <div className="mt-4 p-3 bg-white rounded">
              <p className="text-sm font-medium mb-1">範例留言格式：</p>
              <pre className="text-xs bg-gray-100 p-2 rounded">
{`韭菜+2
高麗菜+1
我要買牛奶
@abc123 韭菜+2`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



