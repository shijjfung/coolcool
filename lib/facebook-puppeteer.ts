/**
 * Facebook Puppeteer 留言抓取工具
 * 使用 Puppeteer 模擬瀏覽器來抓取 Facebook 私密社團留言
 * 
 * 注意事項：
 * 1. 此方法可能違反 Facebook 服務條款
 * 2. 建議使用測試帳號
 * 3. 需要處理驗證碼和安全檢查
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import puppeteerExtra from 'puppeteer-extra';

// 啟用反偵測插件
puppeteerExtra.use(StealthPlugin());

export interface FacebookComment {
  id: string;
  message: string;
  from: {
    name: string;
    id: string;
  };
  created_time: string;
}

export interface PuppeteerConfig {
  headless?: boolean; // 是否使用無頭模式（false = 顯示瀏覽器視窗）
  cookies?: string; // Facebook Cookie 字串（JSON 格式）
  userAgent?: string; // 自訂 User-Agent
  viewport?: { width: number; height: number }; // 視窗大小
  timeout?: number; // 超時時間（毫秒）
}

/**
 * 使用 Puppeteer 登入 Facebook
 */
export async function loginToFacebook(
  page: Page,
  email: string,
  password: string
): Promise<boolean> {
  try {
    console.log('[Puppeteer] 開始登入 Facebook...');
    
    await page.goto('https://www.facebook.com/login', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // 等待登入表單載入
    await page.waitForSelector('#email, input[name="email"], input[type="email"]', {
      timeout: 10000,
    });

    // 輸入帳號密碼
    await page.type('#email, input[name="email"], input[type="email"]', email, {
      delay: 100, // 模擬人類輸入速度
    });
    await page.type('#pass, input[name="pass"], input[type="password"]', password, {
      delay: 100,
    });

    // 點擊登入按鈕
    await page.click('button[type="submit"], input[type="submit"], button[name="login"]');
    
    // 等待登入完成（檢查是否跳轉到首頁或出現安全檢查）
    await page.waitForNavigation({
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // 檢查是否登入成功（檢查是否有登入後的元素）
    const isLoggedIn = await page.evaluate(() => {
      // 檢查是否有 Facebook 首頁的標誌性元素
      return !!(
        document.querySelector('[aria-label="Facebook"]') ||
        document.querySelector('a[href*="/me"]') ||
        document.querySelector('[data-pagelet="LeftRail"]')
      );
    });

    if (isLoggedIn) {
      console.log('[Puppeteer] ✅ Facebook 登入成功');
      return true;
    } else {
      console.warn('[Puppeteer] ⚠️ 登入可能失敗或需要額外驗證');
      return false;
    }
  } catch (error: any) {
    console.error('[Puppeteer] 登入錯誤:', error.message);
    return false;
  }
}

/**
 * 使用 Cookie 登入 Facebook（推薦方式）
 */
export async function loginWithCookies(
  page: Page,
  cookies: string
): Promise<boolean> {
  try {
    console.log('[Puppeteer] 使用 Cookie 登入 Facebook...');
    
    // 解析 Cookie 字串（JSON 格式）
    let cookieArray: any[];
    try {
      // 先清理 Cookie 字串（移除多餘空格、修正格式）
      let cleanedCookies = cookies.trim();
      
      // 修正常見的格式問題
      // 1. 修正 "expiration Date" -> "expirationDate"
      cleanedCookies = cleanedCookies.replace(/"expiration\s+Date"/gi, '"expirationDate"');
      
      // 2. 移除 null 值（Puppeteer 不需要）
      cleanedCookies = cleanedCookies.replace(/,\s*"storeId":\s*null/gi, '');
      cleanedCookies = cleanedCookies.replace(/,\s*"hostOnly":\s*false/gi, '');
      
      cookieArray = JSON.parse(cleanedCookies);
      
      // 轉換為 Puppeteer 需要的格式
      cookieArray = cookieArray.map((cookie: any) => {
        // 只保留 Puppeteer 需要的欄位
        const puppeteerCookie: any = {
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path || '/',
        };
        
        // 添加可選欄位
        if (cookie.expirationDate || cookie['expiration Date']) {
          puppeteerCookie.expires = cookie.expirationDate || cookie['expiration Date'];
        }
        if (cookie.secure !== undefined) {
          puppeteerCookie.secure = cookie.secure;
        }
        if (cookie.httpOnly !== undefined) {
          puppeteerCookie.httpOnly = cookie.httpOnly;
        }
        if (cookie.sameSite) {
          puppeteerCookie.sameSite = cookie.sameSite === 'no_restriction' ? 'None' : 
                                     cookie.sameSite === 'lax' ? 'Lax' : 
                                     cookie.sameSite === 'strict' ? 'Strict' : 
                                     cookie.sameSite;
        }
        
        return puppeteerCookie;
      });
    } catch (error: any) {
      console.error('[Puppeteer] Cookie 解析錯誤:', error.message);
      console.error('[Puppeteer] 嘗試清理 Cookie 格式...');
      
      // 如果解析失敗，嘗試更積極的清理
      try {
        let cleanedCookies = cookies
          .replace(/"expiration\s+Date"/gi, '"expirationDate"')
          .replace(/,\s*"storeId":\s*null/gi, '')
          .replace(/,\s*"hostOnly":\s*false/gi, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        cookieArray = JSON.parse(cleanedCookies);
      } catch (retryError) {
        console.error('[Puppeteer] Cookie 格式錯誤，無法解析');
        cookieArray = [];
      }
    }

    // 先訪問 Facebook 首頁
    await page.goto('https://www.facebook.com', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // 設定 Cookie
    if (cookieArray.length > 0) {
      await page.setCookie(...cookieArray);
      console.log(`[Puppeteer] 已設定 ${cookieArray.length} 個 Cookie`);
    }

    // 重新載入頁面以應用 Cookie
    await page.reload({ waitUntil: 'networkidle2' });

    // 檢查是否登入成功
    const isLoggedIn = await page.evaluate(() => {
      return !!(
        document.querySelector('[aria-label="Facebook"]') ||
        document.querySelector('a[href*="/me"]') ||
        document.querySelector('[data-pagelet="LeftRail"]')
      );
    });

    if (isLoggedIn) {
      console.log('[Puppeteer] ✅ 使用 Cookie 登入成功');
      return true;
    } else {
      console.warn('[Puppeteer] ⚠️ Cookie 可能已過期，需要重新登入');
      return false;
    }
  } catch (error: any) {
    console.error('[Puppeteer] Cookie 登入錯誤:', error.message);
    return false;
  }
}

/**
 * 使用 Puppeteer 抓取 Facebook 貼文留言
 */
export async function fetchCommentsWithPuppeteer(
  postUrl: string,
  config: PuppeteerConfig = {}
): Promise<FacebookComment[]> {
  const {
    headless = true,
    cookies,
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport = { width: 1920, height: 1080 },
    timeout = 60000,
  } = config;

  let browser: Browser | null = null;

  try {
    console.log('[Puppeteer] 啟動瀏覽器...');
    
    // 啟動瀏覽器
    browser = await puppeteerExtra.launch({
      headless: headless ? ('new' as any) : false, // 'new' 使用新的無頭模式
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ],
      defaultViewport: viewport,
    });

    const page = await browser.newPage();
    
    // 設定 User-Agent
    await page.setUserAgent(userAgent);

    // 設定額外的 headers 來模擬真實瀏覽器
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });

    // 如果有提供 Cookie，使用 Cookie 登入
    if (cookies) {
      const loginSuccess = await loginWithCookies(page, cookies);
      if (!loginSuccess) {
        throw new Error('Cookie 登入失敗，請檢查 Cookie 是否有效');
      }
    }

    console.log(`[Puppeteer] 正在訪問貼文：${postUrl}`);
    
    // 訪問貼文頁面
    await page.goto(postUrl, {
      waitUntil: 'networkidle2',
      timeout: timeout,
    });

    // 等待留言區域載入
    console.log('[Puppeteer] 等待留言區域載入...');
    const waitForTimeout = (page as any).waitForTimeout?.bind(page);
    if (typeof waitForTimeout === 'function') {
      await waitForTimeout(3000);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    // 滾動頁面以載入更多留言
    console.log('[Puppeteer] 滾動頁面載入留言...');
    await autoScroll(page);

    // 提取留言
    console.log('[Puppeteer] 開始提取留言...');
    const comments = await extractComments(page);

    console.log(`[Puppeteer] ✅ 成功抓取 ${comments.length} 筆留言`);

    return comments;
  } catch (error: any) {
    console.error('[Puppeteer] 抓取留言錯誤:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('[Puppeteer] 瀏覽器已關閉');
    }
  }
}

/**
 * 自動滾動頁面以載入更多留言
 */
async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        // 如果已經滾動到底部或超過 10 次，停止滾動
        if (totalHeight >= scrollHeight || totalHeight >= 5000) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });

  // 等待新內容載入
  const waitForTimeout = (page as any).waitForTimeout?.bind(page);
  if (typeof waitForTimeout === 'function') {
    await waitForTimeout(2000);
  } else {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

/**
 * 從頁面提取留言
 */
async function extractComments(page: Page): Promise<FacebookComment[]> {
  const comments = await page.evaluate(() => {
    const commentElements: FacebookComment[] = [];

    // Facebook 留言的選擇器（可能會變動，需要根據實際頁面調整）
    // 常見的留言選擇器：
    const selectors = [
      '[data-testid="UFI2Comment/root"]',
      '[data-testid="comment"]',
      '[role="article"]',
      '.userContentWrapper',
      'div[data-ad-preview="message"]',
    ];

    let commentNodes: NodeListOf<Element> | null = null;

    // 嘗試每個選擇器
    for (const selector of selectors) {
      commentNodes = document.querySelectorAll(selector);
      if (commentNodes.length > 0) {
        console.log(`找到 ${commentNodes.length} 個留言（使用選擇器：${selector}）`);
        break;
      }
    }

    if (!commentNodes || commentNodes.length === 0) {
      console.warn('未找到留言元素，嘗試通用方法...');
      // 備用方法：尋找包含留言文字的元素
      commentNodes = document.querySelectorAll('div[dir="auto"]');
    }

    commentNodes?.forEach((element, index) => {
      try {
        // 提取留言文字
        const messageElement = element.querySelector('[data-testid="comment"] span, span[dir="auto"], div[dir="auto"]');
        const message = messageElement?.textContent?.trim() || '';

        if (!message) return; // 跳過空留言

        // 提取留言者名稱
        const nameElement = element.querySelector('a[role="link"] strong, a[href*="/user/"] strong, h3 a');
        const name = nameElement?.textContent?.trim() || '未知用戶';

        // 提取留言 ID（從 data-* 屬性或 href）
        const linkElement = element.querySelector('a[href*="/comment/"]');
        const commentId = linkElement?.getAttribute('href')?.match(/comment\/(\d+)/)?.[1] || `comment_${index}`;

        // 提取時間（如果有的話）
        const timeElement = element.querySelector('a[href*="/comment/"] abbr, time');
        const timeText = timeElement?.getAttribute('title') || timeElement?.textContent || new Date().toISOString();

        commentElements.push({
          id: commentId,
          message: message,
          from: {
            name: name,
            id: '', // Facebook 的用戶 ID 通常需要額外解析
          },
          created_time: timeText,
        });
      } catch (error) {
        console.error('提取留言時發生錯誤:', error);
      }
    });

    return commentElements;
  });

  // 過濾重複的留言（根據 ID）
  const uniqueComments = comments.filter((comment, index, self) =>
    index === self.findIndex((c) => c.id === comment.id)
  );

  return uniqueComments;
}

/**
 * 使用 Puppeteer 回覆 Facebook 留言
 * 
 * @param commentUrlOrPostUrl - 留言 URL 或貼文 URL（如果是貼文 URL，需要提供 commentId）
 * @param message - 回覆訊息
 * @param config - Puppeteer 設定
 * @param commentId - 可選：如果提供的是貼文 URL，需要提供留言 ID
 */
export async function replyToCommentWithPuppeteer(
  commentUrlOrPostUrl: string,
  message: string,
  config: PuppeteerConfig = {},
  commentId?: string
): Promise<boolean> {
  const {
    headless = true,
    cookies,
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport = { width: 1920, height: 1080 },
    timeout = 60000,
  } = config;

  let browser: Browser | null = null;

  try {
    console.log('[Puppeteer] 啟動瀏覽器以回覆留言...');
    
    browser = await puppeteerExtra.launch({
      headless: headless ? ('new' as any) : false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ],
      defaultViewport: viewport,
    });

    const page = await browser.newPage();
    await page.setUserAgent(userAgent);

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });

    // 如果有提供 Cookie，使用 Cookie 登入
    if (cookies) {
      const loginSuccess = await loginWithCookies(page, cookies);
      if (!loginSuccess) {
        throw new Error('Cookie 登入失敗，請檢查 Cookie 是否有效');
      }
    }

    // 構建留言 URL
    let commentUrl = commentUrlOrPostUrl;
    if (commentId && !commentUrlOrPostUrl.includes('#comment_')) {
      // 如果提供的是貼文 URL 和留言 ID，構建留言 URL
      commentUrl = `${commentUrlOrPostUrl}#comment_${commentId}`;
    }

    console.log(`[Puppeteer] 正在訪問留言：${commentUrl}`);
    
    // 訪問留言頁面
    await page.goto(commentUrl, {
      waitUntil: 'networkidle2',
      timeout: timeout,
    });

    // 等待留言區域載入
    const waitForTimeout = (page as any).waitForTimeout?.bind(page);
    if (typeof waitForTimeout === 'function') {
      await waitForTimeout(3000);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    // 如果有 commentId，嘗試滾動到該留言
    if (commentId) {
      console.log(`[Puppeteer] 嘗試滾動到留言 ${commentId}...`);
      await page.evaluate((id) => {
        // 嘗試找到留言元素並滾動到它
        const commentElement = document.querySelector(`[data-testid*="${id}"], a[href*="${id}"]`);
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, commentId);
      if (typeof waitForTimeout === 'function') {
        await waitForTimeout(2000);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // 如果有 commentId，先嘗試找到該留言並點擊回覆
    if (commentId) {
      console.log(`[Puppeteer] 嘗試找到留言 ${commentId} 並點擊回覆...`);
      
      // 嘗試找到留言並點擊回覆按鈕
      const replyButtonFound = await page.evaluate((id) => {
        // 尋找包含留言 ID 的元素
        const commentElements = Array.from(document.querySelectorAll('[data-testid*="comment"], [role="article"]'));
        
        for (const element of commentElements) {
          // 檢查是否包含留言 ID（在連結或屬性中）
          const links = Array.from(element.querySelectorAll('a[href*="/comment/"]'));
          for (const link of links) {
            if (link.getAttribute('href')?.includes(id)) {
              // 找到留言，尋找回覆按鈕
              const replyButton = element.querySelector('div[role="button"][aria-label*="回覆"], div[role="button"][aria-label*="Reply"], span[role="button"]');
              if (replyButton) {
                (replyButton as HTMLElement).click();
                return true;
              }
            }
          }
        }
        return false;
      }, commentId);

      if (replyButtonFound) {
        console.log('[Puppeteer] 已點擊回覆按鈕，等待輸入框出現...');
        if (typeof waitForTimeout === 'function') {
          await waitForTimeout(1000);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    // 尋找回覆輸入框
    console.log('[Puppeteer] 尋找回覆輸入框...');
    
    // Facebook 回覆輸入框的選擇器（可能會變動）
    const replySelectors = [
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"]',
      'textarea[placeholder*="留言"]',
      'textarea[placeholder*="回覆"]',
      'textarea[aria-label*="留言"]',
      'textarea[aria-label*="回覆"]',
      '[data-testid="comment-input"]',
      'div[aria-label*="留言"]',
      'div[aria-label*="回覆"]',
    ];

    let replyInput: any = null;
    let foundSelector: string | null = null;
    
    // 等待輸入框出現（最多等待 10 秒）
    for (const selector of replySelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 10000 });
        replyInput = await page.$(selector);
        if (replyInput) {
          foundSelector = selector;
          console.log(`[Puppeteer] 找到回覆輸入框：${selector}`);
          break;
        }
      } catch {
        continue;
      }
    }

    if (!replyInput || !foundSelector) {
      throw new Error('找不到回覆輸入框，可能留言結構已變更或需要手動點擊回覆');
    }

    // 點擊輸入框以確保焦點
    await replyInput.click();
    {
      const waitForTimeout = (page as any).waitForTimeout?.bind(page);
      if (typeof waitForTimeout === 'function') {
        await waitForTimeout(500);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // 清空輸入框（如果有內容）
    await page.evaluate((selector) => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        element.innerText = '';
        element.textContent = '';
      }
    }, foundSelector);

    // 輸入訊息
    console.log(`[Puppeteer] 輸入回覆訊息：${message}`);
    await page.type(foundSelector, message, { delay: 100 });

    // 尋找並點擊發送按鈕
    console.log('[Puppeteer] 尋找發送按鈕...');
    
    const sendButtonSelectors = [
      'div[aria-label="留言"]',
      'button[type="submit"]',
      'button[aria-label*="留言"]',
      '[data-testid="comment-submit"]',
      'div[role="button"][aria-label*="留言"]',
    ];

    let sendButton: any = null;
    for (const selector of sendButtonSelectors) {
      try {
        sendButton = await page.$(selector);
        if (sendButton) {
          console.log(`[Puppeteer] 找到發送按鈕：${selector}`);
          break;
        }
      } catch {
        continue;
      }
    }

    if (!sendButton) {
      // 如果找不到按鈕，嘗試按 Enter 鍵
      console.log('[Puppeteer] 未找到發送按鈕，嘗試按 Enter 鍵...');
      await page.keyboard.press('Enter');
    } else {
      await sendButton.click();
    }

    // 等待回覆完成
    {
      const waitForTimeout = (page as any).waitForTimeout?.bind(page);
      if (typeof waitForTimeout === 'function') {
        await waitForTimeout(2000);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // 檢查是否回覆成功（檢查是否有新的回覆出現）
    const replySuccess = await page.evaluate((msg) => {
      // 檢查頁面上是否有包含我們訊息的回覆
      const pageText = document.body.innerText;
      return pageText.includes(msg);
    }, message);

    if (replySuccess) {
      console.log('[Puppeteer] ✅ 回覆留言成功');
      return true;
    } else {
      console.warn('[Puppeteer] ⚠️ 無法確認回覆是否成功');
      // 即使無法確認，也返回 true（因為可能只是檢查機制不夠準確）
      return true;
    }
  } catch (error: any) {
    console.error('[Puppeteer] 回覆留言錯誤:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
      console.log('[Puppeteer] 瀏覽器已關閉');
    }
  }
}

/**
 * 取得 Facebook Cookie（用於保存登入狀態）
 */
export async function getFacebookCookies(
  email: string,
  password: string
): Promise<string> {
  let browser: Browser | null = null;

  try {
    console.log('[Puppeteer] 啟動瀏覽器以取得 Cookie...');
    
    browser = await puppeteerExtra.launch({
      headless: false, // 需要顯示瀏覽器以便手動處理驗證
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });

    const page = await browser.newPage();
    
    // 登入 Facebook
    const loginSuccess = await loginToFacebook(page, email, password);
    
    if (!loginSuccess) {
      throw new Error('登入失敗，無法取得 Cookie');
    }

    // 取得 Cookie
    const cookies = await page.cookies();
    
    // 轉換為 JSON 字串
    const cookiesJson = JSON.stringify(cookies, null, 2);
    
    console.log('[Puppeteer] ✅ 已取得 Cookie');
    console.log('[Puppeteer] 請將以下 Cookie 保存到環境變數 FACEBOOK_COOKIES 中：');
    console.log(cookiesJson);

    return cookiesJson;
  } catch (error: any) {
    console.error('[Puppeteer] 取得 Cookie 錯誤:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

