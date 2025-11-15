# Puppeteer Facebook 留言抓取 - 完整使用流程

## 🚀 完整使用步驟

### 步驟 1：啟動開發伺服器

**不是直接執行 Puppeteer**，而是啟動 Next.js 開發伺服器：

```bash
npm run dev
```

或執行批次檔：
```
啟動開發伺服器.bat
```

等待看到：
```
✓ Ready on http://localhost:3000
```

---

### 步驟 2：前往後台創建表單

1. **開啟瀏覽器**
   - 訪問：`http://localhost:3000/admin/create`
   - 或從首頁進入「表單管理」→「建立新表單」

2. **填寫基本資訊**
   - 表單名稱
   - 截止時間
   - 表單欄位等

---

### 步驟 3：設定 Facebook 自動監控

在表單創建頁面中：

1. **勾選「🤖 Facebook 自動監控留言」**

2. **輸入 Facebook 貼文連結**
   - 欄位：`Facebook 貼文連結`
   - 格式：`https://www.facebook.com/groups/xxx/posts/xxx`
   - 如何取得：
     - 前往 Facebook 社團
     - 找到要監控的貼文
     - 點擊貼文右上角「⋯」或「時間」
     - 選擇「複製連結」或「複製貼文連結」
     - 貼上到欄位中

3. **設定其他必要資訊**
   - **發文者姓名**：例如「愛買」（必填）
   - **掃描間隔**：建議 3-10 分鐘（必填）
   - **關鍵字列表**：例如 `+1`、`+2`、`加一` 等（必填）
   - **回覆訊息**：例如「已登記」（選填，預設為「已登記」）

4. **儲存表單**

---

### 步驟 4：系統自動掃描

#### 立即掃描（建立表單時）

當您儲存表單後，系統會：
- ✅ **立即觸發一次掃描**（自動執行）
- ✅ 使用 Puppeteer 訪問 Facebook 貼文
- ✅ 自動滾動載入所有留言
- ✅ 掃描符合關鍵字的留言
- ✅ 自動建立訂單
- ✅ 自動回覆留言（「已登記」或自訂訊息）

#### 定期掃描（需要設定定時任務）

**重要：** 建立表單後，系統只會立即掃描一次。之後需要設定**定時任務（Cron Job）**來定期掃描。

**設定方式：**

1. **使用 Vercel Cron Jobs**（如果部署在 Vercel）
   - 在 `vercel.json` 中設定：
     ```json
     {
       "crons": [{
         "path": "/api/facebook/scan-comments",
         "schedule": "*/3 * * * *"
       }]
     }
     ```
   - 這會每 3 分鐘自動掃描一次

2. **使用外部 Cron 服務**（如 cron-job.org）
   - URL：`https://您的網址/api/facebook/scan-comments`
   - 方法：`POST`
   - 頻率：每 3-10 分鐘（根據您設定的掃描間隔）
   - Headers（如果設定了 CRON_SECRET）：
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```
   - Body：
     ```json
     {
       "usePuppeteer": true
     }
     ```

3. **本地測試**（開發環境）
   - 可以手動執行 `測試Puppeteer.bat`
   - 或使用 PowerShell：
     ```powershell
     $body = '{"usePuppeteer": true}'
     Invoke-RestMethod -Uri "http://localhost:3000/api/facebook/scan-comments" -Method Post -Body $body -ContentType "application/json"
     ```

---

## 📋 完整流程圖

```
1. 啟動開發伺服器
   ↓
2. 前往後台創建表單
   ↓
3. 勾選「Facebook 自動監控」
   ↓
4. 輸入 Facebook 貼文 URL
   ↓
5. 設定關鍵字、發文者等
   ↓
6. 儲存表單
   ↓
7. 系統立即掃描一次 ✅
   ↓
8. 設定定時任務（Cron Job）
   ↓
