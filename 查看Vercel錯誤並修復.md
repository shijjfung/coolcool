# 查看 Vercel 錯誤並修復

## 🔍 步驟 1：查看完整的錯誤訊息

### 在 Vercel Dashboard：

1. **點擊顯示「Error」的部署**
   - 應該是最新的部署（commit: `b78629d`）

2. **點擊「Build Logs」或「View Logs」**

3. **向下滾動，找到錯誤訊息**
   - 尋找包含以下關鍵字的行：
     - `Error:`
     - `Failed to compile`
     - `Type error`
     - `Module not found`
     - `Cannot find module`

4. **複製完整的錯誤訊息**
   - 至少複製 20-30 行
   - 包含錯誤的檔案名稱和行號

---

## 🐛 常見錯誤類型

### 錯誤類型 1：環境變數缺失

**錯誤訊息可能包含：**
```
Error: SUPABASE_URL is not defined
Error: Environment variable DATABASE_TYPE is missing
```

**解決方法：**
- 在 Vercel Settings → Environment Variables 添加所有變數
- 確認選擇了所有環境（Production, Preview, Development）

### 錯誤類型 2：模組找不到

**錯誤訊息可能包含：**
```
Module not found: Can't resolve '@/lib/db'
Cannot find module '@supabase/supabase-js'
```

**解決方法：**
- 確認 `package.json` 包含所有依賴
- 可能需要檢查路徑別名設定

### 錯誤類型 3：TypeScript 編譯錯誤

**錯誤訊息可能包含：**
```
Type error: Property 'xxx' does not exist
Type error: Type 'xxx' is not assignable to type 'yyy'
```

**解決方法：**
- 根據錯誤訊息修復類型問題

### 錯誤類型 4：SQLite 相關錯誤

**錯誤訊息可能包含：**
```
Cannot find module 'sqlite3'
Error loading sqlite3 module
```

**解決方法：**
- 確認 `check-db.ts` 已正確修復
- 確認使用動態導入

---

## 📋 請提供以下資訊

1. **完整的錯誤訊息**（從 Build Logs 複製）
2. **錯誤發生的檔案和行號**
3. **錯誤類型**（編譯錯誤、環境變數、模組找不到等）

---

## 🔧 快速檢查

在提供錯誤訊息前，請先確認：

- [ ] 所有 4 個環境變數都已設定
- [ ] 環境變數的值正確（沒有多餘空格）
- [ ] `DATABASE_TYPE` = `supabase`（不是 `sqlite`）

---

## 💡 提示

如果 Build Logs 很長，可以：
1. 使用瀏覽器的「查找」功能（Ctrl+F）
2. 搜索「Error」或「Failed」
3. 從第一個錯誤開始複製

