import { supabaseAdmin } from './supabase';
import type { FormField, Form, Order } from './db';

// 確保使用 Supabase Admin 客戶端
function getSupabase() {
  if (!supabaseAdmin) {
    console.warn('⚠️ 警告：未設定 SUPABASE_SERVICE_ROLE_KEY，使用 anon key（可能會有權限限制）');
    throw new Error('Supabase 未正確設定，請檢查環境變數。建議設定 SUPABASE_SERVICE_ROLE_KEY 以獲得完整權限。');
  }
  return supabaseAdmin;
}

// 初始化資料庫表（在 Supabase Dashboard 的 SQL Editor 中執行 supabase-schema.sql）
export async function initDatabase() {
  // Supabase 表結構已在 SQL Editor 中建立，這裡不需要做任何事
  // 但保留此函數以保持 API 相容性
  console.log('Supabase 資料庫已初始化（表結構應已在 SQL Editor 中建立）');
}

// 表單相關操作
export async function createForm(
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
  const { data, error } = await getSupabase()
    .from('forms')
    .insert({
      name,
      fields,
      deadline,
      order_deadline: orderDeadline || null,
      order_limit: orderLimit || null,
      pickup_time: pickupTime || null,
      facebook_comment_url: facebookCommentUrl || null,
      line_comment_url: lineCommentUrl || null,
      facebook_post_url: facebookPostUrl || null,
      facebook_post_author: facebookPostAuthor || null,
      facebook_keywords: facebookKeywords || null,
      facebook_auto_monitor: facebookAutoMonitor || 0,
      facebook_reply_message: facebookReplyMessage || null,
      line_post_author: linePostAuthor || null,
      form_token: formToken,
    })
    .select('id')
    .single();

  if (error) throw new Error(`建立表單失敗：${error.message}`);
  return data.id;
}

export async function getFormByToken(token: string): Promise<Form | null> {
  const { data, error } = await getSupabase()
    .from('forms')
    .select('*')
    .eq('form_token', token)
    .eq('deleted', 0)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // 找不到記錄
    throw new Error(`取得表單失敗：${error.message}`);
  }

  return mapFormFromDb(data);
}

export async function getFormById(id: number, includeDeleted: boolean = false): Promise<Form | null> {
  let query = getSupabase()
    .from('forms')
    .select('*')
    .eq('id', id);

  if (!includeDeleted) {
    query = query.eq('deleted', 0);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`取得表單失敗：${error.message}`);
  }

  return mapFormFromDb(data);
}

export async function getAllForms(includeDeleted: boolean = false): Promise<Form[]> {
  let query = getSupabase()
    .from('forms')
    .select('*')
    .order('created_at', { ascending: false });

  if (!includeDeleted) {
    query = query.eq('deleted', 0);
  }

  const { data, error } = await query;

  if (error) throw new Error(`取得表單列表失敗：${error.message}`);
  return (data || []).map(mapFormFromDb);
}

export async function getDeletedForms(): Promise<Form[]> {
  const { data, error } = await getSupabase()
    .from('forms')
    .select('*')
    .eq('deleted', 1)
    .order('deleted_at', { ascending: false });

  if (error) throw new Error(`取得已刪除表單失敗：${error.message}`);
  return (data || []).map(mapFormFromDb);
}

export async function updateForm(
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
  const { error } = await getSupabase()
    .from('forms')
    .update({
      name,
      fields,
      deadline,
      order_deadline: orderDeadline || null,
      order_limit: orderLimit || null,
      pickup_time: pickupTime || null,
      facebook_comment_url: facebookCommentUrl || null,
      line_comment_url: lineCommentUrl || null,
      facebook_post_url: facebookPostUrl || null,
      facebook_post_author: facebookPostAuthor || null,
      facebook_keywords: facebookKeywords || null,
      facebook_auto_monitor: facebookAutoMonitor || 0,
      facebook_reply_message: facebookReplyMessage || null,
      line_post_author: linePostAuthor || null,
    })
    .eq('id', formId);

  if (error) throw new Error(`更新表單失敗：${error.message}`);
  return true;
}

export async function updateFormName(formId: number, newName: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('forms')
    .update({ name: newName })
    .eq('id', formId);

  if (error) throw new Error(`更新表單名稱失敗：${error.message}`);
  return true;
}

export async function markReportGenerated(formId: number): Promise<boolean> {
  const { error } = await getSupabase()
    .from('forms')
    .update({
      report_generated: 1,
      report_generated_at: new Date().toISOString(),
    })
    .eq('id', formId);

  if (error) throw new Error(`標記報表生成失敗：${error.message}`);
  return true;
}

