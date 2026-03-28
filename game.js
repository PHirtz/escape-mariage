let current = localStorage.getItem("level") ? parseInt(localStorage.getItem("level")) : 0;
let score   = localStorage.getItem("score")  ? parseInt(localStorage.getItem("score"))  : 0;
let transitioning = false;

const memoryEmojis = {
  1:"💍", 2:"💒", 3:"🥂", 4:"🎂",
  5:"💐", 6:"🎵", 7:"💌", 8:"🕊️"
};

const steps = [
  {type:"quiz", title:"Question 1",  description:"Quel est le Pokémon préféré de Clémence ?",              answer:"Poichigeon"},
  {type:"quiz", title:"Question 2",  description:"Quel est le Pokémon préféré d'Alex ?",                   answer:"Saquedeneu"},
  {type:"quiz", title:"Question 3",  description:"Quel est le surnom de Clémence dans les jeux ?",         answer:"Octopus"},
  {type:"quiz", title:"Question 4",  description:"Quel est le surnom d'Alex dans les jeux ?",              answer:"Swatt"},
  {type:"quiz", title:"Question 5",  description:"Donnez le prénom d'un chat.",                            answer:["Monsieur Saucisse","M. Saucisse","Puchon","Bubulle","Yum","YumYum"]},
  {type:"quiz", title:"Question 6",  description:"Quel est leur fast-food préféré ?",                      answer:"Mcdo"},
  {type:"quiz", title:"Question 7",  description:"Quelle série Alex regarde en boucle ?",                  answer:"Scrubs"},
  {type:"quiz", title:"Question 8",  description:"Qu'est-ce qu'Alex mange le matin ?",                     answer:["rien","","Aucun","pas"]},
  {type:"quiz", title:"Question 9",  description:"Donnez le nom du village de leur maison.",               answer:"Saint pardoux"},
  {type:"quiz", title:"Question 10", description:"Citez une des passions de Clémence.",                    answer:["Dessin","Lecture","Livre","Dessiner"]},
  {type:"quiz", title:"Question 11", description:"Où se sont-ils rencontrés ?",                            answer:"bus"},
  {type:"quiz", title:"Question 12", description:"Citez une de leurs peurs communes.",                     answer:["Araignee","Avion"]},
  {type:"quiz", title:"Question 13", description:"Quelle classe Alex a-t-il sautée ?",                     answer:"CM1"},
  {type:"quiz", title:"Question 14", description:"Quel sport faisait Clémence adolescente ?",              answer:["Foot","Football"]},
  {type:"quiz", title:"Question 15", description:"Combien de constructions Lego possèdent-ils ?",          answer:["11","onze"]},
  {type:"quiz", title:"Question 16", description:"Citez un toc qu'ils ont en commun.",                     answer:"porte"},
  {type:"quiz", title:"Question 17", description:"Quel livre a donné envie de lire à Clémence ?",          answer:"Les chevaliers d'emeraude"},
  {type:"quiz", title:"Question 18", description:"Depuis combien d'années sont-ils ensemble ?",            answer:["08/04/2014","11","12","onze","douze"]},
  {type:"memory", title:"Memory",    description:"Retrouvez toutes les paires",                            pairs:[1,1,2,2,3,3,4,4]},
  {type:"puzzle", title:"Puzzle",    description:"Reconstituez l'image !",                                 image:"images/mariage.jpg", size:2},

];

const QUIZ_TOTAL = steps.filter(s => s.type === "quiz").length;

// ------------------ Normalisation / Vérification -------------------
function normalize(str) {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

function matchOne(inp, ref) {
  if (ref.trim() === "") return inp === "";
  const refN = normalize(ref);
  if (!refN) return false;
  if (/^\d+$/.test(refN)) return inp === refN;
  return inp.includes(refN);
}

function isCorrect(input, answer) {
  const inp = normalize(input);
  const answers = Array.isArray(answer) ? answer : [answer];
  return answers.some(a => matchOne(inp, a));
}

// ------------------ Affichage -------------------
function updateScoreDisplay() {
  document.getElementById("scoreDisplay").innerText = "⭐ " + score + " / " + QUIZ_TOTAL;
  const pct = (current / steps.length) * 100;
  document.getElementById("progressBar").style.width = pct + "%";
}

// ------------------ Écran d'accueil -------------------
function startGame() {
  const name = document.getElementById("teamName").value.trim();
  if (!name) {
    document.getElementById("teamName").style.borderColor = "#ff4d6d";
    return;
  }
  localStorage.setItem("teamName", name);
  document.getElementById("welcome").style.display = "none";
  document.getElementById("main").style.display    = "block";
  document.getElementById("teamLabel").innerText   = "👥 " + name;
  loadStep();
}

// ------------------ Charger une étape -------------------
function loadStep() {
  transitioning = false;
  firstPiece = null;

  const step = steps[current];
  document.getElementById("title").innerText       = step.title;
  document.getElementById("description").innerText = step.description;
  document.getElementById("feedback").innerText    = "";
  document.getElementById("lock").classList.remove("locked");

  updateScoreDisplay();
  document.getElementById("gameContent").innerHTML = "";
  document.getElementById("validateBtn").style.display = "none";

  switch (step.type) {
    case "quiz":   createQuiz(step); break;
    case "memory": createMemory(step); break;
    case "puzzle": createPuzzle(step); break;
  }

  if (document.activeElement) document.activeElement.blur();
}

// ------------------ Quiz -------------------
function createQuiz(step) {
  const content = document.getElementById("gameContent");
  content.innerHTML = "";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Votre réponse...";
  input.classList.add("quiz-input"); // applique le style
  content.appendChild(input);

  const btn = document.createElement("button");
  btn.innerText = "✅ Valider";
  btn.onclick = () => submitQuiz(input.value, step);
  content.appendChild(btn);

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") submitQuiz(input.value, step);
  });

  setTimeout(() => input.focus(), 50);
}

