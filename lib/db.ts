// ??????????????????????
const DATABASE_TYPE = process.env.DATABASE_TYPE || 'sqlite';

// ????????Supabase?????Supabase ???
let dbModule: any;
if (DATABASE_TYPE === 'supabase') {
  try {
    dbModule = require('./db-supabase');
  } catch (error) {
        console.error('Failed to load Supabase module');
    throw error;
  }
}

// SQLite ??????????????
// ??? SQLite ??????????????????Vercel (Supabase) ????????
let sqlite3: any;
let promisify: any;
let path: any;
let fs: any;
let db: any;
let dbPath: string = '';
let dbRun: (sql: string, params?: any[]) => Promise<any> = async () => {
  throw new Error('dbRun 未初始化');
};
let dbGet: (sql: string, params?: any[]) => Promise<any> = async () => {
  throw new Error('dbGet 未初始化');
};
let dbAll: (sql: string, params?: any[]) => Promise<any> = async () => {
  throw new Error('dbAll 未初始化');
};

if (DATABASE_TYPE === 'sqlite') {
  // ???????SQLite ???????????? Supabase ??????????
  sqlite3 = require('sqlite3');
  promisify = require('util').promisify;
  path = require('path');
  fs = require('fs');

  dbPath = path.join(process.cwd(), 'orders.db');
  if (!dbPath) {
    throw new Error('無法取得 SQLite 資料庫檔案路徑');
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '');
  }

  db = new sqlite3.Database(dbPath);

  // ??callback ???????????Promise
  dbRun = promisify(db.run.bind(db)) as (sql: string, params?: any[]) => Promise<any>;
  dbGet = promisify(db.get.bind(db)) as (sql: string, params?: any[]) => Promise<any>;
  dbAll = promisify(db.all.bind(db)) as (sql: string, params?: any[]) => Promise<any>;
}

