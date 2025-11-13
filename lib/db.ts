// ?寞??啣?霈?豢?鞈?摨恍???const DATABASE_TYPE = process.env.DATABASE_TYPE || 'sqlite';

// 憒?雿輻 Supabase嚗???Supabase 撖虫?
let dbModule: any;
if (DATABASE_TYPE === 'supabase') {
  try {
    dbModule = require('./db-supabase');
  } catch (error) {
    console.error('?⊥?頛 Supabase 璅∠?嚗?蝣箄?撌脣?鋆?@supabase/supabase-js 銝西身摰憓???);
    throw error;
  }
}

// SQLite 撖虫?嚗????箏??剁?
// ?芸 SQLite 璅∪?銝????伐??踹???Vercel (Supabase) ?啣?銝???let sqlite3: any;
let promisify: any;
let path: any;
let fs: any;
let db: any;
let dbPath: string;
let dbRun: (sql: string, params?: any[]) => Promise<any>;
let dbGet: (sql: string, params?: any[]) => Promise<any>;
let dbAll: (sql: string, params?: any[]) => Promise<any>;

if (DATABASE_TYPE === 'sqlite') {
  // ??撠 SQLite ?賊?璅∠?嚗? Supabase 璅∪?銝??伐?
  sqlite3 = require('sqlite3');
  promisify = require('util').promisify;
  path = require('path');
  fs = require('fs');

  dbPath = path.join(process.cwd(), 'orders.db');

  // 蝣箔?鞈?摨急?獢???  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '');
  }

  db = new sqlite3.Database(dbPath);

  // 撠?callback 憸冽??貉?? Promise
  dbRun = promisify(db.run.bind(db)) as (sql: string, params?: any[]) => Promise<any>;
  dbGet = promisify(db.get.bind(db)) as (sql: string, params?: any[]) => Promise<any>;
  dbAll = promisify(db.all.bind(db)) as (sql: string, params?: any[]) => Promise<any>;
}

