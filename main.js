const { GlobalKeyboardListener } = require("node-global-key-listener");
const v = new GlobalKeyboardListener();
const EventEmitter = require('events');
const { app, BrowserWindow } = require('electron');
const path = require('path');
let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 1200,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'keyloader.js'),
    }
  });

  win.loadFile('keyboard.html');
}

app.whenReady().then(() => {
  createWindow();

  // Maintain a record of currently pressed keys
  

  // Listen for global keyboard events
  v.addListener((e, down) => {
    const keyName = e.rawKey._nameRaw;
    console.log(`${e.name} ${e.state == "DOWN" ? "DOWN" : "UP  "} [${e.rawKey._nameRaw}]`);
    const pressedKeys = {keyName: keyName, down: e.state};

    // Emit the updated pressedKeys object to the renderer process
    console.log(pressedKeys)
    win.webContents.send('handle-keypress', pressedKeys);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
