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
            background: linear-gradient(135deg, 
              #ff0000 0%, 
              #ff7f00 14.3%, 
              #ffff00 28.6%, 
              #00ff00 42.9%, 
              #0000ff 57.2%, 
              #4b0082 71.5%, 
              #9400d3 85.8%, 
              #ff0000 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            background-size: 300% 300%;
            animation: gradient-shift 4s ease infinite;
          }
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            25% { background-position: 50% 0%; }
            50% { background-position: 100% 50%; }
            75% { background-position: 50% 100%; }
          }
        `}</style>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold -mt-4 mb-1 kaiti-text gradient-text">
              書宇皇太后座專用後台
            </h2>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              訂單管理系統
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-12">
              輕鬆建立表單，收集客戶訂單，自動生成報表
            </p>

            <div className="flex justify-center mt-16">
              <Link href="/admin">
                <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="text-6xl mb-4">👔</div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    賺錢開單囉
                  </h2>
                  <p className="text-gray-600">
                    建立表單、查看報表、管理訂單
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
