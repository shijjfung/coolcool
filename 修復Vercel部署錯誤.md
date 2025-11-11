# 修復 Vercel 部署錯誤

## 🔍 步驟 1：查看錯誤日誌

### 在 Vercel Dashboard：
1. 點擊那個顯示「Error」的部署
2. 點擊「Build Logs」或「View Logs」
3. 查看錯誤訊息

### 常見錯誤類型：

#### 錯誤類型 1：編譯錯誤（Build Error）
**錯誤訊息可能包含：**
- `Type error`
- `Module not found`
- `Syntax error`

**解決方法：**
- 確認所有代碼已正確推送
- 確認 `pages/api/debug/check-db.ts` 已修復
- 檢查是否有其他 TypeScript 錯誤

#### 錯誤類型 2：環境變數缺失
**錯誤訊息可能包含：**
- `Environment variable not found`
- `DATABASE_TYPE is not defined`
- `SUPABASE_URL is not defined`

**解決方法：**
- 確認所有 4 個環境變數都已設定
- 確認環境變數的值正確（沒有多餘空格）

#### 錯誤類型 3：依賴安裝失敗
**錯誤訊息可能包含：**
- `npm install failed`
- `Package not found`

**解決方法：**
- 確認 `package.json` 中的依賴都正確
- 可能需要更新依賴版本

---

## 🔧 步驟 2：確認修復已推送

### 檢查 GitHub：
1. 打開：https://github.com/shijjfung/coolcool
2. 查看最新的 commit
3. 確認包含以下修復：
   - `pages/api/debug/check-db.ts` 已修復（移除 `dbAll, dbGet` 導入）

### 如果還沒推送：
使用 GitHub Desktop 或命令列推送：
```bash
git add pages/api/debug/check-db.ts
git commit -m "Fix: Remove unused imports for Vercel deployment"
git push origin main
```

---

## ⚙️ 步驟 3：確認環境變數

### 必須設定的 4 個環境變數：

在 Vercel Dashboard → Settings → Environment Variables 確認：

1. ✅ **DATABASE_TYPE** = `supabase`
2. ✅ **SUPABASE_URL** = 您的 Supabase URL
3. ✅ **SUPABASE_ANON_KEY** = 您的 anon key
4. ✅ **SUPABASE_SERVICE_ROLE_KEY** = 您的 service_role key

### 檢查方法：
- 每個變數都要選擇：Production, Preview, Development（全選）
- 確認值沒有多餘的空格
- 確認 Supabase URL 格式正確（https://xxxxx.supabase.co）

---

## 🔄 步驟 4：重新部署

### 方法 A：自動重新部署（推薦）
1. 如果已推送修復到 GitHub
2. Vercel 會自動觸發新的部署
3. 等待 1-3 分鐘

### 方法 B：手動觸發部署
1. 在 Vercel Dashboard 的專案頁面
2. 點擊右上角「...」選單
3. 選擇「Redeploy」
4. 選擇「Use existing Build Cache」（可選，建議不選以確保使用最新代碼）
5. 點擊「Redeploy」

---

## 📋 步驟 5：檢查新部署狀態

### 等待部署完成後：
1. 查看新的部署狀態
2. 如果顯示「Ready」✅ → 成功！
3. 如果還是「Error」❌ → 查看 Build Logs 找出問題

---

## 🐛 常見問題排除

### 問題 1：Build Failed - Type Error
**錯誤範例：**
```
Type error: Module '"@/lib/db"' declares 'dbAll' locally, but it is not exported.
```

**解決：**
- 確認 `pages/api/debug/check-db.ts` 已修復
- 重新推送代碼
- 重新部署

### 問題 2：Environment Variable Missing
**錯誤範例：**
```
Error: SUPABASE_URL is not defined
```

**解決：**
- 在 Vercel Settings → Environment Variables 添加所有變數
- 確認選擇了所有環境（Production, Preview, Development）
- 重新部署

### 問題 3：Database Connection Error
**錯誤範例：**
```
Error connecting to database
```

**解決：**
- 確認 Supabase URL 和 Keys 正確
- 確認 Supabase 專案沒有被暫停
- 確認已執行 `supabase-complete-schema.sql`

---

## ✅ 成功標誌

部署成功後，您會看到：
- ✅ 狀態顯示「Ready」
- ✅ 有 Production Domain（例如：https://coolcool.vercel.app）
- ✅ 可以點擊網址訪問網站

---

## 📱 測試部署

部署成功後：
1. 點擊 Production Domain 網址
2. 應該可以看到首頁（「訂單管理系統」和「老闆創表單」按鈕）
3. 點擊「老闆創表單」進入管理頁面
4. 測試創建表單功能

---

## 💡 下一步

如果部署成功：
1. 在手機上打開部署網址
2. 測試創建表單功能
3. 確認所有功能正常運作

如果還有問題：
1. 複製完整的錯誤訊息
2. 告訴我具體的錯誤內容
3. 我會協助您解決

