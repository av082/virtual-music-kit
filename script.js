// Here we create all body
function createElement() {
  const body = document.body;
  body.innerHTML = '';

  // wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';
  body.appendChild(wrapper);

  // header
  const header = document.createElement('header');
  wrapper.appendChild(header);

  // Edit field
  const editColumn = document.createElement('div');
  editColumn.className = 'column edit-field hide';
  const editLabel = document.createElement('span');
  editLabel.textContent = 'Key:';
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editColumn.appendChild(editLabel);
  editColumn.appendChild(editInput);
  header.appendChild(editColumn);

  // Hide keys checkbox
  const hideColumn = document.createElement('div');
  hideColumn.className = 'column keys-checkbox';
  const hideLabel = document.createElement('span');
  hideLabel.textContent = 'Hide keys';
  const hideInput = document.createElement('input');
  hideInput.type = 'checkbox';
  hideColumn.appendChild(hideLabel);
  hideColumn.appendChild(hideInput);
  header.appendChild(hideColumn);

  const ul = document.createElement('ul');
  ul.className = 'piano-keys';
  wrapper.appendChild(ul);

  const keys = [
    { type: 'white', key: 'a', editImg: 'edit-black.png' },
    { type: 'black', key: 'w', editImg: 'edit-white.png' },
    { type: 'white', key: 's', editImg: 'edit-black.png' },
    { type: 'black', key: 'e', editImg: 'edit-white.png' },
    { type: 'white', key: 'd', editImg: 'edit-black.png' },
    { type: 'white', key: 'f', editImg: 'edit-black.png' },
    { type: 'black', key: 't', editImg: 'edit-white.png' },
    { type: 'white', key: 'g', editImg: 'edit-black.png' },
    { type: 'black', key: 'y', editImg: 'edit-white.png' },
    { type: 'white', key: 'h', editImg: 'edit-black.png' },
    { type: 'black', key: 'u', editImg: 'edit-white.png' },
    { type: 'white', key: 'j', editImg: 'edit-black.png' },
    { type: 'white', key: 'k', editImg: 'edit-black.png' },
    { type: 'black', key: 'o', editImg: 'edit-white.png' },
    { type: 'white', key: 'l', editImg: 'edit-black.png' },
    { type: 'black', key: 'p', editImg: 'edit-white.png' },
    { type: 'white', key: 'm', editImg: 'edit-black.png' },
  ];

  keys.forEach((k, index) => {
    if (index === 5 || index === 12) {
      const br = document.createElement('li');
      br.className = 'break';
      ul.appendChild(br);
    }

    const li = document.createElement('li');
    li.className = `key ${k.type}`;
    li.dataset.key = k.key;

    const img = document.createElement('img');
    img.className = 'edit-btn';
    img.src = k.editImg;
    img.alt = 'edit key';

    const span = document.createElement('span');
    span.textContent = k.key;

    li.appendChild(img);
    li.appendChild(span);
    ul.appendChild(li);
  });

 
  // Поле для ввода последовательности
  const sequenceField = document.createElement("div");
  sequenceField.className = "sequence";
  const sequenceLabel = document.createElement("label");
  sequenceLabel.setAttribute("for", "seq");
  sequenceLabel.textContent = "Play sequence:";
  const sequenceInput = document.createElement("input");
  sequenceInput.type = "text";
  sequenceInput.id = "seq";
  sequenceInput.maxLength = 34;
  const sequenceBtn = document.createElement("button");
  sequenceBtn.id = "play";
  sequenceBtn.textContent = "Play";
  const resetBtn = document.createElement("button");
  resetBtn.id = "clear"
  resetBtn.textContent = "Clear";
  sequenceField.appendChild(sequenceLabel);
  sequenceField.appendChild(sequenceInput);
  sequenceField.appendChild(sequenceBtn);
  sequenceField.appendChild(resetBtn);

  wrapper.appendChild(sequenceField);
}
// вызов функции для генерации интерфейса
createElement();

//=================================================
//LOGIC
//=================================================

const pianoKeys = document.querySelectorAll(".piano-keys .key"),
      editBtns = document.querySelectorAll(".piano-keys .edit-btn"),
      keysCheckbox = document.querySelector(".keys-checkbox input"),
      whiteKeys = document.querySelectorAll(".key.white"),
      blackKeys = document.querySelectorAll(".key.black");