export async function getFormsReadyForReport(): Promise<Form[]> {
  const now = new Date().toISOString();
  
  // Supabase 查詢：使用原生 SQL 或分步查詢
  // 先查詢有 order_deadline 且已到期的
  const { data: data1, error: error1 } = await getSupabase()
    .from('forms')
    .select('*')
    .not('order_deadline', 'is', null)
    .lte('order_deadline', now)
    .eq('report_generated', 0)
    .eq('deleted', 0);

  // 再查詢沒有 order_deadline 但 deadline 已到期的
  const { data: data2, error: error2 } = await getSupabase()
    .from('forms')
    .select('*')
    .is('order_deadline', null)
    .lte('deadline', now)
    .eq('report_generated', 0)
    .eq('deleted', 0);

  if (error1 || error2) {
    throw new Error(`取得待生成報表表單失敗：${error1?.message || error2?.message}`);
  }

  // 合併結果並排序
  const allForms = [...(data1 || []), ...(data2 || [])];
  allForms.sort((a, b) => {
    const aDeadline = a.order_deadline || a.deadline;
    const bDeadline = b.order_deadline || b.deadline;
    return new Date(aDeadline).getTime() - new Date(bDeadline).getTime();
  });

  return allForms.map(mapFormFromDb);
}

export async function moveFormToTrash(formId: number): Promise<boolean> {
  const { error } = await getSupabase()
    .from('forms')
    .update({
      deleted: 1,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', formId);

  if (error) throw new Error(`移動表單到垃圾桶失敗：${error.message}`);
  return true;
}

export async function restoreForm(formId: number): Promise<boolean> {
  const { error } = await getSupabase()
    .from('forms')
    .update({
      deleted: 0,
      deleted_at: null,
    })
    .eq('id', formId);

  if (error) throw new Error(`還原表單失敗：${error.message}`);
  return true;
}

export async function permanentlyDeleteForm(formId: number): Promise<{ success: boolean; deletedOrders: number }> {
  // 先計算要刪除的訂單數量
  const { count } = await getSupabase()
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('form_id', formId);

  const deletedOrders = count || 0;

  // 刪除相關訂單（CASCADE 會自動處理，但我們先手動刪除以獲取數量）
  await getSupabase()
    .from('orders')
    .delete()
    .eq('form_id', formId);

  // 永久刪除表單
  const { error } = await getSupabase()
    .from('forms')
    .delete()
    .eq('id', formId);

  if (error) throw new Error(`永久刪除表單失敗：${error.message}`);
  return { success: true, deletedOrders };
}

// 訂單相關操作
// 從訂單資料中提取物品清單（從好事多代購欄位）
function extractItemsSummary(form: Form, orderData: Record<string, any>): Array<{ name: string; quantity: number }> | null {
  const items: Array<{ name: string; quantity: number }> = [];
  
  // 遍歷表單欄位，找出「好事多代購」類型的欄位
  for (const field of form.fields) {
    if (field.type === 'costco') {
      const value = orderData[field.name];
      if (Array.isArray(value)) {
        // 處理數組格式的物品清單
        for (const item of value) {
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

export async function createOrder(
  formId: number,
  orderData: Record<string, any>,
  customerName?: string,
  customerPhone?: string,
  clientIp?: string,
  userAgent?: string,
  orderSource?: string,
  form?: Form // 新增 form 參數用於提取物品清單
): Promise<string> {
  const orderToken = generateToken();
  
  // 提取物品清單
  let itemsSummary: Array<{ name: string; quantity: number }> | null = null;
  if (form) {
    itemsSummary = extractItemsSummary(form, orderData);
  }
  
  const { error } = await getSupabase()
    .from('orders')
    .insert({
      form_id: formId,
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      order_data: orderData,
      items_summary: itemsSummary,
      client_ip: clientIp || null,
      user_agent: userAgent || null,
      order_source: orderSource || null,
      order_token: orderToken,
    });

  if (error) throw new Error(`建立訂單失敗：${error.message}`);
  return orderToken;
}

export async function updateOrder(orderToken: string, orderData: Record<string, any>): Promise<boolean> {
  const { error } = await getSupabase()
    .from('orders')
    .update({ order_data: orderData })
    .eq('order_token', orderToken);

  if (error) throw new Error(`更新訂單失敗：${error.message}`);
  return true;
}

export async function getOrderByToken(token: string): Promise<Order | null> {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .eq('order_token', token)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`取得訂單失敗：${error.message}`);
  }

  return mapOrderFromDb(data);
}

export async function getOrdersByFormId(formId: number): Promise<Order[]> {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`取得訂單列表失敗：${error.message}`);
  return (data || []).map(mapOrderFromDb);
}

export async function deleteOrder(orderToken: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('orders')
    .delete()
    .eq('order_token', orderToken);

  if (error) throw new Error(`刪除訂單失敗：${error.message}`);
  return true;
}

// 系統設定相關操作
export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await getSupabase()
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`取得設定失敗：${error.message}`);
  }

  return data?.value || null;
}

export async function setSetting(key: string, value: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('settings')
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(`儲存設定失敗：${error.message}`);
  return true;
}

// 輔助函數：將資料庫記錄映射為 Form 物件
function mapFormFromDb(row: any): Form {
  return {
    id: row.id,
    name: row.name,
    fields: typeof row.fields === 'string' ? JSON.parse(row.fields) : row.fields,
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

// 輔助函數：將資料庫記錄映射為 Order 物件
function mapOrderFromDb(row: any): Order {
  return {
    id: row.id,
    form_id: row.form_id,
    customer_name: row.customer_name || undefined,
    customer_phone: row.customer_phone || undefined,
    order_source: row.order_source || undefined,
    order_data: typeof row.order_data === 'string' ? JSON.parse(row.order_data) : row.order_data,
    items_summary: row.items_summary,
    client_ip: row.client_ip || undefined,
    user_agent: row.user_agent || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    order_token: row.order_token,
  };
}

// LINE 賣文記錄相關函數（Supabase）
export async function recordLinePost(
  formId: number,
  groupId: string,
  messageId: string | null,
  senderName: string,
  postContent: string
): Promise<boolean> {
  try {
    const { error } = await getSupabase()
      .from('line_posts')
      .insert({
        form_id: formId,
        group_id: groupId,
        message_id: messageId || null,
        sender_name: senderName,
        post_content: postContent,
      });

    if (error) {
      console.error('記錄 LINE 賣文錯誤:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('記錄 LINE 賣文錯誤:', error);
    return false;
  }
}

export async function getRecentLinePosts(
  groupId: string,
  limit: number = 10
): Promise<Array<{ formId: number; senderName: string; postContent: string; postedAt: string }>> {
  try {
    const { data, error } = await getSupabase()
      .from('line_posts')
      .select('form_id, sender_name, post_content, posted_at')
      .eq('group_id', groupId)
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('取得 LINE 賣文記錄錯誤:', error);
      return [];
    }

    return (data || []).map(row => ({
      formId: row.form_id,
      senderName: row.sender_name || '',
      postContent: row.post_content || '',
      postedAt: row.posted_at,
    }));
  } catch (error) {
    console.error('取得 LINE 賣文記錄錯誤:', error);
    return [];
  }
}

// 生成唯一 token
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 保留訂單排序（Supabase）
export async function reserveOrderNumber(formId: number, sessionId: string): Promise<{ success: boolean; orderNumber?: number; error?: string }> {
  try {
    // 先清理過期保留（5分鐘）
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await getSupabase()
      .from('reserved_orders')
      .delete()
      .eq('form_id', formId)
      .lt('reserved_at', fiveMinutesAgo)
      .is('order_token', null);

    // 檢查是否已有保留
    const { data: existing } = await getSupabase()
      .from('reserved_orders')
      .select('*')
      .eq('form_id', formId)
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      // 檢查是否已過期
      const reservedAt = new Date(existing.reserved_at);
      const now = new Date();
      if (now.getTime() - reservedAt.getTime() > 5 * 60 * 1000 && !existing.order_token) {
        // 已過期，刪除並重新分配
        await getSupabase()
          .from('reserved_orders')
          .delete()
          .eq('id', existing.id);
      } else {
        // 返回現有保留
        return { success: true, orderNumber: existing.order_number };
      }
    }

    // 取得當前已提交的訂單和已保留的數量
    const { data: orders } = await getSupabase()
      .from('orders')
      .select('id')
      .eq('form_id', formId);

    const { data: reserved } = await getSupabase()
      .from('reserved_orders')
      .select('order_number')
      .eq('form_id', formId)
      .or(`order_token.not.is.null,reserved_at.gt.${fiveMinutesAgo}`);

    // 計算下一個可用的排序號
    const usedNumbers = new Set<number>();
    (reserved || []).forEach((r: any) => {
      usedNumbers.add(r.order_number);
    });

    // 找到第一個可用的排序號
    let orderNumber = 1;
    while (usedNumbers.has(orderNumber)) {
      orderNumber++;
    }

    // 插入保留記錄（使用 upsert 處理唯一約束）
    const { error } = await getSupabase()
      .from('reserved_orders')
      .upsert({
        form_id: formId,
        session_id: sessionId,
        order_number: orderNumber,
        reserved_at: new Date().toISOString(),
      }, {
        onConflict: 'form_id,session_id'
      });

    if (error) throw error;

    return { success: true, orderNumber };
  } catch (error: any) {
    console.error('保留訂單排序錯誤:', error);
    return { success: false, error: error.message };
  }
}

// 確認保留的排序（提交訂單時）
export async function confirmReservedOrder(formId: number, sessionId: string, orderToken: string): Promise<boolean> {
  try {
    const { error } = await getSupabase()
      .from('reserved_orders')
      .update({ order_token: orderToken })
      .eq('form_id', formId)
      .eq('session_id', sessionId);

    return !error;
  } catch (error) {
    console.error('確認保留訂單錯誤:', error);
    return false;
  }
}

// 取得保留的排序號
export async function getReservedOrderNumber(formId: number, sessionId: string): Promise<number | null> {
  try {
    const { data } = await getSupabase()
      .from('reserved_orders')
      .select('order_number')
      .eq('form_id', formId)
      .eq('session_id', sessionId)
      .is('order_token', null)
      .single();

    return data ? data.order_number : null;
  } catch (error) {
    console.error('取得保留訂單排序錯誤:', error);
    return null;
  }
}

// 清理過期保留
export async function cleanupExpiredReservations(): Promise<void> {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await getSupabase()
      .from('reserved_orders')
      .delete()
      .lt('reserved_at', fiveMinutesAgo)
      .is('order_token', null);
  } catch (error) {
    console.error('清理過期保留錯誤:', error);
  }
}

// LINE 賣文記錄相關函數
export async function recordLinePost(
  formId: number,
  groupId: string,
  messageId: string | null,
  senderName: string,
  postContent: string | null
): Promise<void> {
  try {
    const { error } = await getSupabase()
      .from('line_posts')
      .insert({
        form_id: formId,
        group_id: groupId,
        message_id: messageId,
        sender_name: senderName,
        post_content: postContent,
      });

    if (error) throw error;
  } catch (error: any) {
    console.error('記錄 LINE 賣文錯誤:', error);
    throw new Error(`記錄 LINE 賣文失敗：${error.message}`);
  }
}

export async function getRecentLinePosts(
  groupId: string,
  limit: number = 10
): Promise<Array<{ formId: number; senderName: string; postContent: string; postedAt: string }>> {
  try {
    const { data, error } = await getSupabase()
      .from('line_posts')
      .select('form_id, sender_name, post_content, created_at')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((row: any) => ({
      formId: row.form_id,
      senderName: row.sender_name || '',
      postContent: row.post_content || '',
      postedAt: row.created_at,
    }));
  } catch (error: any) {
    console.error('取得 LINE 賣文記錄錯誤:', error);
    return [];
  }
}

// 初始化檢查（保持 API 相容性）
export async function ensureDatabaseInitialized() {
  // Supabase 不需要初始化，表結構已在 SQL Editor 中建立
  // 但需要檢查 Supabase 連線是否正常
  try {
    // 先檢查 supabaseAdmin 是否存在
    if (!supabaseAdmin) {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      if (!supabaseUrl) {
        throw new Error('SUPABASE_URL 環境變數未設定。請在 Vercel Dashboard > Settings > Environment Variables 中設定。');
      }
      if (!supabaseServiceKey && !supabaseAnonKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY 或 SUPABASE_ANON_KEY 環境變數未設定。請在 Vercel Dashboard > Settings > Environment Variables 中設定。');
      }
      throw new Error('Supabase 客戶端初始化失敗。請檢查環境變數設定。');
    }
    
    const supabase = getSupabase();
    // 嘗試一個簡單的查詢來驗證連線
    const { error } = await supabase.from('forms').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // PGRST116 表示沒有記錄，這是正常的
      // 其他錯誤表示連線或表結構有問題
      if (error.code === '42P01') {
        throw new Error('資料庫表不存在。請在 Supabase Dashboard > SQL Editor 中執行 supabase-complete-schema.sql 來建立表結構。');
      }
      throw new Error(`Supabase 連線失敗：${error.message} (code: ${error.code})`);
    }
    return true;
  } catch (error: any) {
    if (error.message.includes('Supabase 未正確設定') || error.message.includes('環境變數')) {
      throw error; // 重新拋出環境變數錯誤
    }
    throw new Error(`資料庫連線檢查失敗：${error.message}`);
  }
}
