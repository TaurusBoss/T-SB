const { GlobalKeyboardListener } = require("node-global-key-listener");
const v = new GlobalKeyboardListener();
const EventEmitter = require('events');
const { app, BrowserWindow } = require('electron');
const fs = require("fs");
const path = require('path');
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

  GetSettings("default")
  win.webContents.send('initialize-context', context);
  // Listen for global keyboard events
  v.addListener((e, down) => {
    const keyName = e.rawKey._nameRaw;
    console.log(`${e.name} ${e.state == "DOWN" ? "DOWN" : "UP  "} [${e.rawKey._nameRaw}]`);
    const pressedKeys = {keyName: keyName, down: e.state};
    //console.log(pressedKeys)
    win.webContents.send('handle-keypress', pressedKeys);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


async function GetSettings(settingsName) {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'appsettings.json'), 'utf8');
    const keymap = fs.readFileSync(path.join(__dirname, 'keymaps.json'), 'utf8');
    context = JSON.parse(data)[settingsName];
    context.keymap = JSON.parse(keymap)[context.default_keymap];
  } catch (error) {
    console.error('Error reading file:', error);
  }
}