function submitQuiz(value, step) {
  if (transitioning) return;
  transitioning = true;

  const feedback = document.getElementById("feedback");
  if (isCorrect(value, step.answer)) {
    score++;
    localStorage.setItem("score", score);
    feedback.style.color = "#4caf50";
    feedback.innerText = "✅ Bonne réponse !";
    setTimeout(nextStep, 800);
  } else {
    feedback.style.color = "#ff8099";
    feedback.innerText = `❌ Raté`;
    setTimeout(nextStep, 2000);
  }
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
      if (!first) first = cell;
      else {
        second = cell;
        if (first.dataset.val === second.dataset.val) {
          first.classList.add("matched");
          second.classList.add("matched");
          first = second = null;
          if (grid.querySelectorAll(".memory-cell:not(.matched)").length === 0)
            setTimeout(nextStep, 400);
        } else {
          busy = true;
          setTimeout(() => {
            first.innerText = "";
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

// ------------------ Puzzle -------------------
function createPuzzle(step) {
  const content = document.getElementById("gameContent");
  content.innerHTML = "";

  const containerWidth = Math.min(window.innerWidth * 0.85, 360);
  const size = step.size;
  const pieceSize = containerWidth / size;

  const container = document.createElement("div");
  container.classList.add("puzzle-container");
  container.style.width  = containerWidth + "px";
  container.style.height = containerWidth + "px";
  content.appendChild(container);

  Array.from({length: size * size}, (_, i) => i)
    .sort(() => Math.random() - 0.5)
    .forEach(idx => {
      const piece = document.createElement("div");
      piece.classList.add("puzzle-piece");
      piece.style.width = pieceSize + "px";
      piece.style.height = pieceSize + "px";
      piece.style.backgroundImage = `url(${step.image})`;
      piece.style.backgroundSize  = `${containerWidth}px ${containerWidth}px`;
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
    clicked.style.backgroundPosition    = firstPiece.style.backgroundPosition;
    clicked.dataset.idx                  = firstPiece.dataset.idx;
    firstPiece.style.backgroundPosition = tempBg;
    firstPiece.dataset.idx               = tempIdx;
    firstPiece.style.outline = "none";
    firstPiece = null;
    checkPuzzle();
  }
}

function checkPuzzle() {
  const pieces = document.querySelectorAll(".puzzle-piece");
  for (let i = 0; i < pieces.length; i++)
    if (parseInt(pieces[i].dataset.idx) !== i) return;
  setTimeout(nextStep, 300);
}

// ------------------ Étape suivante -------------------
function nextStep() {
  current++;
  localStorage.setItem("level", current);

  if (current >= steps.length) {
    localStorage.setItem("gameOver", "true"); // <-- AJOUTE CE FLAG
    const teamName = localStorage.getItem("teamName") || "vous";
    const pct      = Math.round((score / QUIZ_TOTAL) * 100);
    const mention  = pct === 100 ? "🏆 Score parfait !" : pct >= 70 ? "🥈 Bien joué !" : "🥉 Pas mal !";
    card.innerHTML = `
      <div style="text-align:center;padding:20px">
        <div style="font-size:64px;margin-bottom:10px">🎉</div>
        <h2 style="color:#ff4d6d">Félicitations !</h2>
        <p>Bravo à l'équipe <strong>${teamName}</strong> !</p>
        <div style="font-size:36px;margin:15px 0">${mention}</div>
        <div style="font-size:22px;color:#ff4d6d;font-weight:bold">
          ${score} bonnes réponses sur ${QUIZ_TOTAL}
        </div>
        <p style="color:#aaa;margin-top:8px">${pct}% de réussite</p>

      </div>`;
    card.classList.remove("hidden");
    return;
  }

  loadStep();
}

// ------------------ Reprise automatique -------------------
document.addEventListener("DOMContentLoaded", () => {
  const savedLevel = parseInt(localStorage.getItem("level"));
  const teamName   = localStorage.getItem("teamName");
  const gameOver   = localStorage.getItem("gameOver") === "true";

  if (teamName) {
    document.getElementById("welcome").style.display = "none";
    document.getElementById("main").style.display    = "block";
    document.getElementById("teamLabel").innerText   = "👥 " + teamName;

    if (gameOver) {
      current = steps.length; // forcer fin de jeu
      nextStep();             // affiche directement les scores
    } else if (!isNaN(savedLevel) && savedLevel >= 0) {
      current = savedLevel;
      loadStep();             // reprend là où on s'était arrêté
    } else {
      // cas sécurité : aucun level sauvegardé
      current = 0;
      loadStep();
    }
  }
});