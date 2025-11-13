import { supabaseAdmin } from './supabase';
import type { FormField, Form, Order } from './db';

// 蝣箔?雿輻 Supabase Admin 摰Ｘ蝡?function getSupabase() {
  if (!supabaseAdmin) {
    console.warn('?? 霅血?嚗閮剖? SUPABASE_SERVICE_ROLE_KEY嚗蝙??anon key嚗?賣??????塚?');
    throw new Error('Supabase ?芣迤蝣箄身摰?隢炎?亦憓??詻遣霅啗身摰?SUPABASE_SERVICE_ROLE_KEY 隞亦敺??湔???);
  }
  return supabaseAdmin;
}

// ?????澈銵剁???Supabase Dashboard ??SQL Editor 銝剖銵?supabase-schema.sql嚗?export async function initDatabase() {
  // Supabase 銵函?瑽歇??SQL Editor 銝剖遣蝡??ㄐ銝?閬?隞颱?鈭?  // 雿??迨?賣隞乩???API ?詨捆??  console.log('Supabase 鞈?摨怠歇????銵函?瑽?撌脣 SQL Editor 銝剖遣蝡?');
}

// 銵典?賊???
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

  if (error) throw new Error(`撱箇?銵典憭望?嚗?{error.message}`);
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
    if (error.code === 'PGRST116') return null; // ?曆??啗???    throw new Error(`??銵典憭望?嚗?{error.message}`);
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
    throw new Error(`??銵典憭望?嚗?{error.message}`);
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

  if (error) throw new Error(`??銵典?”憭望?嚗?{error.message}`);
  return (data || []).map(mapFormFromDb);
}

export async function getDeletedForms(): Promise<Form[]> {
  const { data, error } = await getSupabase()
    .from('forms')
    .select('*')
    .eq('deleted', 1)
    .order('deleted_at', { ascending: false });

  if (error) throw new Error(`??撌脣?方”?桀仃??${error.message}`);
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

  if (error) throw new Error(`?湔銵典憭望?嚗?{error.message}`);
  return true;
}

export async function updateFormName(formId: number, newName: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('forms')
    .update({ name: newName })
    .eq('id', formId);

  if (error) throw new Error(`?湔銵典?迂憭望?嚗?{error.message}`);
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

  if (error) throw new Error(`璅??梯”??憭望?嚗?{error.message}`);
  return true;
}

export async function getFormsReadyForReport(): Promise<Form[]> {
  const now = new Date().toISOString();
  
  // Supabase ?亥岷嚗蝙?典???SQL ??甇交閰?  // ?閰Ｘ? order_deadline 銝歇?唳???  const { data: data1, error: error1 } = await getSupabase()
    .from('forms')
    .select('*')
    .not('order_deadline', 'is', null)
    .lte('order_deadline', now)
    .eq('report_generated', 0)
    .eq('deleted', 0);

  // ?閰Ｘ???order_deadline 雿?deadline 撌脣??
  const { data: data2, error: error2 } = await getSupabase()
    .from('forms')
    .select('*')
    .is('order_deadline', null)
    .lte('deadline', now)
    .eq('report_generated', 0)
    .eq('deleted', 0);

  if (error1 || error2) {
    throw new Error(`??敺??銵刻”?桀仃??${error1?.message || error2?.message}`);
  }

  // ?蔥蝯?銝行?摨?  const allForms = [...(data1 || []), ...(data2 || [])];
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

  if (error) throw new Error(`蝘餃?銵典?啣??暹▲憭望?嚗?{error.message}`);
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

  if (error) throw new Error(`??銵典憭望?嚗?{error.message}`);
  return true;
}

export async function permanentlyDeleteForm(formId: number): Promise<{ success: boolean; deletedOrders: number }> {
  // ??蝞??芷???格??  const { count } = await getSupabase()
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('form_id', formId);

  const deletedOrders = count || 0;

  // ?芷?賊?閮嚗ASCADE ?????雿??????芷隞亦???
  await getSupabase()
    .from('orders')
    .delete()
    .eq('form_id', formId);

  // 瘞訾??芷銵典
  const { error } = await getSupabase()
    .from('forms')
    .delete()
    .eq('id', formId);

  if (error) throw new Error(`瘞訾??芷銵典憭望?嚗?{error.message}`);
  return { success: true, deletedOrders };
}

// 閮?賊???
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

export async function createOrder(
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

  if (error) throw new Error(`撱箇?閮憭望?嚗?{error.message}`);
  return orderToken;
}

export async function updateOrder(orderToken: string, orderData: Record<string, any>): Promise<boolean> {
  const { error } = await getSupabase()
    .from('orders')
    .update({ order_data: orderData })
    .eq('order_token', orderToken);

  if (error) throw new Error(`?湔閮憭望?嚗?{error.message}`);
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
    throw new Error(`??閮憭望?嚗?{error.message}`);
  }

  return mapOrderFromDb(data);
}

export async function getOrdersByFormId(formId: number): Promise<Order[]> {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`??閮?”憭望?嚗?{error.message}`);
  return (data || []).map(mapOrderFromDb);
}

export async function deleteOrder(orderToken: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('orders')
    .delete()
    .eq('order_token', orderToken);

  if (error) throw new Error(`?芷閮憭望?嚗?{error.message}`);
  return true;
}

// 蝟餌絞閮剖??賊???
export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await getSupabase()
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`??閮剖?憭望?嚗?{error.message}`);
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

  if (error) throw new Error(`?脣?閮剖?憭望?嚗?{error.message}`);
  return true;
}

