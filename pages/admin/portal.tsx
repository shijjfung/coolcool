import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function AdminPortal() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const authenticated = sessionStorage.getItem('admin_authenticated') === 'true';
    setIsAdmin(authenticated);
    setAuthChecked(true);
    if (!authenticated) {
      router.replace('/');
    }
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-100">
        <p className="text-gray-600">驗證中...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl px-8 py-10 text-center space-y-4">
          <p className="text-gray-700 font-semibold">尚未登入，請返回首頁輸入管理密碼。</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            返回登入
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-10 px-4">
      <Head>
        <title>後台入口選單 - 涼涼古早味</title>
      </Head>
      <div className="max-w-3xl mx-auto text-center space-y-10">
        <div className="space-y-3">
          <p className="text-sm text-purple-500 font-semibold uppercase tracking-[0.3em]">Admin Portal</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">請選擇要進入的系統</h1>
          <p className="text-sm sm:text-base text-gray-500">完成驗證後，直接點擊下方按鈕即可進入對應頁面。</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/admin"
            className="block rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-2xl font-bold py-10 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all"
          >
            進入表單管理
          </Link>
          <Link
            href="/pickup/verify"
            className="block rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl font-bold py-10 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all"
          >
            進入客戶取貨管理
          </Link>
        </div>

        <div className="pt-6">
          <button
            onClick={() => {
              sessionStorage.removeItem('admin_authenticated');
              router.replace('/');
            }}
            className="inline-flex items-center px-5 py-2.5 rounded-full border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            登出並返回登入頁
          </button>
        </div>
      </div>
    </div>
  );
}


