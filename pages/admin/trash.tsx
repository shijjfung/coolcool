import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Form {
  id: number;
  name: string;
  fields: any[];
  deadline: string;
  order_deadline?: string;
  report_generated?: number;
  report_generated_at?: string;
  deleted_at?: string;
  created_at: string;
  form_token: string;
  facebook_comment_url?: string;
  line_comment_url?: string;
}

export default function Trash() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForms, setSelectedForms] = useState<Set<number>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);

  useEffect(() => {
    fetchTrash();
  }, []);

  const fetchTrash = async () => {
    try {
      const res = await fetch('/api/forms/trash');
      const data = await res.json();
      setForms(data);
    } catch (error) {
      console.error('取得垃圾桶錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (formId: number, formName: string) => {
    const confirmed = window.confirm(`確定要還原表單「${formName}」嗎？`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/forms/trash/${formId}`, {
        method: 'PUT',
      });

      const data = await res.json();

      if (res.ok) {
        alert(`表單「${formName}」已還原！`);
        fetchTrash();
      } else {
        alert(data.error || '還原失敗');
      }
    } catch (error) {
      console.error('還原表單錯誤:', error);
      alert('還原時發生錯誤');
    }
  };

  const handlePermanentDelete = async (formId: number, formName: string) => {
    const confirmed = window.confirm(
      `確定要永久刪除表單「${formName}」嗎？\n\n此操作將同時刪除該表單的所有訂單，且無法復原！`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/forms/${formId}/delete`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        alert(`表單「${formName}」已永久刪除！\n已同時刪除 ${data.deletedOrders} 筆訂單。`);
        fetchTrash();
      } else {
        alert(data.error || '刪除失敗');
      }
    } catch (error) {
      console.error('永久刪除表單錯誤:', error);
      alert('刪除時發生錯誤');
    }
  };

  const handleToggleSelect = (formId: number) => {
    const newSelected = new Set(selectedForms);
    if (newSelected.has(formId)) {
      newSelected.delete(formId);
    } else {
      newSelected.add(formId);
    }
    setSelectedForms(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedForms.size === forms.length) {
      setSelectedForms(new Set());
    } else {
      setSelectedForms(new Set(forms.map(f => f.id)));
    }
  };

  const handleBatchPermanentDelete = async () => {
    if (selectedForms.size === 0) {
      alert('請至少選擇一張表單');
      return;
    }

    const confirmed = window.confirm(
      `確定要永久刪除 ${selectedForms.size} 張表單嗎？\n\n此操作將同時刪除這些表單的所有訂單，且無法復原！`
    );

    if (!confirmed) return;

    setBatchDeleting(true);
    try {
      const res = await fetch('/api/forms/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formIds: Array.from(selectedForms) }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(`✓ 已成功永久刪除 ${data.successCount} 張表單！\n已同時刪除 ${data.totalDeletedOrders} 筆訂單。${data.failCount > 0 ? `\n${data.failCount} 張表單處理失敗。` : ''}`);
        setSelectedForms(new Set());
        fetchTrash();
      } else {
        alert(`✗ 批量永久刪除失敗：${data.error || '未知錯誤'}`);
      }
    } catch (error: any) {
      alert(`✗ 操作失敗：無法連接到伺服器`);
    } finally {
      setBatchDeleting(false);
    }
  };

  return (
    <>
      <Head>
        <title>垃圾桶 - 訂單管理系統</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">🗑️ 垃圾桶</h1>
              <p className="text-sm text-gray-600 mt-1">已刪除的表單會保留在這裡，您可以還原或永久刪除</p>
            </div>
            <Link
              href="/admin"
              className="w-full sm:w-auto bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors text-center"
            >
              ← 返回管理頁面
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">載入中...</div>
          ) : forms.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-6xl mb-4">🗑️</div>
              <p className="text-gray-600 mb-4">垃圾桶是空的</p>
              <Link
                href="/admin"
                className="text-blue-600 hover:underline"
              >
                返回管理頁面
              </Link>
            </div>
          ) : (
            <>
              {/* 批量操作工具列 */}
              {forms.length > 0 && (
                <div className="mb-4 bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedForms.size === forms.length && forms.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {selectedForms.size === forms.length ? '取消全選' : '全選'}
                      </span>
                    </label>
                    <span className="text-sm text-gray-600">
                      已選擇 {selectedForms.size} 張表單
                    </span>
                  </div>
                  {selectedForms.size > 0 && (
                    <button
                      onClick={handleBatchPermanentDelete}
                      disabled={batchDeleting}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {batchDeleting ? '處理中...' : `🗑️ 批量永久刪除 (${selectedForms.size})`}
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {forms.map((form) => (
                  <div
                    key={form.id}
                    className={`bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 border-gray-400 ${
                      selectedForms.has(form.id) ? 'ring-2 ring-red-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedForms.has(form.id)}
                        onChange={() => handleToggleSelect(form.id)}
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                          {form.name}
                        </h3>
                      </div>
                    </div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-2">
                    <div>移入時間: {form.deleted_at ? new Date(form.deleted_at).toLocaleString('zh-TW') : '未知'}</div>
                    <div className="mt-1">建立時間: {new Date(form.created_at).toLocaleString('zh-TW')}</div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <button
                      onClick={() => handleRestore(form.id, form.name)}
                      className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                      ♻️ 還原
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(form.id, form.name)}
                      className="flex-1 bg-red-600 text-white text-center py-2 rounded hover:bg-red-700 transition-colors text-sm sm:text-base"
                    >
                      🗑️ 永久刪除
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

