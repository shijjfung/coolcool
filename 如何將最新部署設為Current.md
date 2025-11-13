# 如何將最新部署設為 Current（當前部署）

## 🔍 問題說明

**Current** 標籤會指向 **Production** 部署，而不是最新的 Preview 部署。

如果您的程式碼在 `chore-project-review-WQeEy` 分支，而 Production 是從 `main` 分支部署的，那麼 Current 會指向舊的 Production 部署。

---

## ✅ 解決方案

### 方案 1：將 Preview 部署提升為 Production（推薦，最快）

1. 前往 Vercel Dashboard > **Deployments**
2. 找到最新的 Preview 部署（來自 `chore-project-review-WQeEy` 分支）
3. 點擊部署右側的 **⋯**（三個點）
4. 選擇 **Promote to Production**
5. 確認後，這個部署就會成為 **Current**（Production）

**優點**：
- ✅ 立即生效
- ✅ 不需要合併分支
- ✅ 可以快速測試

---

### 方案 2：將分支合併到 main（推薦，長期方案）

如果您的程式碼已經測試完成，可以合併到 main 分支：

1. 在 GitHub 上建立 Pull Request：
   - 從 `chore-project-review-WQeEy` 合併到 `main`
   - 或直接在本地執行：
     ```bash
     git checkout main
     git merge chore-project-review-WQeEy
     git push origin main
     ```

2. Vercel 會自動部署 main 分支
3. 新的部署會自動成為 **Current**（Production）

**優點**：
- ✅ 保持程式碼整潔
- ✅ main 分支始終是最新的
- ✅ 符合 Git 最佳實踐

---

### 方案 3：設定 Vercel 監控該分支

1. 前往 Vercel Dashboard > **Settings** > **Git**
2. 在 **Production Branch** 中：
   - 選擇 `chore-project-review-WQeEy`
   - 或新增該分支作為 Production Branch
3. 這樣該分支的部署會自動成為 Production

**優點**：
- ✅ 自動化
- ✅ 不需要手動提升

---

## 🎯 建議操作

### 立即測試（方案 1）

1. 前往 Vercel Dashboard > **Deployments**
2. 找到最新的 Preview 部署（來自 `chore-project-review-WQeEy`）
3. 點擊 **⋯** > **Promote to Production**
4. 這樣就可以立即使用最新功能

### 長期方案（方案 2）

測試完成後，將分支合併到 main，保持程式碼整潔。

---

## 📝 注意事項

- **Current** 標籤會指向 Production 部署
- Preview 部署不會自動成為 Current
- 需要手動提升或合併到 main 分支

---

## ✅ 完成後

提升為 Production 後：
- ✅ 最新部署會成為 **Current**
- ✅ 您的網域會指向最新部署
- ✅ 所有功能都會使用最新版本

