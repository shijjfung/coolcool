import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 直接返回 manifest 內容，避免檔案系統問題
  const manifest = {
    name: "涼涼冰品團購管理系統",
    short_name: "涼涼團購",
    description: "輕鬆建立表單，收集客戶訂單，自動生成報表",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    categories: ["business", "productivity"],
    shortcuts: [
      {
        name: "老闆創表單",
        short_name: "創表單",
        description: "快速建立新的團購表單",
        url: "/admin/create"
      },
      {
        name: "老闆儀表板",
        short_name: "儀表板",
        description: "查看所有表單和管理訂單",
        url: "/admin"
      }
    ]
  };

  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).json(manifest);
}

