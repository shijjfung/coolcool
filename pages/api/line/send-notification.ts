import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureDatabaseInitialized, getOrdersByFormId, Order } from '@/lib/db';

/**
 * LINE Bot 發送取貨通知 API
 * 在群組中 @ 指定客戶並發送訊息
 */

interface LineMention {
  index: number; // @ 符號在訊息中的位置
  length: number; // @ 符號加上用戶名的長度
  type: 'user';
  userId: string;
}

interface LineTextMessage {
  type: 'text';
  text: string;
  mention?: {
    mentionees: LineMention[];
  };
}

interface LinePushMessage {
  to: string; // 群組 ID
  messages: LineTextMessage[];
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
    const { formId, message, groupId } = req.body;

    if (!formId || !message || !groupId) {
      return res.status(400).json({ 
        error: '缺少必要欄位：formId、message 和 groupId' 
      });
    }

    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!channelAccessToken) {
      const isLocalDev = process.env.NODE_ENV === 'development' || !process.env.VERCEL;
      
      return res.status(500).json({ 
        error: 'LINE Bot 未設定（缺少 Channel Access Token）',
        hint: isLocalDev 
          ? '請在本地 .env.local 檔案中設定 LINE_CHANNEL_ACCESS_TOKEN'
          : '請在 Vercel 環境變數中設定 LINE_CHANNEL_ACCESS_TOKEN',
        instructions: isLocalDev ? [
          '本地開發環境設定步驟：',
          '1. 在專案根目錄（與 package.json 同層）建立 .env.local 檔案',
          '2. 在檔案中加入以下內容：',
          '   LINE_CHANNEL_ACCESS_TOKEN=你的_token值',
          '   注意：不要加引號，不要有多餘空格',
          '3. 儲存檔案',
          '4. 重新啟動開發伺服器（必須重啟才會生效！）',
          '',
          '如何取得 Channel Access Token：',
          '1. 前往 LINE Developers Console (https://developers.line.biz/console/)',
          '2. 選擇您的 Bot',
          '3. 前往 "Messaging API" 頁籤',
          '4. 在 "Channel access token" 區塊中，點擊 "Issue" 或 "Reissue"',
          '5. 複製產生的 Token',
          '',
          '診斷：訪問 /api/debug/check-line-env 檢查環境變數是否正確讀取'
        ] : [
          '1. 前往 Vercel Dashboard > Settings > Environment Variables',
          '2. 新增環境變數：',
          '   - Key: LINE_CHANNEL_ACCESS_TOKEN',
          '   - Value: 您的 LINE Bot Channel Access Token',
          '   - Environments: 選擇 "All Environments"',
          '3. 儲存後重新部署應用程式',
          '',
          '如何取得 Channel Access Token：',
          '1. 前往 LINE Developers Console (https://developers.line.biz/console/)',
          '2. 選擇您的 Bot',
          '3. 前往 "Messaging API" 頁籤',
          '4. 在 "Channel access token" 區塊中，點擊 "Issue" 或 "Reissue"',
          '5. 複製產生的 Token 並貼到 Vercel 環境變數中'
        ]
      });
    }

    // 取得該表單的所有訂單
    const orders = await getOrdersByFormId(formId);
    
    // 過濾出 LINE 入口的訂單
    const lineOrders = orders.filter(
      (order: Order) => (order.order_source || '').toLowerCase() === 'line'
    );

    if (lineOrders.length === 0) {
      return res.status(404).json({ 
        error: '目前沒有從 LINE 入口下單的客戶' 
      });
    }

    // 取得所有客戶名稱（去重）
    const customerNames = Array.from(
      new Set(
        lineOrders
          .map((order) => order.customer_name?.trim())
          .filter((name): name is string => !!name && name.length > 0)
      )
    );

    if (customerNames.length === 0) {
      return res.status(404).json({ 
        error: '這些訂單尚未填寫姓名，請先到報表補齊後再通知客戶' 
      });
    }

    // 取得群組成員列表（需要先取得群組成員的 userId）
    // 注意：LINE Bot 需要先加入群組才能取得成員列表
    let memberDetails: Array<{ userId: string; displayName: string }> = [];
    
    try {
      const groupMembersResponse = await fetch(
        `https://api.line.me/v2/bot/group/${groupId}/members/ids`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${channelAccessToken}`,
          },
        }
      );

      if (groupMembersResponse.ok) {
        const groupMembersData = await groupMembersResponse.json();
        const memberIds = groupMembersData.memberIds || [];

        // 取得每個成員的 profile（根據名稱匹配）
        for (const userId of memberIds) {
          try {
            const profileResponse = await fetch(
              `https://api.line.me/v2/bot/group/${groupId}/member/${userId}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${channelAccessToken}`,
                },
              }
            );

            if (profileResponse.ok) {
              const profile = await profileResponse.json();
              memberDetails.push({
                userId,
                displayName: profile.displayName || '',
              });
            }
          } catch (error) {
            console.error(`取得成員 ${userId} 資訊失敗:`, error);
          }
        }
      } else {
        const errorText = await groupMembersResponse.text();
        console.warn('取得群組成員失敗（將使用普通訊息）:', errorText);
      }
    } catch (error) {
      console.warn('取得群組成員時發生錯誤（將使用普通訊息）:', error);
    }

    // 根據客戶名稱匹配群組成員的 userId
    const mentionees: LineMention[] = [];
    const matchedNames: string[] = [];

    for (const customerName of customerNames) {
      // 嘗試匹配成員的顯示名稱
      const matchedMember = memberDetails.find(
        (member) => 
          member.displayName === customerName ||
          member.displayName.includes(customerName) ||
          customerName.includes(member.displayName)
      );

      if (matchedMember) {
        mentionees.push({ type: 'user', userId: matchedMember.userId });
        matchedNames.push(customerName);
      }
    }

    // 構建訊息
    // 注意：LINE Messaging API 的 push message 可能不支援 mention 功能
    // mention 主要用於 reply message
    // 我們改為在訊息中直接提及客戶名稱，並嘗試使用 @ 符號
    
    // 如果有匹配到的成員，嘗試使用 @ 功能
    if (mentionees.length > 0) {
      // 構建包含 @ 符號的訊息
      const mentionTexts: string[] = [];
      const mentioneesWithIndex: LineMention[] = [];
      let currentIndex = 0;

      for (let i = 0; i < matchedNames.length; i++) {
        const name = matchedNames[i];
        const mentionText = `@${name}`;
        mentionTexts.push(mentionText);
        
        // 計算 mention 的位置
        const mentionStart = currentIndex;
        const mentionLength = mentionText.length;
        
        mentioneesWithIndex.push({
          index: mentionStart,
          length: mentionLength,
          type: 'user',
          userId: mentionees[i].userId,
        });
        
        currentIndex += mentionLength;
        if (i < matchedNames.length - 1) {
          currentIndex += 2; // 加上「、」的長度
        }
      }

      const mentionedNames = mentionTexts.join('、');
      const finalMessage = `${mentionedNames}\n${message}`;

      // 嘗試使用 mention 功能發送（注意：push message 可能不支援）
      try {
        const pushResponse = await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${channelAccessToken}`,
          },
          body: JSON.stringify({
            to: groupId,
            messages: [
              {
                type: 'text',
                text: finalMessage,
                mention: {
                  mentionees: mentioneesWithIndex,
                },
              },
            ],
          } as LinePushMessage),
        });

        if (pushResponse.ok) {
          return res.status(200).json({ 
            success: true,
            message: `已成功 @ ${matchedNames.length} 位客戶並發送訊息`,
            matchedNames,
            unmatchedNames: customerNames.filter(name => !matchedNames.includes(name)),
          });
        } else {
          // 如果 mention 失敗，改用普通訊息
          const errorText = await pushResponse.text();
          console.warn('使用 mention 功能失敗，改用普通訊息:', errorText);
        }
      } catch (error) {
        console.warn('使用 mention 功能時發生錯誤，改用普通訊息:', error);
      }
    }

    // 如果沒有匹配到成員，或 mention 功能失敗，使用普通訊息
    {
      // 如果沒有匹配到成員，直接發送訊息並在開頭提及客戶名稱
      const allNames = customerNames.join('、');
      const finalMessage = `${allNames}\n${message}`;

      const pushResponse = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${channelAccessToken}`,
        },
        body: JSON.stringify({
          to: groupId,
          messages: [
            {
              type: 'text',
              text: finalMessage,
            },
          ],
        }),
      });

      if (!pushResponse.ok) {
        const errorText = await pushResponse.text();
        console.error('發送 LINE 訊息失敗:', errorText);
        return res.status(500).json({ 
          error: '發送訊息失敗',
          details: errorText 
        });
      }

      return res.status(200).json({ 
        success: true,
        message: '訊息已發送（無法匹配群組成員，已改為直接提及客戶名稱）',
        customerNames,
      });
    }
  } catch (error: any) {
    console.error('發送 LINE 通知錯誤:', error);
    return res.status(500).json({ 
      error: '伺服器錯誤',
      details: error.message 
    });
  }
}

