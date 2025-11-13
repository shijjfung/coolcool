import { supabaseAdmin } from './supabase';
import type { FormField, Form, Order } from './db';

// ?????輯撒??Supabase Admin ?堆撓??function getSupabase() {
  if (!supabaseAdmin) {
    console.warn('?蹎? ????垮謓舫?? SUPABASE_SERVICE_ROLE_KEY????anon key????鞈????????憛?');
    throw new Error('Supabase ???縣???頨急謍??ｇ???鈭佇????閰鄞蹇??頨急?SUPABASE_SERVICE_ROLE_KEY ?漲?斗謅??皝????);
  }
  return supabaseAdmin;
}

// ?豲??謘??謕??萄????Supabase Dashboard ??SQL Editor ??貔?supabase-schema.sql??export async function initDatabase() {
  // Supabase ?萄??踝?甇??SQL Editor ???????謕?????秋撒??２???  // ?選???謕縐?鞈??鼎???API ?閰冽???  console.log('Supabase ???冽??豲??謖??萄??踝???謓?SQL Editor ??????');
}

// ?萄謘?鞈????
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

  if (error) throw new Error(`?梁???萄謘????{error.message}`);
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
    if (error.code === 'PGRST116') return null; // ????????    throw new Error(`?謘??萄謘????{error.message}`);
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
    throw new Error(`?謘??萄謘????{error.message}`);
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

  if (error) throw new Error(`?謘??萄謘?謅????{error.message}`);
  return (data || []).map(mapFormFromDb);
}

export async function getDeletedForms(): Promise<Form[]> {
  const { data, error } = await getSupabase()
    .from('forms')
    .select('*')
    .eq('deleted', 1)
    .order('deleted_at', { ascending: false });

  if (error) throw new Error(`?謘?????嫖?獢隞?謅?${error.message}`);
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

  if (error) throw new Error(`?皝??萄謘????{error.message}`);
  return true;
}

export async function updateFormName(formId: number, newName: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('forms')
    .update({ name: newName })
    .eq('id', formId);

  if (error) throw new Error(`?皝??萄謘????剜????{error.message}`);
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

  if (error) throw new Error(`????璇胼?賹??剜????{error.message}`);
  return true;
}

export async function getFormsReadyForReport(): Promise<Form[]> {
  const now = new Date().toISOString();
  
  // Supabase ?鈭亙眺?垢??????SQL ?謘??漱貔?  // ????堆撓? order_deadline ??甇?????  const { data: data1, error: error1 } = await getSupabase()
    .from('forms')
    .select('*')
    .not('order_deadline', 'is', null)
    .lte('order_deadline', now)
    .eq('report_generated', 0)
    .eq('deleted', 0);

  // ????堆撓???order_deadline ??deadline ???賹?
  const { data: data2, error: error2 } = await getSupabase()
    .from('forms')
    .select('*')
    .is('order_deadline', null)
    .lte('deadline', now)
    .eq('report_generated', 0)
    .eq('deleted', 0);

  if (error1 || error2) {
    throw new Error(`?謘??綽???鼓?萄??獢隞?謅?${error1?.message || error2?.message}`);
  }

  // ???荒???????  const allForms = [...(data1 || []), ...(data2 || [])];
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

  if (error) throw new Error(`????萄謘?????嫖?剜????{error.message}`);
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

  if (error) throw new Error(`????萄謘????{error.message}`);
  return true;
}

export async function permanentlyDeleteForm(formId: number): Promise<{ success: boolean; deletedOrders: number }> {
  // ????????畸??????澗??  const { count } = await getSupabase()
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('form_id', formId);

  const deletedOrders = count || 0;

  // ??畸??鞈??殉?謘??SCADE ??賂???????選??????????畸??漲??謘踐???
  await getSupabase()
    .from('orders')
    .delete()
    .eq('form_id', formId);

  // ?防???畸??萄謘?
  const { error } = await getSupabase()
    .from('forms')
    .delete()
    .eq('id', formId);

  if (error) throw new Error(`?防???畸??萄謘????{error.message}`);
  return { success: true, deletedOrders };
}

// ?殉?謘?鞈????
// ?綜筆?????謕????????謘????陪??叟垢隤券?瞏??選?
function extractItemsSummary(form: Form, orderData: Record<string, any>): Array<{ name: string; quantity: number }> | null {
  const items: Array<{ name: string; quantity: number }> = [];
  
  // ??◢?萄謘??????蝞?箸?哨??????????????
  for (const field of form.fields) {
    if (field.type === 'costco') {
      const value = orderData[field.name];
      if (Array.isArray(value)) {
        // ????鞎??瞉????蹓???        for (const item of value) {
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
  form?: Form // ??? form ??塗??踐????????謘?
): Promise<string> {
  const orderToken = generateToken();
  
  // ???????謘?
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

  if (error) throw new Error(`?梁???殉?謘????{error.message}`);
  return orderToken;
}

export async function updateOrder(orderToken: string, orderData: Record<string, any>): Promise<boolean> {
  const { error } = await getSupabase()
    .from('orders')
    .update({ order_data: orderData })
    .eq('order_token', orderToken);

  if (error) throw new Error(`?皝??殉?謘????{error.message}`);
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
    throw new Error(`?謘??殉?謘????{error.message}`);
  }

  return mapOrderFromDb(data);
}

export async function getOrdersByFormId(formId: number): Promise<Order[]> {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`?謘??殉?謘?謅????{error.message}`);
  return (data || []).map(mapOrderFromDb);
}

export async function deleteOrder(orderToken: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('orders')
    .delete()
    .eq('order_token', orderToken);

  if (error) throw new Error(`??畸??殉?謘????{error.message}`);
  return true;
}

// ??蝯???鞈????
export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await getSupabase()
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`?謘??桀???剜????{error.message}`);
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

  if (error) throw new Error(`????桀???剜????{error.message}`);
  return true;
}

