import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [folderPath, setFolderPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/report-folder');
      const data = await res.json();
      
      if (res.ok && data.success) {
        setFolderPath(data.folderPath || '');
      }
    } catch (error) {
      console.error('取得設定錯誤:', error);
      setMessage({ type: 'error', text: '無法載入設定' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings/report-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: '設定已儲存！報表將自動保存到此資料夾。' });
      } else {
        setMessage({ type: 'error', text: data.error || '儲存失敗' });
      }
    } catch (error) {
      console.error('儲存設定錯誤:', error);
      setMessage({ type: 'error', text: '儲存時發生錯誤' });
    } finally {
      setSaving(false);
    }
  };

  const handleBrowse = () => {
    // 在瀏覽器環境中，我們無法直接開啟資料夾選擇對話框
    // 所以提供說明文字
    alert('請手動輸入資料夾的完整路徑，例如：\nC:\\Users\\您的名字\\Documents\\報表\n\n或留空表示不自動保存（僅在網頁上下載）');
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
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800">
            ← 返回管理頁面
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 lg:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">⚙️ 系統設定</h1>

          <div className="space-y-6">
            {/* 報表輸出資料夾設定 */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                📁 報表自動保存設定
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    報表輸出資料夾路徑
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={folderPath}
                      onChange={(e) => setFolderPath(e.target.value)}
                      placeholder="例如：C:\Users\您的名字\Documents\報表"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleBrowse}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      📂 說明
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    • 留空表示不自動保存，報表僅在網頁上下載<br/>
                    • 設定後，當報表自動生成時會自動保存到此資料夾<br/>
                    • 請確保資料夾已存在，系統不會自動建立資料夾<br/>
                    • 範例路徑：<code className="bg-gray-100 px-1 rounded">C:\Users\您的名字\Documents\報表</code>
                  </p>
                </div>

                {message && (
                  <div
                    className={`p-4 rounded-lg ${
                      message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? '儲存中...' : '💾 儲存設定'}
                </button>
              </div>
            </div>

            {/* 說明區塊 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 使用說明</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>當表單到達「收單截止時間」時，系統會自動生成報表</li>
                <li>如果設定了輸出資料夾，報表會自動保存到該資料夾</li>
                <li>報表檔案名稱格式：<code className="bg-blue-100 px-1 rounded">訂單報表_表單名稱_日期.csv</code></li>
                <li>即使設定了自動保存，您仍可以在網頁上下載報表</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

