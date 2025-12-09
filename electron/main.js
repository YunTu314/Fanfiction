import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; // 1. 引入 fs 模块用于创建文件夹

// 2. 在 ESM 模式下构建 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 新增配置：重定向 userData 到 saves 目录 ---
// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development';

// 确定基础目录：
// 开发环境 -> 项目根目录
// 生产环境(exe) -> exe 文件所在的同级目录
const basePath = isDev 
  ? path.join(__dirname, '..') 
  : path.dirname(app.getPath('exe'));

// 拼接 saves 路径
const savesPath = path.join(basePath, 'saves');

// 确保目录存在，若不存在则创建
if (!fs.existsSync(savesPath)) {
  try {
    fs.mkdirSync(savesPath, { recursive: true });
  } catch (error) {
    console.error('无法创建存档目录:', error);
  }
}

// 设置 Electron 的 userData 路径
// 这将改变 LocalStorage、Cookies、Cache 等文件的默认存储位置
app.setPath('userData', savesPath);
// ----------------------------------------------

// 禁止显示安全警告
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    autoHideMenuBar: true,
  });

  // 3. 判断开发环境
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境加载文件
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