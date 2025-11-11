import type { NextPageContext } from 'next';
import { NextApiResponse } from 'next';

/**
 * 自定義錯誤頁面
 * 但這不會影響 API 路由的錯誤處理
 */
function Error({ statusCode }: { statusCode: number }) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>{statusCode ? `錯誤 ${statusCode}` : '發生錯誤'}</h1>
      <p>請檢查伺服器日誌以獲取更多資訊</p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;

