import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * 檢查 LINE Bot 環境變數設定
 * GET /api/debug/check-line-env
 * 
 * 用於診斷 LINE Bot 環境變數問題
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const lineAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const lineChannelSecret = process.env.LINE_CHANNEL_SECRET;
  const lineFormToken = process.env.LINE_FORM_TOKEN;

  // 檢查所有環境變數
  const allEnvVars = Object.keys(process.env)
    .filter(key => key.includes('LINE'))
    .reduce((acc, key) => {
      acc[key] = process.env[key] ? '✅ 已設定' : '❌ 未設定';
      return acc;
    }, {} as Record<string, string>);

  return res.status(200).json({
    success: true,
    message: 'LINE Bot 環境變數檢查',
    environment: {
      LINE_CHANNEL_ACCESS_TOKEN: lineAccessToken 
        ? `${lineAccessToken.substring(0, 20)}...（已設定，長度：${lineAccessToken.length}）`
        : '❌ 未設定',
      LINE_CHANNEL_SECRET: lineChannelSecret
        ? `${lineChannelSecret.substring(0, 20)}...（已設定，長度：${lineChannelSecret.length}）`
        : '❌ 未設定（選填）',
      LINE_FORM_TOKEN: lineFormToken || '❌ 未設定（選填）',
    },
    diagnosis: {
      hasAccessToken: !!lineAccessToken,
      hasChannelSecret: !!lineChannelSecret,
      hasFormToken: !!lineFormToken,
      isConfigured: !!lineAccessToken,
    },
    allLineEnvVars: allEnvVars,
    troubleshooting: {
      ifNotSet: [
        '1. 確認已在專案根目錄建立 .env.local 檔案',
        '2. 確認檔案內容格式正確（沒有引號，沒有多餘空格）',
        '3. 確認變數名稱正確：LINE_CHANNEL_ACCESS_TOKEN',
        '4. 確認已重新啟動開發伺服器（修改 .env.local 後必須重啟）',
        '5. 確認檔案位置：應該在專案根目錄（與 package.json 同層）',
      ],
      fileLocation: '專案根目錄（與 package.json 同層）',
      fileFormat: 'LINE_CHANNEL_ACCESS_TOKEN=你的_token值（不要加引號）',
    },
    timestamp: new Date().toISOString(),
  });
}