// ????鞈??城????冽??????蹌?Form ??麾
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

// ????鞈??城????冽??????蹌?Order ??麾
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

// LINE ????殉死??鞈??鞈???upabase??export async function recordLinePost(
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
      console.error('?殉死? LINE ?????芰?:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('?殉死? LINE ?????芰?:', error);
    return false;
  }
}

}

// ?賹???? token
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// ?踐???殉?謘?????upabase??export async function reserveOrderNumber(formId: number, sessionId: string): Promise<{ success: boolean; orderNumber?: number; error?: string }> {
  try {
    // ???????賹??謕?5?????    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await getSupabase()
      .from('reserved_orders')
      .delete()
      .eq('form_id', formId)
      .lt('reserved_at', fiveMinutesAgo)
      .is('order_token', null);

    // ?潘撓貔??秋????踐??
    const { data: existing } = await getSupabase()
      .from('reserved_orders')
      .select('*')
      .eq('form_id', formId)
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      // ?潘撓貔??秋?????      const reservedAt = new Date(existing.reserved_at);
      const now = new Date();
      if (now.getTime() - reservedAt.getTime() > 5 * 60 * 1000 && !existing.order_token) {
        // ???賹???畸????????        await getSupabase()
          .from('reserved_orders')
          .delete()
          .eq('id', existing.id);
      } else {
        // 擗??????踐??
        return { success: true, orderNumber: existing.order_number };
      }
    }

    // ?謘???????剜??殉?謘??箸??踐??????    const { data: orders } = await getSupabase()
      .from('orders')
      .select('id')
      .eq('form_id', formId);

    const { data: reserved } = await getSupabase()
      .from('reserved_orders')
      .select('order_number')
      .eq('form_id', formId)
      .or(`order_token.not.is.null,reserved_at.gt.${fiveMinutesAgo}`);

    // ?殷???????????????    const usedNumbers = new Set<number>();
    (reserved || []).forEach((r: any) => {
      usedNumbers.add(r.order_number);
    });

    // ????????????????    let orderNumber = 1;
    while (usedNumbers.has(orderNumber)) {
      orderNumber++;
    }

    // ???踐???殉死??????upsert ???????????    const { error } = await getSupabase()
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
    console.error('?踐???殉?謘?????芰?:', error);
    return { success: false, error: error.message };
  }
}

// ?????踐??????制???摹?殉?謘?蹇?
export async function confirmReservedOrder(formId: number, sessionId: string, orderToken: string): Promise<boolean> {
  try {
    const { error } = await getSupabase()
      .from('reserved_orders')
      .update({ order_token: orderToken })
      .eq('form_id', formId)
      .eq('session_id', sessionId);

    return !error;
  } catch (error) {
    console.error('?????踐???殉?謘??芰?:', error);
    return false;
  }
}

// ?謘??踐??????制?
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
    console.error('?謘??踐???殉?謘?????芰?:', error);
    return null;
  }
}

// ??????踐??
export async function cleanupExpiredReservations(): Promise<void> {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await getSupabase()
      .from('reserved_orders')
      .delete()
      .lt('reserved_at', fiveMinutesAgo)
      .is('order_token', null);
  } catch (error) {
    console.error('??????踐????芰?:', error);
  }
}

// LINE ????殉死??鞈??鞈?
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
    console.error('?殉死? LINE ?????芰?:', error);
    throw new Error(`?殉死? LINE ????剜????{error.message}`);
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
    console.error('?謘? LINE ????殉死???芰?:', error);
    return [];
  }
}

// ?豲??謘賜??隡??踐?? API ?閰冽????
export async function ensureDatabaseInitialized() {
  // Supabase ????秋撒??迎???????謓?SQL Editor ?????  // ?選???秋撮???Supabase ?????秋?????
  try {
    // ?????supabaseAdmin ??秋??殉朱謓?
    if (!supabaseAdmin) {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      if (!supabaseUrl) {
        throw new Error('SUPABASE_URL ????????曇澈?堊垣?蹇???Vercel Dashboard > Settings > Environment Variables ??頨急謍捍?);
      }
      if (!supabaseServiceKey && !supabaseAnonKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY ??SUPABASE_ANON_KEY ????????曇澈?堊垣?蹇???Vercel Dashboard > Settings > Environment Variables ??頨急謍捍?);
      }
      throw new Error('Supabase ?堆撓????迎???剜???蹇??潘撓貔??????脤????);
    }
    
    const supabase = getSupabase();
    // ?謅疵?????獢??鈭亙眺???????
    const { error } = await supabase.from('forms').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // PGRST116 ?萄?抒????殉死???謕??????      // ?????芰??萄?????謘踱???????      if (error.code === '42P01') {
        throw new Error('???冽兩?????溘蹇???Supabase Dashboard > SQL Editor ??貔?supabase-complete-schema.sql ?????????);
      }
      throw new Error(`Supabase ????剜????{error.message} (code: ${error.code})`);
    }
    return true;
  } catch (error: any) {
    if (error.message.includes('Supabase ???縣???頨急?) || error.message.includes('???????)) {
      throw error; // ?????????????芰?
    }
    throw new Error(`???冽?????潘撓貔????{error.message}`);
  }
}
