import { createClient } from '@supabase/supabase-js';

// 取得環境變數
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 環境變數未設定，請檢查 .env.local 檔案');
}

// 客戶端（前端使用，使用 anon key）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 服務端客戶端（後端使用，使用 service_role key，有完整權限）
// 如果沒有 service_role key，暫時使用 anon key（僅測試用，不建議生產環境）
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

