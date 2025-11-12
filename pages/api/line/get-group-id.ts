import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * 取得 LINE 群組 ID 的說明 API
 * GET /api/line/get-group-id
 * 
 * 提供取得群組 ID 的方法說明
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    success: true,
    message: '如何取得 LINE 群組 ID',
    methods: [
      {
        method: '方法 1：在群組中發送訊息給 Bot（最簡單）',
        steps: [
          '1. 確保 Bot 已加入您的 LINE 群組',
          '2. 在群組中發送訊息：「群組ID」或「groupId」',
          '3. Bot 會自動回覆群組 ID',
          '4. 複製 Bot 回覆的群組 ID',
          '5. 貼到管理後台的「LINE 群組 ID」欄位中'
        ],
        note: '這是最簡單的方法，推薦使用！'
      },
      {
        method: '方法 2：從 LINE Developers Console 查看',
        steps: [
          '1. 前往 LINE Developers Console (https://developers.line.biz/console/)',
          '2. 選擇您的 Bot',
          '3. 前往「Messaging API」>「Webhook settings」',
          '4. 點擊「Webhook event」或「Verify」',
          '5. 在群組中發送一條訊息給 Bot',
          '6. 在 Webhook 事件記錄中查看，找到包含 "groupId" 的事件',
          '7. 複製 groupId 的值'
        ],
        note: '需要查看 Webhook 事件記錄'
      },
      {
        method: '方法 3：從 Webhook 回應中查看',
        steps: [
          '1. 在群組中發送任何訊息給 Bot',
          '2. 查看伺服器日誌或 Webhook 事件',
          '3. 在事件中找到 "source.groupId" 欄位',
          '4. 複製該值'
        ],
        note: '需要查看伺服器日誌'
      }
    ],
    quickMethod: {
      title: '快速方法（推薦）',
      instruction: '在群組中發送「群組ID」給 Bot，Bot 會自動回覆群組 ID',
      example: '在群組中輸入：群組ID'
    },
    tips: [
      '✅ Bot 必須先加入群組才能取得群組 ID',
      '✅ 群組 ID 是固定的，取得一次後可以重複使用',
      '✅ 如果 Bot 被移除後重新加入，群組 ID 不會改變',
      '⚠️ 私訊 Bot 無法取得群組 ID，必須在群組中發送'
    ]
  });
}

