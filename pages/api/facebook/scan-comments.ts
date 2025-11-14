import type { NextApiRequest, NextApiResponse } from 'next';
import { 
  getAllForms, 
  getFormByToken, 
  createOrder, 
  ensureDatabaseInitialized, 
  FormField, 
  type Form,
  isFacebookCommentProcessed,
  markFacebookCommentAsProcessed,
  getProcessedFacebookComments
} from '@/lib/db';
import { parseOrderMessage, mergeOrderItems, extractProductsFromForm } from '@/lib/message-parser';

/**
 * Facebook 留言掃描 API
 * 掃描所有啟用自動監控的表單的 Facebook 貼文留言
 * 
 * 注意：此 API 需要 Facebook Access Token
 * 實際使用時可能需要使用 Puppeteer 或其他方式來存取私密社團的留言
 */

interface FacebookComment {
  id: string;
  message: string;
  from: {
    name: string;
    id: string;
  };
  created_time: string;
}

/**
 * 從 Facebook 貼文 URL 中提取社團 ID 和貼文 ID
 * 支援多種 URL 格式：
 * - https://www.facebook.com/groups/{group_id}/posts/{post_id}/
 * - https://www.facebook.com/groups/{group_id}/permalink/{post_id}/
 * - https://m.facebook.com/groups/{group_id}/posts/{post_id}/
 */
function parseFacebookPostUrl(postUrl: string): { groupId?: string; postId: string } {
  // 移除查詢參數和錨點
  const cleanUrl = postUrl.split('?')[0].split('#')[0];
  
  // 格式 1: /groups/{group_id}/posts/{post_id}
  let match = cleanUrl.match(/\/groups\/([^\/]+)\/posts\/(\d+)/);
  if (match) {
    return { groupId: match[1], postId: match[2] };
  }
  
  // 格式 2: /groups/{group_id}/permalink/{post_id}
  match = cleanUrl.match(/\/groups\/([^\/]+)\/permalink\/(\d+)/);
  if (match) {
    return { groupId: match[1], postId: match[2] };
  }
  
  // 格式 3: /{user_or_page}/posts/{post_id} (個人或粉絲專頁)
  match = cleanUrl.match(/\/([^\/]+)\/posts\/(\d+)/);
  if (match) {
    return { postId: match[2] };
  }
  
  // 格式 4: /p/{post_id} (短連結)
  match = cleanUrl.match(/\/p\/([^\/]+)/);
  if (match) {
    return { postId: match[1] };
  }
  
  // 格式 5: 直接是數字 ID
  match = cleanUrl.match(/(\d+)$/);
  if (match) {
    return { postId: match[1] };
  }
  
  throw new Error(`無法從 URL 中提取貼文 ID：${postUrl}`);
}

/**
 * 使用 Facebook Graph API 取得貼文留言
 * 注意：對於私密社團，需要適當的權限和 Access Token
 */
async function fetchFacebookComments(
  postUrl: string,
  accessToken: string
): Promise<FacebookComment[]> {
  try {
    // 解析 URL 取得社團 ID 和貼文 ID
    const { groupId, postId } = parseFacebookPostUrl(postUrl);
    
    console.log(`解析 Facebook URL：社團 ID=${groupId || '無'}, 貼文 ID=${postId}`);
    
    // 使用 Facebook Graph API 取得留言
    // 注意：對於私密社團，需要社團管理員權限
    // 
    // API 端點說明：
    // - 如果有社團 ID，可以使用：{group_id}_{post_id} 作為完整貼文 ID
    // - 或直接使用貼文 ID：{post_id}
    // - 對於社團貼文，建議使用完整格式：{group_id}_{post_id}
    
    // 構建完整的貼文 ID（如果有社團 ID）
    const fullPostId = groupId ? `${groupId}_${postId}` : postId;
    
    console.log(`使用完整貼文 ID：${fullPostId}`);
    
    // 使用分頁取得所有留言
    let allComments: FacebookComment[] = [];
    let nextUrl = `https://graph.facebook.com/v18.0/${fullPostId}/comments?access_token=${accessToken}&fields=id,message,from,created_time&limit=100`;
    
    while (nextUrl) {
      const response = await fetch(nextUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Facebook API 錯誤:', error);
        // 如果是權限錯誤，返回空陣列而不是拋出錯誤
        if (response.status === 403 || response.status === 401) {
          console.warn('Facebook API 權限不足，無法取得留言');
          return [];
        }
        throw new Error(`Facebook API 錯誤: ${response.status}`);
      }

      const data = await response.json();
      if (data.data) {
        allComments = allComments.concat(data.data);
      }
      
      // 檢查是否有下一頁
      nextUrl = data.paging?.next || null;
      
      // 限制最多取得 500 筆留言（避免過多）
      if (allComments.length >= 500) {
        break;
      }
    }
    
    return allComments;
  } catch (error: any) {
    console.error('取得 Facebook 留言錯誤:', error);
    // 如果無法取得留言，返回空陣列而不是拋出錯誤
    return [];
  }
}

