import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const ADMIN_PASSWORD = '690921';

export default function Home() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 檢查是否已經驗證過
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStatus = sessionStorage.getItem('admin_authenticated');
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === ADMIN_PASSWORD) {
      // 保存驗證狀態到 sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('admin_authenticated', 'true');
      }
      setIsAuthenticated(true);
      // 導向管理頁面
      router.push('/admin/portal');
    } else {
      setError('密碼錯誤，請重新輸入');
      setPassword('');
    }
  };

  const handleEnterAdmin = () => {
    if (!isAuthenticated) {
      // 如果未驗證，顯示錯誤提示
      setError('請先輸入正確的密碼');
      return;
    }
    router.push('/admin/portal');
  };

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
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <div className="text-6xl mb-4">👔</div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  賺錢開單囉
                </h2>
                <p className="text-gray-600 mb-6">
                  建立表單、查看報表、管理訂單
                </p>

                {/* 密碼輸入欄位 */}
                <form onSubmit={handlePasswordSubmit} className="mb-4">
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      請輸入管理密碼
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
                      placeholder="輸入密碼"
                      required
                    />
                  </div>
                  {error && (
                    <div className="mb-4 text-red-600 text-sm">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    驗證並進入
                  </button>
                </form>

                {/* 如果已驗證，顯示直接進入按鈕 */}
                {isAuthenticated && (
                  <button
                    onClick={handleEnterAdmin}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium mt-2"
                  >
                    ✓ 已驗證，直接進入
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
