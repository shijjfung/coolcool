import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

// File System Access API 類型定義
interface FileSystemDirectoryHandle {
  kind: 'directory';
  name: string;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
}

interface FileSystemFileHandle {
  kind: 'file';
  name: string;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: string | Blob | ArrayBuffer): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Window {
    showDirectoryPicker?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle>;
  }
}

export default function SettingsPage() {
  const router = useRouter();
  const [folderPath, setFolderPath] = useState('');
  const [selectedFolderHandle, setSelectedFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [supportsFileSystemAccess, setSupportsFileSystemAccess] = useState(false);

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

  useEffect(() => {
    if (!authChecked) return;
    fetchSettings();
    
    // 檢測是否為手機裝置
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent.toLowerCase()));
      
      // 檢測是否支援 File System Access API（僅限桌面 Chrome/Edge 86+）
      setSupportsFileSystemAccess(
        typeof window.showDirectoryPicker !== 'undefined' &&
        !mobileRegex.test(userAgent.toLowerCase())
      );
    }
  }, [authChecked]);

  const fetchSettings = async () => {
    try {
      // 從 localStorage 讀取已選擇的資料夾資訊
      if (typeof window !== 'undefined') {
        const savedFolderInfo = localStorage.getItem('report_folder_info');
        if (savedFolderInfo) {
          try {
            const info = JSON.parse(savedFolderInfo);
            setFolderPath(info.path || '');
            // 注意：FileSystemDirectoryHandle 無法序列化，所以需要重新選擇
          } catch (e) {
            // 忽略解析錯誤
          }
        }
      }
      
      const res = await fetch('/api/settings/report-folder');
      const data = await res.json();
      
      if (res.ok && data.success && data.folderPath) {
        setFolderPath(data.folderPath);
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
      // 如果有選擇的資料夾 handle，儲存到 localStorage
      if (selectedFolderHandle) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('report_folder_handle_selected', 'true');
          localStorage.setItem('report_folder_name', selectedFolderHandle.name);
        }
      }

      // 儲存路徑到資料庫（用於記錄）
      const res = await fetch('/api/settings/report-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: folderPath || selectedFolderHandle?.name || '' }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({
          type: 'success',
          text: supportsFileSystemAccess && selectedFolderHandle
            ? `設定已儲存！報表將自動保存到「${selectedFolderHandle.name}」資料夾。`
            : '設定已儲存！報表將自動下載到您的「下載」資料夾。',
        });
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

  const handleBrowse = async () => {
    if (!supportsFileSystemAccess) {
      // 不支援 File System Access API，顯示說明
      alert(
        '您的瀏覽器不支援直接選擇資料夾功能。\n\n' +
        '支援的瀏覽器：\n' +
        '• Chrome 86+（桌面版）\n' +
        '• Edge 86+（桌面版）\n\n' +
        '其他瀏覽器或手機：\n' +
        '• 報表會自動下載到您的「下載」資料夾\n' +
        '• 您可以手動移動檔案到想要的資料夾\n\n' +
        '或手動輸入資料夾路徑（僅用於記錄）：\n' +
        '例如：C:\\Users\\您的名字\\Documents\\報表'
      );
      return;
    }

    try {
      // 使用 File System Access API 選擇資料夾
      const directoryHandle = await window.showDirectoryPicker!({
        mode: 'readwrite',
      });

      setSelectedFolderHandle(directoryHandle);
      setFolderPath(directoryHandle.name);
      
      // 儲存資料夾資訊到 localStorage（僅儲存名稱，handle 無法序列化）
      if (typeof window !== 'undefined') {
        localStorage.setItem('report_folder_info', JSON.stringify({
          name: directoryHandle.name,
          path: directoryHandle.name,
        }));
      }

      setMessage({
        type: 'success',
        text: `已選擇資料夾：${directoryHandle.name}\n報表將自動保存到此資料夾。`,
      });
    } catch (error: any) {
      // 用戶取消選擇時會拋出錯誤，這是正常的
      if (error.name !== 'AbortError') {
        console.error('選擇資料夾錯誤:', error);
        setMessage({
          type: 'error',
          text: '選擇資料夾時發生錯誤，請重試。',
        });
      }
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
                    {supportsFileSystemAccess ? '📁 選擇報表保存資料夾' : '📁 報表保存設定'}
                  </label>
                  
                  {supportsFileSystemAccess ? (
                    <div className="space-y-3">
                      <button
                        onClick={handleBrowse}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <span>📂</span>
                        <span>{selectedFolderHandle ? `已選擇：${selectedFolderHandle.name}` : '選擇資料夾（C:、D: 等）'}</span>
                      </button>
                      {selectedFolderHandle && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            ✅ 已選擇資料夾：<strong>{selectedFolderHandle.name}</strong>
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            報表將自動保存到此資料夾
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={folderPath}
                          onChange={(e) => setFolderPath(e.target.value)}
                          placeholder={isMobile ? '手機端會自動下載到「下載」資料夾' : '例如：C:\\Users\\您的名字\\Documents\\報表'}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={handleBrowse}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          📂 說明
                        </button>
                      </div>
                      {isMobile ? (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            📱 <strong>手機端說明：</strong>
                          </p>
                          <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc list-inside">
                            <li>報表會自動下載到您的「下載」資料夾</li>
                            <li>iOS：可在「檔案」App 中找到</li>
                            <li>Android：可在「下載」或「檔案管理」中找到</li>
                            <li>下載後可移動到其他資料夾</li>
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          • 您的瀏覽器不支援直接選擇資料夾<br/>
                          • 建議使用 Chrome 或 Edge 瀏覽器以獲得最佳體驗<br/>
                          • 或留空，報表將自動下載到「下載」資料夾
                        </p>
                      )}
                    </div>
                  )}
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
                {supportsFileSystemAccess ? (
                  <>
                    <li><strong>桌面版（Chrome/Edge）：</strong>選擇資料夾後，下載報表時會自動保存到選擇的資料夾</li>
                    <li><strong>手機版：</strong>報表會自動下載到「下載」資料夾，可手動移動到其他位置</li>
                  </>
                ) : (
                  <>
                    <li><strong>報表下載：</strong>點擊「下載報表」按鈕時，報表會自動下載到您的「下載」資料夾</li>
                    <li><strong>手機端：</strong>iOS 可在「檔案」App 中找到，Android 可在「下載」或「檔案管理」中找到</li>
                  </>
                )}
                <li>報表檔案名稱格式：<code className="bg-blue-100 px-1 rounded">訂單報表_表單名稱_日期.csv</code></li>
                <li>建議使用 Chrome 或 Edge 瀏覽器以獲得最佳體驗（支援直接選擇資料夾）</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

