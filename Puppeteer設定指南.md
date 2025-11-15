# Puppeteer Facebook 留言抓取設定指南

## 📋 目錄

1. [概述](#概述)
2. [虛擬 Windows 設定](#虛擬-windows-設定)
3. [本地環境設定](#本地環境設定)
4. [Cookie 取得與設定](#cookie-取得與設定)
5. [使用方式](#使用方式)
6. [常見問題](#常見問題)
7. [風險與注意事項](#風險與注意事項)

---

## 概述

由於 Facebook 已移除 Groups API，無法再透過 Graph API 抓取私密社團留言。本指南說明如何使用 **Puppeteer**（瀏覽器自動化工具）來模擬真實瀏覽器行為，抓取 Facebook 留言。

### 技術架構

- **Puppeteer**: 控制 Chromium 瀏覽器
- **puppeteer-extra-plugin-stealth**: 反偵測插件，降低被 Facebook 偵測的風險
- **無頭模式**: 可在伺服器上執行，不需要 GUI

---

## 虛擬 Windows 設定

### 方案 1：本地 Windows 電腦（推薦用於開發測試）

如果您有 Windows 電腦，可以直接在本地執行：

**優點：**
- 設定簡單，無需額外費用
- 可以手動處理驗證碼
- 適合開發和測試

**缺點：**
- 需要電腦持續開機
- 佔用本地資源

**設定步驟：**
1. 確保 Windows 10/11 已安裝
2. 安裝 Node.js（建議 v18 或以上）
3. 安裝專案依賴：`npm install`
4. 完成！可以直接使用

---

### 方案 2：雲端 VPS（推薦用於生產環境）

#### 2.1 AWS EC2 Windows 實例

**申請步驟：**

1. **註冊 AWS 帳號**
   - 前往 https://aws.amazon.com/
   - 註冊並完成身份驗證

2. **建立 EC2 實例**
   - 登入 AWS Console
   - 進入 EC2 服務
   - 點擊「啟動執行個體」
   - 選擇「Microsoft Windows Server 2022 Base」
   - 選擇執行個體類型（建議：t3.medium 或以上，至少 4GB RAM）
   - 設定金鑰對（用於遠端登入）
   - 設定安全群組（開放 RDP 3389 埠）
   - 啟動實例

3. **連線到 Windows 實例**
   - 下載 RDP 檔案
   - 使用 Windows 遠端桌面連線
   - 輸入管理員密碼（從 AWS Console 取得）

4. **在 Windows 實例上設定環境**
   ```powershell
   # 安裝 Node.js
   # 下載並安裝 Node.js LTS 版本
   # https://nodejs.org/

   # 安裝 Git（可選）
   # https://git-scm.com/download/win

   # 安裝 Chrome（Puppeteer 需要）
   # Puppeteer 會自動下載 Chromium，但也可以手動安裝 Chrome
   ```

**費用：**
- t3.medium: 約 $0.0416/小時（約 $30/月）
- 資料傳輸費用另計

---

#### 2.2 Azure Windows 虛擬機器

**申請步驟：**

1. **註冊 Azure 帳號**
   - 前往 https://azure.microsoft.com/
   - 註冊並完成身份驗證（有免費試用額度）

2. **建立虛擬機器**
   - 登入 Azure Portal
   - 點擊「建立資源」→「虛擬機器」
   - 選擇「Windows Server 2022 Datacenter」
   - 選擇大小（建議：Standard_B2s 或以上）
   - 設定管理員帳號密碼
   - 建立虛擬機器

3. **連線到虛擬機器**
   - 使用 RDP 連線
   - 輸入管理員帳號密碼

**費用：**
- Standard_B2s: 約 $0.096/小時（約 $70/月）
- 有免費試用額度 $200

---

#### 2.3 Google Cloud Platform (GCP) Windows 實例

**申請步驟：**

1. **註冊 GCP 帳號**
   - 前往 https://cloud.google.com/
   - 註冊並完成身份驗證（有 $300 免費試用）

2. **建立 Compute Engine 實例**
   - 進入 Compute Engine
   - 建立執行個體
   - 選擇「Windows Server 2022」
   - 選擇機器類型（建議：e2-medium 或以上）
   - 建立執行個體

3. **設定 RDP 存取**
   - 設定防火牆規則
   - 使用 RDP 連線

**費用：**
- e2-medium: 約 $0.067/小時（約 $48/月）
- 有 $300 免費試用額度

---

#### 2.4 台灣本地 VPS 服務商

**推薦服務商：**

1. **遠振資訊**
   - 網址：https://host.com.tw/
   - 提供 Windows VPS
   - 價格：約 $500-1000/月

2. **中華電信 HiCloud**
   - 網址：https://hicloud.hinet.net/
   - 提供 Windows 虛擬主機
   - 價格：約 $800-1500/月

3. **GCP 台灣區域**
   - 在 GCP 選擇「asia-east1」（台灣）
   - 延遲較低

---

### 方案 3：Docker 容器（Linux 環境）

如果您有 Linux 伺服器，可以使用 Docker 執行 Puppeteer：

**優點：**
- 資源消耗較低
- 易於部署和管理
- 成本較低

**缺點：**
- 需要 Linux 環境
- 無法手動處理驗證碼（需要自動化）

**設定步驟：**

```bash
# 使用官方 Puppeteer Docker 映像
docker run -it --rm \
  -v $(pwd):/app \
  -e FACEBOOK_COOKIES='...' \
  ghcr.io/puppeteer/puppeteer:latest \
  node /app/your-script.js
```

---

## 本地環境設定

### 1. 安裝依賴

```bash
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
```

### 2. 環境變數設定

在 `.env.local` 或環境變數中設定：

```env
# 啟用 Puppeteer 模式
FACEBOOK_USE_PUPPETEER=true

# Facebook Cookie（JSON 格式）
FACEBOOK_COOKIES='[{"name":"c_user","value":"...","domain":".facebook.com"},...]'

# Puppeteer 設定
FACEBOOK_PUPPETEER_HEADLESS=true  # false = 顯示瀏覽器視窗（用於除錯）
FACEBOOK_PUPPETEER_TIMEOUT=60000  # 超時時間（毫秒）
```

---

## Cookie 取得與設定

### 方法 1：使用 API 取得 Cookie（不推薦用於生產環境）

```bash
# 呼叫 API 取得 Cookie
curl -X POST http://localhost:3000/api/facebook/get-cookies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -d '{
    "email": "your-facebook-email@example.com",
    "password": "your-password"
  }'
```

**⚠️ 注意：** 此方法需要傳遞密碼，不建議在生產環境使用。

---

### 方法 2：本地執行取得 Cookie（推薦）

1. **建立取得 Cookie 的腳本**

建立 `scripts/get-facebook-cookies.ts`：

```typescript
import { getFacebookCookies } from '../lib/facebook-puppeteer';

async function main() {
  const email = process.env.FACEBOOK_EMAIL;
  const password = process.env.FACEBOOK_PASSWORD;

  if (!email || !password) {
    console.error('請設定 FACEBOOK_EMAIL 和 FACEBOOK_PASSWORD 環境變數');
    process.exit(1);
  }

  try {
    const cookies = await getFacebookCookies(email, password);
    console.log('\n✅ Cookie 取得成功！');
    console.log('\n請將以下內容複製到環境變數 FACEBOOK_COOKIES：');
    console.log(cookies);
  } catch (error: any) {
    console.error('❌ 取得 Cookie 失敗:', error.message);
    process.exit(1);
  }
}

main();
```

2. **執行腳本**

```bash
FACEBOOK_EMAIL=your-email@example.com \
FACEBOOK_PASSWORD=your-password \
npx ts-node scripts/get-facebook-cookies.ts
```

3. **保存 Cookie 到環境變數**

將輸出的 JSON 字串保存到 `.env.local` 或環境變數中。

---

### 方法 3：手動取得 Cookie（最安全）

1. **使用瀏覽器擴充功能**

安裝 Chrome 擴充功能「EditThisCookie」或「Cookie-Editor」

2. **登入 Facebook**

在瀏覽器中登入 Facebook

3. **匯出 Cookie**

- 點擊擴充功能圖示
- 選擇「Export」或「匯出」
- 複製 JSON 格式的 Cookie

4. **設定環境變數**

將 Cookie JSON 字串設定到 `FACEBOOK_COOKIES` 環境變數

---

## 使用方式

### 1. 透過 API 呼叫

```bash
# 使用 Puppeteer 模式掃描留言
curl -X POST http://localhost:3000/api/facebook/scan-comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -d '{
    "usePuppeteer": true
  }'
```

### 2. 在 Cron Job 中使用

修改 `pages/api/cron/facebook-monitor.ts`，加入 Puppeteer 模式：

```typescript
// 在請求中加入 usePuppeteer: true
await fetch('http://localhost:3000/api/facebook/scan-comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.CRON_SECRET}`,
  },
  body: JSON.stringify({
    usePuppeteer: true, // 啟用 Puppeteer 模式
  }),
});
```

### 3. 環境變數自動啟用

設定環境變數 `FACEBOOK_USE_PUPPETEER=true`，系統會自動使用 Puppeteer 模式。

---

## 常見問題

### Q1: Puppeteer 無法啟動瀏覽器

**解決方法：**
- 確保已安裝所有依賴：`npm install`
- 在 Linux 環境，可能需要安裝額外套件：
  ```bash
  sudo apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils
  ```

### Q2: Cookie 過期怎麼辦？

**解決方法：**
- Cookie 通常有效期限為 1-3 個月
- 定期重新取得 Cookie（使用方法 2 或 3）
- 可以設定自動提醒機制

### Q3: Facebook 要求驗證碼

**解決方法：**
- 使用非無頭模式（`headless: false`）手動處理
- 或使用驗證碼解決服務（需要額外費用）

### Q4: 抓取不到留言

**可能原因：**
- Cookie 已過期
- 頁面結構變更（需要更新選擇器）
- 網路連線問題
- Facebook 偵測到自動化行為

**除錯方法：**
- 設定 `headless: false` 查看瀏覽器行為
- 檢查 Console 日誌
- 手動訪問貼文確認是否可看到留言

---

## 風險與注意事項

### ⚠️ 重要警告

1. **違反服務條款風險**
   - 使用自動化工具可能違反 Facebook 服務條款
   - 帳號可能被封鎖
   - **建議使用測試帳號**

2. **技術風險**
   - Facebook 會持續更新頁面結構
   - 需要定期維護程式碼
   - 可能被偵測為機器人行為

3. **安全風險**
   - Cookie 包含登入資訊，請妥善保管
   - 不要將 Cookie 提交到 Git
   - 使用環境變數管理敏感資訊

4. **法律風險**
   - 請確保符合當地法律法規
   - 尊重 Facebook 的使用條款

### 建議做法

1. **使用測試帳號**：不要使用主要 Facebook 帳號
2. **降低頻率**：不要過於頻繁地抓取（建議間隔 5-10 分鐘）
3. **模擬人類行為**：加入隨機延遲、滾動等行為
4. **監控與備援**：準備替代方案（如 LINE 自動監控）

---

## 總結

使用 Puppeteer 抓取 Facebook 留言是一個可行的替代方案，但需要：

1. ✅ 設定虛擬 Windows 環境（本地或雲端）
2. ✅ 取得並設定 Facebook Cookie
3. ✅ 定期維護和更新程式碼
4. ⚠️ 注意風險，使用測試帳號
5. ✅ 準備備援方案

**推薦流程：**
1. 先在本地 Windows 電腦測試
2. 確認可行後，部署到雲端 VPS
3. 設定定時任務自動執行
4. 定期檢查和維護

如有問題，請參考程式碼註解或聯絡技術支援。

