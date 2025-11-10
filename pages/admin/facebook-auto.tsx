import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function FacebookAuto() {
  const router = useRouter();
  const [authorName, setAuthorName] = useState('愛買');
  const [postText, setPostText] = useState('');
  const [comments, setComments] = useState('');
  const [formToken, setFormToken] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleProcess = async () => {
    if (!authorName || !postText || !comments || !formToken) {
      alert('請填寫所有欄位');
      return;
    }

    // 解析留言
    const commentLines = comments
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((message, index) => ({
        id: `comment_${index}`,
        message,
        from: { name: '客戶' },
      }));

    setProcessing(true);
    try {
      const res = await fetch('/api/facebook/auto-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postText,
          authorName,
          comments: commentLines,
          formToken,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('處理錯誤:', error);
      alert('處理時發生錯誤');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Head>
        <title>Facebook 自動處理</title>
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
            <h1 className="text-3xl font-bold">Facebook 自動處理系統</h1>
            <p className="text-gray-600 mt-2">
              系統會自動識別發文者、分析貼文、處理留言，並在結單時間自動生成報表
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">貼文資訊</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                發文者名稱
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="例如：愛買"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                系統會識別這個發文者的貼文
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                貼文內容
              </label>
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="例如：阿里水餃 辣味150 原味120，蔬菜餅 1包 30，要的底下留言09點結單"
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

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
                留言內容（每行一筆）
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="從 Facebook 複製留言，每行一筆"
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
            </div>

            <button
              onClick={handleProcess}
              disabled={processing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {processing ? '處理中...' : '🚀 自動處理'}
            </button>
          </div>

          {result && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">處理結果</h2>
              
              {/* 分析結果 */}
              <div className="mb-4 p-4 bg-blue-50 rounded">
                <h3 className="font-bold mb-2">貼文分析：</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">發文者：</span>
                    <span className="ml-2">{result.author}</span>
                  </div>
                  <div>
                    <span className="font-medium">類型：</span>
                    <span className={`ml-2 px-2 py-1 rounded ${
                      result.analysis.type === 'proxy' 
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {result.analysis.type === 'proxy' ? '代購' : '團購'}
                    </span>
                  </div>
                  {result.formInfo.orderDeadline && (
                    <div>
                      <span className="font-medium">結單時間：</span>
                      <span className="ml-2">{new Date(result.formInfo.orderDeadline).toLocaleString('zh-TW')}</span>
                    </div>
                  )}
                  {result.formInfo.products && result.formInfo.products.length > 0 && (
                    <div>
                      <span className="font-medium">識別商品：</span>
                      <span className="ml-2">
                        {result.formInfo.products.map((p: any) => 
                          `${p.name}${p.price ? ` (${p.price}元)` : ''}`
                        ).join('、')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 處理結果 */}
              <div className="mb-4 p-4 bg-green-50 rounded">
                <h3 className="font-bold mb-2">訂單處理：</h3>
                <div className="text-sm space-y-1">
                  <div>總留言數：{result.processing.total} 筆</div>
                  <div className="text-green-600">成功：{result.processing.successCount} 筆</div>
                  <div className="text-red-600">失敗：{result.processing.failCount} 筆</div>
                </div>
              </div>

              {/* 報表生成 */}
              {result.reportGenerated && (
                <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <h3 className="font-bold mb-2">📊 報表已自動生成！</h3>
                  <p className="text-sm mb-2">
                    已到達結單時間，系統自動生成報表
                  </p>
                  <a
                    href={result.reportUrl}
                    className="text-blue-600 hover:underline"
                  >
                    查看報表 →
                  </a>
                </div>
              )}

              {/* 詳細結果 */}
              <div className="mt-4">
                <h3 className="font-bold mb-2">詳細結果：</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {result.processing.results.map((r: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded border-l-4 ${
                        r.success
                          ? 'bg-green-50 border-green-400'
                          : 'bg-red-50 border-red-400'
                      }`}
                    >
                      <div className="font-mono text-sm mb-1">{r.message}</div>
                      {r.success ? (
                        <div className="text-sm text-green-700">
                          ✅ 訂單已建立 - {r.customerName} - {r.items.map((i: any) => `${i.productName} x${i.quantity}`).join('、')}
                        </div>
                      ) : (
                        <div className="text-sm text-red-700">
                          ❌ {r.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {result.processing.successCount > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/admin')}
                    className="text-blue-600 hover:underline"
                  >
                    返回管理頁面查看訂單
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 使用說明 */}
          <div className="bg-blue-50 rounded-lg p-6 mt-6">
            <h3 className="font-bold mb-2">使用說明：</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>輸入您的 Facebook 帳號名稱（例如：愛買）</li>
              <li>貼上您的貼文內容（系統會自動識別商品和結單時間）</li>
              <li>輸入對應的表單代碼</li>
              <li>貼上所有留言（每行一筆）</li>
              <li>點擊「自動處理」，系統會：
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>識別發文者</li>
                  <li>分析貼文類型（團購/代購）</li>
                  <li>提取商品和價格</li>
                  <li>識別結單時間</li>
                  <li>解析留言並建立訂單</li>
                  <li>在結單時間自動生成報表</li>
                </ul>
              </li>
            </ol>
            <div className="mt-4 p-3 bg-white rounded">
              <p className="text-sm font-medium mb-1">範例貼文：</p>
              <pre className="text-xs bg-gray-100 p-2 rounded">
{`阿里水餃 辣味150 原味120
蔬菜餅 1包 30
要的底下留言09點結單`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



