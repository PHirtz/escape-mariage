let current = localStorage.getItem("level") ? parseInt(localStorage.getItem("level")) : 0;
let attempts = 0;

// Emojis mariage pour le memory
const memoryEmojis = {
  1:"💍", 2:"💒", 3:"🥂", 4:"🎂",
  5:"💐", 6:"🎵", 7:"💌", 8:"🕊️"
};

const steps = [
  {type:"code",   title:"Intro",        description:"Trouvez un code",                          code:"INTRO"},
  {type:"quiz",   title:"Quiz Mariée",  description:"Quel est le prénom de la mariée ?",         question:"Prénom de la mariée ?",         options:["Clémence","Alex","Léa"],       answer:"CLÉMENCE"},
  {type:"code",   title:"Indi",     description:"Code à 5 lettres",                         code:"INDI"},
  {type:"memory", title:"Memory",       description:"Retrouvez toutes les paires",               pairs:[1,1,2,2,3,3,4,4]},
  {type:"puzzle", title:"Puzzle Image", description:"Reconstituez l'image !",                    image:"images/mariage.jpg", size:4},
  {type:"code",   title:"verre",      description:"Code secret",                               code:"VERRE"},
  {type:"quiz",   title:"Quiz Lieu",    description:"Quel est le lieu du premier rendez-vous ?", question:"Lieu du 1er RDV ?",             options:["Paris","Lyon","Marseille"],    answer:"PARIS"},
  {type:"memory", title:"Memory 2",       description:"Retrouvez toutes les paires",               pairs:[1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8]},
  {type:"code",   title:"Final",        description:"Dernier code",                              code:"FINAL"},
  {type:"code",   title:"bravo",     description:"Retournez voir les mariés",                 code:"BRAVO"}
];

// ------------------ Load Step -------------------
function loadStep() {
  firstPiece = null; // Réinitialiser la pièce puzzle sélectionnée

  const step = steps[current];
  document.getElementById("title").innerText       = step.title;
  document.getElementById("description").innerText = step.description;
  document.getElementById("feedback").innerText    = "";
  document.getElementById("lock").classList.remove("unlocked");
  attempts = 0;

  // Barre de progression
  const pct = (current / steps.length) * 100;
  document.getElementById("progressBar").style.width = pct + "%";
  document.getElementById("progressText").innerText  = (current + 1) + " / " + steps.length;

  const content = document.getElementById("gameContent");
  content.innerHTML = "";

  // Bouton "Déverrouiller" uniquement pour les codes
  document.getElementById("validateBtn").style.display = step.type === "code" ? "block" : "none";

  switch (step.type) {
    case "code":   createInputs(step.code.length); break;
    case "quiz":   createQuiz(step);   break;
    case "memory": createMemory(step); break;
    case "puzzle": createPuzzle(step); break;
  }

  if (step.type === "code") {
    setTimeout(() => document.querySelector(".digit")?.focus(), 50);
  } else {
    // Retire le focus de tout élément actif pour cacher le clavier virtuel
    if (document.activeElement) document.activeElement.blur();
  }
}

// ------------------ Inputs Code -------------------
function createInputs(length) {
  const content = document.getElementById("gameContent");
  content.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.id = "codeLock";
  for (let i = 0; i < length; i++) {
    const input = document.createElement("input");
    input.classList.add("digit");
    input.maxLength = 1;
    wrap.appendChild(input);
  }
  content.appendChild(wrap);
}

// ------------------ Validate Code -------------------
function validate() {
  const step = steps[current];
  if (step.type !== "code") return;

  const inputs = document.querySelectorAll(".digit");
  let input = "";
  inputs.forEach(i => input += i.value);
  input = input.toUpperCase().trim();

  const card = document.getElementById("card");
  card.classList.remove("error", "success");

  if ("RESET".startsWith(input) && input.length > 0) { resetGame(); return; }

  attempts++;
  if (input === step.code) {
    card.classList.add("success");
    document.getElementById("lock").classList.add("unlocked");
    setTimeout(nextStep, 500);
  } else {
    card.classList.add("error");
    document.getElementById("feedback").innerText = `❌ Incorrect — tentative${attempts > 1 ? "s" : ""} : ${attempts}`;
  }
}

// ------------------ Quiz -------------------
function createQuiz(step) {
  const content = document.getElementById("gameContent");
  content.innerHTML = "";
  step.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => {
      if (opt.toUpperCase() === step.answer.toUpperCase()) {
        nextStep();
      } else {
        document.getElementById("feedback").innerText = "❌ Mauvaise réponse";
        btn.style.background = "#5a1a2a";
        setTimeout(() => btn.style.background = "", 600);
      }
    };
    content.appendChild(btn);
  });
}

