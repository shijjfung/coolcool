# 關閉 Vercel 部署保護

## 問題說明

您看到的是 Vercel 的部署保護頁面，這表示您的部署需要認證才能訪問。這不是代碼問題，而是 Vercel 的設定。

## 解決方案：關閉部署保護

### 方法 1：在 Vercel Dashboard 中關閉（推薦）

1. **前往 Vercel Dashboard**
   - 訪問 https://vercel.com/dashboard
   - 選擇您的專案

2. **前往 Settings（設定）**
   - 點擊左側選單的 **Settings**
   - 滾動到 **Deployment Protection**（部署保護）部分

3. **關閉部署保護**
   - 找到 **"Deployment Protection"** 設定
   - 將保護模式改為 **"None"** 或 **"Off"**
   - 或選擇 **"Password Protection"** 並設定一個簡單的密碼（如果需要的話）

4. **保存設定**
   - 點擊 **Save** 保存設定
   - Vercel 會自動重新部署

### 方法 2：使用生產環境 URL

如果您的專案有自訂網域，使用生產環境 URL：
- 例如：`https://coolcool-ten.vercel.app`（如果這是您的生產環境）

預覽部署（Preview Deployments）通常有保護，但生產環境通常沒有。

## 檢查部署類型

1. 在 Vercel Dashboard 中，前往 **Deployments** 標籤
2. 查看最新部署：
   - **Production** = 生產環境（通常沒有保護）
   - **Preview** = 預覽環境（可能有保護）

## 測試 API

關閉保護後，再次訪問：
```
https://coolcool-ten.vercel.app/api/test-db
```

應該會看到 JSON 回應，而不是認證頁面。

## 如果仍然需要保護

如果您想保留保護但允許 API 訪問：

1. 在 Vercel Dashboard 中設定 **Password Protection**
2. 使用密碼訪問網站
3. 或者設定 **IP Allowlist** 允許特定 IP 訪問

## 注意事項

- 關閉部署保護後，任何人都可以訪問您的網站
- 如果這是生產環境，建議保留保護或使用其他安全措施
- API 端點應該有適當的驗證和授權機制