// ?????澈銵?async function initDatabaseSQLite() {
  // 銵典閮剖?銵?  await dbRun(`
    CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      fields TEXT NOT NULL,
      deadline TEXT NOT NULL,
      order_deadline TEXT,
      order_limit INTEGER,
      pickup_time TEXT,
      report_generated INTEGER DEFAULT 0,
      report_generated_at TEXT,
      deleted INTEGER DEFAULT 0,
      deleted_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      form_token TEXT UNIQUE NOT NULL
    )
  `);
  
  // 瑼Ｘ銝行憓甈?嚗?敺摰對?
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN order_deadline TEXT`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN order_limit INTEGER`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN pickup_time TEXT`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN report_generated INTEGER DEFAULT 0`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN report_generated_at TEXT`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN deleted INTEGER DEFAULT 0`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN deleted_at TEXT`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN facebook_comment_url TEXT`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN line_comment_url TEXT`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN facebook_post_url TEXT`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN facebook_post_author TEXT`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN facebook_keywords TEXT`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN facebook_auto_monitor INTEGER DEFAULT 0`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN facebook_reply_message TEXT`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE forms ADD COLUMN line_post_author TEXT`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }

  // 閮銵?  await dbRun(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL,
      customer_name TEXT,
      customer_phone TEXT,
      order_source TEXT,
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
  
  // 瑼Ｘ銝行憓甈?嚗?敺摰對?
  try {
    await dbRun(`ALTER TABLE orders ADD COLUMN client_ip TEXT`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE orders ADD COLUMN user_agent TEXT`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE orders ADD COLUMN items_summary TEXT`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }
  try {
    await dbRun(`ALTER TABLE orders ADD COLUMN order_source TEXT`);
  } catch (e: any) {
    // 甈?撌脣??剁?敹賜?航炊
  }

  // 蝟餌絞閮剖?銵?  await dbRun(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 靽?閮??銵剁??冽???格??塚?
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

  // LINE 鞈??閮?銵剁?閮?鞈???”?桃?撠???嚗?  await dbRun(`
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
  
  // 撱箇?蝝Ｗ?
  try {
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_line_posts_form_id ON line_posts(form_id)`);
  } catch (e: any) {}
  try {
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_line_posts_group_id ON line_posts(group_id)`);
  } catch (e: any) {}
  try {
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_line_posts_posted_at ON line_posts(posted_at)`);
  } catch (e: any) {}
  
  // 撱箇?蝝Ｗ?
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

// 銵典?賊???
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'costco';
  required: boolean;
  options?: string[];
  price?: number; // ?寞甈?嚗?賂?
}

export interface Form {
  id: number;
  name: string;
  fields: FormField[];
  deadline: string;
  order_deadline?: string; // ?嗅?芣迫??
  order_limit?: number; // 閮?賊??嚗?賂?
  pickup_time?: string; // ?疏??嚗?賂?
  report_generated?: number; // ?梯”?臬撌脩???(0/1)
  report_generated_at?: string; // ?梯”????
  deleted?: number; // ?臬撌脣?文?獢?(0/1)
  deleted_at?: string; // ?芷??
  created_at: string;
  form_token: string;
  facebook_comment_url?: string;
  line_comment_url?: string;
  facebook_post_url?: string; // Facebook 鞎潭????嚗?潸??改?
  facebook_post_author?: string; // Facebook ?潭?????  facebook_keywords?: string; // Facebook ?摮?銵剁?JSON ???嚗?  facebook_auto_monitor?: number; // ?臬? Facebook ?芸??? (0/1)
  facebook_reply_message?: string; // Facebook ??閮
  line_post_author?: string; // LINE ?潭??????冽霅閬?抒?鞈??嚗?}

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
  linePostAuthor?: string
): Promise<number> {
  const formToken = generateToken();
  await dbRun(
    'INSERT INTO forms (name, fields, deadline, order_deadline, order_limit, pickup_time, facebook_comment_url, line_comment_url, facebook_post_url, facebook_post_author, facebook_keywords, facebook_auto_monitor, facebook_reply_message, line_post_author, form_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
      formToken,
    ]
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
    order_limit: row.order_limit !== null && row.order_limit !== undefined ? row.order_limit : undefined,
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
    order_limit: row.order_limit !== null && row.order_limit !== undefined ? row.order_limit : undefined,
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
    facebook_comment_url: row.facebook_comment_url || undefined,
    line_comment_url: row.line_comment_url || undefined,
    facebook_post_url: row.facebook_post_url || undefined,
    facebook_post_author: row.facebook_post_author || undefined,
    facebook_keywords: row.facebook_keywords || undefined,
    facebook_auto_monitor: row.facebook_auto_monitor || 0,
    facebook_reply_message: row.facebook_reply_message || undefined,
  }));
}

/**
 * ???獢嗡葉?”?? */
async function getDeletedFormsSQLite(): Promise<Form[]> {
  const rows = await dbAll('SELECT * FROM forms WHERE deleted = 1 ORDER BY deleted_at DESC') as any[];
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    fields: JSON.parse(row.fields),
    deadline: row.deadline,
    order_deadline: row.order_deadline || undefined,
    order_limit: row.order_limit !== null && row.order_limit !== undefined ? row.order_limit : undefined,
    pickup_time: row.pickup_time || undefined,
    report_generated: row.report_generated || 0,
    report_generated_at: row.report_generated_at || undefined,
    deleted: row.deleted || 0,
    deleted_at: row.deleted_at || undefined,
    created_at: row.created_at,
    form_token: row.form_token,
    facebook_comment_url: row.facebook_comment_url || undefined,
    line_comment_url: row.line_comment_url || undefined,
  }));
}

/**
 * ?湔銵典?迂
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
  linePostAuthor?: string
): Promise<boolean> {
  await dbRun(
    'UPDATE forms SET name = ?, fields = ?, deadline = ?, order_deadline = ?, order_limit = ?, pickup_time = ?, facebook_comment_url = ?, line_comment_url = ?, facebook_post_url = ?, facebook_post_author = ?, facebook_keywords = ?, facebook_auto_monitor = ?, facebook_reply_message = ?, line_post_author = ? WHERE id = ?',
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
 * 璅??梯”撌脩??? */
async function markReportGeneratedSQLite(formId: number): Promise<boolean> {
  const result = await dbRun(
    'UPDATE forms SET report_generated = 1, report_generated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [formId]
  );
  return (result as any).changes > 0;
}

/**
 * ??撌脣??格甇Ｘ???撠???梯”?”?? * 雿輻 order_deadline嚗????剁?嚗?蝙??deadline
 */
async function getFormsReadyForReportSQLite(): Promise<Form[]> {
  const now = new Date().toISOString();
  // ?芸?雿輻 order_deadline嚗?????雿輻 deadline
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
    order_deadline: row.order_deadline || row.deadline, // 憒?瘝? order_deadline嚗蝙??deadline
    report_generated: row.report_generated || 0,
    report_generated_at: row.report_generated_at || undefined,
    created_at: row.created_at,
    form_token: row.form_token,
    facebook_comment_url: row.facebook_comment_url || undefined,
    line_comment_url: row.line_comment_url || undefined,
  }));
}

/**
 * 撠”?桃宏?啣??暹▲嚗??芷嚗? */
async function moveFormToTrashSQLite(formId: number): Promise<boolean> {
  try {
    // 蝣箔?鞈?摨怠歇????    await ensureDatabaseInitialized();
    
    // ?炎?交?雿?血???    const tableInfo = await dbAll("PRAGMA table_info(forms)") as any[];
    const hasDeleted = tableInfo.some((col: any) => col.name === 'deleted');
    const hasDeletedAt = tableInfo.some((col: any) => col.name === 'deleted_at');
    
    // 憒?甈?銝??剁??岫?啣?
    if (!hasDeleted) {
      try {
        await dbRun(`ALTER TABLE forms ADD COLUMN deleted INTEGER DEFAULT 0`);
      } catch (e: any) {
        console.error('?啣? deleted 甈?憭望?:', e.message);
      }
    }
    
    if (!hasDeletedAt) {
      try {
        await dbRun(`ALTER TABLE forms ADD COLUMN deleted_at TEXT`);
      } catch (e: any) {
        console.error('?啣? deleted_at 甈?憭望?:', e.message);
      }
    }
    
    // 雿輻 ISO ?澆????閮?    const deletedAt = new Date().toISOString();
    
    // ??閰行?啣??雿?    let result: any = null;
    try {
      result = await dbRun(
        'UPDATE forms SET deleted = 1, deleted_at = ? WHERE id = ?',
        [deletedAt, formId]
      );
    } catch (error: any) {
      // 憒?憭望?嚗?閰血?湔 deleted 甈?
      if (error.message && error.message.includes('no such column')) {
        try {
          result = await dbRun(
            'UPDATE forms SET deleted = 1 WHERE id = ?',
            [formId]
          );
        } catch (e2: any) {
          throw new Error(`?⊥??湔銵典嚗?{e2.message}`);
        }
      } else {
        throw error;
      }
    }
    
    // 瑼Ｘ蝯?
    if (!result) {
      // ??瑼Ｘ?臬?湔??
      const checkForm = await dbGet('SELECT deleted FROM forms WHERE id = ?', [formId]) as any;
      if (checkForm && checkForm.deleted === 1) {
        return true;
      }
      return false;
    }
    
    const changes = (result as any)?.changes ?? (result?.lastID !== undefined ? 1 : 0);
    
    // 憒? changes ??0嚗?霅?衣???唳???    if (changes === 0) {
      const checkForm = await dbGet('SELECT deleted FROM forms WHERE id = ?', [formId]) as any;
      if (checkForm && checkForm.deleted === 1) {
        return true;
      }
      console.error('銵典?湔憭望?嚗eleted 隞 0');
      return false;
    }
    
    return changes > 0;
  } catch (error: any) {
    console.error('moveFormToTrash ?航炊:', error);
    console.error('?航炊閮:', error.message);
    throw new Error(`?⊥??湔銵典嚗?{error.message}`);
  }
}

/**
 * 敺??暹▲??銵典
 */
async function restoreFormSQLite(formId: number): Promise<boolean> {
  try {
    const result = await dbRun(
      'UPDATE forms SET deleted = 0, deleted_at = NULL WHERE id = ?',
      [formId]
    );
    
    // 瑼Ｘ蝯?
    if (!result) {
      // ??瑼Ｘ?臬?湔??
      const checkForm = await dbGet('SELECT deleted FROM forms WHERE id = ?', [formId]) as any;
      if (checkForm && checkForm.deleted === 0) {
        return true;
      }
      return false;
    }
    
    const changes = (result as any)?.changes ?? (result?.lastID !== undefined ? 1 : 0);
    
    // 憒? changes ??0嚗?霅?衣???唳???    if (changes === 0) {
      const checkForm = await dbGet('SELECT deleted FROM forms WHERE id = ?', [formId]) as any;
      if (checkForm && checkForm.deleted === 0) {
        return true;
      }
      return false;
    }
    
    return changes > 0;
  } catch (error: any) {
    console.error('restoreForm ?航炊:', error);
    throw new Error(`?⊥???銵典嚗?{error.message}`);
  }
}

/**
 * 瘞訾??芷銵典嚗???斤???殷?
 */
async function permanentlyDeleteFormSQLite(formId: number): Promise<{ success: boolean; deletedOrders: number }> {
  // ??蝞??芷???格??  const orderCount = await dbGet('SELECT COUNT(*) as count FROM orders WHERE form_id = ?', [formId]) as { count: number };
  const deletedOrders = orderCount?.count || 0;

  // ?芷?賊?閮
  await dbRun('DELETE FROM orders WHERE form_id = ?', [formId]);

  // 瘞訾??芷銵典
  const result = await dbRun('DELETE FROM forms WHERE id = ?', [formId]);

  // 瑼Ｘ蝯?
  let success = false;
  if (!result) {
    // ??瑼Ｘ?臬?芷??
    const checkForm = await dbGet('SELECT id FROM forms WHERE id = ?', [formId]) as any;
    success = !checkForm; // 憒??曆??啗”?殷?銵函內?芷??
  } else {
    success = ((result as any)?.changes ?? 0) > 0;
  }

  return {
    success,
    deletedOrders,
  };
}

// 閮?賊???
export interface Order {
  id: number;
  form_id: number;
  customer_name?: string;
  customer_phone?: string;
  order_source?: string;
  order_data: Record<string, any>;
  items_summary?: Array<{ name: string; quantity: number }>; // ?拙?皜嚗?憟賭?憭誨鞈潭?雿???
  client_ip?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  order_token: string;
}

// 敺??株??葉???拙?皜嚗?憟賭?憭誨鞈潭?雿?
function extractItemsSummary(form: Form, orderData: Record<string, any>): Array<{ name: string; quantity: number }> | null {
  const items: Array<{ name: string; quantity: number }> = [];
  
  // ?風銵典甈?嚗?箝末鈭?隞?頃????甈?
  for (const field of form.fields) {
    if (field.type === 'costco') {
      const value = orderData[field.name];
      if (Array.isArray(value)) {
        // ???貊??澆??????        for (const item of value) {
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
  form?: Form // ?啣? form ??冽???拙?皜
): Promise<string> {
  const orderToken = generateToken();
  
  // ???拙?皜
  let itemsSummary: string | null = null;
  if (form) {
    const items = extractItemsSummary(form, orderData);
    if (items && items.length > 0) {
      itemsSummary = JSON.stringify(items);
    }
  }
  
  await dbRun(
    'INSERT INTO orders (form_id, customer_name, customer_phone, order_source, order_data, items_summary, client_ip, user_agent, order_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      formId,
      customerName || null,
      customerPhone || null,
      orderSource || null,
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
    
    // 瑼Ｘ蝯?
    if (!result) {
      console.error('updateOrder: dbRun 餈? undefined');
      // ??瑼Ｘ?臬?湔??
      const checkOrder = await dbGet('SELECT order_token FROM orders WHERE order_token = ?', [orderToken]) as any;
      if (checkOrder && checkOrder.order_token === orderToken) {
        // 撽?鞈??臬???湔鈭?        const verifyOrder = await dbGet('SELECT order_data FROM orders WHERE order_token = ?', [orderToken]) as any;
        if (verifyOrder) {
          const currentData = JSON.parse(verifyOrder.order_data);
          // 蝪∪瘥?嚗?摰?嚗??臭誑雿?箸撽?嚗?          if (JSON.stringify(currentData) === JSON.stringify(orderData)) {
            return true;
          }
        }
      }
      return false;
    }
    
    const changes = (result as any)?.changes ?? (result?.lastID !== undefined ? 1 : 0);
    
    // 憒? changes ??0嚗?霅?衣???唳???    if (changes === 0) {
      const checkOrder = await dbGet('SELECT order_data FROM orders WHERE order_token = ?', [orderToken]) as any;
      if (checkOrder) {
        const currentData = JSON.parse(checkOrder.order_data);
        if (JSON.stringify(currentData) === JSON.stringify(orderData)) {
          return true;
        }
      }
      console.error('閮?湔憭望?');
      return false;
    }
    
    return changes > 0;
  } catch (error: any) {
    console.error('updateOrder ?航炊:', error);
    throw new Error(`?⊥??湔閮嚗?{error.message}`);
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
    order_data: JSON.parse(row.order_data),
    items_summary: row.items_summary ? JSON.parse(row.items_summary) : undefined,
    client_ip: row.client_ip || undefined,
    user_agent: row.user_agent || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    order_token: row.order_token,
  }));
}

/**
 * ?芷閮
 */
async function deleteOrderSQLite(orderToken: string): Promise<boolean> {
  try {
    const result = await dbRun('DELETE FROM orders WHERE order_token = ?', [orderToken]);
    
    if (!result) {
      // ??瑼Ｘ?臬?芷??
      const checkOrder = await dbGet('SELECT order_token FROM orders WHERE order_token = ?', [orderToken]) as any;
      return !checkOrder; // 憒??曆??啗??殷?銵函內?芷??
    }
    
    const changes = (result as any)?.changes ?? 0;
    return changes > 0;
  } catch (error: any) {
    console.error('deleteOrder ?航炊:', error);
    throw new Error(`?⊥??芷閮嚗?{error.message}`);
  }
}

// 蝟餌絞閮剖??賊???
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
    console.error('閮剖??脣??航炊:', error);
    return false;
  }
}

// ???臭? token
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// ?? session ID
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// 靽?閮??嚗QLite嚗?async function reserveOrderNumberSQLite(formId: number, sessionId: string): Promise<{ success: boolean; orderNumber?: number; error?: string }> {
  try {
    await ensureDatabaseInitialized();
    
    // ????????5??嚗?    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await dbRun(
      'DELETE FROM reserved_orders WHERE reserved_at < ? AND order_token IS NULL',
      [fiveMinutesAgo]
    );

    // 瑼Ｘ?臬撌脫?靽?
    const existing = await dbGet(
      'SELECT * FROM reserved_orders WHERE form_id = ? AND session_id = ?',
      [formId, sessionId]
    ) as any;

    if (existing) {
      // 瑼Ｘ?臬撌脤???      const reservedAt = new Date(existing.reserved_at);
      const now = new Date();
      if (now.getTime() - reservedAt.getTime() > 5 * 60 * 1000 && !existing.order_token) {
        // 撌脤????芷銝阡??啣???        await dbRun('DELETE FROM reserved_orders WHERE id = ?', [existing.id]);
      } else {
        // 餈??暹?靽?
        return { success: true, orderNumber: existing.order_number };
      }
    }

    // ???嗅?撌脫?鈭斤?閮?歇靽????    const orders = await dbAll('SELECT id FROM orders WHERE form_id = ?', [formId]) as any[];
    const reserved = await dbAll(
      'SELECT order_number FROM reserved_orders WHERE form_id = ? AND (order_token IS NOT NULL OR reserved_at > ?)',
      [formId, fiveMinutesAgo]
    ) as any[];

    // 閮?銝???函?????    const usedNumbers = new Set<number>();
    reserved.forEach((r: any) => {
      usedNumbers.add(r.order_number);
    });

    // ?曉蝚砌???函?????    let orderNumber = 1;
    while (usedNumbers.has(orderNumber)) {
      orderNumber++;
    }

    // ?靽?閮?嚗蝙??INSERT OR REPLACE ???臭?蝝?嚗?    await dbRun(
      'INSERT OR REPLACE INTO reserved_orders (form_id, session_id, order_number, reserved_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [formId, sessionId, orderNumber]
    );

    return { success: true, orderNumber };
  } catch (error: any) {
    console.error('靽?閮???航炊:', error);
    return { success: false, error: error.message };
  }
}

// 蝣箄?靽???摨??漱閮??
async function confirmReservedOrderSQLite(formId: number, sessionId: string, orderToken: string): Promise<boolean> {
  try {
    await ensureDatabaseInitialized();
    await dbRun(
      'UPDATE reserved_orders SET order_token = ? WHERE form_id = ? AND session_id = ?',
      [orderToken, formId, sessionId]
    );
    return true;
  } catch (error) {
    console.error('蝣箄?靽?閮?航炊:', error);
    return false;
  }
}

// ??靽???摨?
async function getReservedOrderNumberSQLite(formId: number, sessionId: string): Promise<number | null> {
  try {
    await ensureDatabaseInitialized();
    const result = await dbGet(
      'SELECT order_number FROM reserved_orders WHERE form_id = ? AND session_id = ? AND order_token IS NULL',
      [formId, sessionId]
    ) as any;
    return result ? result.order_number : null;
  } catch (error) {
    console.error('??靽?閮???航炊:', error);
    return null;
  }
}

// 皜???靽?
async function cleanupExpiredReservationsSQLite(): Promise<void> {
  try {
    await ensureDatabaseInitialized();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await dbRun(
      'DELETE FROM reserved_orders WHERE reserved_at < ? AND order_token IS NULL',
      [fiveMinutesAgo]
    );
  } catch (error) {
    console.error('皜???靽??航炊:', error);
  }
}

// LINE 鞈??閮??賊??賣嚗QLite ?嚗?async function recordLinePostSQLite(
  formId: number,
  groupId: string,
  messageId: string | null,
  senderName: string,
  postContent: string | null
): Promise<void> {
  try {
    await ensureDatabaseInitialized();
    // 蝣箔? line_posts 銵典???    await dbRun(`
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
      [formId, groupId, messageId, senderName, postContent]
    );
  } catch (error: any) {
    console.error('閮? LINE 鞈???航炊:', error);
    throw new Error(`閮? LINE 鞈??憭望?嚗?{error.message}`);
  }
}