let activeKey = null;
let allKeys = [];
let editMode = null;
let sequenceMode = null;
let currentOnKeyDown = null;
let currentOnInput = null;

// audio = new Audio(`tunes/a.wav`);
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let noteBuffers = {};

let noteMap = {
  a: "a.wav",
  s: "s.wav",
  d: "d.wav",
  f: "f.wav",
  g: "g.wav",
  h: "h.wav",
  j: "j.wav",
  k: "k.wav",
  l: "l.wav",
  w: "w.wav",
  e: "e.wav",
  t: "t.wav",
  y: "y.wav",
  u: "u.wav",
  o: "o.wav",
  p: "p.wav",
  m: "m.wav",
};

async function preloadNotes() {
  for (const key in noteMap) {
    const response = await fetch(`tunes/${noteMap[key]}`);
    const arrayBuffer = await response.arrayBuffer();
    noteBuffers[key] = await audioCtx.decodeAudioData(arrayBuffer);
  }
}
preloadNotes();

const playTune = (key) => {
  if (!noteBuffers[key]) return;

  const source = audioCtx.createBufferSource();
  source.buffer = noteBuffers[key];
  source.connect(audioCtx.destination);
  source.start();
  // audio.src = `tunes/${noteMap[key]}`;
  // audio.play();
};

pianoKeys.forEach((key) => {
  key.addEventListener("mousedown", () => {
    if (editMode) return;
    playTune(key.dataset.key);
    key.classList.add("active");
  });
  ["mouseup", "mouseleave"].forEach((evt) => {
    if (editMode) return;
    key.addEventListener(evt, () => key.classList.remove("active"));
  });
});

const showHideKeys = () => {
  pianoKeys.forEach((key) => key.classList.toggle("hide"));
  editBtns.forEach((btn) => btn.classList.toggle("hide"));
};

const pressedKey = (e) => {
  if (editMode || sequenceMode) return;

  let key = e.code.replace("Key", "").toLowerCase();
  if (!(key in noteMap)) return;
  
  if (activeKey !== null) return;
  activeKey = key;

  const keyEl = document.querySelector(`.piano-keys .key[data-key="${key}"]`);
  if (!keyEl) return;

  keyEl.classList.add("active");
  playTune(key);
  
  const removeActive = (evt) => {
    let releasedKey = evt.code.replace("Key", "").toLowerCase();
    if (releasedKey !== activeKey) return;

    keyEl.classList.remove("active");
    activeKey = null;
    document.removeEventListener("keyup", removeActive);
  };
  document.addEventListener("keyup", removeActive);
};

keysCheckbox.addEventListener("click", showHideKeys);
document.addEventListener("keydown", pressedKey);

//=================================================
// EDIT MODE — изменение назначенной клавиши (одно input поле)
//=================================================
editBtns.forEach((btn) => {
  btn.addEventListener("mousedown", function(e) {
    e.stopPropagation();
    e.preventDefault();
  });

  btn.addEventListener("click", (e) => {
    startKeyEdit(e.target);
  });
});

