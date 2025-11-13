import { supabaseAdmin } from './supabase';
import type { FormField, Form, Order } from './db';

// ç¢ºä?ä½¿ç”¨ Supabase Admin å®¢æˆ¶ç«?function getSupabase() {
  if (!supabaseAdmin) {
    console.warn('? ï? è­¦å?ï¼šæœªè¨­å? SUPABASE_SERVICE_ROLE_KEYï¼Œä½¿??anon keyï¼ˆå¯?½æ??‰æ??é??¶ï?');
    throw new Error('Supabase ?ªæ­£ç¢ºè¨­å®šï?è«‹æª¢?¥ç’°å¢ƒè??¸ã€‚å»ºè­°è¨­å®?SUPABASE_SERVICE_ROLE_KEY ä»¥ç²å¾—å??´æ??ã€?);
  }
  return supabaseAdmin;
}

// ?å??–è??™åº«è¡¨ï???Supabase Dashboard ??SQL Editor ä¸­åŸ·è¡?supabase-schema.sqlï¼?export async function initDatabase() {
  // Supabase è¡¨ç?æ§‹å·²??SQL Editor ä¸­å»ºç«‹ï??™è£¡ä¸é?è¦å?ä»»ä?äº?  // ä½†ä??™æ­¤?½æ•¸ä»¥ä???API ?¸å®¹??  console.log('Supabase è³‡æ?åº«å·²?å??–ï?è¡¨ç?æ§‹æ?å·²åœ¨ SQL Editor ä¸­å»ºç«‹ï?');
}

// è¡¨å–®?¸é??ä?
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

  if (error) throw new Error(`å»ºç?è¡¨å–®å¤±æ?ï¼?{error.message}`);
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
    if (error.code === 'PGRST116') return null; // ?¾ä??°è???    throw new Error(`?–å?è¡¨å–®å¤±æ?ï¼?{error.message}`);
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
    throw new Error(`?–å?è¡¨å–®å¤±æ?ï¼?{error.message}`);
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

  if (error) throw new Error(`?–å?è¡¨å–®?—è¡¨å¤±æ?ï¼?{error.message}`);
  return (data || []).map(mapFormFromDb);
}

export async function getDeletedForms(): Promise<Form[]> {
  const { data, error } = await getSupabase()
    .from('forms')
    .select('*')
    .eq('deleted', 1)
    .order('deleted_at', { ascending: false });

  if (error) throw new Error(`?–å?å·²åˆª?¤è¡¨?®å¤±?—ï?${error.message}`);
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

  if (error) throw new Error(`?´æ–°è¡¨å–®å¤±æ?ï¼?{error.message}`);
  return true;
}

export async function updateFormName(formId: number, newName: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('forms')
    .update({ name: newName })
    .eq('id', formId);

  if (error) throw new Error(`?´æ–°è¡¨å–®?ç¨±å¤±æ?ï¼?{error.message}`);
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

  if (error) throw new Error(`æ¨™è??±è¡¨?Ÿæ?å¤±æ?ï¼?{error.message}`);
  return true;
}

export async function getFormsReadyForReport(): Promise<Form[]> {
  const now = new Date().toISOString();
  
  // Supabase ?¥è©¢ï¼šä½¿?¨å???SQL ?–å?æ­¥æŸ¥è©?  // ?ˆæŸ¥è©¢æ? order_deadline ä¸”å·²?°æ???  const { data: data1, error: error1 } = await getSupabase()
    .from('forms')
    .select('*')
    .not('order_deadline', 'is', null)
    .lte('order_deadline', now)
    .eq('report_generated', 0)
    .eq('deleted', 0);

  // ?æŸ¥è©¢æ???order_deadline ä½?deadline å·²åˆ°?Ÿç?
  const { data: data2, error: error2 } = await getSupabase()
    .from('forms')
    .select('*')
    .is('order_deadline', null)
    .lte('deadline', now)
    .eq('report_generated', 0)
    .eq('deleted', 0);

  if (error1 || error2) {
    throw new Error(`?–å?å¾…ç??å ±è¡¨è¡¨?®å¤±?—ï?${error1?.message || error2?.message}`);
  }

  // ?ˆä½µçµæ?ä¸¦æ?åº?  const allForms = [...(data1 || []), ...(data2 || [])];
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

  if (error) throw new Error(`ç§»å?è¡¨å–®?°å??¾æ¡¶å¤±æ?ï¼?{error.message}`);
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

  if (error) throw new Error(`?„å?è¡¨å–®å¤±æ?ï¼?{error.message}`);
  return true;
}

export async function permanentlyDeleteForm(formId: number): Promise<{ success: boolean; deletedOrders: number }> {
  // ?ˆè?ç®—è??ªé™¤?„è??®æ•¸??  const { count } = await getSupabase()
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('form_id', formId);

  const deletedOrders = count || 0;

  // ?ªé™¤?¸é?è¨‚å–®ï¼ˆCASCADE ?ƒè‡ª?•è??†ï?ä½†æ??‘å??‹å??ªé™¤ä»¥ç²?–æ•¸?ï?
  await getSupabase()
    .from('orders')
    .delete()
    .eq('form_id', formId);

  // æ°¸ä??ªé™¤è¡¨å–®
  const { error } = await getSupabase()
    .from('forms')
    .delete()
    .eq('id', formId);

  if (error) throw new Error(`æ°¸ä??ªé™¤è¡¨å–®å¤±æ?ï¼?{error.message}`);
  return { success: true, deletedOrders };
}