// ------------------ Memory -------------------
function createMemory(step) {
  const content = document.getElementById("gameContent");
  content.innerHTML = "";

  const cards = step.pairs.slice().sort(() => Math.random() - 0.5);
  let first = null, second = null, busy = false;

  const grid = document.createElement("div");
  grid.classList.add("memory-grid");

  cards.forEach(val => {
    const cell = document.createElement("div");
    cell.classList.add("memory-cell");
    cell.dataset.val = val;

    cell.onclick = () => {
      if (busy || cell.classList.contains("matched") || cell === first) return;
      cell.innerText = memoryEmojis[val] || val;
      cell.classList.add("flipped");

      if (!first) {
        first = cell;
      } else {
        second = cell;
        if (first.dataset.val === second.dataset.val) {
          first.classList.add("matched");
          second.classList.add("matched");
          first = second = null;
          if (grid.querySelectorAll(".memory-cell:not(.matched)").length === 0) {
            setTimeout(nextStep, 400);
          }
        } else {
          busy = true;
          setTimeout(() => {
            first.innerText  = "";
            second.innerText = "";
            first.classList.remove("flipped");
            second.classList.remove("flipped");
            first = second = null;
            busy = false;
          }, 700);
        }
      }
    };

    grid.appendChild(cell);
  });

  content.appendChild(grid);
}

// ------------------ Puzzle Image -------------------
function createPuzzle(step) {
  const content = document.getElementById("gameContent");
  content.innerHTML = "";

  const containerWidth = Math.min(window.innerWidth * 0.85, 360);
  const size      = step.size;
  const pieceSize = containerWidth / size;

  const container = document.createElement("div");
  container.classList.add("puzzle-container");
  container.style.width  = containerWidth + "px";
  container.style.height = containerWidth + "px";
  content.appendChild(container);

  const indices = Array.from({length: size * size}, (_, i) => i).sort(() => Math.random() - 0.5);

  indices.forEach(idx => {
    const piece = document.createElement("div");
    piece.classList.add("puzzle-piece");
    piece.style.width              = pieceSize + "px";
    piece.style.height             = pieceSize + "px";
    piece.style.backgroundImage    = `url(${step.image})`;
    piece.style.backgroundSize     = `${containerWidth}px ${containerWidth}px`;
    piece.style.backgroundPosition = `-${(idx % size) * pieceSize}px -${Math.floor(idx / size) * pieceSize}px`;
    piece.dataset.idx = idx;
    piece.addEventListener("click", handlePieceClick);
    container.appendChild(piece);
  });
}

let firstPiece = null;

function handlePieceClick(e) {
  const clicked = e.currentTarget;
  if (!firstPiece) {
    firstPiece = clicked;
    clicked.style.outline = "3px solid #ff4d6d";
  } else {
    const tempBg  = clicked.style.backgroundPosition;
    const tempIdx = clicked.dataset.idx;

    clicked.style.backgroundPosition  = firstPiece.style.backgroundPosition;
    clicked.dataset.idx                = firstPiece.dataset.idx;

    firstPiece.style.backgroundPosition = tempBg;
    firstPiece.dataset.idx               = tempIdx;

    firstPiece.style.outline = "none";
    firstPiece = null;

    checkPuzzle();
  }
}

function checkPuzzle() {
  const pieces = document.querySelectorAll(".puzzle-piece");
  for (let i = 0; i < pieces.length; i++) {
    if (parseInt(pieces[i].dataset.idx) !== i) return;
  }
  setTimeout(nextStep, 300);
}

// ------------------ Next Step -------------------
function nextStep() {
  const card = document.getElementById("card");
  card.classList.add("hidden");

  setTimeout(() => {
    current++;
    localStorage.setItem("level", current);

    if (current >= steps.length) {
      card.innerHTML = `
        <div style="text-align:center;padding:20px">
          <div style="font-size:64px;margin-bottom:10px">🎉</div>
          <h2 style="color:#ff4d6d">Félicitations !</h2>
          <p>Vous avez résolu toutes les énigmes.<br>Allez retrouver les mariés !</p>
          <button onclick="resetGame()" style="margin-top:20px;background:#444">🔄 Rejouer</button>
        </div>`;
      card.classList.remove("hidden");
      return;
    }

    loadStep();
    card.classList.remove("hidden");
  }, 300);
}

// ------------------ Reset -------------------
function resetGame() {
  localStorage.removeItem("level");
  current    = 0;
  firstPiece = null;

  // Restaurer la carte si elle a été remplacée par l'écran victoire
  const card = document.getElementById("card");
  if (!document.getElementById("title")) {
    card.innerHTML = `
      <div id="lock" class="locked">🔒</div>
      <h2 id="title"></h2>
      <p id="description"></p>
      <div id="gameContent"></div>
      <button onclick="validate()" id="validateBtn">🔓 Déverrouiller</button>
      <button onclick="resetGame()" style="margin-top:10px;background:#444">🔄 Reset</button>
      <p id="feedback"></p>`;
  }

  loadStep();
}

// ------------------ UX Clavier -------------------
document.addEventListener("input", function(e) {
  if (e.target.classList.contains("digit")) {
    e.target.value = e.target.value.slice(-1).toUpperCase();
    if (e.target.value) {
      const next = e.target.nextElementSibling;
      if (next) next.focus();
    }
  }
});

document.addEventListener("focusin", function(e) {
  if (e.target.classList.contains("digit")) setTimeout(() => e.target.select(), 0);
});

document.addEventListener("keydown", function(e) {
  if (e.target.classList.contains("digit")) {
    if (e.key === "Backspace" && !e.target.value) {
      const prev = e.target.previousElementSibling;
      if (prev) prev.focus();
    }
    if (e.key === "Enter") validate();
  }
});

// ------------------ Start -------------------
loadStep();