9. 系統定期自動掃描 ✅
```

---

## ⚙️ 掃描機制說明

### 掃描條件

系統會自動掃描符合以下條件的表單：

1. ✅ **啟用自動監控**（`facebook_auto_monitor = 1`）
2. ✅ **已設定貼文 URL**（`facebook_post_url`）
3. ✅ **已設定發文者**（`facebook_post_author`）
4. ✅ **已設定關鍵字**（`facebook_keywords`）
5. ✅ **未超過結單時間**（`deadline` 或 `order_deadline`）
6. ✅ **達到掃描間隔**（距離上次掃描已超過設定的間隔時間）

### 掃描流程

1. **使用 Puppeteer 啟動瀏覽器**
2. **使用 Cookie 登入 Facebook**
3. **訪問貼文 URL**
4. **自動滾動載入所有留言**
5. **解析留言內容**
6. **比對關鍵字**
7. **建立訂單**（符合關鍵字的留言）
8. **自動回覆留言**（「已登記」或自訂訊息）
9. **記錄已處理的留言**（避免重複處理）

---

## 🔍 如何確認掃描是否成功

### 方法 1：查看開發伺服器 Console

在執行 `npm run dev` 的終端機中，您會看到：

```
[Facebook] ========== 開始掃描 Facebook 留言 ==========
[Facebook] 時間：2024-11-16T...
[Facebook] 啟用監控的表單數量：1
[Facebook] 使用模式：Puppeteer（瀏覽器自動化）
[Facebook] 開始取得留言，表單：1 (表單名稱)，貼文 URL：...
[Puppeteer] 啟動瀏覽器...
[Puppeteer] 使用 Cookie 登入 Facebook...
[Puppeteer] ✅ 使用 Cookie 登入成功
[Puppeteer] 正在訪問貼文：...
[Puppeteer] 開始滾動載入留言...
[Puppeteer] ✅ 取得 10 筆留言
[Facebook] ✅ Puppeteer 模式：取得 10 筆留言
[Facebook] 處理留言：符合關鍵字「+1」
[Facebook] ✅ 已建立訂單：訂單 ID 123
[Facebook] 💬 準備使用 Puppeteer 回覆留言...
[Puppeteer] ✅ 回覆留言成功
```

### 方法 2：查看後台訂單

1. 前往「表單管理」
2. 點擊表單的「查看報表」
3. 查看是否有新建立的訂單

### 方法 3：查看 Facebook 留言

前往 Facebook 貼文，檢查是否有自動回覆的「已登記」訊息。

---

## ⚠️ 重要提醒

### 1. 前置需求

- ✅ **已設定 Facebook Cookie**（`FACEBOOK_COOKIES` 環境變數）
- ✅ **已設定 `FACEBOOK_USE_PUPPETEER=true`**
- ✅ **開發伺服器正在運行**

### 2. 掃描間隔

- 系統會根據表單設定的「掃描間隔」來控制掃描頻率
- 例如：設定 3 分鐘，則每 3 分鐘最多掃描一次
- 如果距離上次掃描未達間隔時間，會跳過本次掃描

### 3. 結單時間

- 如果表單已超過結單時間（`deadline` 或 `order_deadline`），系統會自動跳過掃描
- 這是為了避免在結單後繼續處理訂單

### 4. Cookie 有效期

- Cookie 通常有效 1-3 個月
- 過期後需要重新取得並更新 `.env.local`
- 建議定期檢查 Cookie 是否有效

---

## 🆘 常見問題

### Q1: 建立表單後沒有立即掃描？

**可能原因：**
- 開發伺服器未運行
- Cookie 未設定或已過期
- 表單設定不完整（缺少貼文 URL、發文者、關鍵字）

**解決方法：**
- 檢查開發伺服器 Console 是否有錯誤訊息
- 確認 `.env.local` 中有 `FACEBOOK_COOKIES`
- 檢查表單設定是否完整

### Q2: 如何手動觸發掃描？

**方法 1：使用測試批次檔**
```
測試Puppeteer.bat
```

**方法 2：使用 API**
```bash
curl -X POST http://localhost:3000/api/facebook/scan-comments \
  -H "Content-Type: application/json" \
  -d '{"usePuppeteer": true}'
```

### Q3: 掃描後沒有建立訂單？

**可能原因：**
- 留言不符合關鍵字
- 留言已被處理過（避免重複）
- 留言時間在結單時間之後

**解決方法：**
- 檢查關鍵字設定是否正確
- 查看 Console 日誌了解詳細原因
- 確認留言格式是否符合預期

---

## ✅ 總結

**完整流程：**

1. ✅ 啟動開發伺服器（`npm run dev`）
2. ✅ 前往後台創建表單
3. ✅ 勾選「Facebook 自動監控」
4. ✅ 輸入 Facebook 貼文 URL
5. ✅ 設定關鍵字、發文者等
6. ✅ 儲存表單（系統會立即掃描一次）
7. ✅ 設定定時任務（定期自動掃描）

**系統會自動：**
- 🔍 掃描 Facebook 留言
- 📝 建立訂單
- 💬 回覆留言

**您只需要：**
- 建立表單
- 設定定時任務（一次設定，永久有效）

就是這麼簡單！🎉

