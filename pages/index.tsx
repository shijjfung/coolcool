import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <style>{`
          .kaiti-text {
            font-family: '標楷體', 'KaiTi', 'STKaiti', 'DFKai-SB', 'BiauKai', serif;
          }
          .gradient-text {
            background: linear-gradient(135deg, #ff6b9d 0%, #ff1744 25%, #ff5722 50%, #ff9800 75%, #ff6b9d 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            background-size: 200% 200%;
            animation: gradient-shift 3s ease infinite;
          }
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 kaiti-text gradient-text">
              書宇皇太后座專用後台
            </h2>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              訂單管理系統
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              輕鬆建立表單，收集客戶訂單，自動生成報表
            </p>

          <div className="flex justify-center mt-16">
            <Link href="/admin">
              <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
                <div className="text-6xl mb-4">👔</div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  老闆創表單
                </h2>
                <p className="text-gray-600">
                  建立表單、查看報表、管理訂單
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
