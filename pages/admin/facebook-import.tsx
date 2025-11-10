import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function FacebookImport() {
  const router = useRouter();
  const [postText, setPostText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [formToken, setFormToken] = useState('');
  const [comments, setComments] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!postText.trim()) {
      alert('請輸入貼文內容');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await fetch('/api/facebook/analyze-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postText }),
      });

      const data = await res.json();
      setAnalysis(data);
    } catch (error) {
      console.error('分析錯誤:', error);
      alert('分析時發生錯誤');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImport = async () => {
    if (!formToken || !comments.trim()) {
      alert('請填寫表單代碼和留言內容');
      return;
    }

    // 解析留言（每行一筆）
    const commentLines = comments
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((message, index) => ({
        id: `comment_${index}`,
        message,
        from: { name: '客戶' },
      }));

    setImporting(true);
    try {
      const mode = analysis?.suggestions?.recommendedMode || 'groupbuy';
      
      const res = await fetch('/api/facebook/fetch-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formToken,
          comments: commentLines,
          mode,
        }),
      });

      const data = await res.json();
      setImportResults(data);
    } catch (error) {
      console.error('匯入錯誤:', error);
      alert('匯入時發生錯誤');
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Facebook 智能匯入</title>
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
            <h1 className="text-3xl font-bold">Facebook 智能匯入</h1>
            <p className="text-gray-600 mt-2">
              貼上您的 Facebook 貼文，系統會自動判斷是團購還是代購，並處理留言
            </p>
          </div>

          {/* 步驟 1：分析貼文 */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">步驟 1：分析貼文</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                貼上您的 Facebook 貼文內容
              </label>
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="例如：今天有水餃團購！口味：辣味、韭菜、高麗菜。要買的底下留言：韭菜+2"
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {analyzing ? '分析中...' : '🔍 分析貼文'}
            </button>

            {analysis && (
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <h3 className="font-bold mb-2">分析結果：</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">類型：</span>
                    <span className={`ml-2 px-2 py-1 rounded ${
                      analysis.analysis.type === 'proxy' 
                        ? 'bg-teal-100 text-teal-800'
                        : analysis.analysis.type === 'groupbuy'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {analysis.analysis.type === 'proxy' ? '代購' : 
                       analysis.analysis.type === 'groupbuy' ? '團購' : '未知'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">信心度：</span>
                    <span className="ml-2">{Math.round(analysis.analysis.confidence * 100)}%</span>
                  </div>
                  <div>
                    <span className="font-medium">建議模式：</span>
                    <span className="ml-2">{analysis.suggestions.recommendedMode === 'proxy' ? '代購模式' : '團購模式'}</span>
                  </div>
                  {analysis.analysis.keywords.length > 0 && (
                    <div>
                      <span className="font-medium">識別關鍵字：</span>
                      <span className="ml-2">{analysis.analysis.keywords.join('、')}</span>
                    </div>
                  )}
                  {analysis.formInfo.products && (
                    <div>
                      <span className="font-medium">識別商品：</span>
                      <span className="ml-2">{analysis.formInfo.products.join('、')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 步驟 2：匯入留言 */}
          {analysis && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">步驟 2：匯入留言</h2>
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
                <p className="text-xs text-gray-500 mt-1">
                  系統會使用 {analysis.suggestions.recommendedMode === 'proxy' ? '代購' : '團購'} 模式解析留言
                </p>
              </div>
              <button
                onClick={handleImport}
                disabled={importing}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {importing ? '匯入中...' : `📥 匯入 ${comments.split('\n').filter(l => l.trim()).length} 筆留言`}
              </button>

              {importResults && (
                <div className="mt-4 p-4 bg-green-50 rounded">
                  <h3 className="font-bold mb-2">匯入結果：</h3>
                  <div className="text-sm space-y-1">
                    <div>總數：{importResults.total} 筆</div>
                    <div className="text-green-600">成功：{importResults.successCount} 筆</div>
                    <div className="text-red-600">失敗：{importResults.failCount} 筆</div>
                  </div>
                  {importResults.successCount > 0 && (
                    <button
                      onClick={() => router.push('/admin')}
                      className="mt-4 text-blue-600 hover:underline"
                    >
                      返回管理頁面查看訂單
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 使用說明 */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-bold mb-2">使用說明：</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>複製您的 Facebook 貼文內容，貼到「步驟 1」</li>
              <li>點擊「分析貼文」，系統會自動判斷是團購還是代購</li>
              <li>從 Facebook 複製所有留言，貼到「步驟 2」</li>
              <li>輸入對應的表單代碼</li>
              <li>點擊「匯入留言」，系統會自動解析並建立訂單</li>
            </ol>
            <div className="mt-4 p-3 bg-white rounded">
              <p className="text-sm font-medium mb-1">範例貼文：</p>
              <pre className="text-xs bg-gray-100 p-2 rounded">
{`今天有水餃團購！
口味：辣味、韭菜、高麗菜
價格：每包 100 元
截止時間：12/31 18:00

要買的底下留言：韭菜+2`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



