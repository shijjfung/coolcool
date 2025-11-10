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
  orderDeadline?: string
): Promise<number> {
  const formToken = generateToken();
  const { data, error } = await getSupabase()
    .from('forms')
    .insert({
      name,
      fields,
      deadline,
      order_deadline: orderDeadline || null,
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
export async function createOrder(
  formId: number,
  orderData: Record<string, any>,
  customerName?: string,
  customerPhone?: string
): Promise<string> {
  const orderToken = generateToken();
  const { error } = await getSupabase()
    .from('orders')
    .insert({
      form_id: formId,
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      order_data: orderData,
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
    .order('created_at', { ascending: false });

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
    report_generated: row.report_generated || 0,
    report_generated_at: row.report_generated_at || undefined,
    deleted: row.deleted || 0,
    deleted_at: row.deleted_at || undefined,
    created_at: row.created_at,
    form_token: row.form_token,
  };
}

// 輔助函數：將資料庫記錄映射為 Order 物件
function mapOrderFromDb(row: any): Order {
  return {
    id: row.id,
    form_id: row.form_id,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    order_data: typeof row.order_data === 'string' ? JSON.parse(row.order_data) : row.order_data,
    created_at: row.created_at,
    updated_at: row.updated_at,
    order_token: row.order_token,
  };
}

// 生成唯一 token
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 初始化檢查（保持 API 相容性）
export async function ensureDatabaseInitialized() {
  // Supabase 不需要初始化，表結構已在 SQL Editor 中建立
  return true;
}

