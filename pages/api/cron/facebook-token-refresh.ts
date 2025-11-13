import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Facebook Token 自動刷新 Cron Job
 * GET /api/cron/facebook-token-refresh
 * 
 * 這個 API 會被 Vercel Cron Jobs 定期呼叫（建議每 24 小時一次）
 * 會自動：
 * 1. 檢查 Token 狀態
 * 2. 如果剩餘天數少於 10 天，自動刷新
 * 3. 自動更新 Vercel 環境變數
 * 4. 自動觸發重新部署
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 驗證 Cron Secret（可選，但建議設定）
  const cronSecret = req.headers['authorization'];
  const expectedSecret = process.env.CRON_SECRET;
  
  if (expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const currentToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;
    const vercelTeamId = process.env.VERCEL_TEAM_ID;

    if (!appId || !appSecret || !currentToken) {
      console.log('⚠️ Facebook Token 自動刷新：缺少必要的環境變數');
      return res.status(200).json({
        success: false,
        message: '缺少必要的環境變數',
        skipped: true,
      });
    }

    // 步驟 1: 檢查 Token 狀態
    console.log('🔄 開始檢查 Facebook Token 狀態...');
    const debugUrl = `https://graph.facebook.com/v18.0/debug_token?input_token=${currentToken}&access_token=${currentToken}`;
    
    const statusResponse = await fetch(debugUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    let shouldRefresh = false;
    let daysRemaining: number | null = null;

    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      if (statusData.data && statusData.data.is_valid) {
        const expiresAt = statusData.data.expires_at 
          ? new Date(statusData.data.expires_at * 1000)
          : null;
        if (expiresAt) {
          const now = new Date();
          daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          shouldRefresh = daysRemaining < 10; // 剩餘天數少於 10 天時刷新
          console.log(`📊 Token 狀態：剩餘 ${daysRemaining} 天`);
        }
      }
    }

    if (!shouldRefresh && daysRemaining !== null) {
      console.log(`✅ Token 狀態良好，剩餘 ${daysRemaining} 天，無需刷新`);
      return res.status(200).json({
        success: true,
        message: `Token 狀態良好，剩餘 ${daysRemaining} 天`,
        days_remaining: daysRemaining,
        refreshed: false,
      });
    }

    // 步驟 2: 刷新 Token
    console.log('🔄 開始刷新 Facebook Token...');
    const refreshUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${currentToken}`;

    const refreshResponse = await fetch(refreshUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text();
      console.error('❌ Facebook Token 刷新失敗:', errorText);
      return res.status(500).json({
        success: false,
        error: '刷新 Token 失敗',
        details: errorText,
      });
    }

    const refreshData = await refreshResponse.json();

    if (!refreshData.access_token) {
      console.error('❌ Facebook API 未返回新的 Token');
      return res.status(500).json({
        success: false,
        error: '刷新 Token 失敗',
        details: 'Facebook API 未返回新的 Token',
      });
    }

    const newToken = refreshData.access_token;
    const expiresIn = refreshData.expires_in || 5184000;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    console.log('✅ Facebook Token 刷新成功');

    // 步驟 3: 更新 Vercel 環境變數並部署（如果設定了 Vercel Token）
    let vercelUpdated = false;
    let deploymentId: string | null = null;

    if (vercelToken && vercelProjectId) {
      try {
        console.log('🔄 開始更新 Vercel 環境變數...');
        
        const vercelApiUrl = vercelTeamId
          ? `https://api.vercel.com/v10/projects/${vercelProjectId}/env?teamId=${vercelTeamId}`
          : `https://api.vercel.com/v10/projects/${vercelProjectId}/env`;

        // 取得現有的環境變數
        const getEnvResponse = await fetch(vercelApiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (getEnvResponse.ok) {
          const envData = await getEnvResponse.json();
          const existingEnv = envData.envs?.find((env: any) => env.key === 'FACEBOOK_ACCESS_TOKEN');

          if (existingEnv) {
            // 更新現有的環境變數
            const updateUrl = vercelTeamId
              ? `https://api.vercel.com/v10/projects/${vercelProjectId}/env/${existingEnv.id}?teamId=${vercelTeamId}`
              : `https://api.vercel.com/v10/projects/${vercelProjectId}/env/${existingEnv.id}`;

            const updateResponse = await fetch(updateUrl, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${vercelToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                value: newToken,
                type: existingEnv.type || 'encrypted',
                target: existingEnv.target || ['production', 'preview', 'development'],
              }),
            });

            if (updateResponse.ok) {
              vercelUpdated = true;
              console.log('✅ Vercel 環境變數更新成功');
            } else {
              const errorText = await updateResponse.text();
              console.error('❌ 更新 Vercel 環境變數失敗:', errorText);
            }
          } else {
            // 建立新的環境變數
            const createResponse = await fetch(vercelApiUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${vercelToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                key: 'FACEBOOK_ACCESS_TOKEN',
                value: newToken,
                type: 'encrypted',
                target: ['production', 'preview', 'development'],
              }),
            });

            if (createResponse.ok) {
              vercelUpdated = true;
              console.log('✅ Vercel 環境變數建立成功');
            } else {
              const errorText = await createResponse.text();
              console.error('❌ 建立 Vercel 環境變數失敗:', errorText);
            }
          }

          // 步驟 4: 觸發重新部署
          if (vercelUpdated) {
            console.log('🔄 開始觸發 Vercel 重新部署...');
            
            const deployUrl = vercelTeamId
              ? `https://api.vercel.com/v13/deployments?teamId=${vercelTeamId}`
              : `https://api.vercel.com/v13/deployments`;

            const deployResponse = await fetch(deployUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${vercelToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: vercelProjectId,
                project: vercelProjectId,
              }),
            });

            if (deployResponse.ok) {
              const deployData = await deployResponse.json();
              deploymentId = deployData.id || null;
              console.log('✅ Vercel 重新部署已觸發，部署 ID:', deploymentId);
            } else {
              const errorText = await deployResponse.text();
              console.error('❌ 觸發 Vercel 重新部署失敗:', errorText);
            }
          }
        }
      } catch (vercelError: any) {
        console.error('❌ Vercel 操作錯誤:', vercelError);
      }
    } else {
      console.log('⚠️ 未設定 Vercel Token 或 Project ID，跳過自動部署');
    }

    return res.status(200).json({
      success: true,
      message: vercelUpdated
        ? 'Token 已刷新，Vercel 環境變數已更新，重新部署已觸發'
        : 'Token 已刷新（請手動更新環境變數）',
      access_token: newToken.substring(0, 20) + '...', // 只返回前 20 個字元，避免洩露
      expires_in: expiresIn,
      expires_at: expiresAt.toISOString(),
      days_remaining: Math.ceil(expiresIn / 86400),
      vercel_updated: vercelUpdated,
      deployment_id: deploymentId,
      refreshed: true,
    });
  } catch (error: any) {
    console.error('❌ Facebook Token 自動刷新錯誤:', error);
    return res.status(500).json({
      success: false,
      error: '伺服器錯誤',
      details: error.message,
    });
  }
}

