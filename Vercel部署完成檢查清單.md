# Vercel 部署完成檢查清單

## ✅ 步驟 1：確認代碼已推送

### 檢查項目：
- [ ] `pages/api/debug/check-db.ts` 已修復（移除未使用的導入）
- [ ] `pages/index.tsx` 已更新（老闆創表單按鈕）
- [ ] 所有修改已提交到 GitHub

### 如何確認：
1. 打開 GitHub：https://github.com/shijjfung/coolcool
2. 檢查最新的 commit 是否包含修復
3. 如果沒有，請使用 GitHub Desktop 或命令列推送

---

## ✅ 步驟 2：在 Vercel 設定環境變數

### 必須設定的 4 個環境變數：

1. **DATABASE_TYPE**
   - 值：`supabase`
   - 環境：Production, Preview, Development（全選）

2. **SUPABASE_URL**
   - 值：從 Supabase Dashboard → Settings → API → Project URL 複製
   - 格式：`https://xxxxx.supabase.co`
   - 環境：全選

3. **SUPABASE_ANON_KEY**
   - 值：從 Supabase Dashboard → Settings → API → anon public key 複製
   - 環境：全選

4. **SUPABASE_SERVICE_ROLE_KEY**
   - 值：從 Supabase Dashboard → Settings → API → service_role key 複製
   - ⚠️ 注意：這個 key 有完整權限，請妥善保管
   - 環境：全選

### 設定步驟：
1. 登入 Vercel Dashboard
2. 進入專案 `coolcool`
3. 點擊「Settings」→「Environment Variables」
4. 逐一添加上述 4 個環境變數
5. 每個變數都要選擇所有環境（Production, Preview, Development）
6. 點擊「Save」

---

## ✅ 步驟 3：在 Supabase 執行 SQL 腳本

### 步驟：
1. 登入 Supabase Dashboard：https://app.supabase.com
2. 選擇您的專案
3. 點擊左側選單「SQL Editor」
4. 點擊「New query」
5. 打開專案中的 `supabase-complete-schema.sql` 檔案
6. 複製全部內容
7. 貼上到 Supabase SQL Editor
8. 點擊「Run」執行
9. 確認沒有錯誤訊息（應該會顯示「Success. No rows returned」）

---

## ✅ 步驟 4：觸發重新部署

### 方法 A：自動部署（推薦）
- 如果已推送代碼到 GitHub，Vercel 會自動觸發部署
- 等待 1-3 分鐘

### 方法 B：手動觸發
1. 在 Vercel Dashboard 的專案頁面
2. 點擊右上角「...」選單
3. 選擇「Redeploy」
4. 選擇「Use existing Build Cache」（可選）
5. 點擊「Redeploy」

---

## ✅ 步驟 5：檢查部署狀態

### 檢查項目：
1. 在 Vercel Dashboard 查看部署狀態
2. 如果顯示「Ready」✅ → 部署成功
3. 如果顯示錯誤 ❌ → 點擊查看詳細錯誤訊息

### 常見錯誤排除：

#### 錯誤 1：Build Failed - 編譯錯誤
- **原因**：代碼有語法錯誤
- **解決**：檢查 Build Logs，修復錯誤後重新推送

#### 錯誤 2：Environment Variable Missing
- **原因**：環境變數未設定
- **解決**：確認所有 4 個環境變數都已正確設定

#### 錯誤 3：Database Connection Error
- **原因**：Supabase 環境變數錯誤或資料庫未設定
- **解決**：
  - 檢查 Supabase URL 和 Keys 是否正確
  - 確認 Supabase 專案沒有被暫停
  - 確認已執行 `supabase-complete-schema.sql`

---

## ✅ 步驟 6：取得部署網址

部署成功後：
1. 在 Vercel Dashboard 的專案頁面
2. 會看到部署網址，例如：`https://coolcool.vercel.app`
3. 複製這個網址

---

## 📱 步驟 7：手機端測試

### 測試步驟：

1. **在手機瀏覽器打開部署網址**
   - 例如：`https://coolcool.vercel.app`
   - 建議使用 Chrome 或 Safari

2. **測試首頁**
   - [ ] 可以看到「訂單管理系統」標題
   - [ ] 可以看到「老闆創表單」按鈕
   - [ ] 按鈕可以正常點擊

3. **測試創建表單功能**
   - [ ] 點擊「老闆創表單」進入管理頁面
   - [ ] 點擊「+ 建立新表單」
   - [ ] 填寫「建立本張團購單」名稱
   - [ ] 設定「本單截止時間」（日期和時間）
   - [ ] 可選：設定「取貨時間」
   - [ ] 可選：勾選「本單限額」並設定限額筆數
   - [ ] 點擊「+ 新增欄位」
   - [ ] 填寫欄位名稱
   - [ ] 選擇欄位類型（文字、數字、好事多代購）
   - [ ] 如果是數字類型，可以設定價格
   - [ ] 點擊「建立」按鈕
   - [ ] 應該會跳轉到分享頁面

4. **測試表單分享**
   - [ ] 可以看到 QR Code
   - [ ] 可以複製表單網址
   - [ ] 可以分享到 LINE、WhatsApp 等

5. **測試客戶端填寫表單**
   - [ ] 使用分享的網址或掃描 QR Code
   - [ ] 可以填寫姓名和電話
   - [ ] 可以填寫表單欄位
   - [ ] 可以送出訂單
   - [ ] 可以看到訂單確認頁面

### 手機端優化確認：

✅ 已優化的功能：
- 按鈕有足夠的點擊區域（最小 44px）
- 輸入框字體大小為 16px（防止 iOS 自動縮放）
- 響應式設計（自動適應手機螢幕）
- 觸控優化（touch-manipulation）

---

## 🐛 如果遇到問題

### 問題 1：手機無法訪問
- **檢查**：確認 Vercel 部署網址正確
- **檢查**：確認手機網路連線正常
- **檢查**：嘗試清除瀏覽器快取

### 問題 2：創建表單失敗
- **檢查**：查看瀏覽器控制台（Console）是否有錯誤
- **檢查**：確認 Supabase 環境變數已正確設定
- **檢查**：確認 Supabase 資料庫結構已建立

### 問題 3：表單無法保存
- **檢查**：確認 Supabase 連線正常
- **檢查**：查看 Vercel 的 Function Logs
- **檢查**：確認 `forms` 表已正確建立

---

## 📝 測試完成後

如果所有測試都通過，恭喜！您的系統已成功部署到 Vercel，並且可以在手機上正常使用！

### 後續建議：
1. 將 Vercel 網址加入手機書籤
2. 可以考慮設定自訂網域名稱（在 Vercel Settings → Domains）
3. 定期備份 Supabase 資料庫

---

## 💡 提示

- Vercel 會自動為每次推送生成預覽網址
- 可以設定自訂網域名稱（需要購買網域）
- 免費方案有使用限制，但對個人使用通常足夠

如有任何問題，請查看 Vercel 的 Build Logs 或聯繫我協助！