/**
 * 回覆 Facebook 留言
 */
async function replyToFacebookComment(
  commentId: string,
  message: string,
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${commentId}/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Facebook 回覆錯誤:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('回覆 Facebook 留言錯誤:', error);
    return false;
  }
}

/**
 * 檢查留言是否符合關鍵字（支援靈活的模式匹配）
 */
function matchesKeywords(message: string, keywords: string[]): boolean {
  const lowerMessage = message.toLowerCase();
  return keywords.some(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    
    // 精確匹配
    if (lowerMessage.includes(lowerKeyword)) {
      return true;
    }
    
    // 支援變體：+1 和 加一、加1
    if (lowerKeyword.includes('+') && lowerMessage.includes(lowerKeyword.replace('+', '加'))) {
      return true;
    }
    if (lowerKeyword.includes('加') && lowerMessage.includes(lowerKeyword.replace('加', '+'))) {
      return true;
    }
    
    // 支援模式：數字+數字（例如：1斤+1、5斤+1、水果1斤+1）
    // 將關鍵字轉換為正則表達式模式
    const keywordPattern = lowerKeyword
      .replace(/\+/g, '\\+')
      .replace(/\d+/g, '\\d+')
      .replace(/[\u4e00-\u9fa5]+/g, '[\\u4e00-\\u9fa5]+');
    
    try {
      const regex = new RegExp(keywordPattern);
      if (regex.test(lowerMessage)) {
        return true;
      }
    } catch (e) {
      // 如果正則表達式無效，忽略
    }
    
    return false;
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formId, accessToken } = req.body;

    // 如果指定了表單 ID，只掃描該表單；否則掃描所有啟用自動監控的表單
    let forms: Form[];
    if (formId) {
      const form = await getAllForms().then((forms: Form[]) => forms.find(f => f.id === formId));
      forms = form ? [form] : [];
    } else {
      forms = await getAllForms();
    }

    // 過濾出啟用自動監控的表單
    const monitoringForms = forms.filter(
      form => form.facebook_auto_monitor === 1 &&
              form.facebook_post_url &&
              form.facebook_post_author &&
              form.facebook_keywords
    );

    if (monitoringForms.length === 0) {
      return res.status(200).json({
        message: '沒有啟用自動監控的表單',
        scanned: 0,
        processed: 0,
      });
    }

    // 檢查是否有 Access Token
    const fbAccessToken = accessToken || process.env.FACEBOOK_ACCESS_TOKEN;
    if (!fbAccessToken) {
      return res.status(400).json({
        error: '缺少 Facebook Access Token',
        hint: '請在環境變數中設定 FACEBOOK_ACCESS_TOKEN，或在請求中提供 accessToken',
      });
    }

    const results = [];
    let totalScanned = 0;
    let totalProcessed = 0;

    // 掃描每個表單的留言
    for (const form of monitoringForms) {
      try {
        // 檢查結單時間（使用 order_deadline 或 deadline）
        const deadline = form.order_deadline 
          ? new Date(form.order_deadline) 
          : new Date(form.deadline);
        const now = new Date();
        if (now > deadline) {
          console.log(`表單 ${form.id} (${form.name}) 已超過結單時間，跳過處理`);
          continue;
        }

        // 檢查掃描間隔時間
        const scanInterval = form.facebook_scan_interval || 3; // 預設 3 分鐘
        const lastScanAt = form.facebook_last_scan_at ? new Date(form.facebook_last_scan_at) : null;
        
        if (lastScanAt) {
          const minutesSinceLastScan = (now.getTime() - lastScanAt.getTime()) / (1000 * 60);
          if (minutesSinceLastScan < scanInterval) {
            console.log(`表單 ${form.id} (${form.name}) 距離上次掃描僅 ${Math.round(minutesSinceLastScan)} 分鐘，未達間隔 ${scanInterval} 分鐘，跳過處理`);
            continue;
          }
        }

        const keywords = JSON.parse(form.facebook_keywords || '[]') as string[];
        
        if (keywords.length === 0) {
          console.log(`表單 ${form.id} (${form.name}) 沒有設定關鍵字，跳過處理`);
          continue;
        }
        
        // 解析貼文 URL 以取得社團資訊
        const urlInfo = parseFacebookPostUrl(form.facebook_post_url!);
        console.log(`表單 ${form.id} (${form.name})：社團 ID=${urlInfo.groupId || '無'}, 貼文 ID=${urlInfo.postId}, 發文者：${form.facebook_post_author || '未設定'}`);
        
        // 取得留言
        const comments = await fetchFacebookComments(form.facebook_post_url!, fbAccessToken);
        totalScanned += comments.length;
        
        // 取得資料庫中已處理的留言 ID 列表
        const processedCommentIds = await getProcessedFacebookComments(form.id);
        const processedSet = new Set(processedCommentIds);
        
        console.log(`表單 ${form.id} (${form.name})：掃描到 ${comments.length} 筆留言，資料庫中已處理 ${processedSet.size} 筆`);
        
        // 比對留言數量
        if (comments.length > processedSet.size) {
          console.log(`⚠️ 發現 ${comments.length - processedSet.size} 筆未處理的留言，開始檢查是否有遺漏`);
        } else if (comments.length === processedSet.size) {
          console.log(`✅ 留言數量匹配：Facebook ${comments.length} 筆 = 資料庫 ${processedSet.size} 筆`);
        }

        // 處理每個留言
        for (const comment of comments) {
          // 檢查是否已處理過（使用資料庫記錄）
          if (processedSet.has(comment.id)) {
            continue;
          }
          
          // 再次確認資料庫（避免並發問題）
          if (await isFacebookCommentProcessed(form.id, comment.id)) {
            processedSet.add(comment.id);
            continue;
          }

          // 檢查是否符合關鍵字
          if (!matchesKeywords(comment.message, keywords)) {
            continue;
          }

          // 解析留言訊息
          const availableProducts = extractProductsFromForm(form.fields);
          const parsed = parseOrderMessage(
            comment.message,
            availableProducts,
            '預設商品',
            'groupbuy'
          );

          // 建立訂單資料
          const orderData: Record<string, any> = {};
          let customerName = comment.from.name;
          let customerPhone = '';

          if (parsed && parsed.items.length > 0) {
            // 如果成功解析，使用解析結果
            const mergedItems = mergeOrderItems(parsed.items);

            const productField = form.fields.find(
              (f: FormField) => f.label.includes('商品') || f.label.includes('品項') || f.label.includes('口味')
            );
            if (productField && mergedItems.length > 0) {
              orderData[productField.name] = mergedItems[0].productName;
            }

            const quantityField = form.fields.find(
              (f: FormField) => f.label.includes('數量') || f.label.includes('訂購數量')
            );
            if (quantityField) {
              const totalQuantity = mergedItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
              orderData[quantityField.name] = totalQuantity;
            }

            customerName = parsed.customerName || comment.from.name;
            customerPhone = parsed.customerPhone || '';
          } else {
            // 如果無法解析，但符合關鍵字，建立簡單訂單（數量為 1）
            console.log(`留言符合關鍵字但無法解析，建立簡單訂單: ${comment.message}`);
            
            // 嘗試從訊息中提取商品名稱（移除 +1、加一等關鍵字）
            const cleanMessage = comment.message
              .replace(/\+1|加一|加1|\+\s*1|加\s*一|加\s*1/gi, '')
              .trim();
            
            const productField = form.fields.find(
              (f: FormField) => f.label.includes('商品') || f.label.includes('品項') || f.label.includes('口味')
            );
            if (productField) {
              // 如果有商品欄位，使用清理後的訊息作為商品名稱，或使用表單名稱
              orderData[productField.name] = cleanMessage || form.name || '商品';
            }

            const quantityField = form.fields.find(
              (f: FormField) => f.label.includes('數量') || f.label.includes('訂購數量')
            );
            if (quantityField) {
              orderData[quantityField.name] = 1; // 預設數量為 1
            }
          }

          // 建立訂單
          const orderToken = await createOrder(
            form.id,
            orderData,
            customerName,
            customerPhone,
            undefined,
            undefined,
            'facebook',
            form
          );

          // 自動回覆留言（使用表單設定的回覆訊息，或預設「已登記」）
          const replyMessage = form.facebook_reply_message || '已登記';
          const replySuccess = await replyToFacebookComment(comment.id, replyMessage, fbAccessToken);
          
          if (replySuccess) {
            console.log(`✅ 已回覆留言 ${comment.id}：${replyMessage}`);
          } else {
            console.warn(`⚠️ 回覆留言 ${comment.id} 失敗`);
          }

          // 標記為已處理（使用資料庫記錄）
          await markFacebookCommentAsProcessed(form.id, comment.id);
          processedSet.add(comment.id);

          totalProcessed++;
          results.push({
            formId: form.id,
            formName: form.name,
            commentId: comment.id,
            customerName,
            message: comment.message,
            orderToken,
            replySuccess,
          });
        }

        // 更新表單最後掃描時間（無論是否有處理留言）
        try {
          await updateFormLastScanAt(form.id);
          console.log(`✅ 已更新表單 ${form.id} (${form.name}) 最後掃描時間`);
        } catch (error: any) {
          console.error(`更新表單 ${form.id} 最後掃描時間失敗:`, error);
        }
      } catch (error: any) {
        console.error(`掃描表單 ${form.id} 錯誤:`, error);
        results.push({
          formId: form.id,
          formName: form.name,
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      scanned: totalScanned,
      processed: totalProcessed,
      results,
    });
  } catch (error: any) {
    console.error('Facebook 留言掃描錯誤:', error);
    return res.status(500).json({
      error: '伺服器錯誤',
      details: error.message,
    });
  }
}

