const { ipcRenderer } = require('electron');

const defaultKeySet = {
    "type": "QWERTZ",
    "length": "104",
    "language": "hu/HU",
    "keys": {
        "VK_ESCAPE": "ESC",
        "VK_F1": "F1",
        "VK_F2": "F2",
        "VK_F3": "F3",
        "VK_F4": "F4",
        "VK_F5": "F5",
        "VK_F6": "F6",
        "VK_F7": "F7",
        "VK_F8": "F8",
        "VK_F9": "F9",
        "VK_F10": "F10",
        "VK_F11": "F11",
        "VK_F12": "F12",
        "VK_SNAPSHOT": "PRTSC",
        "VK_SCROLL": "SCRLK",
        "VK_PAUSE": "PAUSE",
        "VK_0": "0",
        "VK_1": "1",
        "VK_2": "2",
        "VK_3": "3",
        "VK_4": "4",
        "VK_5": "5",
        "VK_6": "6",
        "VK_7": "7",
        "VK_8": "8",
        "VK_9": "9",
        "VK_OEM_3": "Ö",
        "VK_OEM_2": "Ü",
        "VK_OEM_PLUS": "Ó",
        "VK_BACK": "BACKSPACE",
        "VK_INSERT": "INS",
        "VK_HOME": "HOME",
        "VK_PRIOR": "PAGE UP",
        "VK_NUMLOCK": "NUMLK",
        "VK_DIVIDE": "/",
        "VK_MULTIPLY": "*",
        "VK_SUBTRACT": "-",
        "VK_TAB": "TAB",
        "VK_Q": "Q",
        "VK_W": "W",
        "VK_E": "E",
        "VK_R": "R",
        "VK_T": "T",
        "VK_Z": "Z",
        "VK_U": "U",
        "VK_I": "I",
        "VK_O": "O",
        "VK_P": "P",
        "VK_OEM_4": "Ő",
        "VK_OEM_6": "Ú",
        "VK_RETURN": "RETURN",
        "VK_DELETE": "DELETE",
        "VK_END": "END",
        "VK_NEXT": "PAGE DN",
        "VK_NUMPAD7": "NUM 7",
        "VK_NUMPAD8": "NUM 8",
        "VK_NUMPAD9": "NUM 9",
        "VK_ADD": "+",
        "VK_CAPITAL": "CAPS LK",
        "VK_A": "A",
        "VK_S": "S",
        "VK_D": "D",
        "VK_F": "F",
        "VK_G": "G",
        "VK_H": "H",
        "VK_J": "J",
        "VK_K": "K",
        "VK_L": "L",
        "VK_OEM_1": "É",
        "VK_OEM_7": "Á",
        "VK_OEM_5": "Ű",
        "VK_NUMPAD4": "NUM 4",
        "VK_NUMPAD5": "NUM 5",
        "VK_NUMPAD6": "NUM 6",
        "VK_LSHIFT": "LEFT SHIFT",
        "VK_OEM_102": "Í",
        "VK_Y": "Y",
        "VK_X": "X",
        "VK_C": "C",
        "VK_V": "V",
        "VK_B": "B",
        "VK_N": "N",
        "VK_M": "M",
        "VK_OEM_COMMA": ",",
        "VK_OEM_PERIOD": ".",
        "VK_OEM_MINUS": "-",
        "VK_RSHIFT": "RIGHT SHIFT",
        "VK_NUMPAD1": "NUM 1",
        "VK_NUMPAD2": "NUM 2",
        "VK_NUMPAD3": "NUM 3",
        "VK_UP": "UP",
        "VK_LCONTROL": "LEFT CTRL",
        "VK_LWIN": "WIN",
        "VK_LMENU": "LEFT ALT",
        "VK_SPACE": "SPACE",
        "VK_RMENU": "RIGHT ALT",
        "VK_RCONTROL": "RIGHT CTRL",
        "VK_LEFT": "LEFT",
        "VK_DOWN": "DOWN ",
        "VK_RIGHT": "RIGHT",
        "VK_NUMPAD0": "NUM 0",
        "VK_DECIMAL": ","
    }
}

function createKeyboard(keySet) {
    const keyboardContainer = document.getElementById("keyboard-container");

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
    createKeyboard(defaultKeySet);
    ipcRenderer.on('handle-keypress', (e, pressedKey) => {
        handleKeyPress(pressedKey.keyName, pressedKey.down == "DOWN" ? true : false)
      });
});