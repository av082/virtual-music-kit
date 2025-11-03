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

  // piano keys list
  const ul = document.createElement('ul');
  ul.className = 'piano-keys';
  wrapper.appendChild(ul);

  // массив клавиш с их типами и символами
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

  keys.forEach(k => {
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
  const sequenceBtn = document.createElement("button");
  sequenceBtn.textContent = "Play";
  sequenceField.appendChild(sequenceLabel);
  sequenceField.appendChild(sequenceInput);
  sequenceField.appendChild(sequenceBtn);

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
audio = new Audio(`tunes/a.wav`);

// Клавиши по умолчанию
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
  q: "q.wav",
  w: "w.wav",
  e: "e.wav",
  t: "t.wav",
  y: "y.wav",
  u: "u.wav",
  o: "o.wav",
  p: "p.wav",
  m: "m.wav",
};

const playTune = (key) => {
  audio.src = `tunes/${noteMap[key]}`;
  audio.play();
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
const handleVolume = (e) => {
  audio.volume = e.target.value;
};
const showHideKeys = () => {
  pianoKeys.forEach((key) => key.classList.toggle("hide"));
  editBtn.forEach((btn) => btn.classList.toggle("hide"));
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
    startKeyEdit(btn);
  });
});

function startKeyEdit(editBtn) {
  const editField = document.querySelector(".edit-field input");
  const keyToEdit = editBtn.closest(".key");
  const oldKey = keyToEdit.dataset.key;
  
  editField.parentElement.classList.remove("hide");
  editField.value = oldKey.toUpperCase();
  editField.focus();
  editMode = true;

  const onKeyDown = (e) => {
    if (!editMode) return;

    // Разрешаем только A-Z / Backspace / Enter
    if (!/^[a-zA-Z]$/.test(e.key) && e.key !== "Backspace" && e.key !== "Enter") {
      e.preventDefault();
      return;
    }

    // Запрещаем вводить больше одного символа
    if (editField.value.length >= 1 && e.key.length === 1) {
      editField.value = e.key;
      return;
    }

    if (e.key === "Enter") applyKey();
  };

  const onInput = () => {
    if (!editMode) return;

    // Если больше одного символа, оставляем только первый. Например, если вставка.
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
      return;
    }

    noteMap[newKey] = noteMap[oldKey.toLowerCase()];
    delete noteMap[oldKey.toLowerCase()];

    keyToEdit.dataset.key = newKey;
    keyToEdit.querySelector("span").textContent = newKey.toUpperCase();

    cleanup();
  }

  function cleanup() {
    editMode = false;
    editField.parentElement.classList.add("hide");
    editField.removeEventListener("keydown", onKeyDown);
    editField.removeEventListener("input", onInput);
  }

  editField.addEventListener("keydown", onKeyDown);
  editField.addEventListener("input", onInput);
}


//=================================================
// SEQUENCE PLAY — воспроизведение последовательности
//=================================================

const seqFeild = document.querySelector("#seq");
const seqBtn = document.querySelector(".sequence button");
seqFeild.addEventListener("focus", () => {
  sequenceMode = true;
});
seqFeild.addEventListener("blur", () => {
  sequenceMode = false;
});
seqBtn.addEventListener("click", () => {
  simulatePianoKey(seqFeild);
});

async function simulatePianoKey(chars) {
  const charArr = chars.value.split("");
  for (const keyChar of charArr) {
    const keyCode = "Key" + keyChar.toUpperCase();

    // Событие нажатия
    const keyDownEvent = new KeyboardEvent("keydown", {
      code: keyCode,
      key: keyChar,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(keyDownEvent);

    // Ждём немного перед отпусканием
    await new Promise(resolve => setTimeout(resolve, 400));

    // Событие отпускания
    const keyUpEvent = new KeyboardEvent("keyup", {
      code: keyCode,
      key: keyChar,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(keyUpEvent);

    // Дополнительная пауза между нотами (можно убрать или изменить)
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}