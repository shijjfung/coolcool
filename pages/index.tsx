import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const ADMIN_PASSWORD = '690921';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export default function Home() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installMessage, setInstallMessage] = useState('');
  const [showInstallCTA, setShowInstallCTA] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // 檢查是否已經驗證過 + 安裝捷徑提示
  useEffect(() => {
    if (typeof window === 'undefined') return;
      const authStatus = sessionStorage.getItem('admin_authenticated');
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      }

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-ignore
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
      setShowInstallCTA(true);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
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

  const handleInstallShortcut = async () => {
    if (typeof window === 'undefined') return;
    setInstallMessage('');

    if (installPromptEvent) {
      await installPromptEvent.prompt();
      const choice = await installPromptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallMessage('已建立「團購後台」捷徑，可到主畫面或桌面找到它。');
        setInstallPromptEvent(null);
        setShowInstallCTA(false);
      } else {
        setInstallMessage('已取消捷徑安裝，可隨時再試一次。');
      }
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    if (isIOS) {
      setInstallMessage('請使用 Safari → 分享 → 加到主畫面，即可建立「團購後台」圖示。');
      return;
    }
    const isAndroid = /android/.test(ua);
    if (isAndroid) {
      setInstallMessage('請在瀏覽器選單中選擇「安裝應用程式」或「加到主畫面」。');
      return;
    }
    setInstallMessage('請於瀏覽器的功能選單中選擇「安裝應用程式 / 建立捷徑」，即可在桌面顯示團購後台。');
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
            {!isStandalone && (
              <div className="flex flex-col items-center gap-3 mb-10">
                <button
                  type="button"
                  onClick={handleInstallShortcut}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-purple-600 text-white font-semibold shadow-lg shadow-purple-300/60 hover:bg-purple-700 transition-colors"
                >
                  📱 添加團購後台捷徑
                </button>
                {installMessage ? (
                  <p className="text-sm text-purple-800 bg-white/70 px-4 py-2 rounded-full border border-purple-100 max-w-md">
                    {installMessage}
                  </p>
                ) : (
                  showInstallCTA && (
                    <p className="text-sm text-gray-500">
                      支援 Android、桌面瀏覽器的安裝提示，iPhone 請改用「加到主畫面」。
                    </p>
                  )
                )}
              </div>
            )}

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
