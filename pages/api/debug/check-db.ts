import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureDatabaseInitialized, dbAll, dbGet } from '@/lib/db';
import { promisify } from 'util';
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'orders.db');
const db = new sqlite3.Database(dbPath);
const dbAllSync = promisify(db.all.bind(db)) as (sql: string, params?: any[]) => Promise<any[]>;
const dbGetSync = promisify(db.get.bind(db)) as (sql: string, params?: any[]) => Promise<any>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await ensureDatabaseInitialized();

    // 檢查表結構
    const tableInfo = await dbAllSync("PRAGMA table_info(forms)") as any[];
    
    // 檢查是否有 deleted 和 deleted_at 欄位
    const hasDeleted = tableInfo.some(col => col.name === 'deleted');
    const hasDeletedAt = tableInfo.some(col => col.name === 'deleted_at');

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
      stack: error.stack
    });
  }
}



