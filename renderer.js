const { ipcRenderer } = require('electron');
const { dialog, BrowserWindow } = require('electron');
const WaveSurfer = require('wavesurfer.js')
const Regions = require('wavesurfer.js/plugins/regions')

let context;
let ws;

window.addEventListener("DOMContentLoaded", () => {
  const $ = require('jquery');
  window.$ = window.jQuery = $;
  ipcRenderer.on('initialize-context', (e, settings) => {
    context = settings;
    createKeyboard(context.keyboards[context.default_keyboard]);
  });
  ipcRenderer.on('refresh-context', (e, settings) => {
    context = settings;
  });
  ipcRenderer.on('handle-keypress', (e, pressedKey) => {
    handleKeyPress(pressedKey.keyName, pressedKey.down == "DOWN" ? true : false)
  });
  ipcRenderer.on('add-sound', (e, details) => {
    handleAddSound(details)
  });
  document.querySelector('#add-sound').addEventListener('click', function (event) {
    ipcRenderer.send('open-browser', { keymaps: context.keymaps, keyID: $('#keymap-selection').attr("key") })
  });

});

function createKeyboard(keySet) {
  const keyboardContainer = document.querySelector("#keyboard-container");
  console.log(keySet)
  for (const [keyRaw, keyLabel] of Object.entries(keySet.keys)) {
    const keyElement = document.createElement("div");
    keyElement.id = keyRaw;
    keyElement.className = "key";
    keyElement.textContent = keyLabel;
    keyElement.onclick = selectKey;
    keyboardContainer.appendChild(keyElement);
  }
}

function handleKeyPress(keyName, isKeyDown) {
  const keyElement = document.getElementById(keyName);
  if (keyElement) {
    if (isKeyDown) {
      keyElement.classList.add("highlight");
    } else {
      keyElement.classList.remove("highlight");
    }
  }
}

function audioPlayer(pathOfAudioFile) {
  var audio = new Audio(pathOfAudioFile);
  audio.play();
}

function selectKey(e) {
  let id = e.target.id
  //Client clicks on an already selected key.
  if ($(`#${id}`).hasClass("selected")) {
    $(`#${id}`).removeClass("selected");
    $("#keymap-selection").attr("key", "none")
    $("#keymap-selection").toggleClass("key-selected", false);
    $("#description").html("No selected key.")
    if (ws !== undefined) {
      ws.destroy();
    }
    id = null;
  }
  //Client clicks on a key not selected ATM.
  else {
    $(".selected").removeClass("selected")
    $(`#${id}`).addClass("selected")
    $("#keymap-selection").attr("key", id);
    $("#keymap-selection").toggleClass("key-selected", true);
    $("#description").html(`Key: ${e.target.innerText}<br>ID: ${id}`)
  }
  console.log(context.keymaps[context.default_keymap])
  if (context.keymaps[context.default_keymap][id] !== undefined) {
    updatePlayer(context.keymaps[context.default_keymap][id].path)
  }
  else if (ws !== undefined) {
    ws.destroy();
  }
}

function declareListener(id, audioFilePath) {
  context.keymaps[context.default_keymap][id] = {
    path: audioFilePath,
    T_start: 0,
    T_end: 0,
    fileExtension: audioFilePath.split(".").pop()
  }
  updatePlayer(audioFilePath)
  ipcRenderer.send('keymap-refresh', context.keymaps)

}

function handleAddSound(details) {
  declareListener(details.keyID, details.filePath)
}

function updatePlayer(path) {
  ws = WaveSurfer.create({
    container: '#player',
    waveColor: '#4F4A85',
    progressColor: '#383351',
    url: path
  })
  ws.on('interaction', () => {
    ws.playPause()
  })
}