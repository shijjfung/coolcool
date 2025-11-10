import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            訂單管理系統
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            輕鬆建立表單，收集客戶訂單，自動生成報表
          </p>

          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <Link href="/admin">
              <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
                <div className="text-6xl mb-4">👔</div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  老闆端
                </h2>
                <p className="text-gray-600">
                  建立表單、查看報表、管理訂單
                </p>
              </div>
            </Link>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                客戶端
              </h2>
              <p className="text-gray-600 mb-4">
                請使用老闆提供的 QR code 或網址進入表單
              </p>
              <p className="text-sm text-gray-500">
                或輸入表單代碼：
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




