import type { NextApiRequest, NextApiResponse } from 'next';
import QRCode from 'qrcode';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: '缺少 URL' });
    }

    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
    });

    return res.status(200).json({ qrCode: qrCodeDataUrl });
  } catch (error) {
    console.error('生成 QR code 錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}




