const AUTOMATION_BASE = process.env.FACEBOOK_AUTOMATION_URL;
const AUTOMATION_TOKEN = process.env.FACEBOOK_AUTOMATION_TOKEN;

export class FacebookAutomationError extends Error {
  status?: number;
  details?: any;
  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = 'FacebookAutomationError';
    this.status = status;
    this.details = details;
  }
}

const buildUrl = (path: string) => {
  if (!AUTOMATION_BASE) {
    throw new FacebookAutomationError('尚未設定 FACEBOOK_AUTOMATION_URL');
  }
  const base = AUTOMATION_BASE.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};

const buildHeaders = () => {
  if (!AUTOMATION_TOKEN) {
    throw new FacebookAutomationError('尚未設定 FACEBOOK_AUTOMATION_TOKEN');
  }
  return {
    'Content-Type': 'application/json',
    'x-automation-token': AUTOMATION_TOKEN,
  };
};

export async function callFacebookAutomation<T = any>(
  path: string,
  payload: Record<string, any>
): Promise<T> {
  const url = buildUrl(path);
  const headers = buildHeaders();

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // ignore parse error
  }

  if (!response.ok || !data?.success) {
    const errorMessage = data?.error || `Facebook 自動化服務錯誤 (${response.status})`;
    throw new FacebookAutomationError(errorMessage, response.status, data);
  }

  return data as T;
}

export const callAutomationScanComments = async <T = any>(payload: Record<string, any>) =>
  callFacebookAutomation<T>('/facebook/scan-comments', payload);

export const callAutomationPickupNotifications = async <T = any>(payload: Record<string, any>) =>
  callFacebookAutomation<T>('/facebook/send-pickup-notification', payload);

