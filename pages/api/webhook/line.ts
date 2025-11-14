import type { NextApiRequest, NextApiResponse } from 'next';
import { parseOrderMessage, mergeOrderItems, extractProductsFromForm } from '@/lib/message-parser';
import { getFormByToken, getAllForms, createOrder, ensureDatabaseInitialized, FormField, recordLinePost, getLatestLineSale, markLineSaleEndAnnounced, markLineSaleFirstWarningSent, type Form } from '@/lib/db';

/**
 * LINE Webhook API
 * 接收 LINE Bot 的訊息並自動建立訂單
 * 
 * 設定方式：
 * 1. 在 LINE Developers Console 建立 Bot
 * 2. 設定 Webhook URL: https://your-domain.com/api/webhook/line
 * 3. 設定 Channel Secret 和 Channel Access Token（環境變數）
 */

// LINE Messaging API 的訊息格式
interface LineEvent {
  type: string;
  message?: {
    type: string;
    text?: string;
  };
  source: {
    type: string;
    userId?: string;
    groupId?: string;
  };
  replyToken?: string;
}

interface LineWebhookBody {
  events: LineEvent[];
}

function extractLineIdentifiers(form: any): string[] {
  const identifiers = new Set<string>();
  if (form?.form_token) {
    identifiers.add(form.form_token.toLowerCase());
    identifiers.add(`@${form.form_token}`.toLowerCase());
  }
  if (form?.line_use_custom_identifier && form?.line_custom_identifier) {
    const custom = String(form.line_custom_identifier).trim();
    if (custom) {
      identifiers.add(custom.toLowerCase());
      const normalized = custom.replace(/^[#@]+/, '').toLowerCase();
      if (normalized && normalized !== custom.toLowerCase()) {
        identifiers.add(normalized);
      }
    }
  }
  return Array.from(identifiers).filter(Boolean);
}

function pad(num: number): string {
  return num.toString().padStart(2, '0');
}

function formatDeadline(date: Date): string {
  return `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日${pad(date.getHours())}時${pad(date.getMinutes())}分`;
}

// 簡化的 LINE API 回應（實際使用時需要安裝 @line/bot-sdk）
async function replyMessage(replyToken: string, message: string, channelAccessToken: string, quoteToken?: string) {
  try {
    const payloadMessage: any = {
      type: 'text',
      text: message,
    };
    if (quoteToken) {
      payloadMessage.quoteToken = quoteToken;
    }

    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [payloadMessage],
      }),
    });

    if (!response.ok) {
      console.error('LINE API 錯誤:', await response.text());
    }
  } catch (error) {
    console.error('回覆 LINE 訊息錯誤:', error);
  }
}

