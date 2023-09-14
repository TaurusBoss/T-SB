const { ipcRenderer } = require('electron');

let context;

function createKeyboard(keySet) {
    const keyboardContainer = document.getElementById("keyboard-container");
    console.log(keySet)
    for (const [keyRaw, keyLabel] of Object.entries(keySet.keys)) {
        const keyElement = document.createElement("div");
        keyElement.id = keyRaw;
        keyElement.className = "key";
        keyElement.textContent = keyLabel;
        keyboardContainer.appendChild(keyElement);
    }
}

// Function to handle key press events
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

window.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.on('initialize-context', (e, settings) => {
        context = settings;
        createKeyboard(context.keyboards[context.default_keyboard]);
      });
    ipcRenderer.on('handle-keypress', (e, pressedKey) => {
        handleKeyPress(pressedKey.keyName, pressedKey.down == "DOWN" ? true : false)
      });
      
      
});