// è¨‚å–®?¸é??ä?
// å¾è??®è??™ä¸­?å??©å?æ¸…å–®ï¼ˆå?å¥½ä?å¤šä»£è³¼æ?ä½ï?
function extractItemsSummary(form: Form, orderData: Record<string, any>): Array<{ name: string; quantity: number }> | null {
  const items: Array<{ name: string; quantity: number }> = [];
  
  // ?æ­·è¡¨å–®æ¬„ä?ï¼Œæ‰¾?ºã€Œå¥½äº‹å?ä»?³¼?é??‹ç?æ¬„ä?
  for (const field of form.fields) {
    if (field.type === 'costco') {
      const value = orderData[field.name];
      if (Array.isArray(value)) {
        // ?•ç??¸ç??¼å??„ç‰©?æ???        for (const item of value) {
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
  form?: Form // ?°å? form ?ƒæ•¸?¨æ–¼?å??©å?æ¸…å–®
): Promise<string> {
  const orderToken = generateToken();
  
  // ?å??©å?æ¸…å–®
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

  if (error) throw new Error(`å»ºç?è¨‚å–®å¤±æ?ï¼?{error.message}`);
  return orderToken;
}

export async function updateOrder(orderToken: string, orderData: Record<string, any>): Promise<boolean> {
  const { error } = await getSupabase()
    .from('orders')
    .update({ order_data: orderData })
    .eq('order_token', orderToken);

  if (error) throw new Error(`?´æ–°è¨‚å–®å¤±æ?ï¼?{error.message}`);
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
    throw new Error(`?–å?è¨‚å–®å¤±æ?ï¼?{error.message}`);
  }

  return mapOrderFromDb(data);
}

export async function getOrdersByFormId(formId: number): Promise<Order[]> {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`?–å?è¨‚å–®?—è¡¨å¤±æ?ï¼?{error.message}`);
  return (data || []).map(mapOrderFromDb);
}

export async function deleteOrder(orderToken: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('orders')
    .delete()
    .eq('order_token', orderToken);

  if (error) throw new Error(`?ªé™¤è¨‚å–®å¤±æ?ï¼?{error.message}`);
  return true;
}

// ç³»çµ±è¨­å??¸é??ä?
export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await getSupabase()
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`?–å?è¨­å?å¤±æ?ï¼?{error.message}`);
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

  if (error) throw new Error(`?²å?è¨­å?å¤±æ?ï¼?{error.message}`);
  return true;
}

// è¼”åŠ©?½æ•¸ï¼šå?è³‡æ?åº«è??„æ?å°„ç‚º Form ?©ä»¶
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

// è¼”åŠ©?½æ•¸ï¼šå?è³‡æ?åº«è??„æ?å°„ç‚º Order ?©ä»¶
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

// LINE è³??è¨˜é??¸é??½æ•¸ï¼ˆSupabaseï¼?export async function recordLinePost(
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
      console.error('è¨˜é? LINE è³???¯èª¤:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('è¨˜é? LINE è³???¯èª¤:', error);
    return false;
  }
}

}

// ?Ÿæ??¯ä? token
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// ä¿ç?è¨‚å–®?’å?ï¼ˆSupabaseï¼?export async function reserveOrderNumber(formId: number, sessionId: string): Promise<{ success: boolean; orderNumber?: number; error?: string }> {
  try {
    // ?ˆæ??†é??Ÿä??™ï?5?†é?ï¼?    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await getSupabase()
      .from('reserved_orders')
      .delete()
      .eq('form_id', formId)
      .lt('reserved_at', fiveMinutesAgo)
      .is('order_token', null);

    // æª¢æŸ¥?¯å¦å·²æ?ä¿ç?
    const { data: existing } = await getSupabase()
      .from('reserved_orders')
      .select('*')
      .eq('form_id', formId)
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      // æª¢æŸ¥?¯å¦å·²é???      const reservedAt = new Date(existing.reserved_at);
      const now = new Date();
      if (now.getTime() - reservedAt.getTime() > 5 * 60 * 1000 && !existing.order_token) {
        // å·²é??Ÿï??ªé™¤ä¸¦é??°å???        await getSupabase()
          .from('reserved_orders')
          .delete()
          .eq('id', existing.id);
      } else {
        // è¿”å??¾æ?ä¿ç?
        return { success: true, orderNumber: existing.order_number };
      }
    }

    // ?–å??¶å?å·²æ?äº¤ç?è¨‚å–®?Œå·²ä¿ç??„æ•¸??    const { data: orders } = await getSupabase()
      .from('orders')
      .select('id')
      .eq('form_id', formId);

    const { data: reserved } = await getSupabase()
      .from('reserved_orders')
      .select('order_number')
      .eq('form_id', formId)
      .or(`order_token.not.is.null,reserved_at.gt.${fiveMinutesAgo}`);

    // è¨ˆç?ä¸‹ä??‹å¯?¨ç??’å???    const usedNumbers = new Set<number>();
    (reserved || []).forEach((r: any) => {
      usedNumbers.add(r.order_number);
    });

    // ?¾åˆ°ç¬¬ä??‹å¯?¨ç??’å???    let orderNumber = 1;
    while (usedNumbers.has(orderNumber)) {
      orderNumber++;
    }

    // ?’å…¥ä¿ç?è¨˜é?ï¼ˆä½¿??upsert ?•ç??¯ä?ç´„æ?ï¼?    const { error } = await getSupabase()
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
    console.error('ä¿ç?è¨‚å–®?’å??¯èª¤:', error);
    return { success: false, error: error.message };
  }
}

