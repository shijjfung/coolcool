const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let nextProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: '訂單管理系統',
  });

  if (isDev) {
    // 開發模式：連接到 Next.js 開發伺服器
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // 生產模式：等待伺服器啟動後載入
    waitForServer(() => {
      mainWindow.loadURL('http://localhost:3000');
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function waitForServer(callback, maxAttempts = 30) {
  let attempts = 0;
  const checkServer = () => {
    const http = require('http');
    const req = http.get('http://localhost:3000', (res) => {
      callback();
    });
    req.on('error', () => {
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkServer, 1000);
      } else {
        console.error('無法連接到伺服器');
      }
    });
  };
  checkServer();
}

function startNextServer() {
  if (isDev) {
    // 開發模式：假設 Next.js 已經在運行
    return;
  }

  // 生產模式：啟動 Next.js 伺服器
  const appPath = app.getAppPath();
  const nextPath = path.join(appPath, '.next', 'standalone');
  const serverPath = path.join(nextPath, 'server.js');
  
  // 檢查檔案是否存在
  if (!fs.existsSync(serverPath)) {
    console.error('找不到 Next.js 伺服器檔案');
    return;
  }
  
  nextProcess = spawn('node', [serverPath], {
    cwd: nextPath,
    env: {
      ...process.env,
      PORT: '3000',
      NODE_ENV: 'production',
    },
  });

  nextProcess.stdout.on('data', (data) => {
    console.log(`Next.js: ${data}`);
  });

  nextProcess.stderr.on('data', (data) => {
    console.error(`Next.js: ${data}`);
  });

  nextProcess.on('error', (error) => {
    console.error('啟動 Next.js 伺服器錯誤:', error);
  });
}

app.whenReady().then(() => {
  startNextServer();
  // 等待伺服器啟動
  setTimeout(() => {
    createWindow();
  }, 3000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (nextProcess) {
    nextProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (nextProcess) {
    nextProcess.kill();
  }
});