async function getRecentLinePostsSQLite(
  groupId: string,
  limit: number = 10
): Promise<Array<{ formId: number; senderName: string; postContent: string; postedAt: string }>> {
  try {
    await ensureDatabaseInitialized();
    // 蝣箔? line_posts 銵典???    await dbRun(`
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
    console.error('?? LINE 鞈??閮??航炊:', error);
    return [];
  }
}

// ?????澈嚗蝚砌?甈∩蝙?冽?隤輻嚗?let dbInitialized = false;
export async function ensureDatabaseInitialized() {
  if (DATABASE_TYPE === 'supabase') {
    // Supabase 銝?閬?憪?嚗”蝯?撌脣 SQL Editor 銝剖遣蝡?    // 雿?閬Ⅱ靽?dbModule 撌脰???    if (!dbModule) {
      throw new Error('Supabase 璅∠??芾??伐?隢Ⅱ隤憓??詨歇甇?Ⅱ閮剖?');
    }
    return dbModule.ensureDatabaseInitialized();
  }
  
  // SQLite 璅∪?
  if (!dbInitialized) {
    await initDatabaseSQLite();
    dbInitialized = true;
  }
}

// ?寞?鞈?摨恍????撠???// 憒?雿輻 Supabase嚗? dbModule ?撠????// 憒?雿輻 SQLite嚗蝙?其??Ｗ?蝢拍? SQLite ?賣

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

