import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Order {
  id: number;
  customer_name?: string;
  customer_phone?: string;
  order_data: Record<string, any>;
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
                      訂單編號
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
                      建立時間
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm">{order.id}</td>
                      <td className="py-3 px-4 text-sm">
                        {order.customer_name || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {order.customer_phone || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="space-y-1">
                          {Object.entries(order.order_data).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span>{' '}
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(order.created_at).toLocaleString('zh-TW')}
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