// ????????async function initDatabaseSQLite() {
  // ???????  await dbRun(`
  //   CREATE TABLE IF NOT EXISTS forms (
  //     id INTEGER PRIMARY KEY AUTOINCREMENT,
  //     name TEXT NOT NULL,
  //     fields TEXT NOT NULL,
  //     deadline TEXT NOT NULL,
  //     order_deadline TEXT,
  //     order_limit INTEGER,
  //     pickup_time TEXT,
  //     report_generated INTEGER DEFAULT 0,
  //     report_generated_at TEXT,
  //     deleted INTEGER DEFAULT 0,
  //     deleted_at TEXT,
  //     created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  //     form_token TEXT UNIQUE NOT NULL
  //   )
  // `);
  
  // ????????????????????
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN order_deadline TEXT`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN order_limit INTEGER`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN pickup_time TEXT`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN report_generated INTEGER DEFAULT 0`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN report_generated_at TEXT`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN deleted INTEGER DEFAULT 0`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN deleted_at TEXT`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN facebook_comment_url TEXT`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN line_comment_url TEXT`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN facebook_post_url TEXT`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN facebook_post_author TEXT`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN facebook_keywords TEXT`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN facebook_auto_monitor INTEGER DEFAULT 0`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN facebook_reply_message TEXT`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN line_post_author TEXT`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN post_deadline_reply_message TEXT`);
  } catch (e: any) {
    // column may already exist
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN line_custom_identifier TEXT`);
  } catch (e: any) {
    // column may already exist
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN line_use_custom_identifier INTEGER DEFAULT 0`);
  } catch (e: any) {
    // column may already exist
  }

  // ????  await dbRun(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL,
      customer_name TEXT,
      customer_phone TEXT,
      order_source TEXT,
      facebook_comment_id TEXT,
      facebook_pickup_notified_at TEXT,
      order_data TEXT NOT NULL,
      items_summary TEXT,
      client_ip TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      order_token TEXT UNIQUE NOT NULL,
      FOREIGN KEY (form_id) REFERENCES forms(id)
    )
  `);
  
  // ????????????????????
  try {
    await dbRun(`ALTER TABLE orders ADD COLUMN client_ip TEXT`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE orders ADD COLUMN user_agent TEXT`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE orders ADD COLUMN items_summary TEXT`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE orders ADD COLUMN order_source TEXT`);
  } catch (e: any) {
    // ??????????????????
  }
  try {
    await dbRun(`ALTER TABLE orders ADD COLUMN facebook_comment_id TEXT`);
  } catch (e: any) {
    // column may already exist
  }
  try {
    await dbRun(`ALTER TABLE orders ADD COLUMN facebook_pickup_notified_at TEXT`);
  } catch (e: any) {
    // column may already exist
  }

  // ???????  await dbRun(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ????????????????????????
  await dbRun(`
    CREATE TABLE IF NOT EXISTS reserved_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL,
      session_id TEXT NOT NULL,
      order_number INTEGER NOT NULL,
      reserved_at TEXT DEFAULT CURRENT_TIMESTAMP,
      order_token TEXT,
      FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
      UNIQUE(form_id, session_id)
    )
  `);

  // LINE ???????????????????????????  await dbRun(`
    CREATE TABLE IF NOT EXISTS line_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL,
      group_id TEXT NOT NULL,
      message_id TEXT,
      sender_name TEXT,
      post_content TEXT,
      posted_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    )
  `);
  
  // ?????
  try {
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_line_posts_form_id ON line_posts(form_id)`);
  } catch (e: any) {}
  try {
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_line_posts_group_id ON line_posts(group_id)`);
  } catch (e: any) {}
  try {
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_line_posts_posted_at ON line_posts(posted_at)`);
  } catch (e: any) {}
  
  // ?????
  try {
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_reserved_orders_form_id ON reserved_orders(form_id)`);
  } catch (e: any) {}
  try {
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_reserved_orders_session_id ON reserved_orders(session_id)`);
  } catch (e: any) {}
  try {
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_reserved_orders_reserved_at ON reserved_orders(reserved_at)`);
  } catch (e: any) {}
}

// ?????????
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'costco';
  required: boolean;
  options?: string[];
  price?: number;
}

export interface LineSale {
  id: number;
  form_id: number;
  group_id: string;
  identifier?: string | null;
  deadline?: string | null;
  end_announced?: boolean;
  first_warning_sent?: boolean;
}

export interface Form {
  id: number;
  name: string;
  fields: FormField[];
  deadline: string;
  order_deadline?: string;
  order_limit?: number;
  pickup_time?: string;
  report_generated?: number;
  report_generated_at?: string;
  deleted?: number;
  deleted_at?: string;
  created_at: string;
  form_token: string;
  facebook_comment_url?: string;
  line_comment_url?: string;
  facebook_post_url?: string;
  facebook_post_author?: string;
  facebook_keywords?: string;
  facebook_auto_monitor?: number;
  facebook_reply_message?: string;
  line_post_author?: string;
  post_deadline_reply_message?: string;
  line_custom_identifier?: string;
  line_use_custom_identifier?: boolean;
}

function mapFormRow(row: any): Form {
  return {
    id: row.id,
    name: row.name,
    fields: typeof row.fields === 'string' ? JSON.parse(row.fields) : row.fields,
    deadline: row.deadline,
    order_deadline: row.order_deadline || undefined,
    order_limit:
      row.order_limit !== null && row.order_limit !== undefined ? row.order_limit : undefined,
    pickup_time: row.pickup_time || undefined,
    report_generated: row.report_generated || 0,
    report_generated_at: row.report_generated_at || undefined,
    deleted: row.deleted || 0,
    deleted_at: row.deleted_at || undefined,
    created_at: row.created_at,
    form_token: row.form_token,
    facebook_comment_url: row.facebook_comment_url || undefined,
    line_comment_url: row.line_comment_url || undefined,
    facebook_post_url: row.facebook_post_url || undefined,
    facebook_post_author: row.facebook_post_author || undefined,
    facebook_keywords: row.facebook_keywords || undefined,
    facebook_auto_monitor: row.facebook_auto_monitor || 0,
    facebook_reply_message: row.facebook_reply_message || undefined,
    line_post_author: row.line_post_author || undefined,
    post_deadline_reply_message: row.post_deadline_reply_message || undefined,
    line_custom_identifier: row.line_custom_identifier || undefined,
    line_use_custom_identifier:
      row.line_use_custom_identifier === null || row.line_use_custom_identifier === undefined
        ? undefined
        : row.line_use_custom_identifier === true ||
          row.line_use_custom_identifier === 1 ||
          row.line_use_custom_identifier === '1',
  };
}

function mapLineSaleRow(row: any): LineSale {
  return {
    id: row.id,
    form_id: row.form_id,
    group_id: row.group_id,
    identifier: row.identifier || null,
    deadline: row.deadline || null,
    end_announced:
      row.end_announced === true ||
      row.end_announced === 1 ||
      row.end_announced === '1',
    first_warning_sent:
      row.first_warning_sent === true ||
      row.first_warning_sent === 1 ||
      row.first_warning_sent === '1',
  };
}

async function createFormSQLite(
  name: string, 
  fields: FormField[], 
  deadline: string,
  orderDeadline?: string,
  orderLimit?: number,
  pickupTime?: string,
  facebookCommentUrl?: string,
  lineCommentUrl?: string,
  facebookPostUrl?: string,
  facebookPostAuthor?: string,
  facebookKeywords?: string,
  facebookAutoMonitor?: number,
  facebookReplyMessage?: string,
  linePostAuthor?: string,
  postDeadlineReplyMessage?: string,
  lineCustomIdentifier?: string,
  lineUseCustomIdentifier?: boolean
): Promise<number> {
  const formToken = generateToken();
  const trimmedCustomIdentifier = (lineCustomIdentifier || '').trim();
  const useCustomIdentifier = lineUseCustomIdentifier ? 1 : 0;
  const storedCustomIdentifier =
    useCustomIdentifier && trimmedCustomIdentifier.length > 0
      ? trimmedCustomIdentifier
      : null;
  const storedPostDeadlineReply =
    postDeadlineReplyMessage && postDeadlineReplyMessage.trim()
      ? postDeadlineReplyMessage.trim()
      : null;
  await dbRun(
    'INSERT INTO forms (name, fields, deadline, order_deadline, order_limit, pickup_time, facebook_comment_url, line_comment_url, facebook_post_url, facebook_post_author, facebook_keywords, facebook_auto_monitor, facebook_reply_message, line_post_author, post_deadline_reply_message, line_custom_identifier, line_use_custom_identifier, form_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      name,
      JSON.stringify(fields),
      deadline,
      orderDeadline || null,
      orderLimit || null,
      pickupTime || null,
      facebookCommentUrl || null,
      lineCommentUrl || null,
      facebookPostUrl || null,
      facebookPostAuthor || null,
      facebookKeywords || null,
      facebookAutoMonitor || 0,
      facebookReplyMessage || null,
      linePostAuthor || null,
      storedPostDeadlineReply,
      storedCustomIdentifier,
      useCustomIdentifier,
      formToken,
    ]
  );
  const result = await dbGet('SELECT last_insert_rowid() as id') as { id: number };
  return result.id;
}

async function getFormByTokenSQLite(token: string): Promise<Form | null> {
  const row = await dbGet('SELECT * FROM forms WHERE form_token = ? AND (deleted IS NULL OR deleted = 0)', [token]) as any;
  if (!row) return null;
  return mapFormRow(row);
}

async function getFormByIdSQLite(id: number, includeDeleted: boolean = false): Promise<Form | null> {
  const query = includeDeleted 
    ? 'SELECT * FROM forms WHERE id = ?'
    : 'SELECT * FROM forms WHERE id = ? AND (deleted IS NULL OR deleted = 0)';
  const row = await dbGet(query, [id]) as any;
  if (!row) return null;
  return mapFormRow(row);
}

async function getAllFormsSQLite(includeDeleted: boolean = false): Promise<Form[]> {
  const query = includeDeleted 
    ? 'SELECT * FROM forms ORDER BY created_at DESC'
    : 'SELECT * FROM forms WHERE deleted IS NULL OR deleted = 0 ORDER BY created_at DESC';
  const rows = await dbAll(query) as any[];
  return rows.map(mapFormRow);
}

/**
 * ?????????????? */
async function getDeletedFormsSQLite(): Promise<Form[]> {
  const rows = await dbAll('SELECT * FROM forms WHERE deleted = 1 ORDER BY deleted_at DESC') as any[];
  return rows.map(mapFormRow);
}

/**
 * ??????????
 */
async function updateFormSQLite(
  formId: number,
  name: string,
  fields: FormField[],
  deadline: string,
  orderDeadline?: string,
  orderLimit?: number,
  pickupTime?: string,
  facebookCommentUrl?: string,
  lineCommentUrl?: string,
  facebookPostUrl?: string,
  facebookPostAuthor?: string,
  facebookKeywords?: string,
  facebookAutoMonitor?: number,
  facebookReplyMessage?: string,
  linePostAuthor?: string,
  postDeadlineReplyMessage?: string,
  lineCustomIdentifier?: string,
  lineUseCustomIdentifier?: boolean
): Promise<boolean> {
  const trimmedCustomIdentifier = (lineCustomIdentifier || '').trim();
  const useCustomIdentifier = lineUseCustomIdentifier ? 1 : 0;
  const storedCustomIdentifier =
    useCustomIdentifier && trimmedCustomIdentifier.length > 0
      ? trimmedCustomIdentifier
      : null;
  const storedPostDeadlineReply =
    postDeadlineReplyMessage && postDeadlineReplyMessage.trim()
      ? postDeadlineReplyMessage.trim()
      : null;
  await dbRun(
    'UPDATE forms SET name = ?, fields = ?, deadline = ?, order_deadline = ?, order_limit = ?, pickup_time = ?, facebook_comment_url = ?, line_comment_url = ?, facebook_post_url = ?, facebook_post_author = ?, facebook_keywords = ?, facebook_auto_monitor = ?, facebook_reply_message = ?, line_post_author = ?, post_deadline_reply_message = ?, line_custom_identifier = ?, line_use_custom_identifier = ? WHERE id = ?',
    [
      name,
      JSON.stringify(fields),
      deadline,
      orderDeadline || null,
      orderLimit || null,
      pickupTime || null,
      facebookCommentUrl || null,
      lineCommentUrl || null,
      facebookPostUrl || null,
      facebookPostAuthor || null,
      facebookKeywords || null,
      facebookAutoMonitor || 0,
      facebookReplyMessage || null,
      linePostAuthor || null,
      storedPostDeadlineReply,
      storedCustomIdentifier,
      useCustomIdentifier,
      formId,
    ]
  );
  return true;
}

async function updateFormNameSQLite(formId: number, newName: string): Promise<boolean> {
  const result = await dbRun(
    'UPDATE forms SET name = ? WHERE id = ?',
    [newName, formId]
  );
  return (result as any)?.changes > 0 || (result?.lastID !== undefined);
}

/**
 * ???????????? */
async function markReportGeneratedSQLite(formId: number): Promise<boolean> {
  const result = await dbRun(
    'UPDATE forms SET report_generated = 1, report_generated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [formId]
  );
  return (result as any).changes > 0;
}

/**
 * ??????????????????????????????? * ????order_deadline?????????????????deadline
 */
async function getFormsReadyForReportSQLite(): Promise<Form[]> {
  const now = new Date().toISOString();
  // ???????order_deadline????????????deadline
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
  
  return rows.map(row => {
    const form = mapFormRow(row);
    form.order_deadline = row.order_deadline || row.deadline;
    return form;
  });
}

/**
 * ???????????????????? */
async function moveFormToTrashSQLite(formId: number): Promise<boolean> {
  try {
    // ??????????????    await ensureDatabaseInitialized();
    
    // ???????????????    const tableInfo = await dbAll("PRAGMA table_info(forms)") as any[];
    const hasDeleted = tableInfo.some((col: any) => col.name === 'deleted');
    const hasDeletedAt = tableInfo.some((col: any) => col.name === 'deleted_at');
    
    // ???????????????????
    if (!hasDeleted) {
      try {
        await dbRun(`ALTER TABLE forms ADD COLUMN deleted INTEGER DEFAULT 0`);
      } catch (e: any) {
            console.error('Failed to load Supabase module');
      }
    }
    
    if (!hasDeletedAt) {
      try {
        await dbRun(`ALTER TABLE forms ADD COLUMN deleted_at TEXT`);
      } catch (e: any) {
            console.error('Failed to load Supabase module');
      }
    }
    
    // ????ISO ???????????    const deletedAt = new Date().toISOString();
    
    // ???????????????    let result: any = null;
    try {
      result = await dbRun(
        'UPDATE forms SET deleted = 1, deleted_at = ? WHERE id = ?',
        [deletedAt, formId]
      );
    } catch (error: any) {
      // ??????????????????? deleted ????
      if (error.message && error.message.includes('no such column')) {
        try {
          result = await dbRun(
            'UPDATE forms SET deleted = 1 WHERE id = ?',
            [formId]
          );
        } catch (e2: any) {
          throw new Error(`????????????{e2.message}`);
        }
      } else {
        throw error;
      }
    }
    
    // ????
    if (!result) {
      // ???????????????
      const checkForm = await dbGet('SELECT deleted FROM forms WHERE id = ?', [formId]) as any;
      if (checkForm && checkForm.deleted === 1) {
        return true;
      }
      return false;
    }
    
    const changes = (result as any)?.changes ?? (result?.lastID !== undefined ? 1 : 0);
    
    // ???? changes ??0??????????????????    if (changes === 0) {
      const checkForm = await dbGet('SELECT deleted FROM forms WHERE id = ?', [formId]) as any;
      if (checkForm && checkForm.deleted === 1) {
        return true;
      }
          console.error('Failed to load Supabase module');
      return false;
    }
    
    return changes > 0;
  } catch (error: any) {
        console.error('Failed to load Supabase module');
        console.error('Failed to load Supabase module');
    throw new Error(`????????????{error.message}`);
  }
}

/**
 * ???????????? */
async function restoreFormSQLite(formId: number): Promise<boolean> {
  try {
    const result = await dbRun(
      'UPDATE forms SET deleted = 0, deleted_at = NULL WHERE id = ?',
      [formId]
    );
    
    // ????
    if (!result) {
      // ???????????????
      const checkForm = await dbGet('SELECT deleted FROM forms WHERE id = ?', [formId]) as any;
      if (checkForm && checkForm.deleted === 0) {
        return true;
      }
      return false;
    }
    
    const changes = (result as any)?.changes ?? (result?.lastID !== undefined ? 1 : 0);
    
    // ???? changes ??0??????????????????    if (changes === 0) {
      const checkForm = await dbGet('SELECT deleted FROM forms WHERE id = ?', [formId]) as any;
      if (checkForm && checkForm.deleted === 0) {
        return true;
      }
      return false;
    }
    
    return changes > 0;
  } catch (error: any) {
        console.error('Failed to load Supabase module');
    throw new Error(`???????????{error.message}`);
  }
}

/**
 * ???????????????????????
 */
async function permanentlyDeleteFormSQLite(formId: number): Promise<{ success: boolean; deletedOrders: number }> {
  // ?????????????????  const orderCount = await dbGet('SELECT COUNT(*) as count FROM orders WHERE form_id = ?', [formId]) as { count: number };
  const deletedOrders = orderCount?.count || 0;

  // ??????????  await dbRun('DELETE FROM orders WHERE form_id = ?', [formId]);

  // ??????????  const result = await dbRun('DELETE FROM forms WHERE id = ?', [formId]);

  // ????
  let success = false;
  if (!result) {
    // ???????????????
    const checkForm = await dbGet('SELECT id FROM forms WHERE id = ?', [formId]) as any;
    success = !checkForm; // ???????????????????????
  } else {
    success = ((result as any)?.changes ?? 0) > 0;
  }

  return {
    success,
    deletedOrders,
  };
}

// ????????
export interface Order {
  id: number;
  form_id: number;
  customer_name?: string;
  customer_phone?: string;
  order_source?: string;
  facebook_comment_id?: string;
  facebook_pickup_notified_at?: string | null;
  order_data: Record<string, any>;
  items_summary?: Array<{ name: string; quantity: number }>; // ??????????????????????
  client_ip?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  order_token: string;
}

// ???????????????????????????????
function extractItemsSummary(form: Form, orderData: Record<string, any>): Array<{ name: string; quantity: number }> | null {
  const items: Array<{ name: string; quantity: number }> = [];
  
  // ????????????????????????????????
  for (const field of form.fields) {
    if (field.type === 'costco') {
      const value = orderData[field.name];
      if (Array.isArray(value)) {
        // ????????????????        for (const item of value) {
          if (item && item.name && item.name.trim()) {
            const quantity = parseInt(String(item.quantity || 0), 10) || 0;
            if (quantity > 0) {
              items.push({
                name: item.name.trim(),
                quantity: quantity
              });
            }
          }
        }
      }
    }
  }
  
  return items.length > 0 ? items : null;
}

async function createOrderSQLite(
  formId: number,
  orderData: Record<string, any>,
  customerName?: string,
  customerPhone?: string,
  clientIp?: string,
  userAgent?: string,
  orderSource?: string,
  form?: Form,
  facebookCommentId?: string
): Promise<string> {
  const orderToken = generateToken();
  
  // ?????????  let itemsSummary: string | null = null;
  if (form) {
    const items = extractItemsSummary(form, orderData);
    if (items && items.length > 0) {
      itemsSummary = JSON.stringify(items);
    }
  }
  
  await dbRun(
    'INSERT INTO orders (form_id, customer_name, customer_phone, order_source, facebook_comment_id, order_data, items_summary, client_ip, user_agent, order_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      formId,
      customerName || null,
      customerPhone || null,
      orderSource || null,
      facebookCommentId || null,
      JSON.stringify(orderData),
      itemsSummary,
      clientIp || null,
      userAgent || null,
      orderToken,
    ]
  );
  return orderToken;
}

async function updateOrderSQLite(orderToken: string, orderData: Record<string, any>): Promise<boolean> {
  try {
  const result = await dbRun(
    'UPDATE orders SET order_data = ?, updated_at = CURRENT_TIMESTAMP WHERE order_token = ?',
    [JSON.stringify(orderData), orderToken]
  );
    
    // ????
    if (!result) {
          console.error('Failed to load Supabase module');
      // ???????????????
      const checkOrder = await dbGet('SELECT order_token FROM orders WHERE order_token = ?', [orderToken]) as any;
      if (checkOrder && checkOrder.order_token === orderToken) {
        // ?????????????????        const verifyOrder = await dbGet('SELECT order_data FROM orders WHERE order_token = ?', [orderToken]) as any;
        if (verifyOrder) {
          const currentData = JSON.parse(verifyOrder.order_data);
          // ????????????????????????????          if (JSON.stringify(currentData) === JSON.stringify(orderData)) {
            return true;
          }
        }
      }
      return false;
    }
    
    const changes = (result as any)?.changes ?? (result?.lastID !== undefined ? 1 : 0);
    
    // ???? changes ??0??????????????????    if (changes === 0) {
      const checkOrder = await dbGet('SELECT order_data FROM orders WHERE order_token = ?', [orderToken]) as any;
      if (checkOrder) {
        const currentData = JSON.parse(checkOrder.order_data);
        if (JSON.stringify(currentData) === JSON.stringify(orderData)) {
          return true;
        }
      }
          console.error('Failed to load Supabase module');
      return false;
    }
    
    return changes > 0;
  } catch (error: any) {
        console.error('Failed to load Supabase module');
    throw new Error(`???????????{error.message}`);
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
    order_source: row.order_source || undefined,
    facebook_comment_id: row.facebook_comment_id || undefined,
    facebook_pickup_notified_at: row.facebook_pickup_notified_at || undefined,
    order_data: JSON.parse(row.order_data),
    items_summary: row.items_summary ? JSON.parse(row.items_summary) : undefined,
    client_ip: row.client_ip || undefined,
    user_agent: row.user_agent || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    order_token: row.order_token,
  };
}

async function getOrdersByFormIdSQLite(formId: number): Promise<Order[]> {
  const rows = await dbAll('SELECT * FROM orders WHERE form_id = ? ORDER BY created_at ASC', [formId]) as any[];
  return rows.map(row => ({
    id: row.id,
    form_id: row.form_id,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    order_source: row.order_source || undefined,
    facebook_comment_id: row.facebook_comment_id || undefined,
    facebook_pickup_notified_at: row.facebook_pickup_notified_at || undefined,
    order_data: JSON.parse(row.order_data),
    items_summary: row.items_summary ? JSON.parse(row.items_summary) : undefined,
    client_ip: row.client_ip || undefined,
    user_agent: row.user_agent || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    order_token: row.order_token,
  }));
}

async function getOrdersByIdsSQLite(orderIds: number[]): Promise<Order[]> {
  if (!orderIds || orderIds.length === 0) return [];
  const placeholders = orderIds.map(() => '?').join(',');
  const rows = await dbAll(
    `SELECT * FROM orders WHERE id IN (${placeholders})`,
    orderIds
  ) as any[];
  return rows.map(row => ({
    id: row.id,
    form_id: row.form_id,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    order_source: row.order_source || undefined,
    facebook_comment_id: row.facebook_comment_id || undefined,
    facebook_pickup_notified_at: row.facebook_pickup_notified_at || undefined,
    order_data: JSON.parse(row.order_data),
    items_summary: row.items_summary ? JSON.parse(row.items_summary) : undefined,
    client_ip: row.client_ip || undefined,
    user_agent: row.user_agent || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    order_token: row.order_token,
  }));
}

async function markFacebookPickupNotifiedSQLite(orderId: number, notifiedAt: string): Promise<void> {
  await dbRun(
    'UPDATE orders SET facebook_pickup_notified_at = ? WHERE id = ?',
    [notifiedAt, orderId]
  );
}

/**
 * ??????? */
async function deleteOrderSQLite(orderToken: string): Promise<boolean> {
  try {
    const result = await dbRun('DELETE FROM orders WHERE order_token = ?', [orderToken]);
    
    if (!result) {
      // ???????????????
      const checkOrder = await dbGet('SELECT order_token FROM orders WHERE order_token = ?', [orderToken]) as any;
      return !checkOrder; // ????????????????????????
    }
    
    const changes = (result as any)?.changes ?? 0;
    return changes > 0;
  } catch (error: any) {
        console.error('Failed to load Supabase module');
    throw new Error(`???????????{error.message}`);
  }
}

// ???????????
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
        console.error('Failed to load Supabase module');
    return false;
  }
}

// ????? token
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// ?? session ID
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// ??????????QLite??async function reserveOrderNumberSQLite(formId: number, sessionId: string): Promise<{ success: boolean; orderNumber?: number; error?: string }> {
  try {
    await ensureDatabaseInitialized();
    
    // ??????????5?????    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await dbRun(
      'DELETE FROM reserved_orders WHERE reserved_at < ? AND order_token IS NULL',
      [fiveMinutesAgo]
    );

    // ????????????
    const existing = await dbGet(
      'SELECT * FROM reserved_orders WHERE form_id = ? AND session_id = ?',
      [formId, sessionId]
    ) as any;

    if (existing) {
      // ???????????      const reservedAt = new Date(existing.reserved_at);
      const now = new Date();
      if (now.getTime() - reservedAt.getTime() > 5 * 60 * 1000 && !existing.order_token) {
        // ?????????????????        await dbRun('DELETE FROM reserved_orders WHERE id = ?', [existing.id]);
      } else {
        // ??????????
        return { success: true, orderNumber: existing.order_number };
      }
    }

    // ?????????????????????????    const orders = await dbAll('SELECT id FROM orders WHERE form_id = ?', [formId]) as any[];
    const reserved = await dbAll(
      'SELECT order_number FROM reserved_orders WHERE form_id = ? AND (order_token IS NOT NULL OR reserved_at > ?)',
      [formId, fiveMinutesAgo]
    ) as any[];

    // ?????????????????    const usedNumbers = new Set<number>();
    reserved.forEach((r: any) => {
      usedNumbers.add(r.order_number);
    });

    // ??????????????????    let orderNumber = 1;
    while (usedNumbers.has(orderNumber)) {
      orderNumber++;
    }

    // ?????????????INSERT OR REPLACE ???????????    await dbRun(
      'INSERT OR REPLACE INTO reserved_orders (form_id, session_id, order_number, reserved_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [formId, sessionId, orderNumber]
    );

    return { success: true, orderNumber };
  } catch (error: any) {
        console.error('Failed to load Supabase module');
    return { success: false, error: error.message };
  }
}

// ????????????????????
async function confirmReservedOrderSQLite(formId: number, sessionId: string, orderToken: string): Promise<boolean> {
  try {
    await ensureDatabaseInitialized();
    await dbRun(
      'UPDATE reserved_orders SET order_token = ? WHERE form_id = ? AND session_id = ?',
      [orderToken, formId, sessionId]
    );
    return true;
  } catch (error) {
        console.error('Failed to load Supabase module');
    return false;
  }
}

// ????????????
async function getReservedOrderNumberSQLite(formId: number, sessionId: string): Promise<number | null> {
  try {
    await ensureDatabaseInitialized();
    const result = await dbGet(
      'SELECT order_number FROM reserved_orders WHERE form_id = ? AND session_id = ? AND order_token IS NULL',
      [formId, sessionId]
    ) as any;
    return result ? result.order_number : null;
  } catch (error) {
        console.error('Failed to load Supabase module');
    return null;
  }
}

// ?????????
async function cleanupExpiredReservationsSQLite(): Promise<void> {
  try {
    await ensureDatabaseInitialized();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await dbRun(
      'DELETE FROM reserved_orders WHERE reserved_at < ? AND order_token IS NULL',
      [fiveMinutesAgo]
    );
  } catch (error) {
        console.error('Failed to load Supabase module');
  }
}

// LINE ?????????????QLite ?????async function recordLinePostSQLite(
  formId: number,
  groupId: string,
  messageId: string | null,
  senderName: string,
  postContent: string | null
): Promise<void> {
  try {
    await ensureDatabaseInitialized();
    // ???? line_posts ??????    await dbRun(`
      CREATE TABLE IF NOT EXISTS line_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        form_id INTEGER NOT NULL,
        group_id TEXT NOT NULL,
        message_id TEXT,
        sender_name TEXT NOT NULL,
        post_content TEXT,
        posted_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
      )
    `);
    
    await dbRun(
      'INSERT INTO line_posts (form_id, group_id, message_id, sender_name, post_content) VALUES (?, ?, ?, ?, ?)',
      [formId, groupId, messageId, senderName, postContent]
    );
  } catch (error: any) {
        console.error('Failed to load Supabase module');
    throw new Error(`?? LINE ?????????{error.message}`);
  }
}

async function getRecentLinePostsSQLite(
  groupId: string,
  limit: number = 10
): Promise<Array<{ formId: number; senderName: string; postContent: string; postedAt: string }>> {
  try {
    await ensureDatabaseInitialized();
    // ???? line_posts ??????    await dbRun(`
      CREATE TABLE IF NOT EXISTS line_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        form_id INTEGER NOT NULL,
        group_id TEXT NOT NULL,
        message_id TEXT,
        sender_name TEXT NOT NULL,
        post_content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
      )
    `);
    
    const rows = await dbAll(
      'SELECT form_id, sender_name, post_content, created_at FROM line_posts WHERE group_id = ? ORDER BY created_at DESC LIMIT ?',
      [groupId, limit]
    ) as any[];

    return rows.map((row: any) => ({
      formId: row.form_id,
      senderName: row.sender_name || '',
      postContent: row.post_content || '',
      postedAt: row.created_at,
    }));
  } catch (error: any) {
        console.error('Failed to load Supabase module');
    return [];
  }
}

async function getActiveLineSalesSQLite(): Promise<LineSale[]> {
  await ensureDatabaseInitialized();
  await dbRun(`
    CREATE TABLE IF NOT EXISTS line_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL,
      group_id TEXT NOT NULL,
      message_id TEXT,
      sender_name TEXT NOT NULL,
      post_content TEXT,
      identifier TEXT,
      deadline TEXT,
      end_announced INTEGER DEFAULT 0,
      first_warning_sent INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    )
  `);
  try { await dbRun('ALTER TABLE line_posts ADD COLUMN identifier TEXT'); } catch (e: any) {}
  try { await dbRun('ALTER TABLE line_posts ADD COLUMN deadline TEXT'); } catch (e: any) {}
  try { await dbRun('ALTER TABLE line_posts ADD COLUMN end_announced INTEGER DEFAULT 0'); } catch (e: any) {}
  try { await dbRun('ALTER TABLE line_posts ADD COLUMN first_warning_sent INTEGER DEFAULT 0'); } catch (e: any) {}

  const rows = await dbAll(
    'SELECT * FROM line_posts WHERE deadline IS NOT NULL AND end_announced = 0 AND datetime(deadline) <= datetime("now")'
  ) as any[];
  return rows.map(mapLineSaleRow);
}

async function recordLinePostSQLite(
  formId: number,
  groupId: string,
  messageId: string | null,
  senderName: string,
  postContent: string | null,
  identifier?: string | null,
  deadline?: string | null
): Promise<void> {
  try {
    await ensureDatabaseInitialized();
    await dbRun(`
      CREATE TABLE IF NOT EXISTS line_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        form_id INTEGER NOT NULL,
        group_id TEXT NOT NULL,
        message_id TEXT,
        sender_name TEXT NOT NULL,
        post_content TEXT,
        identifier TEXT,
        deadline TEXT,
        end_announced INTEGER DEFAULT 0,
        first_warning_sent INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
      )
    `);
    try { await dbRun('ALTER TABLE line_posts ADD COLUMN identifier TEXT'); } catch (e: any) {}
    try { await dbRun('ALTER TABLE line_posts ADD COLUMN deadline TEXT'); } catch (e: any) {}
    try { await dbRun('ALTER TABLE line_posts ADD COLUMN end_announced INTEGER DEFAULT 0'); } catch (e: any) {}
    try { await dbRun('ALTER TABLE line_posts ADD COLUMN first_warning_sent INTEGER DEFAULT 0'); } catch (e: any) {}

    await dbRun(
      'INSERT INTO line_posts (form_id, group_id, message_id, sender_name, post_content, identifier, deadline, end_announced, first_warning_sent) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)',
      [
        formId,
        groupId,
        messageId,
        senderName,
        postContent,
        identifier || null,
        deadline || null,
      ]
    );
  } catch (error: any) {
        console.error('Failed to load Supabase module');
    throw new Error(`記錄 LINE 賣文失敗：${error.message}`);
  }
}

async function getLatestLineSaleSQLite(groupId: string, formId: number): Promise<LineSale | null> {
  const row = await dbGet(
    'SELECT * FROM line_posts WHERE group_id = ? AND form_id = ? ORDER BY created_at DESC LIMIT 1',
    [groupId, formId]
  ) as any;
  if (!row) return null;
  return mapLineSaleRow(row);
}

async function markLineSaleEndAnnouncedSQLite(saleId: number): Promise<void> {
  await dbRun('UPDATE line_posts SET end_announced = 1 WHERE id = ?', [saleId]);
}

async function markLineSaleFirstWarningSentSQLite(saleId: number): Promise<void> {
  await dbRun('UPDATE line_posts SET first_warning_sent = 1 WHERE id = ?', [saleId]);
}

// ??????????????????????????let dbInitialized = false;
export async function ensureDatabaseInitialized() {
  if (DATABASE_TYPE === 'supabase') {
    // Supabase ???????????????????SQL Editor ?????    // ?????????dbModule ??????    if (!dbModule) {
      throw new Error('Supabase ??????????????????????????????');
    }
    return dbModule.ensureDatabaseInitialized();
  }
  
  // SQLite ????
  if (!dbInitialized) {
    await initDatabaseSQLite();
    dbInitialized = true;
  }
}

// ??????????????????????????// ????????Supabase??? dbModule ??????????????// ????????SQLite???????????? SQLite ????
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

export const updateForm = DATABASE_TYPE === 'supabase'
  ? dbModule.updateForm
  : updateFormSQLite;

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

export const getOrdersByIds = DATABASE_TYPE === 'supabase'
  ? dbModule.getOrdersByIds
  : getOrdersByIdsSQLite;

export const deleteOrder = DATABASE_TYPE === 'supabase'
  ? dbModule.deleteOrder
  : deleteOrderSQLite;

export const markFacebookPickupNotified = DATABASE_TYPE === 'supabase'
  ? dbModule.markFacebookPickupNotified
  : markFacebookPickupNotifiedSQLite;

export const getLatestLineSale = DATABASE_TYPE === 'supabase'
  ? dbModule.getLatestLineSale
  : getLatestLineSaleSQLite;

export const markLineSaleEndAnnounced = DATABASE_TYPE === 'supabase'
  ? dbModule.markLineSaleEndAnnounced
  : markLineSaleEndAnnouncedSQLite;

export const markLineSaleFirstWarningSent = DATABASE_TYPE === 'supabase'
  ? dbModule.markLineSaleFirstWarningSent
  : markLineSaleFirstWarningSentSQLite;

export const getSetting = DATABASE_TYPE === 'supabase'
  ? dbModule.getSetting
  : getSettingSQLite;

export const setSetting = DATABASE_TYPE === 'supabase'
  ? dbModule.setSetting
  : setSettingSQLite;

// ???????????????export const reserveOrderNumber = DATABASE_TYPE === 'supabase'
  ? dbModule.reserveOrderNumber
  : reserveOrderNumberSQLite;

export const confirmReservedOrder = DATABASE_TYPE === 'supabase'
  ? dbModule.confirmReservedOrder
  : confirmReservedOrderSQLite;

export const getReservedOrderNumber = DATABASE_TYPE === 'supabase'
  ? dbModule.getReservedOrderNumber
  : getReservedOrderNumberSQLite;

export const cleanupExpiredReservations = DATABASE_TYPE === 'supabase'
  ? dbModule.cleanupExpiredReservations
  : cleanupExpiredReservationsSQLite;

// LINE ?????????????QLite??async function recordLinePostSQLite(
  formId: number,
  groupId: string,
  messageId: string | null,
  senderName: string,
  postContent: string | null
): Promise<void> {
  try {
    await ensureDatabaseInitialized();
    // ???? line_posts ??????    await dbRun(`
      CREATE TABLE IF NOT EXISTS line_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        form_id INTEGER NOT NULL,
        group_id TEXT NOT NULL,
        message_id TEXT,
        sender_name TEXT NOT NULL,
        post_content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
      )
    `);
    
    await dbRun(
      'INSERT INTO line_posts (form_id, group_id, message_id, sender_name, post_content) VALUES (?, ?, ?, ?, ?)',
      [formId, groupId, messageId || null, senderName, postContent || null]
    );
  } catch (error: any) {
        console.error('Failed to load Supabase module');
    throw new Error(`?? LINE ?????????{error.message}`);
  }
}

export const getActiveLineSales = DATABASE_TYPE === 'supabase'
  ? dbModule.getActiveLineSales
  : getActiveLineSalesSQLite;

async function getFormByIdLiteSQLite(formId: number): Promise<Form | null> {
  const row = await dbGet('SELECT * FROM forms WHERE id = ?', [formId]) as any;
  if (!row) return null;
  return mapFormRow(row);
}

