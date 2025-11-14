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
  getProcessedFacebookComments,
  updateFormLastScanAt
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
 * - https://www.facebook.com/groups/{group_id}/?multi_permalinks={post_id}&...
 */
function parseFacebookPostUrl(postUrl: string): { groupId?: string; postId: string } {
  // 先嘗試從查詢參數中提取（格式：?multi_permalinks={post_id}）
  const urlObj = new URL(postUrl);
  const multiPermalinks = urlObj.searchParams.get('multi_permalinks');
  if (multiPermalinks) {
    // 從 URL 路徑中提取群組 ID
    const groupMatch = postUrl.match(/\/groups\/(\d+)/);
    if (groupMatch) {
      return { groupId: groupMatch[1], postId: multiPermalinks };
    }
    // 如果沒有群組 ID，只返回貼文 ID
    return { postId: multiPermalinks };
  }
  
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
    
    console.log(`[Facebook] 解析 URL：社團 ID=${groupId || '無'}, 貼文 ID=${postId}`);
    console.log(`[Facebook] 原始 URL：${postUrl}`);
    
    // 嘗試多種 API 端點格式
    const apiEndpoints: Array<{ name: string; url: string }> = [];
    
    if (groupId) {
      // 方法 1: 使用完整格式 {group_id}_{post_id}
      apiEndpoints.push({
        name: '完整格式 (group_id_post_id)',
        url: `https://graph.facebook.com/v18.0/${groupId}_${postId}/comments?access_token=${accessToken}&fields=id,message,from,created_time&limit=100`
      });
      
      // 方法 2: 使用社團 feed 然後過濾（需要先取得貼文）
      // 這個方法較複雜，先不實作
      
      // 方法 3: 直接使用貼文 ID（不帶群組 ID）
      apiEndpoints.push({
        name: '直接貼文 ID',
        url: `https://graph.facebook.com/v18.0/${postId}/comments?access_token=${accessToken}&fields=id,message,from,created_time&limit=100`
      });
    } else {
      // 如果沒有群組 ID，直接使用貼文 ID
      apiEndpoints.push({
        name: '貼文 ID',
        url: `https://graph.facebook.com/v18.0/${postId}/comments?access_token=${accessToken}&fields=id,message,from,created_time&limit=100`
      });
    }
    
    // 嘗試每個端點
    for (const endpoint of apiEndpoints) {
      try {
        console.log(`[Facebook] 嘗試端點：${endpoint.name}`);
        console.log(`[Facebook] API URL：${endpoint.url.replace(accessToken, 'TOKEN_HIDDEN')}`);
        
        let allComments: FacebookComment[] = [];
        let nextUrl = endpoint.url;
        let attemptCount = 0;
        const maxAttempts = 10; // 最多嘗試 10 頁
        
        while (nextUrl && attemptCount < maxAttempts) {
          attemptCount++;
          const response = await fetch(nextUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            let errorData: any = {};
            try {
              errorData = JSON.parse(errorText);
            } catch {
              // 如果不是 JSON，直接使用文字
            }
            
            console.error(`[Facebook] API 錯誤 (${endpoint.name}):`, errorText);
            
            // 檢查錯誤類型
            if (errorData.error) {
              const errorCode = errorData.error.code;
              const errorSubcode = errorData.error.error_subcode;
              const errorMessage = errorData.error.message;
              
              console.error(`[Facebook] 錯誤代碼：${errorCode}, 子代碼：${errorSubcode}`);
              console.error(`[Facebook] 錯誤訊息：${errorMessage}`);
              
              // 錯誤代碼 100 + 子代碼 33 通常表示權限不足或物件不存在
              if (errorCode === 100 && errorSubcode === 33) {
                console.warn(`[Facebook] 物件不存在或權限不足 (${endpoint.name})`);
                // 繼續嘗試下一個端點
                break;
              }
              
              // 如果是權限錯誤，嘗試下一個端點
              if (response.status === 403 || response.status === 401) {
                console.warn(`[Facebook] 權限不足 (${endpoint.name})`);
                break;
              }
            }
            
            // 如果不是第一個端點，嘗試下一個
            if (endpoint !== apiEndpoints[0]) {
              break;
            }
            
            // 如果是第一個端點且是權限錯誤，嘗試下一個
            throw new Error(`Facebook API 錯誤: ${response.status}`);
          }

          const data = await response.json();
          
          // 檢查是否有錯誤
          if (data.error) {
            console.error(`[Facebook] API 返回錯誤 (${endpoint.name}):`, data.error);
            // 嘗試下一個端點
            break;
          }
          
          if (data.data) {
            allComments = allComments.concat(data.data);
            console.log(`[Facebook] 成功取得 ${data.data.length} 筆留言 (${endpoint.name})，累計 ${allComments.length} 筆`);
          }
          
          // 檢查是否有下一頁
          nextUrl = data.paging?.next || null;
          
          // 限制最多取得 500 筆留言（避免過多）
          if (allComments.length >= 500) {
            console.log(`[Facebook] 已達到 500 筆留言上限`);
            break;
          }
        }
        
        // 如果成功取得留言，返回結果
        if (allComments.length > 0) {
          console.log(`[Facebook] ✅ 成功使用 ${endpoint.name} 取得 ${allComments.length} 筆留言`);
          return allComments;
        }
        
        console.log(`[Facebook] ⚠️ ${endpoint.name} 未取得任何留言，嘗試下一個端點...`);
      } catch (endpointError: any) {
        console.error(`[Facebook] 端點 ${endpoint.name} 發生錯誤:`, endpointError.message);
        // 繼續嘗試下一個端點
        continue;
      }
    }
    
    // 所有端點都失敗
    console.warn(`[Facebook] ⚠️ 所有 API 端點都無法取得留言`);
    console.warn(`[Facebook] 可能原因：`);
    console.warn(`  1. Access Token 權限不足（需要 groups_read_content, groups_access_member_info）`);
    console.warn(`  2. 貼文 ID 不正確或貼文不存在`);
    console.warn(`  3. 貼文屬於私密社團，且 Token 沒有該社團的存取權限`);
    console.warn(`[Facebook] 建議檢查：`);
    console.warn(`  - 在 Graph API Explorer 中測試 Token 權限`);
    console.warn(`  - 確認貼文 URL 是否正確`);
    console.warn(`  - 確認 Token 是否為該社團的管理員或成員`);
    
    return [];
  } catch (error: any) {
    console.error('[Facebook] 取得留言時發生未預期錯誤:', error);
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

  // 驗證請求來源（如果設定了 CRON_SECRET，則需要認證）
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
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
    
    console.log(`[Facebook] ========== 開始掃描 Facebook 留言 ==========`);
    console.log(`[Facebook] 時間：${new Date().toISOString()}`);
    console.log(`[Facebook] 啟用監控的表單數量：${monitoringForms.length}`);
    console.log(`[Facebook] Access Token：${fbAccessToken ? '已設定' : '未設定'}`);

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
        
        // 如果沒有設定關鍵字，但只有一個表單，也處理（共用表單的情況）
        if (keywords.length === 0) {
          const allMonitoringForms = monitoringForms.filter(f => {
            const deadline = f.order_deadline ? new Date(f.order_deadline) : new Date(f.deadline);
            return new Date() <= deadline;
          });
          if (allMonitoringForms.length === 1) {
            console.log(`表單 ${form.id} (${form.name}) 沒有設定關鍵字，但只有一個表單，使用此表單`);
          } else {
          console.log(`表單 ${form.id} (${form.name}) 沒有設定關鍵字，跳過處理`);
          continue;
          }
        }
        
        // 解析貼文 URL 以取得社團資訊
        const urlInfo = parseFacebookPostUrl(form.facebook_post_url!);
        console.log(`表單 ${form.id} (${form.name})：社團 ID=${urlInfo.groupId || '無'}, 貼文 ID=${urlInfo.postId}, 發文者：${form.facebook_post_author || '未設定'}`);
        
        // 取得留言
        console.log(`[Facebook] 開始取得留言，表單：${form.id} (${form.name})，貼文 URL：${form.facebook_post_url}`);
        const comments = await fetchFacebookComments(form.facebook_post_url!, fbAccessToken);
        console.log(`[Facebook] 取得 ${comments.length} 筆留言`);
        
        if (comments.length === 0) {
          console.log(`[Facebook] ⚠️ 表單 ${form.id} (${form.name}) 沒有取得任何留言，可能原因：`);
          console.log(`  - Access Token 無效或過期`);
          console.log(`  - 貼文 URL 格式錯誤`);
          console.log(`  - 沒有權限存取該貼文`);
          console.log(`  - 貼文確實沒有留言`);
        }
        
        totalScanned += comments.length;
        
        // 取得資料庫中已處理的留言 ID 列表
        const processedCommentIds = await getProcessedFacebookComments(form.id);
        const processedSet = new Set(processedCommentIds);
        
        console.log(`[Facebook] 表單 ${form.id} (${form.name})：掃描到 ${comments.length} 筆留言，資料庫中已處理 ${processedSet.size} 筆`);
        
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
          const matches = matchesKeywords(comment.message, keywords);
          console.log(`[Facebook] 檢查留言 ${comment.id}：${comment.message.substring(0, 50)}... 是否符合關鍵字：${matches ? '✅' : '❌'}`);
          
          if (!matches) {
            console.log(`[Facebook] 留言不符合關鍵字，跳過：${comment.message}`);
            continue;
          }

          console.log(`[Facebook] ✅ 留言符合關鍵字，開始處理：${comment.from.name} - ${comment.message}`);

          // 🔥 智能處理：如果看到 +1，直接建立簡單訂單（客戶名稱 = 留言者姓名，數量 = 1）
          const isSimplePlusOne = /\+1|加一|加1|\+\s*1|加\s*一|加\s*1/i.test(comment.message);
          
          let orderData: Record<string, any> = {};
          let customerName = comment.from.name;
          let customerPhone = '';

          if (isSimplePlusOne) {
            // 提取數量（如果訊息是 +2、+3 等）
            const quantityMatch = comment.message.match(/\+(\d+)|加(\d+)|加一|加1/);
            const quantity = quantityMatch ? (parseInt(quantityMatch[1] || quantityMatch[2] || '1', 10) || 1) : 1;
            
            console.log(`[Facebook] 建立簡單 +1 訂單: ${comment.from.name}, 數量: ${quantity}`);
            
            // 尋找數量欄位
            const quantityField = form.fields.find(
              (f: FormField) => f.label.includes('數量') || f.label.includes('訂購數量') || f.type === 'number'
            );
            if (quantityField) {
              orderData[quantityField.name] = quantity;
            } else {
              // 如果沒有數量欄位，嘗試找第一個 number 類型的欄位
              const firstNumberField = form.fields.find((f: FormField) => f.type === 'number');
              if (firstNumberField) {
                orderData[firstNumberField.name] = quantity;
              }
            }
            
            // 客戶名稱 = 留言者姓名，數量 = 1（或從訊息提取的數量）
            customerName = comment.from.name;
            customerPhone = '';
          } else {
            // 如果不是簡單的 +1，嘗試解析複雜訊息
          const availableProducts = extractProductsFromForm(form.fields);
          const parsed = parseOrderMessage(
            comment.message,
            availableProducts,
            '預設商品',
            'groupbuy'
          );

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
              console.log(`[Facebook] 留言符合關鍵字但無法解析，建立簡單訂單: ${comment.message}`);
              
              const quantityField = form.fields.find(
                (f: FormField) => f.label.includes('數量') || f.label.includes('訂購數量') || f.type === 'number'
              );
              if (quantityField) {
                orderData[quantityField.name] = 1;
              } else {
                const firstNumberField = form.fields.find((f: FormField) => f.type === 'number');
                if (firstNumberField) {
                  orderData[firstNumberField.name] = 1;
                }
              }
              
              customerName = comment.from.name;
              customerPhone = '';
            }
          }

          // 建立訂單
          console.log(`[Facebook] 📝 準備建立訂單：`, {
            formId: form.id,
            formName: form.name,
            orderData,
            customerName,
            customerPhone
          });
          
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
          
          console.log(`[Facebook] ✅ 訂單建立成功：${orderToken}`);

          // 自動回覆留言（使用表單設定的回覆訊息，或預設「已登記」）
          const replyMessage = form.facebook_reply_message || '已登記';
          console.log(`[Facebook] 💬 準備回覆留言 ${comment.id}：${replyMessage}`);
          
          const replySuccess = await replyToFacebookComment(comment.id, replyMessage, fbAccessToken);
          
          if (replySuccess) {
            console.log(`[Facebook] ✅ 已回覆留言 ${comment.id}：${replyMessage}`);
          } else {
            console.warn(`[Facebook] ⚠️ 回覆留言 ${comment.id} 失敗，可能原因：`);
            console.warn(`  - Access Token 無效或過期`);
            console.warn(`  - 沒有回覆留言的權限`);
            console.warn(`  - 留言 ID 錯誤`);
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
          console.log(`[Facebook] ✅ 已更新表單 ${form.id} (${form.name}) 最後掃描時間`);
        } catch (error: any) {
          console.error(`[Facebook] 更新表單 ${form.id} 最後掃描時間失敗:`, error);
        }
      } catch (error: any) {
        console.error(`[Facebook] ❌ 掃描表單 ${form.id} 錯誤:`, error);
        results.push({
          formId: form.id,
          formName: form.name,
          error: error.message,
        });
      }
    }

    console.log(`[Facebook] ========== 掃描完成 ==========`);
    console.log(`[Facebook] 總共掃描：${totalScanned} 筆留言`);
    console.log(`[Facebook] 總共處理：${totalProcessed} 筆訂單`);

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

