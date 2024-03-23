const { GlobalKeyboardListener } = require("node-global-key-listener");
const v = new GlobalKeyboardListener();
const EventEmitter = require('events');
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const fs = require("fs");
const path = require('path');
try {
  require('electron-reloader')(module)
} catch (_) { }
let win;
let context = {};

const createWindow = () => {
  win = new BrowserWindow({
    minWidth: 1280,
    minHeight: 720,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'frontend.js')
    }    
  });
  win.maximize();
  win.loadFile('keyboard.html');
}

app.whenReady().then(() => {
  createWindow();
  const menu = Menu.buildFromTemplate(menuTemplate())
  Menu.setApplicationMenu(menu)
  GetSettings()
  win.webContents.send('initialize-context', context);
  // Listen for global keyboard events
  v.addListener((e, down) => {
    const keyName = e.rawKey._nameRaw;
    console.log(`${e.name} ${e.state == "DOWN" ? "DOWN" : "UP  "} [${e.rawKey._nameRaw}]`);
    const pressedKeys = { keyName: keyName, down: e.state };
    //console.log(pressedKeys)
    win.webContents.send('handle-keypress', pressedKeys);
  });
  ipcMain.on('settings-refresh', (e, data) => {
    delete data.keymaps;
    let settings = {default: data}
    fs.writeFileSync(path.join(__dirname, 'appsettings.json'), JSON.stringify(settings));
  })
  ipcMain.on('keymap-refresh', (e, keymaps) => {
    fs.writeFileSync(path.join(__dirname, 'keymaps.json'), JSON.stringify(keymaps));
    context.keymaps = keymaps;
    win.webContents.send('refresh-context', context)
  })
  ipcMain.on('open-browser', (e, details) => {
    dialog.showOpenDialog({
      defaultPath: context.sounds_dir,
      properties: ['openFile'],
      filters: [
        { name: 'Audio files', extensions: ['mp3'] },
      ]
    }).then(file => {
      if (!file.canceled) {
        const filePath = file.filePaths[0].toString()
        win.webContents.send('add-sound', {keyID: details.keyID, filePath: filePath})
      }
    })
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


async function GetSettings() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'appsettings.json'), 'utf8');
    const keymaps = fs.readFileSync(path.join(__dirname, 'keymaps.json'), 'utf8');
    context = JSON.parse(data)['default'];
    context.keymaps = JSON.parse(keymaps);
    if (context.sounds_dir = "default") {
      context.sounds_dir = path.join(__dirname, "/assets/sounds")
      console.log("sound_dir setting is set to default")
    }
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