import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Form {
  id: number;
  name: string;
  fields: any[];
  deadline: string;
  order_deadline?: string;
  report_generated?: number;
  report_generated_at?: string;
  created_at: string;
  form_token: string;
}

interface ButtonConfig {
  id: string;
  label: string;
  href: string;
  className: string;
  fontSize?: number; // 文字大小（px）
}

export default function AdminDashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [checkingReports, setCheckingReports] = useState(false);
  const [selectedForms, setSelectedForms] = useState<Set<number>>(new Set());
  const [batchMoving, setBatchMoving] = useState(false);
  const [draggedButton, setDraggedButton] = useState<string | null>(null);
  const [dragOverButton, setDragOverButton] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ formId: number; x: number; y: number } | null>(null);
  const [editingFormId, setEditingFormId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [buttonContextMenu, setButtonContextMenu] = useState<{ buttonId: string; x: number; y: number } | null>(null);
  const [editingButtonId, setEditingButtonId] = useState<string | null>(null);
  const [editingButtonLabel, setEditingButtonLabel] = useState('');
  const [editingButtonFontSize, setEditingButtonFontSize] = useState(12); // 使用數字（px）

  // 預設按鈕配置
  const defaultButtons: ButtonConfig[] = [
    { id: 'test-parser', label: '🧪 測試訊息解析', href: '/admin/test-parser', className: 'bg-purple-600 hover:bg-purple-700' },
    { id: 'batch-import', label: '📥 批量匯入留言', href: '/admin/batch-import', className: 'bg-indigo-600 hover:bg-indigo-700' },
    { id: 'facebook-import', label: '🤖 Facebook 智能匯入', href: '/admin/facebook-import', className: 'bg-pink-600 hover:bg-pink-700' },
    { id: 'facebook-auto', label: '⚡ Facebook 自動處理', href: '/admin/facebook-auto', className: 'bg-red-600 hover:bg-red-700' },
    { id: 'trash', label: '🗑️ 垃圾桶', href: '/admin/trash', className: 'bg-gray-600 hover:bg-gray-700' },
    { id: 'settings', label: '⚙️ 系統設定', href: '/admin/settings', className: 'bg-yellow-600 hover:bg-yellow-700' },
  ];

  // 從 localStorage 載入按鈕順序
  const [buttons, setButtons] = useState<ButtonConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-button-order');
      if (saved) {
        try {
          const savedOrder = JSON.parse(saved);
          // 確保所有按鈕都存在
          const savedIds = savedOrder.map((b: ButtonConfig) => b.id);
          const missingButtons = defaultButtons.filter(b => !savedIds.includes(b.id));
          return [...savedOrder, ...missingButtons];
        } catch (e) {
          return defaultButtons;
        }
      }
    }
    return defaultButtons;
  });

  // 保存按鈕順序到 localStorage
  const saveButtonOrder = (newButtons: ButtonConfig[]) => {
    setButtons(newButtons);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-button-order', JSON.stringify(newButtons));
    }
  };

  // 拖放處理函數
  const handleDragStart = (e: React.DragEvent, buttonId: string) => {
    setDraggedButton(buttonId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', buttonId);
    
    // 創建自定義拖動圖像（像 Windows 移動捷徑）
    const buttonElement = e.currentTarget as HTMLElement;
    const dragImage = buttonElement.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.pointerEvents = 'none';
    document.body.appendChild(dragImage);
    
    // 設置拖動圖像的偏移
    const rect = buttonElement.getBoundingClientRect();
    e.dataTransfer.setDragImage(dragImage, rect.width / 2, rect.height / 2);
    
    // 清理臨時元素
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, buttonId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (draggedButton && draggedButton !== buttonId) {
      setDragOverButton(buttonId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 延遲清除，避免快速移動時閃爍
    setTimeout(() => {
      setDragOverButton(null);
    }, 50);
  };

  const handleDrop = (e: React.DragEvent, targetButtonId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedButton || draggedButton === targetButtonId) {
      setDraggedButton(null);
      setDragOverButton(null);
      return;
    }

    const newButtons = [...buttons];
    const draggedIndex = newButtons.findIndex(b => b.id === draggedButton);
    const targetIndex = newButtons.findIndex(b => b.id === targetButtonId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // 移除被拖動的按鈕
      const [removed] = newButtons.splice(draggedIndex, 1);
      // 插入到目標位置
      newButtons.splice(targetIndex, 0, removed);
      saveButtonOrder(newButtons);
    }

    setDraggedButton(null);
    setDragOverButton(null);
  };

  const handleDragEnd = () => {
    // 延遲清除，避免觸發點擊事件
    setTimeout(() => {
      setDraggedButton(null);
      setDragOverButton(null);
      setIsDragging(false);
    }, 100);
  };

  // 右鍵選單處理
  const handleContextMenu = (e: React.MouseEvent, formId: number) => {
    e.preventDefault();
    setContextMenu({ formId, x: e.clientX, y: e.clientY });
  };


  // 開始編輯表單名稱
  const handleRenameForm = (formId: number, currentName: string) => {
    setEditingFormId(formId);
    setEditingName(currentName);
    setContextMenu(null);
  };

  // 保存表單名稱
  const handleSaveName = async (formId: number) => {
    if (!editingName.trim()) {
      alert('表單名稱不能為空');
      return;
    }

    try {
      const res = await fetch(`/api/forms/${formId}/update-name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        // 更新本地狀態
        setForms(forms.map(f => f.id === formId ? { ...f, name: editingName.trim() } : f));
        setEditingFormId(null);
        setEditingName('');
      } else {
        alert(data.error || '更新失敗');
      }
    } catch (error) {
      console.error('更新表單名稱錯誤:', error);
      alert('更新時發生錯誤');
    }
  };

  // 取消編輯
  const handleCancelEdit = () => {
    setEditingFormId(null);
    setEditingName('');
  };

  // 按鈕右鍵選單處理
  const handleButtonContextMenu = (e: React.MouseEvent, buttonId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setButtonContextMenu({ buttonId, x: e.clientX, y: e.clientY });
  };

  // 開始編輯按鈕名稱
  const handleRenameButton = (buttonId: string, currentLabel: string) => {
    const button = buttons.find(b => b.id === buttonId);
    setEditingButtonId(buttonId);
    setEditingButtonLabel(currentLabel);
    setEditingButtonFontSize(button?.fontSize || 12);
    setButtonContextMenu(null);
  };

  // 保存按鈕名稱
  const handleSaveButtonName = (buttonId: string) => {
    if (!editingButtonLabel.trim()) {
      alert('按鈕名稱不能為空');
      return;
    }

    // 更新按鈕標籤和文字大小
    const newButtons = buttons.map(b => 
      b.id === buttonId ? { ...b, label: editingButtonLabel.trim(), fontSize: editingButtonFontSize } : b
    );
    saveButtonOrder(newButtons);
    setEditingButtonId(null);
    setEditingButtonLabel('');
    setEditingButtonFontSize(12);
  };

  // 取消編輯按鈕名稱
  const handleCancelButtonEdit = () => {
    setEditingButtonId(null);
    setEditingButtonLabel('');
    setEditingButtonFontSize(12);
  };

  // 調整字體大小
  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(8, editingButtonFontSize + delta); // 最小 8px
    setEditingButtonFontSize(newSize);
  };

  // 點擊外部關閉右鍵選單或保存編輯
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // 如果點擊的是編輯區域內部，不處理
      if (editingButtonId && target.closest('.button-edit-container')) {
        return;
      }
      
      // 如果正在編輯按鈕，保存並關閉
      if (editingButtonId) {
        const currentButtonId = editingButtonId;
        const currentLabel = editingButtonLabel;
        const currentFontSize = editingButtonFontSize;
        
        if (currentLabel.trim()) {
          // 保存按鈕
          const newButtons = buttons.map(b => 
            b.id === currentButtonId ? { ...b, label: currentLabel.trim(), fontSize: currentFontSize } : b
          );
          saveButtonOrder(newButtons);
        }
        
        setEditingButtonId(null);
        setEditingButtonLabel('');
        setEditingButtonFontSize(12);
      }
      
      // 關閉右鍵選單
      setContextMenu(null);
      setButtonContextMenu(null);
    };

    if (contextMenu || buttonContextMenu || editingButtonId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu, buttonContextMenu, editingButtonId, editingButtonLabel, editingButtonFontSize, buttons]);

  useEffect(() => {
    fetchForms();
    checkAutoReports();
    // 每 5 分鐘檢查一次
    const interval = setInterval(checkAutoReports, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchForms = async () => {
    try {
      const res = await fetch('/api/forms/list');
      const data = await res.json();
      setForms(data);
    } catch (error) {
      console.error('取得表單列表錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAutoReports = async () => {
    setCheckingReports(true);
    try {
      const res = await fetch('/api/reports/auto-generate');
      const data = await res.json();
      
      if (data.generated > 0) {
        setNotifications(data.forms);
        // 重新載入表單列表以更新狀態
        fetchForms();
      }
    } catch (error) {
      console.error('檢查報表錯誤:', error);
    } finally {
      setCheckingReports(false);
    }
  };

  const handleDeleteForm = async (formId: number, formName: string) => {
    // 確認移到垃圾桶
    const confirmed = window.confirm(
      `確定要將表單「${formName}」移到垃圾桶嗎？\n\n您之後可以在垃圾桶中還原或永久刪除。`
    );

    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(`/api/forms/trash/${formId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(`✓ 表單「${formName}」已成功移到垃圾桶！`);
        // 重新載入表單列表
        fetchForms();
      } else {
        // 顯示簡單易懂的錯誤訊息
        let errorMsg = '移到垃圾桶失敗';
        
        if (data.error) {
          if (data.error.includes('資料庫欄位')) {
            errorMsg = '資料庫欄位未建立，請重新啟動伺服器';
          } else if (data.error.includes('表單不存在')) {
            errorMsg = '表單不存在或已被刪除';
          } else if (data.error.includes('已經在垃圾桶')) {
            errorMsg = '表單已經在垃圾桶中';
          } else {
            errorMsg = data.error;
          }
        } else if (data.details) {
          errorMsg = data.details;
        }
        
        alert(`✗ ${errorMsg}\n\n如果問題持續，請重新啟動伺服器。`);
      }
    } catch (error: any) {
      alert(`✗ 操作失敗：無法連接到伺服器\n\n請確認：\n1. 伺服器正在運行\n2. 網路連接正常\n3. 重新啟動伺服器`);
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

  const handleBatchMoveToTrash = async () => {
    if (selectedForms.size === 0) {
      alert('請至少選擇一張表單');
      return;
    }

    const confirmed = window.confirm(
      `確定要將 ${selectedForms.size} 張表單移到垃圾桶嗎？\n\n您之後可以在垃圾桶中還原或永久刪除。`
    );

    if (!confirmed) {
      return;
    }

    setBatchMoving(true);
    try {
      const res = await fetch('/api/forms/batch-trash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formIds: Array.from(selectedForms) }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(`✓ 已成功將 ${data.successCount} 張表單移到垃圾桶！${data.failCount > 0 ? `\n${data.failCount} 張表單處理失敗。` : ''}`);
        setSelectedForms(new Set());
        fetchForms();
      } else {
        alert(`✗ 批量移到垃圾桶失敗：${data.error || '未知錯誤'}`);
      }
    } catch (error: any) {
      alert(`✗ 操作失敗：無法連接到伺服器`);
    } finally {
      setBatchMoving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-4">表單管理</h1>
          <div className="w-full flex justify-center">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 sm:gap-3">
              {/* 可拖曳的按鈕 */}
              {buttons.map((button) => (
                <div
                  key={button.id}
                  className={`${button.className} text-white rounded-lg transition-all cursor-move select-none aspect-square flex items-center justify-center relative text-xs ${
                    draggedButton === button.id ? 'opacity-30 scale-90' : ''
                  } ${
                    dragOverButton === button.id ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, button.id)}
                  onDragOver={(e) => handleDragOver(e, button.id)}
                  onDragLeave={(e) => handleDragLeave(e)}
                  onDrop={(e) => handleDrop(e, button.id)}
                  onDragEnd={handleDragEnd}
                  onContextMenu={(e) => handleButtonContextMenu(e, button.id)}
                >
                  {editingButtonId === button.id ? (
                    <div className="button-edit-container w-full p-2 flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingButtonLabel}
                        onChange={(e) => setEditingButtonLabel(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveButtonName(button.id);
                          } else if (e.key === 'Escape') {
                            handleCancelButtonEdit();
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ fontSize: `${editingButtonFontSize}px` }}
                        className="w-full px-2 py-1 border border-white rounded bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white"
                        placeholder="按鈕名稱"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-white text-xs">字體大小:</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            adjustFontSize(-1);
                          }}
                          className="px-2 py-1 border border-white rounded bg-white bg-opacity-10 text-white hover:bg-opacity-30 text-xs font-bold"
                          title="減小"
                        >
                          −
                        </button>
                        <span className="text-white text-xs min-w-[30px] text-center">
                          {editingButtonFontSize}px
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            adjustFontSize(1);
                          }}
                          className="px-2 py-1 border border-white rounded bg-white bg-opacity-10 text-white hover:bg-opacity-30 text-xs font-bold"
                          title="增大"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveButtonName(button.id);
                          }}
                          className="text-white hover:text-green-200 text-xs"
                          title="儲存"
                        >
                          ✓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelButtonEdit();
                          }}
                          className="text-white hover:text-red-200 text-xs"
                          title="取消"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={button.href}
                      onClick={(e) => {
                        // 如果正在拖動或剛完成拖動，阻止點擊
                        if (isDragging || draggedButton) {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                      className="w-full h-full flex items-center justify-center text-center px-1 overflow-hidden"
                      title="拖曳可調整位置"
                    >
                      <span 
                        className="break-words w-full"
                        style={{
                          fontSize: button.fontSize 
                            ? `clamp(8px, min(${button.fontSize}px, 3.5vw, 3.5vh, 20px), ${button.fontSize}px)` 
                            : 'clamp(8px, min(12px, 3.5vw, 3.5vh, 20px), 12px)',
                          lineHeight: '1.2',
                          maxWidth: '100%',
                          wordBreak: 'break-word',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          textOverflow: 'ellipsis',
                          textAlign: 'center',
                        }}
                      >
                        {button.label}
                      </span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 通知區域 */}
        {notifications.length > 0 && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  📊 報表已自動生成！
                </h3>
                <ul className="space-y-2">
                  {notifications.map((notif: any) => (
                    <li key={notif.formId} className="text-sm text-yellow-700">
                      <span className="font-medium">{notif.formName}</span>
                      {' - '}
                      <span>{notif.totalOrders} 筆訂單</span>
                      {notif.savedPath && (
                        <>
                          {' - '}
                          <span className="text-green-600 font-medium">✓ 已自動保存到資料夾</span>
                        </>
                      )}
                      {' - '}
                      <a
                        href={notif.reportUrl}
                        className="text-blue-600 hover:underline"
                      >
                        查看報表
                      </a>
                      {' 或 '}
                      <a
                        href={notif.downloadUrl}
                        className="text-blue-600 hover:underline"
                        download
                      >
                        下載 CSV
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setNotifications([])}
                className="text-yellow-600 hover:text-yellow-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 手動檢查按鈕和建立新表單 */}
        <div className="mb-4 flex justify-end gap-2">
          <Link
            href="/admin/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            + 建立新表單
          </Link>
          <button
            onClick={checkAutoReports}
            disabled={checkingReports}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 text-sm"
          >
            {checkingReports ? '檢查中...' : '🔍 檢查報表'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">載入中...</div>
        ) : forms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">還沒有建立任何表單</p>
            <Link
              href="/admin/create"
              className="text-blue-600 hover:underline"
            >
              立即建立第一個表單
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
                    onClick={handleBatchMoveToTrash}
                    disabled={batchMoving}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {batchMoving ? '處理中...' : `🗑️ 批量移到垃圾桶 (${selectedForms.size})`}
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className={`bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow flex flex-col relative ${
                    selectedForms.has(form.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onContextMenu={(e) => handleContextMenu(e, form.id)}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedForms.has(form.id)}
                      onChange={() => handleToggleSelect(form.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                    />
                    <div className="flex-1 flex items-start justify-between min-w-0">
                      {editingFormId === form.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveName(form.id);
                              } else if (e.key === 'Escape') {
                                handleCancelEdit();
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveName(form.id);
                            }}
                            className="text-green-600 hover:text-green-700 text-sm"
                            title="儲存"
                          >
                            ✓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                            className="text-red-600 hover:text-red-700 text-sm"
                            title="取消"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 flex items-center gap-2 min-w-0">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                            {form.name}
                          </h3>
                            <Link
                              href={`/admin/create?id=${form.id}`}
                              className="flex-shrink-0 bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                              title="修改表單"
                            >
                              ✏️ 修改
                            </Link>
                          </div>
                          {form.report_generated === 1 && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex-shrink-0">
                              ✓ 報表已生成
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                <div className="text-xs sm:text-sm text-gray-500 mb-2">
                  <div>截止時間: {new Date(form.deadline).toLocaleString('zh-TW', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}</div>
                  {new Date(form.deadline) <= new Date() && form.report_generated === 0 && (
                    <div className="mt-1">
                      <span className="text-orange-600 font-medium">⚠️ 待生成報表</span>
                    </div>
                  )}
                  {form.report_generated_at && (
                    <div className="mt-1 text-green-600">
                      報表生成時間: {new Date(form.report_generated_at).toLocaleString('zh-TW', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                      })}
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Link
                    href={`/admin/forms/${form.id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition-colors text-sm sm:text-base flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    查看報表
                  </Link>
                  <Link
                    href={`/admin/share/${form.form_token}`}
                    className="flex-1 bg-green-600 text-white text-center py-2 rounded hover:bg-green-700 transition-colors text-sm sm:text-base flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    分享表單
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteForm(form.id, form.name);
                    }}
                    className="flex-1 bg-red-600 text-white text-center py-2 rounded hover:bg-red-700 transition-colors text-sm sm:text-base flex items-center justify-center"
                  >
                    移到垃圾桶
                  </button>
                </div>
              </div>
              ))}
            </div>

            {/* 表單右鍵選單 */}
            {contextMenu && (
              <div
                className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50 py-1 min-w-[150px]"
                style={{
                  left: `${contextMenu.x}px`,
                  top: `${contextMenu.y}px`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    const form = forms.find(f => f.id === contextMenu.formId);
                    if (form) {
                      handleRenameForm(contextMenu.formId, form.name);
                    }
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                >
                  ✏️ 修改名稱
                </button>
              </div>
            )}

            {/* 按鈕右鍵選單 */}
            {buttonContextMenu && (
              <div
                className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50 py-1 min-w-[150px]"
                style={{
                  left: `${buttonContextMenu.x}px`,
                  top: `${buttonContextMenu.y}px`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    const button = buttons.find(b => b.id === buttonContextMenu.buttonId);
                    if (button) {
                      handleRenameButton(buttonContextMenu.buttonId, button.label);
                    }
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                >
                  ✏️ 修改名稱
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

