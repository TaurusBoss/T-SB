const { ipcRenderer } = require('electron');
const { dialog, BrowserWindow} = require('electron');
const WaveSurfer = require('wavesurfer.js')

let context;

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
        ipcRenderer.send('open-browser', {keymaps: context.keymaps, keyID: $('#keymap-selection').attr("key")})
    });
    const wavesurfer = WaveSurfer.create({
      container: '#player',
      waveColor: '#4F4A85',
      progressColor: '#383351',
      url: 'assets/sounds/dezso.mp3'
    })   
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
    console.log(e.target)
    //Client clicks on an already selected key.
    if($(`#${e.target.id}`).hasClass("selected")){
        $(`#${e.target.id}`).removeClass("selected");
        $("#keymap-selection").attr("key", "none")
        $("#keymap-selection").toggleClass("key-selected", false);
        $("#description").html("No selected key.")
    } 
    //Client clicks on a key not selected ATM.
    else {
        $(".selected").removeClass("selected")
        $(`#${e.target.id}`).addClass("selected")
        $("#keymap-selection").attr("key", e.target.id);
        $("#keymap-selection").toggleClass("key-selected", true);
        $("#description").html(`Key: ${e.target.innerText}<br>ID: ${e.target.id}`)
    }
}

function declareListener(id, audioFilePath) {
    context.keymaps[context.default_keymap][id] = {
        path: audioFilePath,
        T_start: 0,
        T_end: 0,
        fileExtension: audioFilePath.split(".").pop()
    }
    ipcRenderer.send('keymap-refresh', context.keymaps)

}

function handleAddSound(details) {
    declareListener(details.keyID, details.filePath)
}