// ç¢ºè?ä¿ç??„æ?åºï??äº¤è¨‚å–®?‚ï?
export async function confirmReservedOrder(formId: number, sessionId: string, orderToken: string): Promise<boolean> {
  try {
    const { error } = await getSupabase()
      .from('reserved_orders')
      .update({ order_token: orderToken })
      .eq('form_id', formId)
      .eq('session_id', sessionId);

    return !error;
  } catch (error) {
    console.error('ç¢ºè?ä¿ç?è¨‚å–®?¯èª¤:', error);
    return false;
  }
}

// ?–å?ä¿ç??„æ?åºè?
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
    console.error('?–å?ä¿ç?è¨‚å–®?’å??¯èª¤:', error);
    return null;
  }
}

// æ¸…ç??æ?ä¿ç?
export async function cleanupExpiredReservations(): Promise<void> {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await getSupabase()
      .from('reserved_orders')
      .delete()
      .lt('reserved_at', fiveMinutesAgo)
      .is('order_token', null);
  } catch (error) {
    console.error('æ¸…ç??æ?ä¿ç??¯èª¤:', error);
  }
}

// LINE è³??è¨˜é??¸é??½æ•¸
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
    console.error('è¨˜é? LINE è³???¯èª¤:', error);
    throw new Error(`è¨˜é? LINE è³??å¤±æ?ï¼?{error.message}`);
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
    console.error('?–å? LINE è³??è¨˜é??¯èª¤:', error);
    return [];
  }
}

// ?å??–æª¢?¥ï?ä¿æ? API ?¸å®¹?§ï?
export async function ensureDatabaseInitialized() {
  // Supabase ä¸é?è¦å?å§‹å?ï¼Œè¡¨çµæ?å·²åœ¨ SQL Editor ä¸­å»ºç«?  // ä½†é?è¦æª¢??Supabase ????¯å¦æ­?¸¸
  try {
    // ?ˆæª¢??supabaseAdmin ?¯å¦å­˜åœ¨
    if (!supabaseAdmin) {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      if (!supabaseUrl) {
        throw new Error('SUPABASE_URL ?°å?è®Šæ•¸?ªè¨­å®šã€‚è???Vercel Dashboard > Settings > Environment Variables ä¸­è¨­å®šã€?);
      }
      if (!supabaseServiceKey && !supabaseAnonKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY ??SUPABASE_ANON_KEY ?°å?è®Šæ•¸?ªè¨­å®šã€‚è???Vercel Dashboard > Settings > Environment Variables ä¸­è¨­å®šã€?);
      }
      throw new Error('Supabase å®¢æˆ¶ç«¯å?å§‹å?å¤±æ??‚è?æª¢æŸ¥?°å?è®Šæ•¸è¨­å???);
    }
    
    const supabase = getSupabase();
    // ?—è©¦ä¸€?‹ç°¡?®ç??¥è©¢ä¾†é?è­‰é€??
    const { error } = await supabase.from('forms').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // PGRST116 è¡¨ç¤ºæ²’æ?è¨˜é?ï¼Œé€™æ˜¯æ­?¸¸??      // ?¶ä??¯èª¤è¡¨ç¤º????–è¡¨çµæ??‰å?é¡?      if (error.code === '42P01') {
        throw new Error('è³‡æ?åº«è¡¨ä¸å??¨ã€‚è???Supabase Dashboard > SQL Editor ä¸­åŸ·è¡?supabase-complete-schema.sql ä¾†å»ºç«‹è¡¨çµæ???);
      }
      throw new Error(`Supabase ???å¤±æ?ï¼?{error.message} (code: ${error.code})`);
    }
    return true;
  } catch (error: any) {
    if (error.message.includes('Supabase ?ªæ­£ç¢ºè¨­å®?) || error.message.includes('?°å?è®Šæ•¸')) {
      throw error; // ?æ–°?‹å‡º?°å?è®Šæ•¸?¯èª¤
    }
    throw new Error(`è³‡æ?åº«é€??æª¢æŸ¥å¤±æ?ï¼?{error.message}`);
  }
}