function startKeyEdit(editBtn) {
  const editField = document.querySelector(".edit-field input");
  const keyToEdit = editBtn.closest(".key");
  const oldKey = keyToEdit.dataset.key.toLowerCase();
  
  editField.parentElement.classList.remove("hide");
  editField.value = oldKey.toUpperCase();
  editField.focus();
  editMode = true;
  toggleElements(true);

  if (currentOnKeyDown) {
    document.removeEventListener("keydown", currentOnKeyDown);
    editField.removeEventListener("input", currentOnInput);
  }

  const onKeyDown = (e) => {
    if (!editMode) return;

    if (!/^[a-zA-Z]$/.test(e.key) && e.key !== "Backspace" && e.key !== "Enter") {
      e.preventDefault();
      return;
    }

    if (editField.value.length >= 1 && e.key.length === 1) {
      editField.value = e.key;
      return;
    }

    if (e.key === "Enter") applyKey();
  };

  const onInput = () => {
    if (!editMode) return;

    if (editField.value.length > 1) {
      editField.value = editField.value.slice(0, 1).toUpperCase();
    }
  };

  function applyKey() {
    const newKey = editField.value.toLowerCase();

    if (newKey === oldKey) { 
      cleanup();
      return;
    }

    if (!/^[a-z]$/.test(newKey) || noteMap[newKey]) {
      editField.value = "";
      showErr();
      return;
    }

    noteMap[newKey] = noteMap[oldKey];
    noteBuffers[newKey] = noteBuffers[oldKey];
    
    delete noteMap[oldKey];
    delete noteBuffers[oldKey];

    keyToEdit.dataset.key = newKey;
    keyToEdit.querySelector("span").textContent = newKey.toUpperCase();

    cleanup();
  }

  function cleanup() {
    editMode = false;
    editField.parentElement.classList.add("hide");
    document.removeEventListener("keydown", onKeyDown);
    editField.removeEventListener("input", onInput);
    toggleElements(false);
    currentOnKeyDown = null;
    currentOnInput = null;
  }

  function showErr() {
    editField.classList.add('input-error');
    setTimeout(() => editField.classList.remove('input-error'), 1200);
  }

  document.addEventListener("keydown", onKeyDown);
  editField.addEventListener("input", onInput);

  currentOnKeyDown = onKeyDown;
  currentOnInput = onInput;
}

function toggleElements(disable=true) {
  document.querySelectorAll(".sequence input, .sequence button")
    .forEach(el => el.disabled = disable);

  keysCheckbox.disabled = disable;
}
//=================================================
// SEQUENCE PLAY — воспроизведение последовательности
//=================================================
const seqFeild = document.querySelector("#seq");
const playBtn = document.querySelector("#play");
const resetBtn = document.querySelector("#clear");
seqFeild.addEventListener("focus", () => {
  sequenceMode = true;
});
seqFeild.addEventListener("blur", () => {
  sequenceMode = false;
});
playBtn.addEventListener("click", () => {
  playWithUserBlocked(() => simulatePianoKey(seqFeild));
});
seqFeild.addEventListener("change", cleanSeqField);

resetBtn.addEventListener("click", () => {
  seqFeild.value = "";
})

async function simulatePianoKey(chars) {
  const charArr = chars.value.split("");

  for (const keyChar of charArr) {
    const keyCode = "Key" + keyChar.toUpperCase();

    const keyDownEvent = new KeyboardEvent("keydown", {
      code: keyCode,
      key: keyChar,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(keyDownEvent);

    await new Promise(resolve => setTimeout(resolve, 400));

    const keyUpEvent = new KeyboardEvent("keyup", {
      code: keyCode,
      key: keyChar,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(keyUpEvent);

    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

function cleanSeqField() {
  const seqField = document.querySelector("#seq");
  let value = seqField.value.toLowerCase();
  value = value.replace(/[^a-z]/g, "");
  const noteMapKeys = Object.keys(noteMap);
  
  let cleaned = "";
  for (let char of value) {
    if (noteMapKeys.includes(char)) {
      cleaned += char;
    }
  }

  if (cleaned.length > noteMapKeys.length * 2) {
    cleaned = cleaned.slice(0, noteMapKeys.length * 2);
  }

  seqField.value = cleaned;
}

async function playWithUserBlocked(func) {

  const blockHandler = (e) => {
    if (!e.isTrusted) return;

    e.preventDefault();
    e.stopImmediatePropagation();
  };

  const events = ["keydown", "keypress", "keyup", "mousedown", "mouseup", "click", "dblclick", "contextmenu", "wheel", "touchstart", "touchend"];
  events.forEach(event => document.addEventListener(event, blockHandler, { capture: true, passive: false }));

  toggleElements(true);

  try {
    await func();
  } finally {
    toggleElements(false);
    events.forEach(event => document.removeEventListener(event, blockHandler, { capture: true, passive: false }));
  }
}

seqFeild.addEventListener("keypress", (event) => {
  let key = event.key;

  if (!/[a-zA-Z]/.test(key)) {
    event.preventDefault();
    return;
  }

  if (!isAllowed(key)) {
    event.preventDefault();
  }

  function isAllowed(letter) {
    letter = letter.toLowerCase();
    
    if (noteMap[letter]) {
      return true;
    } else {
      return false;
    }
  }
});