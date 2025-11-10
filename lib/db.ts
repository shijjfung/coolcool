// 根據環境變數選擇資料庫類型
const DATABASE_TYPE = process.env.DATABASE_TYPE || 'sqlite';

// 如果使用 Supabase，導入 Supabase 實作
let dbModule: any;
if (DATABASE_TYPE === 'supabase') {
  try {
    dbModule = require('./db-supabase');
  } catch (error) {
    console.error('無法載入 Supabase 模組，請確認已安裝 @supabase/supabase-js 並設定環境變數');
    throw error;
  }
}

// SQLite 實作（保留作為備用）
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'orders.db');

// 確保資料庫檔案存在
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '');
}

const db = new sqlite3.Database(dbPath);

// 將 callback 風格的函數轉換為 Promise
const dbRun = promisify(db.run.bind(db)) as (sql: string, params?: any[]) => Promise<any>;
const dbGet = promisify(db.get.bind(db)) as (sql: string, params?: any[]) => Promise<any>;
const dbAll = promisify(db.all.bind(db)) as (sql: string, params?: any[]) => Promise<any>;

// 初始化資料庫表
async function initDatabaseSQLite() {
  // 表單設定表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      fields TEXT NOT NULL,
      deadline TEXT NOT NULL,
      order_deadline TEXT,
      report_generated INTEGER DEFAULT 0,
      report_generated_at TEXT,
      deleted INTEGER DEFAULT 0,
      deleted_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      form_token TEXT UNIQUE NOT NULL
    )
  `);
  
  // 檢查並新增新欄位（向後相容）
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN order_deadline TEXT`);
  } catch (e: any) {
    // 欄位已存在，忽略錯誤
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN report_generated INTEGER DEFAULT 0`);
  } catch (e: any) {
    // 欄位已存在，忽略錯誤
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN report_generated_at TEXT`);
  } catch (e: any) {
    // 欄位已存在，忽略錯誤
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN deleted INTEGER DEFAULT 0`);
  } catch (e: any) {
    // 欄位已存在，忽略錯誤
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN deleted_at TEXT`);
  } catch (e: any) {
    // 欄位已存在，忽略錯誤
  }

  // 訂單表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL,
      customer_name TEXT,
      customer_phone TEXT,
      order_data TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      order_token TEXT UNIQUE NOT NULL,
      FOREIGN KEY (form_id) REFERENCES forms(id)
    )
  `);

  // 系統設定表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// 表單相關操作
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select';
  required: boolean;
  options?: string[];
}

export interface Form {
  id: number;
  name: string;
  fields: FormField[];
  deadline: string;
  order_deadline?: string; // 收單截止時間
  report_generated?: number; // 報表是否已生成 (0/1)
  report_generated_at?: string; // 報表生成時間
  deleted?: number; // 是否已刪除到垃圾桶 (0/1)
  deleted_at?: string; // 刪除時間
  created_at: string;
  form_token: string;
}

async function createFormSQLite(
  name: string, 
  fields: FormField[], 
  deadline: string,
  orderDeadline?: string
): Promise<number> {
  const formToken = generateToken();
  await dbRun(
    'INSERT INTO forms (name, fields, deadline, order_deadline, form_token) VALUES (?, ?, ?, ?, ?)',
    [name, JSON.stringify(fields), deadline, orderDeadline || null, formToken]
  );
  const result = await dbGet('SELECT last_insert_rowid() as id') as { id: number };
  return result.id;
}

async function getFormByTokenSQLite(token: string): Promise<Form | null> {
  const row = await dbGet('SELECT * FROM forms WHERE form_token = ? AND (deleted IS NULL OR deleted = 0)', [token]) as any;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    fields: JSON.parse(row.fields),
    deadline: row.deadline,
    order_deadline: row.order_deadline || undefined,
    report_generated: row.report_generated || 0,
    report_generated_at: row.report_generated_at || undefined,
    deleted: row.deleted || 0,
    deleted_at: row.deleted_at || undefined,
    created_at: row.created_at,
    form_token: row.form_token,
  };
}

async function getFormByIdSQLite(id: number, includeDeleted: boolean = false): Promise<Form | null> {
  const query = includeDeleted 
    ? 'SELECT * FROM forms WHERE id = ?'
    : 'SELECT * FROM forms WHERE id = ? AND (deleted IS NULL OR deleted = 0)';
  const row = await dbGet(query, [id]) as any;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    fields: JSON.parse(row.fields),
    deadline: row.deadline,
    order_deadline: row.order_deadline || undefined,
    report_generated: row.report_generated || 0,
    report_generated_at: row.report_generated_at || undefined,
    deleted: row.deleted || 0,
    deleted_at: row.deleted_at || undefined,
    created_at: row.created_at,
    form_token: row.form_token,
  };
}

async function getAllFormsSQLite(includeDeleted: boolean = false): Promise<Form[]> {
  const query = includeDeleted 
    ? 'SELECT * FROM forms ORDER BY created_at DESC'
    : 'SELECT * FROM forms WHERE deleted IS NULL OR deleted = 0 ORDER BY created_at DESC';
  const rows = await dbAll(query) as any[];
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    fields: JSON.parse(row.fields),
    deadline: row.deadline,
    order_deadline: row.order_deadline || undefined,
    report_generated: row.report_generated || 0,
    report_generated_at: row.report_generated_at || undefined,
    deleted: row.deleted || 0,
    deleted_at: row.deleted_at || undefined,
    created_at: row.created_at,
    form_token: row.form_token,
  }));
}

/**
 * 取得垃圾桶中的表單
 */
async function getDeletedFormsSQLite(): Promise<Form[]> {
  const rows = await dbAll('SELECT * FROM forms WHERE deleted = 1 ORDER BY deleted_at DESC') as any[];
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    fields: JSON.parse(row.fields),
    deadline: row.deadline,
    order_deadline: row.order_deadline || undefined,
    report_generated: row.report_generated || 0,
    report_generated_at: row.report_generated_at || undefined,
    deleted: row.deleted || 0,
    deleted_at: row.deleted_at || undefined,
    created_at: row.created_at,
    form_token: row.form_token,
  }));
}

/**
 * 更新表單名稱
 */
async function updateFormNameSQLite(formId: number, newName: string): Promise<boolean> {
  const result = await dbRun(
    'UPDATE forms SET name = ? WHERE id = ?',
    [newName, formId]
  );
  return (result as any)?.changes > 0 || (result?.lastID !== undefined);
}

/**
 * 標記報表已生成
 */
async function markReportGeneratedSQLite(formId: number): Promise<boolean> {
  const result = await dbRun(
    'UPDATE forms SET report_generated = 1, report_generated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [formId]
  );
  return (result as any).changes > 0;
}

/**
 * 取得已到達收單截止時間但尚未生成報表的表單
 * 使用 order_deadline（如果存在），否則使用 deadline
 */
async function getFormsReadyForReportSQLite(): Promise<Form[]> {
  const now = new Date().toISOString();
  // 優先使用 order_deadline，如果沒有則使用 deadline
  const rows = await dbAll(
    `SELECT * FROM forms 
     WHERE (
       (order_deadline IS NOT NULL AND order_deadline <= ?) 
       OR 
       (order_deadline IS NULL AND deadline <= ?)
     )
     AND (report_generated IS NULL OR report_generated = 0)
     AND deleted = 0
     ORDER BY COALESCE(order_deadline, deadline) ASC`,
    [now, now]
  ) as any[];
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    fields: JSON.parse(row.fields),
    deadline: row.deadline,
    order_deadline: row.order_deadline || row.deadline, // 如果沒有 order_deadline，使用 deadline
    report_generated: row.report_generated || 0,
    report_generated_at: row.report_generated_at || undefined,
    created_at: row.created_at,
    form_token: row.form_token,
  }));
}

/**
 * 將表單移到垃圾桶（軟刪除）
 */
async function moveFormToTrashSQLite(formId: number): Promise<boolean> {
  try {
    // 確保資料庫已初始化
    await ensureDatabaseInitialized();
    
    // 先檢查欄位是否存在
    const tableInfo = await dbAll("PRAGMA table_info(forms)") as any[];
    const hasDeleted = tableInfo.some((col: any) => col.name === 'deleted');
    const hasDeletedAt = tableInfo.some((col: any) => col.name === 'deleted_at');
    
    // 如果欄位不存在，嘗試新增
    if (!hasDeleted) {
      try {
        await dbRun(`ALTER TABLE forms ADD COLUMN deleted INTEGER DEFAULT 0`);
      } catch (e: any) {
        console.error('新增 deleted 欄位失敗:', e.message);
      }
    }
    
    if (!hasDeletedAt) {
      try {
        await dbRun(`ALTER TABLE forms ADD COLUMN deleted_at TEXT`);
      } catch (e: any) {
        console.error('新增 deleted_at 欄位失敗:', e.message);
      }
    }
    
    // 使用 ISO 格式的時間戳記
    const deletedAt = new Date().toISOString();
    
    // 先嘗試更新兩個欄位
    let result: any = null;
    try {
      result = await dbRun(
        'UPDATE forms SET deleted = 1, deleted_at = ? WHERE id = ?',
        [deletedAt, formId]
      );
    } catch (error: any) {
      // 如果失敗，嘗試只更新 deleted 欄位
      if (error.message && error.message.includes('no such column')) {
        try {
          result = await dbRun(
            'UPDATE forms SET deleted = 1 WHERE id = ?',
            [formId]
          );
        } catch (e2: any) {
          throw new Error(`無法更新表單：${e2.message}`);
        }
      } else {
        throw error;
      }
    }
    
    // 檢查結果
    if (!result) {
      // 手動檢查是否更新成功
      const checkForm = await dbGet('SELECT deleted FROM forms WHERE id = ?', [formId]) as any;
      if (checkForm && checkForm.deleted === 1) {
        return true;
      }
      return false;
    }
    
    const changes = (result as any)?.changes ?? (result?.lastID !== undefined ? 1 : 0);
    
    // 如果 changes 為 0，驗證是否真的更新成功
    if (changes === 0) {
      const checkForm = await dbGet('SELECT deleted FROM forms WHERE id = ?', [formId]) as any;
      if (checkForm && checkForm.deleted === 1) {
        return true;
      }
      console.error('表單更新失敗，deleted 仍為 0');
      return false;
    }
    
    return changes > 0;
  } catch (error: any) {
    console.error('moveFormToTrash 錯誤:', error);
    console.error('錯誤訊息:', error.message);
    throw new Error(`無法更新表單：${error.message}`);
  }
}

/**
 * 從垃圾桶還原表單
 */
async function restoreFormSQLite(formId: number): Promise<boolean> {
  try {
    const result = await dbRun(
      'UPDATE forms SET deleted = 0, deleted_at = NULL WHERE id = ?',
      [formId]
    );
    
    // 檢查結果
    if (!result) {
      // 手動檢查是否更新成功
      const checkForm = await dbGet('SELECT deleted FROM forms WHERE id = ?', [formId]) as any;
      if (checkForm && checkForm.deleted === 0) {
        return true;
      }
      return false;
    }
    
    const changes = (result as any)?.changes ?? (result?.lastID !== undefined ? 1 : 0);
    
    // 如果 changes 為 0，驗證是否真的更新成功
    if (changes === 0) {
      const checkForm = await dbGet('SELECT deleted FROM forms WHERE id = ?', [formId]) as any;
      if (checkForm && checkForm.deleted === 0) {
        return true;
      }
      return false;
    }
    
    return changes > 0;
  } catch (error: any) {
    console.error('restoreForm 錯誤:', error);
    throw new Error(`無法還原表單：${error.message}`);
  }
}

/**
 * 永久刪除表單（同時刪除相關訂單）
 */
async function permanentlyDeleteFormSQLite(formId: number): Promise<{ success: boolean; deletedOrders: number }> {
  // 先計算要刪除的訂單數量
  const orderCount = await dbGet('SELECT COUNT(*) as count FROM orders WHERE form_id = ?', [formId]) as { count: number };
  const deletedOrders = orderCount?.count || 0;

  // 刪除相關訂單
  await dbRun('DELETE FROM orders WHERE form_id = ?', [formId]);

  // 永久刪除表單
  const result = await dbRun('DELETE FROM forms WHERE id = ?', [formId]);

  // 檢查結果
  let success = false;
  if (!result) {
    // 手動檢查是否刪除成功
    const checkForm = await dbGet('SELECT id FROM forms WHERE id = ?', [formId]) as any;
    success = !checkForm; // 如果找不到表單，表示刪除成功
  } else {
    success = ((result as any)?.changes ?? 0) > 0;
  }

  return {
    success,
    deletedOrders,
  };
}

// 訂單相關操作
export interface Order {
  id: number;
  form_id: number;
  customer_name?: string;
  customer_phone?: string;
  order_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  order_token: string;
}

async function createOrderSQLite(
  formId: number,
  orderData: Record<string, any>,
  customerName?: string,
  customerPhone?: string
): Promise<string> {
  const orderToken = generateToken();
  await dbRun(
    'INSERT INTO orders (form_id, customer_name, customer_phone, order_data, order_token) VALUES (?, ?, ?, ?, ?)',
    [formId, customerName || null, customerPhone || null, JSON.stringify(orderData), orderToken]
  );
  return orderToken;
}

async function updateOrderSQLite(orderToken: string, orderData: Record<string, any>): Promise<boolean> {
  try {
  const result = await dbRun(
    'UPDATE orders SET order_data = ?, updated_at = CURRENT_TIMESTAMP WHERE order_token = ?',
    [JSON.stringify(orderData), orderToken]
  );
    
    // 檢查結果
    if (!result) {
      console.error('updateOrder: dbRun 返回 undefined');
      // 手動檢查是否更新成功
      const checkOrder = await dbGet('SELECT order_token FROM orders WHERE order_token = ?', [orderToken]) as any;
      if (checkOrder && checkOrder.order_token === orderToken) {
        // 驗證資料是否真的更新了
        const verifyOrder = await dbGet('SELECT order_data FROM orders WHERE order_token = ?', [orderToken]) as any;
        if (verifyOrder) {
          const currentData = JSON.parse(verifyOrder.order_data);
          // 簡單比較（不完美，但可以作為基本驗證）
          if (JSON.stringify(currentData) === JSON.stringify(orderData)) {
            return true;
          }
        }
      }
      return false;
    }
    
    const changes = (result as any)?.changes ?? (result?.lastID !== undefined ? 1 : 0);
    
    // 如果 changes 為 0，驗證是否真的更新成功
    if (changes === 0) {
      const checkOrder = await dbGet('SELECT order_data FROM orders WHERE order_token = ?', [orderToken]) as any;
      if (checkOrder) {
        const currentData = JSON.parse(checkOrder.order_data);
        if (JSON.stringify(currentData) === JSON.stringify(orderData)) {
          return true;
        }
      }
      console.error('訂單更新失敗');
      return false;
    }
    
    return changes > 0;
  } catch (error: any) {
    console.error('updateOrder 錯誤:', error);
    throw new Error(`無法更新訂單：${error.message}`);
  }
}

async function getOrderByTokenSQLite(token: string): Promise<Order | null> {
  const row = await dbGet('SELECT * FROM orders WHERE order_token = ?', [token]) as any;
  if (!row) return null;
  return {
    id: row.id,
    form_id: row.form_id,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    order_data: JSON.parse(row.order_data),
    created_at: row.created_at,
    updated_at: row.updated_at,
    order_token: row.order_token,
  };
}

async function getOrdersByFormIdSQLite(formId: number): Promise<Order[]> {
  const rows = await dbAll('SELECT * FROM orders WHERE form_id = ? ORDER BY created_at DESC', [formId]) as any[];
  return rows.map(row => ({
    id: row.id,
    form_id: row.form_id,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    order_data: JSON.parse(row.order_data),
    created_at: row.created_at,
    updated_at: row.updated_at,
    order_token: row.order_token,
  }));
}

/**
 * 刪除訂單
 */
async function deleteOrderSQLite(orderToken: string): Promise<boolean> {
  try {
    const result = await dbRun('DELETE FROM orders WHERE order_token = ?', [orderToken]);
    
    if (!result) {
      // 手動檢查是否刪除成功
      const checkOrder = await dbGet('SELECT order_token FROM orders WHERE order_token = ?', [orderToken]) as any;
      return !checkOrder; // 如果找不到訂單，表示刪除成功
    }
    
    const changes = (result as any)?.changes ?? 0;
    return changes > 0;
  } catch (error: any) {
    console.error('deleteOrder 錯誤:', error);
    throw new Error(`無法刪除訂單：${error.message}`);
  }
}

// 系統設定相關操作
async function getSettingSQLite(key: string): Promise<string | null> {
  await ensureDatabaseInitialized();
  const row = await dbGet('SELECT value FROM settings WHERE key = ?', [key]) as any;
  return row ? row.value : null;
}

async function setSettingSQLite(key: string, value: string): Promise<boolean> {
  await ensureDatabaseInitialized();
  try {
    await dbRun(
      'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [key, value]
    );
    return true;
  } catch (error) {
    console.error('設定儲存錯誤:', error);
    return false;
  }
}

// 生成唯一 token
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 初始化資料庫（在第一次使用時調用）
let dbInitialized = false;
export async function ensureDatabaseInitialized() {
  if (DATABASE_TYPE === 'supabase') {
    // Supabase 不需要初始化，表結構已在 SQL Editor 中建立
    return dbModule.ensureDatabaseInitialized();
  }
  
  if (!dbInitialized) {
    if (DATABASE_TYPE === 'supabase') {
      await dbModule.initDatabase();
    } else {
      await initDatabaseSQLite();
    }
    dbInitialized = true;
  }
}

// 根據資料庫類型選擇要導出的函數
// 如果使用 Supabase，從 dbModule 重新導出所有函數
// 如果使用 SQLite，使用上面定義的 SQLite 函數

export const initDatabase = DATABASE_TYPE === 'supabase' 
  ? dbModule.initDatabase 
  : initDatabaseSQLite;

export const createForm = DATABASE_TYPE === 'supabase'
  ? dbModule.createForm
  : createFormSQLite;

export const getFormByToken = DATABASE_TYPE === 'supabase'
  ? dbModule.getFormByToken
  : getFormByTokenSQLite;

export const getFormById = DATABASE_TYPE === 'supabase'
  ? dbModule.getFormById
  : getFormByIdSQLite;

export const getAllForms = DATABASE_TYPE === 'supabase'
  ? dbModule.getAllForms
  : getAllFormsSQLite;

export const getDeletedForms = DATABASE_TYPE === 'supabase'
  ? dbModule.getDeletedForms
  : getDeletedFormsSQLite;

export const updateFormName = DATABASE_TYPE === 'supabase'
  ? dbModule.updateFormName
  : updateFormNameSQLite;

export const markReportGenerated = DATABASE_TYPE === 'supabase'
  ? dbModule.markReportGenerated
  : markReportGeneratedSQLite;

export const getFormsReadyForReport = DATABASE_TYPE === 'supabase'
  ? dbModule.getFormsReadyForReport
  : getFormsReadyForReportSQLite;

export const moveFormToTrash = DATABASE_TYPE === 'supabase'
  ? dbModule.moveFormToTrash
  : moveFormToTrashSQLite;

export const restoreForm = DATABASE_TYPE === 'supabase'
  ? dbModule.restoreForm
  : restoreFormSQLite;

export const permanentlyDeleteForm = DATABASE_TYPE === 'supabase'
  ? dbModule.permanentlyDeleteForm
  : permanentlyDeleteFormSQLite;

export const createOrder = DATABASE_TYPE === 'supabase'
  ? dbModule.createOrder
  : createOrderSQLite;

export const updateOrder = DATABASE_TYPE === 'supabase'
  ? dbModule.updateOrder
  : updateOrderSQLite;

export const getOrderByToken = DATABASE_TYPE === 'supabase'
  ? dbModule.getOrderByToken
  : getOrderByTokenSQLite;

export const getOrdersByFormId = DATABASE_TYPE === 'supabase'
  ? dbModule.getOrdersByFormId
  : getOrdersByFormIdSQLite;

export const deleteOrder = DATABASE_TYPE === 'supabase'
  ? dbModule.deleteOrder
  : deleteOrderSQLite;

export const getSetting = DATABASE_TYPE === 'supabase'
  ? dbModule.getSetting
  : getSettingSQLite;

export const setSetting = DATABASE_TYPE === 'supabase'
  ? dbModule.setSetting
  : setSettingSQLite;