export const deleteOrder = DATABASE_TYPE === 'supabase'
  ? dbModule.deleteOrder
  : deleteOrderSQLite;

export const getSetting = DATABASE_TYPE === 'supabase'
  ? dbModule.getSetting
  : getSettingSQLite;

export const setSetting = DATABASE_TYPE === 'supabase'
  ? dbModule.setSetting
  : setSettingSQLite;

// 靽?閮???賊??賣
export const reserveOrderNumber = DATABASE_TYPE === 'supabase'
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

// LINE 鞈??閮??賊??賣嚗QLite嚗?async function recordLinePostSQLite(
  formId: number,
  groupId: string,
  messageId: string | null,
  senderName: string,
  postContent: string | null
): Promise<void> {
  try {
    await ensureDatabaseInitialized();
    // 蝣箔? line_posts 銵典???    await dbRun(`
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
    console.error('閮? LINE 鞈???航炊:', error);
    throw new Error(`閮? LINE 鞈??憭望?嚗?{error.message}`);
  }
}

}

// LINE 鞈??閮??賊??賣
export const recordLinePost = DATABASE_TYPE === 'supabase'
  ? dbModule.recordLinePost
  : recordLinePostSQLite;

export const getRecentLinePosts = DATABASE_TYPE === 'supabase'
  ? dbModule.getRecentLinePosts
  : getRecentLinePostsSQLite;

// generateSessionId 撌脣銝摰儔銝血???

