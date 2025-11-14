import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ensureDatabaseInitialized,
  getActiveLineSales,
  getFormByIdLite,
  markLineSaleEndAnnounced,
} from '@/lib/db';

async function sendPushMessage(to: string, message: string): Promise<boolean> {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!channelAccessToken) {
    console.warn('缺少 LINE_CHANNEL_ACCESS_TOKEN，無法推播結單訊息');
    return false;
  }

  try {
    const resp = await fetch('https://api.line.me/v2/bot/message/push', {
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
    if (!resp.ok) {
      console.error('推播結單訊息失敗:', await resp.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('推播結單訊息發生錯誤:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 驗證請求來源（可選，增加安全性）
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await ensureDatabaseInitialized();
    const sales = await getActiveLineSales();
    if (!sales.length) {
      return res.status(200).json({ message: '沒有到期的 LINE 賣文' });
    }

    let processed = 0;
    for (const sale of sales) {
      const form = await getFormByIdLite(sale.form_id);
      if (!form) continue;

      const message = `本次「${form.name}」已經截止，後續喊單不予登記，期待下次為你服務^.^`;
      const pushed = await sendPushMessage(sale.group_id, message);
      if (pushed) {
        await markLineSaleEndAnnounced(sale.id);
        processed += 1;
      }
    }

    return res.status(200).json({ message: '已處理到期賣文', processed });
  } catch (error: any) {
    console.error('LINE 結單檢查錯誤:', error);
    return res.status(500).json({ error: error?.message || '伺服器錯誤' });
  }
}
