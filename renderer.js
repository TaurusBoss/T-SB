const { ipcRenderer } = require('electron');

let context;

window.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.on('initialize-context', (e, settings) => {
        context = settings;
        createKeyboard(context.keyboards[context.default_keyboard]);
      });
    ipcRenderer.on('handle-keypress', (e, pressedKey) => {
        handleKeyPress(pressedKey.keyName, pressedKey.down == "DOWN" ? true : false)
      });
    const $ = require('jquery');
    window.$ = window.jQuery = $;
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
        $("#keymap-selection").html("No selected key.")
    } 
    //Client clicks on a key not selected ATM.
    else {
        $(".selected").removeClass("selected")
        $(`#${e.target.id}`).addClass("selected")
        $("#keymap-selection").html(`Key: ${e.target.innerText}<br>ID: ${e.target.id}`)
    }
}
