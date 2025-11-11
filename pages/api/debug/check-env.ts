import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * 檢查環境變數設定
 * GET /api/debug/check-env
 * 
 * 用於診斷 Supabase 連線問題
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const envCheck = {
    // 資料庫類型
    DATABASE_TYPE: process.env.DATABASE_TYPE || '未設定（預設：sqlite）',
    
    // Supabase 環境變數
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL 
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...（已設定）`
      : '❌ 未設定',
    
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...（已設定）`
      : '❌ 未設定',
    
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...（已設定）`
      : '❌ 未設定',
    
    // 診斷結果
    diagnosis: {
      usingSupabase: process.env.DATABASE_TYPE === 'supabase',
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      allConfigured: 
        process.env.DATABASE_TYPE === 'supabase' &&
        !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    
    // 建議
    recommendations: [] as string[],
  };

  // 生成建議
  if (process.env.DATABASE_TYPE !== 'supabase') {
    envCheck.recommendations.push(
      '⚠️ DATABASE_TYPE 應該設定為 "supabase"，目前是 "' + (process.env.DATABASE_TYPE || 'sqlite') + '"'
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    envCheck.recommendations.push('❌ 缺少 NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    envCheck.recommendations.push('❌ 缺少 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    envCheck.recommendations.push('❌ 缺少 SUPABASE_SERVICE_ROLE_KEY（這個很重要！）');
  }

  if (envCheck.diagnosis.allConfigured) {
    envCheck.recommendations.push('✅ 所有環境變數都已正確設定！');
    envCheck.recommendations.push('📋 請確認已在 Supabase Dashboard 執行 supabase-complete-schema.sql');
  }

  return res.status(200).json({
    success: true,
    message: '環境變數檢查完成',
    ...envCheck,
    timestamp: new Date().toISOString(),
  });
}

