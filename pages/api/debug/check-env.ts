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
    
    // LINE Bot 環境變數
    LINE_CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN
      ? `${process.env.LINE_CHANNEL_ACCESS_TOKEN.substring(0, 20)}...（已設定）`
      : '❌ 未設定',
    
    LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET
      ? `${process.env.LINE_CHANNEL_SECRET.substring(0, 20)}...（已設定）`
      : '❌ 未設定（選填，用於 Webhook 驗證）',
    
    LINE_FORM_TOKEN: process.env.LINE_FORM_TOKEN
      ? `${process.env.LINE_FORM_TOKEN}（已設定）`
      : '❌ 未設定（選填，預設表單代碼）',
    
    // 診斷結果
    diagnosis: {
      usingSupabase: process.env.DATABASE_TYPE === 'supabase',
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasLineAccessToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
      hasLineChannelSecret: !!process.env.LINE_CHANNEL_SECRET,
      allConfigured: 
        process.env.DATABASE_TYPE === 'supabase' &&
        !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      lineBotConfigured: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
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

  // LINE Bot 相關建議
  if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
    envCheck.recommendations.push('❌ 缺少 LINE_CHANNEL_ACCESS_TOKEN（LINE Bot 取貨通知功能需要此變數）');
    envCheck.recommendations.push('   如何取得：前往 LINE Developers Console > 選擇 Bot > Messaging API > Channel access token');
  }

  if (!process.env.LINE_CHANNEL_SECRET) {
    envCheck.recommendations.push('⚠️ 缺少 LINE_CHANNEL_SECRET（選填，用於 Webhook 驗證）');
  }

  if (envCheck.diagnosis.allConfigured) {
    envCheck.recommendations.push('✅ 所有資料庫環境變數都已正確設定！');
    envCheck.recommendations.push('📋 請確認已在 Supabase Dashboard 執行 supabase-complete-schema.sql');
  }

  if (envCheck.diagnosis.lineBotConfigured) {
    envCheck.recommendations.push('✅ LINE Bot 環境變數已設定！');
  }

  return res.status(200).json({
    success: true,
    message: '環境變數檢查完成',
    ...envCheck,
    timestamp: new Date().toISOString(),
  });
}

