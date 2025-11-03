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

  // Volume slider
  const volColumn = document.createElement('div');
  volColumn.className = 'column volume-slider';
  const volLabel = document.createElement('span');
  volLabel.textContent = 'Volume';
  const volInput = document.createElement('input');
  volInput.type = 'range';
  volInput.min = '0';
  volInput.max = '1';
  volInput.value = '0.5';
  volInput.step = 'any';
  volColumn.appendChild(volLabel);
  volColumn.appendChild(volInput);
  header.appendChild(volColumn);

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
    { type: 'white', key: ';', editImg: 'edit-black.png' },
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
}
// вызов функции для генерации интерфейса
createElement();

//=================================================
//LOGIC
//=================================================

const pianoKeys = document.querySelectorAll(".piano-keys .key"),
      editBtns = document.querySelectorAll(".piano-keys .edit-btn"),
      volumeSlider = document.querySelector(".volume-slider input"),
      keysCheckbox = document.querySelector(".keys-checkbox input"),
      whiteKeys = document.querySelectorAll(".key.white"),
      blackKeys = document.querySelectorAll(".key.black");

let activeKey = null;
let allKeys = [];
audio = new Audio(`tunes/a.wav`); // by default, audio src is "a" tune

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
};

const playTune = (key) => {
  audio.src = `tunes/${noteMap[key]}`;
  audio.play();
};

pianoKeys.forEach((key) => {
  key.addEventListener("mousedown", () => {
    playTune(key.dataset.key);
    key.classList.add("active");
  });
  ["mouseup", "mouseleave"].forEach((evt) => {
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
volumeSlider.addEventListener("input", handleVolume);
document.addEventListener("keydown", pressedKey);

//=================================================
// ✅ EDIT MODE — изменение назначенной клавиши (одно input поле)
//=================================================

const editField = document.querySelector(".edit-field");
let keyToEdit = null;

editBtns.forEach((btn) => {
  btn.addEventListener("mousedown", function(e) {
    e.stopPropagation();
    e.preventDefault();
  });

  btn.addEventListener("click", (e) => {
    keyToEdit = btn.closest(".key");
    input = editField.querySelector("input");
    editField.classList.remove("hide");
    input.value = keyToEdit.dataset.key.toUpperCase();
    input.focus();
  });
});