async function sendPushMessage(to: string, message: string, channelAccessToken: string) {
  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to,
        messages: [
          {
            type: 'text',
            text: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('LINE Push API 錯誤:', await response.text());
    }
  } catch (error) {
    console.error('推播 LINE 訊息錯誤:', error);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureDatabaseInitialized();

  // 如果是 GET 請求，返回 Webhook 設定資訊（用於測試）
  if (req.method === 'GET') {
    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const formToken = process.env.LINE_FORM_TOKEN;

    return res.status(200).json({
      message: 'LINE Webhook API 已設定',
      note: '此端點只接受 POST 請求（由 LINE 伺服器發送）',
      status: {
        webhookUrl: 'https://coolcool-ten.vercel.app/api/webhook/line',
        channelSecret: channelSecret ? '✅ 已設定' : '❌ 未設定',
        channelAccessToken: channelAccessToken ? '✅ 已設定' : '❌ 未設定',
        formToken: formToken || '❌ 未設定（選填）',
      },
      instructions: [
        '1. 在 LINE Developers Console 中設定 Webhook URL',
        '2. 確保 "Use webhook" 已啟用',
        '3. LINE 伺服器會自動發送 POST 請求到此端點',
        '4. 您無法用瀏覽器直接測試（瀏覽器使用 GET 請求）',
        '5. 要測試 Webhook，請在 LINE 中發送訊息給 Bot'
      ],
      testMethod: '在 LINE 中發送訊息給 Bot 來測試 Webhook 功能'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 驗證 LINE Webhook（實際使用時需要驗證簽章）
    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const formToken = process.env.LINE_FORM_TOKEN; // 預設表單代碼

    if (!channelSecret || !channelAccessToken) {
      console.warn('LINE 環境變數未設定，無法處理 LINE 訊息');
      return res.status(200).json({ message: 'LINE 未設定' });
    }

    const body: LineWebhookBody = req.body;

    // 處理每個事件
    for (const event of body.events) {
      // 只處理文字訊息
      if (event.type !== 'message' || event.message?.type !== 'text') {
        continue;
      }

      const messageText = event.message.text;
      if (!messageText) continue;
      const messageLower = messageText.toLowerCase();
      const groupId = event.source.groupId || '';
      const quoteToken = (event.message as any).quoteToken;
      if (!groupId) {
        continue;
      }

      // 優先處理群組 ID 查詢指令（必須在訂單處理之前）
      // 檢查訊息是否為群組 ID 查詢指令（支援多種格式）
      const trimmedMessage = messageText.trim();
      // 匹配：群組ID、群組 ID、groupId、group id、群組id 等（不區分大小寫，允許空格）
      const isGroupIdQuery = /^(群組[\s_]?id|group[\s_]?id)$/i.test(trimmedMessage);
      
      if (isGroupIdQuery) {
        const groupId = event.source.groupId;
        const sourceType = event.source.type;
        
        console.log('群組 ID 查詢請求:', { messageText, trimmedMessage, groupId, sourceType });
        
        if (groupId) {
          await replyMessage(
            event.replyToken!,
            `📋 群組 ID：\n${groupId}\n\n💡 提示：複製此 ID 並貼到管理後台的「LINE 群組 ID」欄位中`,
            channelAccessToken,
            quoteToken
          );
          continue; // 重要：處理完群組 ID 查詢後，不再處理訂單邏輯
        } else if (sourceType === 'user') {
          await replyMessage(
            event.replyToken!,
            '⚠️ 此訊息不是在群組中發送的。\n\n請在群組中發送「群組ID」來取得群組 ID。',
            channelAccessToken,
            quoteToken
          );
          continue; // 重要：處理完後不再繼續
        } else {
          // 如果在群組中但沒有 groupId（不應該發生，但以防萬一）
          await replyMessage(
            event.replyToken!,
            '⚠️ 無法取得群組 ID。請確認 Bot 已正確加入群組。',
            channelAccessToken,
            quoteToken
          );
          continue;
        }
      }

      // 取得發送者資訊（用於上下文關聯）
      const senderUserId = event.source.userId;
      let senderName = '';
      
      // 嘗試取得發送者名稱
      if (senderUserId && event.source.groupId) {
        try {
          const profileResponse = await fetch(
            `https://api.line.me/v2/bot/group/${event.source.groupId}/member/${senderUserId}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${channelAccessToken}`,
              },
            }
          );
          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            senderName = profile.displayName || '';
          }
        } catch (error) {
          console.error('取得發送者資訊失敗:', error);
        }
      }

      // 取得所有啟用的表單（用於上下文關聯匹配）
      const allForms = await getAllForms();

      // ==================== 推廣邏輯（推送開單訊息）====================
      // 🔥 只有在看到特殊代碼時才推送開單訊息
      // 檢查發送者是否為任何表單設定的 LINE 發文者
      const formsWithMatchingAuthor = allForms.filter(
        (form: Form) => form.line_post_author && 
                form.line_post_author.trim() !== '' &&
                senderName &&
                (senderName.includes(form.line_post_author.trim()) || 
                 form.line_post_author.trim().includes(senderName))
      );

      if (formsWithMatchingAuthor.length > 0) {
        // 🔥 關鍵：只有在訊息中包含特殊代碼時才推送開單訊息
        const identifierMatchedForm = formsWithMatchingAuthor.find((form: Form) => {
          const deadline = form.order_deadline
            ? new Date(form.order_deadline)
            : new Date(form.deadline);
          if (new Date() > deadline) return false;
          const identifiers = extractLineIdentifiers(form);
          // 必須包含特殊代碼才推送
          return identifiers.length > 0 && identifiers.some(id => messageLower.includes(id));
        });

        if (identifierMatchedForm) {
          // 找到匹配的特殊代碼，推送開單訊息
          const identifiers = extractLineIdentifiers(identifierMatchedForm);
          const matchedIdentifier = identifiers.find(id => messageLower.includes(id));
          if (matchedIdentifier) {
            const deadlineDate = identifierMatchedForm.order_deadline
              ? new Date(identifierMatchedForm.order_deadline)
              : new Date(identifierMatchedForm.deadline);
            const deadlineLabel = formatDeadline(deadlineDate);
            const saleMessage = `本次「${identifierMatchedForm.name}」結單時間為 ${deadlineLabel}止，只要有下單的客戶小幫手會一一回覆喔！`;

            try {
              await recordLinePost(
                identifierMatchedForm.id,
                groupId,
                null,
                senderName,
                messageText.substring(0, 500),
                matchedIdentifier,
                deadlineDate.toISOString()
              );
            } catch (error) {
              console.error('記錄 LINE 賣文失敗:', error);
            }

            await sendPushMessage(groupId, saleMessage, channelAccessToken);
            console.log(`✅ 推廣：透過識別碼偵測到賣文：${senderName}，表單：${identifierMatchedForm.name}，識別碼：${matchedIdentifier}`);
            continue; // 推送後不再處理回覆邏輯
          }
        }
      }
      
      // ==================== 回覆邏輯（回覆「已登記」）====================
      // 🔥 只有在符合關鍵字時才回覆「已登記」
      
      // 優先檢查是否有表單代碼（例如：「@abc123 韭菜+2」）
      let targetForm = null;
      const formTokenMatch = messageText.match(/@(\w+)/);
      if (formTokenMatch) {
        targetForm = await getFormByToken(formTokenMatch[1]);
      }

      if (!targetForm) {
        const identifierMatchedForm = allForms.find((form: Form) => {
          if (form.deleted && form.deleted !== 0) return false;
          const identifiers = extractLineIdentifiers(form);
          if (identifiers.length === 0) return false;
          const deadline = form.order_deadline
            ? new Date(form.order_deadline)
            : new Date(form.deadline);
          if (new Date() > deadline) return false;
          return identifiers.some(id => messageLower.includes(id));
        });

        if (identifierMatchedForm) {
          targetForm = identifierMatchedForm;
        }
      }

      // 如果沒有表單代碼，根據 LINE 發文者姓名和關鍵字匹配表單
      if (!targetForm) {
        // 取得所有啟用的表單（不一定要有 LINE 發文者姓名）
        const now = new Date();
        const activeForms = allForms.filter((form: Form) => {
          if (form.deleted && form.deleted !== 0) return false;
          const deadline = form.order_deadline ? new Date(form.order_deadline) : new Date(form.deadline);
          return now <= deadline;
        });

        console.log(`[LINE] 開始匹配表單，訊息：${messageText}，發送者：${senderName}，群組：${groupId}`);
        console.log(`[LINE] 啟用的表單數量：${activeForms.length}`);

        // 根據關鍵字匹配表單（支援靈活的模式）
        const matchedForms: Array<{ form: any; score: number; reason: string }> = [];
        
        for (const form of activeForms) {
          const keywords = form.facebook_keywords ? JSON.parse(form.facebook_keywords) : [];
          
          if (keywords.length === 0) {
            console.log(`[LINE] 表單 ${form.id} (${form.name}) 沒有設定關鍵字，跳過`);
            continue;
          }

          console.log(`[LINE] 檢查表單 ${form.id} (${form.name})，關鍵字：${JSON.stringify(keywords)}`);
          
          // 檢查訊息是否符合關鍵字（使用改進的匹配邏輯）
          let matchScore = 0;
          let matchReason = '';
          for (const keyword of keywords) {
            const lowerKeyword = keyword.toLowerCase();
            const lowerMessage = messageLower;
            
            // 精確匹配（分數最高）
            if (lowerMessage.includes(lowerKeyword)) {
              matchScore += 10;
              matchReason = `精確匹配關鍵字：${keyword}`;
              break;
            }
            // 變體匹配
            else if (lowerKeyword.includes('+') && lowerMessage.includes(lowerKeyword.replace('+', '加'))) {
              matchScore += 8;
              matchReason = `變體匹配：${keyword} -> ${lowerKeyword.replace('+', '加')}`;
            }
            else if (lowerKeyword.includes('加') && lowerMessage.includes(lowerKeyword.replace('加', '+'))) {
              matchScore += 8;
              matchReason = `變體匹配：${keyword} -> ${lowerKeyword.replace('加', '+')}`;
            }
            // 模式匹配（例如：1斤+1、5斤+1）
            else {
              const keywordPattern = lowerKeyword.replace(/\+/g, '\\+').replace(/\d+/g, '\\d+');
              try {
                const regex = new RegExp(keywordPattern);
                if (regex.test(lowerMessage)) {
                  matchScore += 6;
                  matchReason = `模式匹配：${keywordPattern}`;
                }
              } catch (e) {
                // 忽略正則表達式錯誤
              }
            }
          }

          if (matchScore > 0) {
            console.log(`[LINE] ✅ 表單 ${form.id} (${form.name}) 匹配成功，分數：${matchScore}，原因：${matchReason}`);
            matchedForms.push({ form, score: matchScore, reason: matchReason });
          } else {
            console.log(`[LINE] ❌ 表單 ${form.id} (${form.name}) 關鍵字不匹配`);
          }
        }

        // 根據分數排序，選擇分數最高的表單
        if (matchedForms.length > 0) {
          matchedForms.sort((a, b) => b.score - a.score);
          targetForm = matchedForms[0].form;
          console.log(`[LINE] 🎯 選擇表單：${targetForm.id} (${targetForm.name})，分數：${matchedForms[0].score}`);
        } else {
          console.log(`[LINE] ⚠️ 沒有表單匹配關鍵字`);
        }

        // 如果還是沒有匹配到，使用預設表單
        if (!targetForm && formToken) {
          targetForm = await getFormByToken(formToken);
          if (targetForm) {
            console.log(`[LINE] 📌 使用預設表單：${targetForm.id} (${targetForm.name})`);
          }
        }
      }

      if (!targetForm) {
        // 找不到表單時靜默，不回覆任何訊息
        console.log('[LINE] ❌ 找不到對應的表單，靜默處理:', { messageText, senderName, groupId, allFormsCount: allForms.length });
        continue;
      }

      const saleRecord = await getLatestLineSale(groupId, targetForm.id);

      // 移除表單代碼部分（如果有的話）
      const cleanMessage = messageText.replace(/@\w+\s*/, '').trim();

      // 取得表單設定的關鍵字列表
      const formKeywords = targetForm.facebook_keywords 
        ? JSON.parse(targetForm.facebook_keywords) as string[]
        : ['+1', '+2', '+3', '加一', '加1'];

      // 改進的關鍵字匹配：支援靈活的模式
      // 匹配：+1、+2、+3、加一、加1、水果1斤+1、5斤+1、烤雞半隻+1 等
      const matchesFormKeywords = formKeywords.some((keyword: string) => {
        const lowerKeyword = keyword.toLowerCase();
        const lowerMessage = cleanMessage.toLowerCase();
        
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
        
        // 支援模式：數字+數字（例如：1斤+1、5斤+1）
        const keywordPattern = lowerKeyword.replace(/\+/g, '\\+').replace(/\d+/g, '\\d+');
        try {
          const regex = new RegExp(keywordPattern);
          if (regex.test(lowerMessage)) {
            return true;
          }
        } catch (e) {
          // 忽略正則表達式錯誤
        }
        
        return false;
      });

      const hasPlusOnePattern = matchesFormKeywords;

      // 🔥 重要：如果訊息不符合關鍵字，靜默處理，不回覆
      if (!hasPlusOnePattern) {
        console.log('[LINE] ❌ 訊息不符合關鍵字，靜默處理:', { 
          messageText, 
          cleanMessage,
          formKeywords, 
          senderName,
          formId: targetForm.id,
          formName: targetForm.name
        });
        continue;
      }

      console.log('[LINE] ✅ 訊息符合關鍵字，開始處理訂單:', { 
        messageText, 
        cleanMessage,
        formKeywords, 
        senderName,
        formId: targetForm.id,
        formName: targetForm.name
      });

      // 檢查截止時間（使用記錄中的 deadline 或表單設定）
      const deadline = saleRecord?.deadline
        ? new Date(saleRecord.deadline)
        : targetForm.order_deadline
          ? new Date(targetForm.order_deadline)
          : new Date(targetForm.deadline);
      const now = new Date();
      if (now > deadline) {
        if (saleRecord) {
          const responses: string[] = [];
          let needEndAnnounceUpdate = false;
          let needFirstWarningUpdate = false;

          if (!saleRecord.end_announced) {
            responses.push(`本次「${targetForm.name}」已經結單了，無法再登記。`);
            needEndAnnounceUpdate = true;
          }

          if (hasPlusOnePattern && !saleRecord.first_warning_sent) {
            responses.push(`不登記，${targetForm.name} 已結單，下次請早唷！^.^`);
            needFirstWarningUpdate = true;
          }

          if (responses.length > 0) {
            await replyMessage(
              event.replyToken!,
              responses.join('\n\n'),
              channelAccessToken,
              quoteToken
            );
          }

          if (needEndAnnounceUpdate) {
            await markLineSaleEndAnnounced(saleRecord.id);
          }
          if (needFirstWarningUpdate) {
            await markLineSaleFirstWarningSent(saleRecord.id);
          }

          continue;
        } else {
          const fallbackMessage = targetForm.post_deadline_reply_message?.trim() || '此表單已超過結單時間';
          await replyMessage(
            event.replyToken!,
            fallbackMessage,
            channelAccessToken,
            quoteToken
          );
          continue;
        }
      }
      
      // 判斷模式：如果訊息包含「+數字」或「數字+」或「加一/加1」，使用團購模式；否則使用代購模式
      const hasGroupbuyPattern = hasPlusOnePattern || 
                                  (/[\+\d]/.test(cleanMessage) && !/我要買|買\s/.test(cleanMessage));
      const mode = hasGroupbuyPattern ? 'groupbuy' : 'proxy';

      // 解析訊息
      const availableProducts = extractProductsFromForm(targetForm.fields);
      const parsed = parseOrderMessage(cleanMessage, availableProducts, undefined, mode);

      if (!parsed || parsed.items.length === 0) {
        // 如果訊息包含 +1 相關關鍵字但無法解析，仍然嘗試建立訂單
        if (hasPlusOnePattern) {
          // 嘗試提取商品名稱（從訊息中移除 +1、加一等關鍵字）
          const productName = cleanMessage
            .replace(/\+1|加一|加1|\+\s*1|加\s*一|加\s*1/gi, '')
            .trim();
          
          if (productName) {
            // 建立簡單訂單（數量為 1）
            const orderData: Record<string, any> = {};
            
            const productField = targetForm.fields.find(
              (f: FormField) => f.label.includes('商品') || f.label.includes('品項') || f.label.includes('口味')
            );
            if (productField) {
              orderData[productField.name] = productName;
            }

            const quantityField = targetForm.fields.find(
              (f: FormField) => f.label.includes('數量') || f.label.includes('訂購數量')
            );
            if (quantityField) {
              orderData[quantityField.name] = 1;
            }

            // 建立訂單
            const orderToken = await createOrder(
              targetForm.id,
              orderData,
              parsed?.customerName || senderName,
              parsed?.customerPhone || '',
              undefined,
              undefined,
              'line',
              targetForm,
              undefined
            );

            // 回覆確認訊息
            await replyMessage(
              event.replyToken!,
              `✅ 已登記！\n\n商品：${productName}\n數量：1\n訂單代碼：${orderToken}`,
              channelAccessToken,
              quoteToken
            );
            continue;
          }
        }
        
        // 如果訊息符合關鍵字但無法解析，靜默處理（避免打擾用戶）
        console.log('訊息符合關鍵字但無法解析，靜默處理:', { messageText, formKeywords, senderName });
        continue;
      }

      // 合併相同商品
      const mergedItems = mergeOrderItems(parsed.items);

      // 建立訂單資料
      const orderData: Record<string, any> = {};

      const productField = targetForm.fields.find(
        (f: FormField) => f.label.includes('商品') || f.label.includes('品項') || f.label.includes('口味')
      );
      if (productField && mergedItems.length > 0) {
        orderData[productField.name] = mergedItems[0].productName;
      }

      const quantityField = targetForm.fields.find(
        (f: FormField) => f.label.includes('數量') || f.label.includes('訂購數量')
      );
      if (quantityField) {
        const totalQuantity = mergedItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
        orderData[quantityField.name] = totalQuantity;
      }

      // 建立訂單
      console.log('[LINE] 📝 開始建立訂單:', { 
        formId: targetForm.id, 
        orderData, 
        customerName: parsed.customerName,
        customerPhone: parsed.customerPhone 
      });
      
      const orderToken = await createOrder(
        targetForm.id,
        orderData,
        parsed.customerName,
        parsed.customerPhone,
        undefined,
        undefined,
        'line',
        targetForm,
        undefined
      );

      console.log('[LINE] ✅ 訂單建立成功:', { orderToken, formId: targetForm.id });

      // 回覆確認訊息（簡化版本，符合用戶需求）
      const itemsText = mergedItems
        .map((item: any) => `${item.productName} x${item.quantity}`)
        .join('、');
      
      // 如果訊息包含 +1 相關關鍵字，使用簡短回覆
      const replyText = hasPlusOnePattern
        ? '✅ 已登記'
        : `✅ 訂單已建立！\n\n商品：${itemsText}\n訂單代碼：${orderToken}\n\n您可以使用此代碼修改訂單。`;
      
      console.log('[LINE] 💬 準備回覆訊息:', { replyText, hasPlusOnePattern });
      
      await replyMessage(
        event.replyToken!,
        replyText,
        channelAccessToken,
        quoteToken
      );
      
      console.log('[LINE] ✅ 已回覆訊息給客戶');
    }

    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    console.error('LINE Webhook 錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}

