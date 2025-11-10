import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzePostType, extractFormInfo } from '@/lib/facebook-analyzer';

/**
 * 分析 Facebook 貼文
 * POST /api/facebook/analyze-post
 * 
 * Body:
 * {
 *   postText: string  // 貼文內容
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { postText } = req.body;

    if (!postText || typeof postText !== 'string') {
      return res.status(400).json({ error: '請提供貼文內容' });
    }

    // 分析貼文類型
    const analysis = analyzePostType(postText);
    
    // 提取表單資訊
    const formInfo = extractFormInfo(postText);

    return res.status(200).json({
      success: true,
      analysis,
      formInfo,
      suggestions: {
        type: analysis.type,
        recommendedMode: analysis.type === 'proxy' ? 'proxy' : 'groupbuy',
        message: analysis.type === 'unknown' 
          ? '無法判斷貼文類型，請手動選擇'
          : `判斷為${analysis.type === 'proxy' ? '代購' : '團購'}模式（信心度：${Math.round(analysis.confidence * 100)}%）`,
      },
    });
  } catch (error) {
    console.error('分析貼文錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}



