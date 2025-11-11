import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureDatabaseInitialized } from '@/lib/db';

// 這個 API 僅用於本地 SQLite 調試，在 Vercel (Supabase) 環境下不適用
const DATABASE_TYPE = process.env.DATABASE_TYPE || 'sqlite';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 如果是 Supabase 模式，直接返回提示
  if (DATABASE_TYPE === 'supabase') {
    return res.status(200).json({
      success: true,
      message: '當前使用 Supabase 資料庫，此檢查功能僅適用於 SQLite 模式',
      databaseType: 'supabase',
      note: 'Supabase 資料庫結構請在 Supabase Dashboard 中查看'
    });
  }

  // SQLite 模式下的檢查（僅在本地開發環境使用）
  try {
    await ensureDatabaseInitialized();
    
    // 動態導入 SQLite 相關模組（避免在 Supabase 模式下載入）
    const { promisify } = await import('util');
    const sqlite3 = await import('sqlite3');
    const path = await import('path');
    
    const dbPath = path.join(process.cwd(), 'orders.db');
    const db = new sqlite3.Database(dbPath);
    const dbAllSync = promisify(db.all.bind(db)) as (sql: string, params?: any[]) => Promise<any[]>;
    const dbGetSync = promisify(db.get.bind(db)) as (sql: string, params?: any[]) => Promise<any>;

    // 檢查表結構
    const tableInfo = await dbAllSync("PRAGMA table_info(forms)") as any[];
    
    // 檢查是否有 deleted 和 deleted_at 欄位
    const hasDeleted = tableInfo.some((col: any) => col.name === 'deleted');
    const hasDeletedAt = tableInfo.some((col: any) => col.name === 'deleted_at');

    // 取得一個表單來測試
    const testForm = await dbGetSync('SELECT id, name, deleted, deleted_at FROM forms LIMIT 1') as any;

    return res.status(200).json({
      success: true,
      tableInfo,
      hasDeleted,
      hasDeletedAt,
      testForm,
      message: hasDeleted && hasDeletedAt 
        ? '資料庫欄位正常' 
        : '資料庫欄位缺失，需要手動新增'
    });
  } catch (error: any) {
    return res.status(500).json({
      error: '檢查失敗',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}



