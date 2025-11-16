import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Order {
  id: number;
  customer_name?: string;
  customer_phone?: string;
  order_data: Record<string, any>;
  client_ip?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

interface ReportData {
  orders: Order[];
  statistics: Record<string, any>;
  totalOrders: number;
}

export default function FormReport() {
  const router = useRouter();
  const { id } = router.query;
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/reports/${id}`);
      const data = await res.json();
      setReport(data);
    } catch (error) {
      console.error('取得報表錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // 直接使用下載 API，這樣可以使用統一的報表格式（團購專用格式）
    if (!id) return;
    window.location.href = `/api/reports/${id}/download`;
  };

  const downloadItemsStatistics = () => {
    // 下載物品統計資料
    if (!id) return;
    window.location.href = `/api/reports/${id}/items-statistics/download`;
  };

  // 解析設備類型
  const getDeviceType = (userAgent?: string): string => {
    if (!userAgent || userAgent === 'unknown') return '-';
    const ua = userAgent.toLowerCase();
    
    // 檢測 iPad
    if (/ipad/i.test(userAgent)) {
      if (/cpu os (\d+)_(\d+)/i.test(userAgent)) {
        const match = userAgent.match(/cpu os (\d+)_(\d+)/i);
        if (match) {
          const major = match[1];
          const minor = match[2];
          return `iPad (iPadOS ${major}.${minor})`;
        }
      }
      return 'iPad';
    }
    
    // 檢測 iPhone
    if (/iphone/i.test(userAgent)) {
      const iphoneModels: { [key: string]: string } = {
        'iphone15,2': 'iPhone 14 Pro',
        'iphone15,3': 'iPhone 14 Pro Max',
        'iphone14,2': 'iPhone 13 Pro',
        'iphone14,3': 'iPhone 13 Pro Max',
        'iphone13,2': 'iPhone 12 Pro',
        'iphone13,3': 'iPhone 12 Pro Max',
        'iphone12,8': 'iPhone SE (第2代)',
        'iphone11,8': 'iPhone XR',
        'iphone11,2': 'iPhone XS',
        'iphone11,6': 'iPhone XS Max',
        'iphone10,3': 'iPhone X',
        'iphone10,6': 'iPhone X',
        'iphone9,1': 'iPhone 7',
        'iphone9,2': 'iPhone 7 Plus',
        'iphone9,3': 'iPhone 7',
        'iphone9,4': 'iPhone 7 Plus',
        'iphone8,1': 'iPhone 6s',
        'iphone8,2': 'iPhone 6s Plus',
        'iphone8,4': 'iPhone SE',
        'iphone7,1': 'iPhone 6 Plus',
        'iphone7,2': 'iPhone 6',
      };
      
      let model = 'iPhone';
      for (const [key, value] of Object.entries(iphoneModels)) {
        if (ua.includes(key)) {
          model = value;
          break;
        }
      }
      
      if (model === 'iPhone') {
        const iosMatch = userAgent.match(/os (\d+)_(\d+)/i);
        if (iosMatch) {
          const major = parseInt(iosMatch[1]);
          if (major >= 16) {
            model = 'iPhone (較新機型)';
          } else if (major >= 14) {
            model = 'iPhone (較新機型)';
          }
        }
      }
      
      return model;
    }
    
    // 檢測 Android 手機
    if (/android/i.test(userAgent) && !/tablet/i.test(userAgent)) {
      if (/samsung/i.test(userAgent)) {
        const samsungModels: { [key: string]: string } = {
          'sm-s': 'Samsung Galaxy S',
          'sm-n': 'Samsung Galaxy Note',
          'sm-a': 'Samsung Galaxy A',
          'sm-g': 'Samsung Galaxy',
          'sm-f': 'Samsung Galaxy Fold',
        };
        
        let model = 'Samsung';
        for (const [key, value] of Object.entries(samsungModels)) {
          if (ua.includes(key)) {
            const modelMatch = userAgent.match(new RegExp(`${key}(\\d+)`, 'i'));
            if (modelMatch) {
              model = `${value} ${modelMatch[1]}`;
            } else {
              model = value;
            }
            break;
          }
        }
        
        if (model === 'Samsung') {
          if (ua.includes('galaxy')) {
            model = 'Samsung Galaxy';
          } else {
            model = 'Samsung 手機';
          }
        }
        
        return model;
      }
      
      if (/xiaomi|redmi|mi /i.test(userAgent)) return '小米手機';
      if (/huawei|honor/i.test(userAgent)) return '華為手機';
      if (/oppo/i.test(userAgent)) return 'OPPO 手機';
      if (/vivo/i.test(userAgent)) return 'vivo 手機';
      if (/oneplus/i.test(userAgent)) return 'OnePlus 手機';
      if (/sony/i.test(userAgent)) return 'Sony 手機';
      if (/lg/i.test(userAgent)) return 'LG 手機';
      if (/htc/i.test(userAgent)) return 'HTC 手機';
      
      return 'Android 手機';
    }
    
    // 檢測 Windows
    if (/windows/i.test(userAgent)) {
      if (/windows nt 10.0/i.test(userAgent)) {
        // Windows 10 或 11（User Agent 無法準確區分）
        return 'Windows 10/11';
      } else if (/windows nt 6.3/i.test(userAgent)) {
        return 'Windows 8.1';
      } else if (/windows nt 6.2/i.test(userAgent)) {
        return 'Windows 8';
      } else if (/windows nt 6.1/i.test(userAgent)) {
        return 'Windows 7';
      } else if (/windows nt 6.0/i.test(userAgent)) {
        return 'Windows Vista';
      } else if (/windows nt 5.1/i.test(userAgent)) {
        return 'Windows XP';
      }
      return 'Windows';
    }
    
    // 檢測 macOS
    if (/macintosh|mac os x/i.test(userAgent)) {
      const macMatch = userAgent.match(/mac os x (\d+)[._](\d+)/i);
      if (macMatch) {
        const major = parseInt(macMatch[1]);
        const minor = parseInt(macMatch[2]);
        
        const macVersions: { [key: number]: string } = {
          14: 'macOS Sonoma',
          13: 'macOS Ventura',
          12: 'macOS Monterey',
          11: 'macOS Big Sur',
          10: major === 10 && minor >= 15 ? 'macOS Catalina' : 
              major === 10 && minor >= 14 ? 'macOS Mojave' :
              major === 10 && minor >= 13 ? 'macOS High Sierra' :
              'macOS',
        };
        
        if (macVersions[major]) {
          return macVersions[major];
        } else if (major >= 15) {
          return `macOS (版本 ${major}.${minor})`;
        }
      }
      return 'Mac 電腦';
    }
    
    // 檢測 Linux
    if (/linux/i.test(userAgent)) {
      return 'Linux';
    }
    
    // 預設為電腦
    return '電腦';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">無法載入報表</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">訂單報表</h1>
          <div className="flex gap-4">
            <button
              onClick={downloadItemsStatistics}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              下載物品統計
            </button>
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              匯出 CSV
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              返回
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">統計資訊</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {report.totalOrders}
              </div>
              <div className="text-sm text-gray-600">總訂單數</div>
            </div>
          </div>

          {Object.keys(report.statistics).length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">欄位統計</h3>
              <div className="space-y-4">
                {Object.entries(report.statistics).map(([key, stat]: [string, any]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">{stat.label}</h4>
                    {stat.total !== undefined && (
                      <div className="text-sm text-gray-600">
                        <div>總計: {stat.total}</div>
                        <div>平均: {stat.average.toFixed(2)}</div>
                        <div>數量: {stat.count}</div>
                      </div>
                    )}
                    {stat.counts && (
                      <div className="mt-2">
                        {Object.entries(stat.counts).map(([option, count]: [string, any]) => (
                          <div key={option} className="text-sm text-gray-600">
                            {option}: {count} 筆
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">訂單明細</h2>
          {report.orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">目前還沒有訂單</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      提交時間
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      客戶姓名
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      客戶電話
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      訂單內容
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      設備類型
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      客戶 IP
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm">
                        {new Date(order.created_at).toLocaleString('zh-TW', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {order.customer_name || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {order.customer_phone || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="space-y-1">
                          {Object.entries(order.order_data).map(([key, value]) => {
                            // 處理陣列類型的值（例如：好事多代購欄位）
                            let displayValue: string;
                            if (Array.isArray(value)) {
                              displayValue = value.map((item: any) => {
                                if (typeof item === 'object' && item !== null) {
                                  // 如果是物件，顯示 name 和 quantity
                                  if (item.name && item.quantity !== undefined) {
                                    return `${item.name} × ${item.quantity}`;
                                  }
                                  return JSON.stringify(item);
                                }
                                return String(item);
                              }).join(', ');
                            } else if (typeof value === 'object' && value !== null) {
                              displayValue = JSON.stringify(value);
                            } else {
                              displayValue = String(value);
                            }
                            
                            return (
                              <div key={key}>
                                <span className="font-medium">{key}:</span>{' '}
                                <span>{displayValue}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {getDeviceType(order.user_agent)}
                      </td>
                      <td className="py-3 px-4 text-sm font-mono text-xs">
                        {order.client_ip || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




