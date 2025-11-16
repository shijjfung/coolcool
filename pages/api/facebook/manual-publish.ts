import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ensureDatabaseInitialized,
  getFormById,
  setFacebookPostUrl,
} from '@/lib/db';

const AUTOMATION_BASE = process.env.FACEBOOK_AUTOMATION_URL;
const AUTOMATION_TOKEN = process.env.FACEBOOK_AUTOMATION_TOKEN;

const normalizeBase = (req: NextApiRequest) => {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const protocol =
    (req.headers['x-forwarded-proto'] as string) ||
    (req.headers.referer?.startsWith('https') ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  return `${protocol}://${host}`;
};

const buildImages = (input?: string | null) => {
  if (!input) return [];
  return input
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!AUTOMATION_BASE || !AUTOMATION_TOKEN) {
    return res.status(500).json({
      error: '尚未設定 Facebook 自動化服務連結或權杖',
      hint: '請設定環境變數：FACEBOOK_AUTOMATION_URL、FACEBOOK_AUTOMATION_TOKEN',
    });
  }

  try {
    const { formId } = req.body || {};
    if (!formId || Number.isNaN(Number(formId))) {
      return res.status(400).json({ error: '請提供有效的 formId' });
    }

    await ensureDatabaseInitialized();
    const form = await getFormById(Number(formId));
    if (!form) {
      return res.status(404).json({ error: '表單不存在' });
    }

    if (!form.facebook_target_url || !form.facebook_target_url.trim()) {
      return res.status(400).json({ error: '此表單尚未設定社團或粉專目標連結' });
    }

    if (!form.facebook_post_template || !form.facebook_post_template.trim()) {
      return res.status(400).json({ error: '此表單尚未設定貼文內容' });
    }

    const baseUrl = normalizeBase(req);
    const formUrl = `${baseUrl.replace(/\/$/, '')}/form/${form.form_token}`;
    const deadlineText = new Date(form.deadline).toLocaleString('zh-TW', { hour12: false });
    const pickupTime = form.pickup_time || '';

    const payload = {
      formId: form.id,
      targetUrl: form.facebook_target_url,
      template: form.facebook_post_template,
      vendorContent: form.facebook_vendor_content || '',
      images: buildImages(form.facebook_post_images),
      variables: {
        formName: form.name,
        deadline: deadlineText,
        formUrl,
        pickupTime,
        orderLimit: form.order_limit,
      },
    };

    const automationResponse = await fetch(
      `${AUTOMATION_BASE.replace(/\/$/, '')}/facebook/publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-automation-token': AUTOMATION_TOKEN,
        },
        body: JSON.stringify(payload),
      }
    );

    let automationData: any = null;
    try {
      automationData = await automationResponse.json();
    } catch (error) {
      // ignore parse error, will handle below
    }

    if (!automationResponse.ok || !automationData?.success) {
      return res.status(automationResponse.status || 500).json({
        error: automationData?.error || '發布貼文失敗，請稍後再試',
        details: automationData,
      });
    }

    const postUrl = automationData.postUrl || automationData.url || null;
    if (postUrl) {
      await setFacebookPostUrl(form.id, postUrl);
    }

    return res.status(200).json({
      success: true,
      postUrl,
      automation: automationData,
    });
  } catch (error: any) {
    console.error('manual publish error', error);
    return res.status(500).json({
      error: error?.message || '發布貼文時發生錯誤',
    });
  }
}


