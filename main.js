const { GlobalKeyboardListener } = require("node-global-key-listener");
const v = new GlobalKeyboardListener();
const EventEmitter = require('events');
const { app, BrowserWindow, Menu } = require('electron');
const fs = require("fs");
const path = require('path');
try {
  require('electron-reloader')(module)
} catch (_) {}
let win;
let context = {};

const createWindow = () => {
  win = new BrowserWindow({
    width: 1200,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'renderer.js'),
    }
  });

  win.loadFile('keyboard.html');
}

app.whenReady().then(() => {
  createWindow();
  const menu = Menu.buildFromTemplate(menuTemplate())
  Menu.setApplicationMenu(menu)
  GetSettings("default")
  win.webContents.send('initialize-context', context);
  // Listen for global keyboard events
  v.addListener((e, down) => {
    const keyName = e.rawKey._nameRaw;
    console.log(`${e.name} ${e.state == "DOWN" ? "DOWN" : "UP  "} [${e.rawKey._nameRaw}]`);
    const pressedKeys = { keyName: keyName, down: e.state };
    //console.log(pressedKeys)
    win.webContents.send('handle-keypress', pressedKeys);
  });
  win.webContents.on('keymap-refresh', keymaps => {
    fs.writeFileSync(path.join(__dirname, 'keymaps.json'), keymaps);
  })
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


async function GetSettings(settingsName) {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'appsettings.json'), 'utf8');
    const keymaps = fs.readFileSync(path.join(__dirname, 'keymaps.json'), 'utf8');
    context = JSON.parse(data)[settingsName];
    context.keymaps = JSON.parse(keymaps);
  } catch (error) {
    console.error('Error reading file:', error);
  }
}

const isMac = process.platform === 'darwin'

const menuTemplate = () => {
  const isMac = process.platform === 'darwin'
  return [
    // { role: 'appMenu' }
    ...(isMac
      ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }]
      : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [
                { role: 'startSpeaking' },
                { role: 'stopSpeaking' }
              ]
            }
          ]
          : [
            { role: 'delete' },
            { type: 'separator' },
            { role: 'selectAll' }
          ])
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
          ]
          : [
            { role: 'close' }
          ])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://electronjs.org')
          }
        }
      ]
    }
  ]
}