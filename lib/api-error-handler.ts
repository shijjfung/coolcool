import type { NextApiResponse } from 'next';

/**
 * 統一的 API 錯誤處理函數
 * 確保所有錯誤都返回 JSON 格式，而不是 HTML
 */
export function handleApiError(
  res: NextApiResponse,
  error: any,
  defaultMessage: string = '伺服器錯誤'
) {
  // 確保響應頭已設置為 JSON
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json');
  }

  const errorMessage = error?.message || defaultMessage;
  const statusCode = error?.statusCode || 500;

  console.error('API 錯誤:', {
    message: errorMessage,
    statusCode,
    stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
  });

  // 如果響應已經發送，記錄錯誤但不嘗試發送響應
  if (res.headersSent) {
    console.error('響應已發送，無法返回錯誤訊息');
    return;
  }

  return res.status(statusCode).json({
    error: defaultMessage,
    details: errorMessage,
    hint: error?.hint || '請檢查伺服器日誌以獲取更多資訊',
  });
}

/**
 * 包裝 API 處理函數，確保所有錯誤都被捕獲
 */
export function withErrorHandler(
  handler: (req: any, res: NextApiResponse) => Promise<any>
) {
  return async (req: any, res: NextApiResponse) => {
    try {
      // 確保響應頭設置為 JSON
      res.setHeader('Content-Type', 'application/json');
      
      // 執行處理函數
      await handler(req, res);
    } catch (error: any) {
      // 如果響應已經發送，只記錄錯誤
      if (res.headersSent) {
        console.error('處理函數執行後發生錯誤，但響應已發送:', error);
        return;
      }

      // 處理錯誤
      handleApiError(res, error);
    }
  };
}

