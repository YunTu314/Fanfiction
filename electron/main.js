
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; 

// 2. 在 ESM 模式下构建 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 新增配置：重定向 userData 到 saves 目录 ---
const isDev = process.env.NODE_ENV === 'development';

const basePath = isDev 
  ? path.join(__dirname, '..') 
  : path.dirname(app.getPath('exe'));

const savesPath = path.join(basePath, 'saves');

if (!fs.existsSync(savesPath)) {
  try {
    fs.mkdirSync(savesPath, { recursive: true });
  } catch (error) {
    console.error('无法创建存档目录:', error);
  }
}

app.setPath('userData', savesPath);
// ----------------------------------------------

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let mainWindow;

function createWindow() {
  // 确定图标路径
  // 开发环境: public/icon.ico
  // 生产环境: dist/icon.ico (vite 会把 public 下的文件复制到 dist)
  const iconPath = isDev 
    ? path.join(__dirname, '../public/icon.ico') 
    : path.join(__dirname, '../dist/icon.ico');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath, // 设置窗口图标
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    autoHideMenuBar: true,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
