const { app, BrowserWindow, shell, Menu, Tray, nativeImage, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const PORT = 8099;
let mainWindow = null;
let tray = null;
let backendProcess = null;
let serverReady = false;

// ── Data directory ────────────────────────────────────────────────────────────
function getDataDir() {
  return path.join(app.getPath('userData'), 'data');
}

function ensureDataDir() {
  const dir = getDataDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ── Python backend ────────────────────────────────────────────────────────────
function getPythonExecutable() {
  if (app.isPackaged) {
    // In packaged app, use bundled python binary
    const platform = process.platform;
    const base = path.join(process.resourcesPath, 'backend');
    if (platform === 'win32') return path.join(base, 'server', 'server.exe');
    return path.join(base, 'server', 'server');
  }
  // Development: use system python
  return process.platform === 'win32' ? 'python' : 'python3';
}

function getServerScript() {
  if (app.isPackaged) return null; // packaged binary doesn't need a script
  return path.join(__dirname, 'backend', 'server.py');
}

function startBackend() {
  const dataDir = ensureDataDir();
  const exe = getPythonExecutable();
  const script = getServerScript();

  const args = script ? [script] : [];
  const env = { ...process.env, PORT: String(PORT), DATA_DIR: dataDir };

  console.log(`Starting backend: ${exe} ${args.join(' ')}`);
  backendProcess = spawn(exe, args, { env, stdio: ['ignore', 'pipe', 'pipe'] });

  backendProcess.stdout.on('data', d => console.log('[backend]', d.toString().trim()));
  backendProcess.stderr.on('data', d => console.error('[backend]', d.toString().trim()));
  backendProcess.on('exit', (code) => {
    console.log(`Backend exited with code ${code}`);
    backendProcess = null;
  });
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
}

// ── Wait for server ───────────────────────────────────────────────────────────
function waitForServer(maxAttempts = 30, interval = 500) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      const req = http.get(`http://localhost:${PORT}/`, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (attempts >= maxAttempts) {
          reject(new Error('Backend did not start in time'));
        } else {
          setTimeout(check, interval);
        }
      });
      req.setTimeout(400, () => req.destroy());
    };
    check();
  });
}

// ── Main window ───────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'Brouwerij Admin',
    icon: path.join(__dirname, 'assets', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  // App menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'Bestand',
      submenu: [
        {
          label: 'Data map openen',
          click: () => shell.openPath(getDataDir()),
        },
        { type: 'separator' },
        { role: 'quit', label: 'Afsluiten' },
      ],
    },
    {
      label: 'Weergave',
      submenu: [
        { role: 'reload', label: 'Herladen' },
        { role: 'forceReload', label: 'Geforceerd herladen' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom reset' },
        { role: 'zoomIn', label: 'Inzoomen' },
        { role: 'zoomOut', label: 'Uitzoomen' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Volledig scherm' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'GitHub',
          click: () => shell.openExternal('https://github.com/jasperbom/Brew-admin-HA-App'),
        },
        {
          label: 'Over Brouwerij Admin',
          click: () => dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Over Brouwerij Admin',
            message: 'Brouwerij Admin v1.2.0',
            detail: 'Nano brouwerij administratie voor batches, ingrediënten, accijns en voorraad.\n\n© 2026 Jasper Bom\nLicentie: AGPL-3.0',
          }),
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Load a splash/loading screen first, then the real app
  mainWindow.loadURL(`data:text/html,
    <html style="margin:0;background:#1a1a2e;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
    <div style="text-align:center;color:#e2b96f">
      <div style="font-size:60px;margin-bottom:16px">🍺</div>
      <h2 style="margin:0 0 8px;font-size:22px">Brouwerij Admin</h2>
      <p style="margin:0;color:#aaa;font-size:14px">Server wordt gestart…</p>
    </div></html>`);

  waitForServer()
    .then(() => {
      serverReady = true;
      if (mainWindow) mainWindow.loadURL(`http://localhost:${PORT}/`);
    })
    .catch((err) => {
      dialog.showErrorBox('Opstartfout', `De backend server kon niet worden gestart:\n\n${err.message}`);
      app.quit();
    });
}

// ── Tray icon (Windows) ───────────────────────────────────────────────────────
function createTray() {
  if (process.platform !== 'win32') return;
  const iconPath = path.join(__dirname, 'assets', 'icon.ico');
  if (!fs.existsSync(iconPath)) return;

  tray = new Tray(iconPath);
  tray.setToolTip('Brouwerij Admin');
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Openen', click: () => { if (mainWindow) mainWindow.show(); } },
    { type: 'separator' },
    { label: 'Afsluiten', click: () => app.quit() },
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => { if (mainWindow) mainWindow.show(); });
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  startBackend();
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  stopBackend();
});