// 頛?賣嚗?鞈?摨怨???撠 Form ?拐辣
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

// 頛?賣嚗?鞈?摨怨???撠 Order ?拐辣
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

// LINE 鞈??閮??賊??賣嚗upabase嚗?export async function recordLinePost(
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
      console.error('閮? LINE 鞈???航炊:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('閮? LINE 鞈???航炊:', error);
    return false;
  }
}

}

// ???臭? token
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 靽?閮??嚗upabase嚗?export async function reserveOrderNumber(formId: number, sessionId: string): Promise<{ success: boolean; orderNumber?: number; error?: string }> {
  try {
    // ????????5??嚗?    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await getSupabase()
      .from('reserved_orders')
      .delete()
      .eq('form_id', formId)
      .lt('reserved_at', fiveMinutesAgo)
      .is('order_token', null);

    // 瑼Ｘ?臬撌脫?靽?
    const { data: existing } = await getSupabase()
      .from('reserved_orders')
      .select('*')
      .eq('form_id', formId)
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      // 瑼Ｘ?臬撌脤???      const reservedAt = new Date(existing.reserved_at);
      const now = new Date();
      if (now.getTime() - reservedAt.getTime() > 5 * 60 * 1000 && !existing.order_token) {
        // 撌脤????芷銝阡??啣???        await getSupabase()
          .from('reserved_orders')
          .delete()
          .eq('id', existing.id);
      } else {
        // 餈??暹?靽?
        return { success: true, orderNumber: existing.order_number };
      }
    }

    // ???嗅?撌脫?鈭斤?閮?歇靽????    const { data: orders } = await getSupabase()
      .from('orders')
      .select('id')
      .eq('form_id', formId);

    const { data: reserved } = await getSupabase()
      .from('reserved_orders')
      .select('order_number')
      .eq('form_id', formId)
      .or(`order_token.not.is.null,reserved_at.gt.${fiveMinutesAgo}`);

    // 閮?銝???函?????    const usedNumbers = new Set<number>();
    (reserved || []).forEach((r: any) => {
      usedNumbers.add(r.order_number);
    });

    // ?曉蝚砌???函?????    let orderNumber = 1;
    while (usedNumbers.has(orderNumber)) {
      orderNumber++;
    }

    // ?靽?閮?嚗蝙??upsert ???臭?蝝?嚗?    const { error } = await getSupabase()
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
    console.error('靽?閮???航炊:', error);
    return { success: false, error: error.message };
  }
}

// 蝣箄?靽???摨??漱閮??
export async function confirmReservedOrder(formId: number, sessionId: string, orderToken: string): Promise<boolean> {
  try {
    const { error } = await getSupabase()
      .from('reserved_orders')
      .update({ order_token: orderToken })
      .eq('form_id', formId)
      .eq('session_id', sessionId);

    return !error;
  } catch (error) {
    console.error('蝣箄?靽?閮?航炊:', error);
    return false;
  }
}

// ??靽???摨?
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
    console.error('??靽?閮???航炊:', error);
    return null;
  }
}

// 皜???靽?
export async function cleanupExpiredReservations(): Promise<void> {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await getSupabase()
      .from('reserved_orders')
      .delete()
      .lt('reserved_at', fiveMinutesAgo)
      .is('order_token', null);
  } catch (error) {
    console.error('皜???靽??航炊:', error);
  }
}

// LINE 鞈??閮??賊??賣
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
    console.error('閮? LINE 鞈???航炊:', error);
    throw new Error(`閮? LINE 鞈??憭望?嚗?{error.message}`);
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
    console.error('?? LINE 鞈??閮??航炊:', error);
    return [];
  }
}

// ???炎?伐?靽? API ?詨捆?改?
export async function ensureDatabaseInitialized() {
  // Supabase 銝?閬?憪?嚗”蝯?撌脣 SQL Editor 銝剖遣蝡?  // 雿?閬炎??Supabase ????臬甇?虜
  try {
    // ?炎??supabaseAdmin ?臬摮
    if (!supabaseAdmin) {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      if (!supabaseUrl) {
        throw new Error('SUPABASE_URL ?啣?霈?芾身摰???Vercel Dashboard > Settings > Environment Variables 銝剛身摰?);
      }
      if (!supabaseServiceKey && !supabaseAnonKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY ??SUPABASE_ANON_KEY ?啣?霈?芾身摰???Vercel Dashboard > Settings > Environment Variables 銝剛身摰?);
      }
      throw new Error('Supabase 摰Ｘ蝡臬?憪?憭望???瑼Ｘ?啣?霈閮剖???);
    }
    
    const supabase = getSupabase();
    // ?岫銝?陛?桃??亥岷靘?霅??
    const { error } = await supabase.from('forms').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // PGRST116 銵函內瘝?閮?嚗甇?虜??      // ?嗡??航炊銵函內????”蝯???憿?      if (error.code === '42P01') {
        throw new Error('鞈?摨怨”銝??具???Supabase Dashboard > SQL Editor 銝剖銵?supabase-complete-schema.sql 靘遣蝡”蝯???);
      }
      throw new Error(`Supabase ???憭望?嚗?{error.message} (code: ${error.code})`);
    }
    return true;
  } catch (error: any) {
    if (error.message.includes('Supabase ?芣迤蝣箄身摰?) || error.message.includes('?啣?霈')) {
      throw error; // ???啣?霈?航炊
    }
    throw new Error(`鞈?摨恍??瑼Ｘ憭望?嚗?{error.message}`);
  }
}
