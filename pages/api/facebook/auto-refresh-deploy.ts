import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Facebook Token 自動刷新並部署 API
 * POST /api/facebook/auto-refresh-deploy
 * 
 * 1. 刷新 Facebook Token
 * 2. 更新 Vercel 環境變數
 * 3. 觸發 Vercel 重新部署
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const currentToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;
    const vercelTeamId = process.env.VERCEL_TEAM_ID; // 可選

    if (!appId || !appSecret) {
      return res.status(400).json({
        error: '缺少 Facebook App ID 或 App Secret',
        hint: '請在環境變數中設定 FACEBOOK_APP_ID 和 FACEBOOK_APP_SECRET',
      });
    }

    if (!currentToken) {
      return res.status(400).json({
        error: '缺少 Facebook Access Token',
        hint: '請在環境變數中設定 FACEBOOK_ACCESS_TOKEN',
      });
    }

    // 步驟 1: 刷新 Facebook Token
    console.log('🔄 開始刷新 Facebook Token...');
    const refreshUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${currentToken}`;

    const refreshResponse = await fetch(refreshUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text();
      console.error('Facebook Token 刷新錯誤:', errorText);
      return res.status(refreshResponse.status).json({
        error: '刷新 Token 失敗',
        details: errorText,
        step: 'refresh_token',
      });
    }

    const refreshData = await refreshResponse.json();

    if (!refreshData.access_token) {
      return res.status(500).json({
        error: '刷新 Token 失敗',
        details: 'Facebook API 未返回新的 Token',
        step: 'refresh_token',
      });
    }

    const newToken = refreshData.access_token;
    const expiresIn = refreshData.expires_in || 5184000;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    console.log('✅ Facebook Token 刷新成功');

    // 步驟 2: 更新 Vercel 環境變數（如果設定了 Vercel Token）
    let vercelUpdated = false;
    let deploymentId: string | null = null;

    if (vercelToken && vercelProjectId) {
      try {
        console.log('🔄 開始更新 Vercel 環境變數...');
        
        // 更新環境變數
        const vercelApiUrl = vercelTeamId
          ? `https://api.vercel.com/v10/projects/${vercelProjectId}/env?teamId=${vercelTeamId}`
          : `https://api.vercel.com/v10/projects/${vercelProjectId}/env`;

        // 先取得現有的環境變數
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
                type: 'encrypted', // 或 'plain'，根據您的需求
                target: ['production', 'preview', 'development'], // 或根據您的需求
              }),
            });

            if (updateResponse.ok) {
              vercelUpdated = true;
              console.log('✅ Vercel 環境變數更新成功');
            } else {
              const errorText = await updateResponse.text();
              console.error('更新 Vercel 環境變數失敗:', errorText);
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
              console.error('建立 Vercel 環境變數失敗:', errorText);
            }
          }
        }

        // 步驟 3: 觸發重新部署（如果環境變數更新成功）
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
            console.log('✅ Vercel 重新部署已觸發');
          } else {
            const errorText = await deployResponse.text();
            console.error('觸發 Vercel 重新部署失敗:', errorText);
          }
        }
      } catch (vercelError: any) {
        console.error('Vercel 操作錯誤:', vercelError);
        // 即使 Vercel 操作失敗，也返回 Token 刷新成功的結果
      }
    }

    return res.status(200).json({
      success: true,
      access_token: newToken,
      expires_in: expiresIn,
      expires_at: expiresAt.toISOString(),
      vercel_updated: vercelUpdated,
      deployment_id: deploymentId,
      message: vercelUpdated
        ? 'Token 已刷新，Vercel 環境變數已更新，重新部署已觸發'
        : 'Token 已刷新（請手動更新環境變數）',
      hint: vercelUpdated
        ? '環境變數已自動更新，部署正在進行中'
        : '請將新的 Token 手動更新到環境變數 FACEBOOK_ACCESS_TOKEN',
    });
  } catch (error: any) {
    console.error('自動刷新和部署錯誤:', error);
    return res.status(500).json({
      error: '伺服器錯誤',
      details: error.message,
    });
  }
}

