const { ipcRenderer } = require('electron');
const { dialog, BrowserWindow } = require('electron');
const WaveSurfer = require('wavesurfer.js')
const RegionsPlugin = require('wavesurfer.js/plugins/regions')

let context;
let ws;
let audio = new Audio();

window.addEventListener("DOMContentLoaded", () => {
  const $ = require('jquery');
  window.$ = window.jQuery = $;
  deviceInitialization()
  ipcRenderer.on('initialize-context', (e, settings) => {
    context = settings;
    initSystem();
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
function initSystem() {
  createKeyboard(context.keyboards[context.default_keyboard]);
  soundMapInitialization(context.keymaps);
  layoutListInitialization(context.keyboards);
  context.selected_keymap = context.default_keymap;
  $('#soundmaps').on('change', function(){
    context.selected_keymap = $(this).val();
    $('.key.selected').removeClass('selected');
    resetPlayer()
  })
  $('#save-soundmap').on('click', function(){
      ipcRenderer.send('keymap-refresh', context.keymaps);
  });
  $('#add-soundmap').on('click', function() {
    $(this).hide();
    $('#new-soundmap-name').show();
    $('#create-soundmap').show();
  });
  $('#create-soundmap').on('click', createSoundMap);
}
function createSoundMap() {
  
  let soundMapName = $('#new-soundmap-name').val();
  if (!context.keymaps[soundMapName]) {
    context.keymaps[soundMapName] = {};
    soundMapInitialization(context.keymaps);
    $('#save-soundmap').trigger('click');
    $('#new-soundmap-name').toggleClass('error', false);
    $('#new-soundmap-name').val('');
    $('#new-soundmap-name').text('');
    //Reset tools to original state
    $('#new-soundmap-name').hide();
    $('#create-soundmap').hide();
    $('#add-soundmap').show();
    $('#new-soundmap-name').attr('placeholder', 'Soundmap name');
  }
  else {
    $('#new-soundmap-name').val('');
    $('#new-soundmap-name').text('');
    $('#new-soundmap-name').attr('placeholder', 'Already exists...');
    $('#new-soundmap-name').toggleClass('error', true);
  }
}
async function deviceInitialization() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  let outputDevices = devices.filter(function (device) {
    return device.kind == 'audiooutput'
  });
  for (let device of outputDevices) {
    const option = $('<option>')
    option.text(device.label)
    option.attr('value', device.deviceId)
    $('#devices').append(option)
  }
  const audio = document.createElement("audio");
  $('#devices').on("change", async (e) => {
    const deviceId = $('#devices').find(":selected").val();
    context.output = deviceId;
    ws.setSinkId(deviceId);
  })
}
function soundMapInitialization(soundMaps) {
  $('#soundmaps').html('');
  for (const map of Object.keys(soundMaps)) {
    const option = $('<option>');
    $(option).text(map);
    $(option).val(`${map}`);
    $('#soundmaps').append(option)
  }
}

function layoutListInitialization(layouts) {
  $('#layouts').html('');
  for (const layout of Object.keys(layouts)) {
    const option = $('<option>');
    $(option).text(layout);
    $(option).val(`${layout}`);
    $('#layouts').append(option)
  }
}

function createKeyboard(keySet) {
  const keyboardContainer = $("#keyboard-container");
  for (const [stage, rows] of Object.entries(keySet.keys)) {
    const stageContainer = $(`<div>`);
    $(stageContainer).attr('id', stage + '-subcontainer');
    for (const row of rows) {
      const newLine = $('<br>');
      for (const [keyRaw, keyLabel] of Object.entries(row)) {
        const keyElement = $("<div>");
        $(keyElement).attr('id', keyRaw);
        $(keyElement).addClass('key key-' + stage);
        $(keyElement).text(keyLabel);
        $(keyElement).on('click', function(e) {
          selectKey(e);
        })
        $(stageContainer).append(keyElement);
        
      }
      $(stageContainer).append($(newLine));
    }
    $(keyboardContainer).append(stageContainer);
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
    if (isKeyDown && context.keymaps[context.selected_keymap][keyName] !== undefined) {
      if ($(`#${keyName}`).hasClass("selected")) {
        if (!ws.isPlaying()){
          ws.plugins[0].regions[0].play()
        }
        else ws.pause();
      } 
      else if(audio.paused) audioPlayer(keyName);
      else audio.pause();

    }
  }
}

async function audioPlayer(id) {
  const data = context.keymaps[context.selected_keymap][id];
  audio = new Audio(`${data.path}#t=${data.T_start},${data.T_end - 0.05}`);
  await audio.setSinkId(context.output)
  audio.play();
}

function resetPlayer() {
  $("#keymap-selection").attr("key", "none")
  $("#keymap-selection").toggleClass("key-selected", false);
  $("#description").html("No selected key.")
  if (ws !== undefined) {
    ws.destroy();
  }
}

function selectKey(e) {
  let id = e.target.id
  //Client clicks on an already selected key.
  if ($(`#${id}`).hasClass("selected")) {
    $(`#${id}`).removeClass("selected");
    resetPlayer();
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
  if (context.keymaps[context.selected_keymap][id] !== undefined) {
    $('#player').html('');
    updatePlayer(context.keymaps[context.selected_keymap][id].path, id)
  }
  else if (ws !== undefined) {
    ws.destroy();
  }
}

function handleAddSound(details) {
  const id = details.keyID
  const audioFilePath = details.filePath
  context.keymaps[context.selected_keymap][id] = {
    path: audioFilePath,
    T_start: 0,
    T_end: 0,
    fileExtension: audioFilePath.split(".").pop()
  }
  updatePlayer(audioFilePath, id)
  ipcRenderer.send('keymap-refresh', context.keymaps)

}

function updatePlayer(path, id) {
  ws = WaveSurfer.create({
    container: '#player',
    waveColor: '#4F4A85',
    progressColor: '#383351',
    url: path
  })
  ws.setSinkId(context.output);
  const wsRegions = ws.registerPlugin(RegionsPlugin.create())

  ws.on('decode', () => {
    if (context.keymaps[context.selected_keymap][id].T_end == 0) {
      context.keymaps[context.selected_keymap][id].T_end = ws.getDuration();
    }
    if (context.keymaps[context.selected_keymap][id].T_start < 0.001) {
      context.keymaps[context.selected_keymap][id].T_start = 0;
    }
    wsRegions.addRegion({
      start: context.keymaps[context.selected_keymap][id].T_start,
      end: context.keymaps[context.selected_keymap][id].T_end,
      content: 'Region to play',
      color: "rgba(135,206,235,0.5)",
      drag: true,
      resize: true,
      minLength: 0.1,
      id: 'selected-region'
    })
  })
  // ws.on('interaction', () => {
  //   ws.playPause()
  // })
  wsRegions.on("region-updated", (region) => {
    context.keymaps[context.selected_keymap][id].T_start = region.start;
    context.keymaps[context.selected_keymap][id].T_end = region.end;
  })
  wsRegions.on('region-out', (e) => {
    ws.stop()
  })
}