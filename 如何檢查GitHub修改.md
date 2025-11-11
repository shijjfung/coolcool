# 如何在 GitHub Desktop 檢查修改

## 方法 1：使用 GitHub Desktop（圖形化介面）

### 步驟：

1. **打開 GitHub Desktop**
   - 如果還沒打開，從開始選單或桌面圖示打開

2. **檢查左側面板**
   - 在 GitHub Desktop 的左側，應該會看到：
     - 「Changes」標籤（顯示有修改的檔案）
     - 「History」標籤（顯示提交歷史）

3. **查看「Changes」標籤**
   - 點擊「Changes」標籤
   - 應該會看到一個檔案列表，顯示所有有修改的檔案
   - 尋找 `pages/api/debug/check-db.ts`

4. **查看檔案修改內容**
   - 點擊 `pages/api/debug/check-db.ts` 檔案
   - 右側會顯示：
     - **左邊（紅色）**：舊的內容（被刪除或修改的部分）
     - **右邊（綠色）**：新的內容（新增或修改的部分）

5. **確認修改**
   - 應該會看到：
     - 移除了頂部的 `import sqlite3` 和 `import path`
     - 添加了 `const DATABASE_TYPE` 檢查
     - 添加了 Supabase 模式的判斷

---

## 方法 2：使用命令列（如果熟悉命令列）

### 步驟：

1. **打開命令提示字元或 PowerShell**
   - 按 `Win + R`，輸入 `cmd` 或 `powershell`，按 Enter

2. **切換到專案目錄**
   ```bash
   cd E:\下單庫存管理
   ```

3. **檢查修改狀態**
   ```bash
   git status
   ```
   - 會顯示所有有修改的檔案
   - 尋找 `pages/api/debug/check-db.ts`

4. **查看具體修改內容**
   ```bash
   git diff pages/api/debug/check-db.ts
   ```
   - 會顯示檔案的修改內容
   - 紅色（前面有 `-`）表示被刪除的行
   - 綠色（前面有 `+`）表示新增的行

---

## 如果沒有看到修改

### 可能的原因：

1. **檔案還沒保存**
   - 確認在編輯器中已保存檔案（Ctrl+S）
   - 重新整理 GitHub Desktop（按 F5 或關閉重開）

2. **修改已經提交**
   - 檢查「History」標籤
   - 查看最新的 commit 是否包含這個修改

3. **GitHub Desktop 沒有偵測到**
   - 嘗試點擊「Repository」→「Refresh」或按 F5
   - 或關閉並重新打開 GitHub Desktop

---

## 如何提交修改

### 如果看到修改：

1. **在「Changes」標籤中**
   - 確認 `pages/api/debug/check-db.ts` 有勾選（應該預設會勾選）

2. **在底部輸入提交訊息**
   - 例如：「Fix: Make check-db.ts compatible with Vercel/Supabase」

3. **點擊「Commit to main」按鈕**

4. **推送到 GitHub**
   - 點擊「Push origin」按鈕
   - 或點擊「Push origin」旁邊的下拉選單，選擇「Push」

---

## 視覺化說明

### GitHub Desktop 介面：

```
┌─────────────────────────────────────┐
│  GitHub Desktop                      │
├─────────────────────────────────────┤
│  [Changes] [History]                │
├─────────────────────────────────────┤
│  📁 pages/api/debug/                │
│     ✏️ check-db.ts  (修改)          │  ← 這裡應該會看到
│                                     │
│  [顯示修改內容的區域]                │
│  - 舊內容（紅色）                    │
│  + 新內容（綠色）                    │
├─────────────────────────────────────┤
│  Summary:                            │
│  [輸入提交訊息]                      │
│  [Commit to main]  [Push origin]    │
└─────────────────────────────────────┘
```

---

## 快速檢查方法

### 最簡單的方法：

1. **打開 GitHub Desktop**
2. **看左側「Changes」標籤**
3. **如果看到 `pages/api/debug/check-db.ts`** → 有修改，需要提交
4. **如果沒看到** → 可能已經提交，或檔案還沒保存

---

## 需要協助？

如果還是不確定，可以：
1. 截圖 GitHub Desktop 的畫面給我
2. 或告訴我您看到什麼（或沒看到什麼）
3. 我會協助您確認

