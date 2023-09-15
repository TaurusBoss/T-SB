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
    const previousKey = document.querySelector('.selected');
    if(previousKey) {
        previousKey.classList.remove("selected")
    }
    const key = document.querySelector(`#${e.target.id}`);
    if (key.classList.contains("selected")){
        key.classList.remove("selected")
        selection.innerHTML = "No selected key.";
    }
    else {
        key.classList.add("selected")
        const container = document.querySelector("#keymap-selection")
        const previousSelection = document.querySelector("#selection")
        console.log(previousSelection)
        container.removeChild(previousSelection)
        const selection = document.createElement("p")
        selection.id = "selection"
        selection.innerHTML = `Selected key: ${e.target.innerText}<br>and its ID is ${e.target.id}`
        container.appendChild(selection); 
    }
    
}
