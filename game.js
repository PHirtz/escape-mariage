let current = localStorage.getItem("level") ? parseInt(localStorage.getItem("level")) : 0;
let score   = localStorage.getItem("score")  ? parseInt(localStorage.getItem("score"))  : 0;
let userAnswers = JSON.parse(localStorage.getItem("answers")) || [];
let transitioning = false;

const memoryEmojis = {
  1:"💍", 2:"💒", 3:"🥂", 4:"🎂",
  5:"💐", 6:"🎵", 7:"💌", 8:"🕊️"
};

const steps = [

  {type:"quiz", title:"Question 1",  description:"Quel est le Pokémon préféré de Clémence ?",aide:"",              answer:"Poichigeon"},
  {type:"puzzle", title:"Puzzle 1",    description:"Reconstituez l'image !",                                 image:"images/photo3.jpg", size:3},
  {type:"quiz", title:"Question 2",  description:"Quel est le Pokémon préféré d'Alex ?",aide:"",                   answer:"Saquedeneu"},
  {type:"quiz", title:"Question 3",  description:"Quel est le surnom de Clémence dans les jeux ?",aide:"",         answer:"Octopus"},
  {type:"quiz", title:"Question 4",  description:"Quel est le surnom d'Alex dans les jeux ?",aide:"",              answer:"Swatt"},
  {type:"puzzle", title:"Puzzle 2",    description:"Reconstituez l'image !",                                 image:"images/photo2.jpg", size:3},
  {type:"quiz", title:"Question 5",  description:"Donnez le prénom d'un chat.",aide:"",                            answer:["Monsieur Saucisse","M. Saucisse","Puchon","Bubulle","Yum","YumYum"]},
  {type:"quiz", title:"Question 6",  description:"Quel est leur fast-food préféré ?",aide:"Aux pieds d'un des invités",answer:["Mcdo","Mac","Macdo","Macdonald","Mac do","Mc do","Mac donald"]},
  {type:"memory", title:"Memory 1",    description:"Retrouvez toutes les paires",                            pairs:[1,1,2,2,3,3,4,4]},
  {type:"quiz", title:"Question 7",  description:"Quelle série Alex regarde en boucle ?",aide:"Soyez attentif au levé de coude de vos voisins",                  answer:["Scrubs","Scrub"]},
  {type:"quiz", title:"Question 8",  description:"Qu'est-ce qu'Alex mange le matin ?",aide:"Il faut sonder la génétrice",                     answer:["rien","","Aucun","pas"]},
  {type:"quiz", title:"Question 9",  description:"Donnez le nom du village de leur maison.",aide:"",               answer:["Saint pardoux","St pardoux","pardoux","pardou"]},
  {type:"puzzle", title:"Puzzle 3",    description:"Reconstituez l'image !",                                 image:"images/photo4.jpg", size:3},
  {type:"quiz", title:"Question 10", description:"Citez une des passions de Clémence.",aide:"",                    answer:["Dessin","Lecture","Livre","Dessiner","lire"]},
  {type:"quiz", title:"Question 11", description:"Où se sont-ils rencontrés ?",aide:"",                            answer:"bus"},
  {type:"memory", title:"Memory 2",    description:"Retrouvez toutes les paires",                            pairs:[5,5,6,6,7,7,8,8]},
  {type:"quiz", title:"Question 12", description:"Citez une de leurs peurs communes.",aide:"",                     answer:["Araignee","Araigne","Avion","Vol"]},
  {type:"quiz", title:"Question 13", description:"Quelle classe Alex a-t-il sautée ?",aide:"",                     answer:"CM1"},
  {type:"quiz", title:"Question 14", description:"Quel sport faisait Clémence adolescente ?",aide:"",              answer:["Foot","Football"]},
  {type:"puzzle", title:"Puzzle 4",    description:"Reconstituez l'image !",                                 image:"images/photo5.jpg", size:3},
  {type:"quiz", title:"Question 15", description:"Combien de constructions Lego possèdent-ils ?",aide:"",          answer:["11","onze"]},
  {type:"quiz", title:"Question 16", description:"Citez un toc qu'ils ont en commun.",aide:"",                     answer:"porte"},
  {type:"memory", title:"Memory 3",    description:"Retrouvez toutes les paires",                            pairs:[1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8]},
  {type:"quiz", title:"Question 17", description:"Quel livre a donné envie de lire à Clémence ?",aide:"Trouver sa génétrice",          answer:"Les chevaliers d'emeraude"},
  {type:"quiz", title:"Question 18", description:"Depuis combien d'années sont-ils ensemble ?",aide:"Un point bonus pour la date exacte",            answer:["08/04/2014","11","12","onze","douze"]},
  {type:"puzzle", title:"Puzzle 5",    description:"Reconstituez l'image !",                                 image:"images/photo1.jpg", size:3},
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

  // 🔹 Texte d'aide (si présent)
  if (step.aide) {
    const help = document.createElement("p");
    help.innerText = "💡 " + step.aide;
    help.classList.add("quiz-help");
    content.appendChild(help);
  }

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Votre réponse...";
  input.classList.add("quiz-input");
  content.appendChild(input);

  const btn = document.createElement("button");
  btn.innerText = "Valider";
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

  userAnswers[current] = value;
  localStorage.setItem("answers", JSON.stringify(userAnswers));

  const feedback = document.getElementById("feedback");
  if (isCorrect(value, step.answer)) {
    score++;
    localStorage.setItem("score", score);
    feedback.style.color = "#4caf50";
    feedback.innerText = "✅ Bonne réponse !";
    setTimeout(nextStep, 1000);
  } else {
    feedback.style.color = "#ff8099";
    feedback.innerText = `❌ Raté`;
    setTimeout(nextStep, 1000);
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
            setTimeout(nextStep, 2000);
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
  setTimeout(nextStep, 3000);
}

// ------------------ Étape suivante -------------------
function nextStep() {
  current++;
  localStorage.setItem("level", current);

  if (current >= steps.length) {
    localStorage.setItem("gameOver", "true");

    const teamName = localStorage.getItem("teamName") || "vous";
    const pct      = Math.round((score / QUIZ_TOTAL) * 100);
    const mention  = pct === 100 ? "🏆 Score parfait !" : pct >= 70 ? "🥈 Bien joué !" : "🥉 Pas mal !";

    // 🔹 Génération du récap
    let recapHTML = "<div style='text-align:left;margin-top:20px'>";

    steps.forEach((step, index) => {
      if (step.type === "quiz") {
        const userAnswer = userAnswers[index] || "";
        const correct = isCorrect(userAnswer, step.answer);

        const correctAnswers = Array.isArray(step.answer)
          ? step.answer.join(" / ")
          : step.answer;

        recapHTML += `
          <div style="
            margin-bottom:14px;
            padding:12px;
            border-radius:12px;
            background:${correct ? "#f0f9f4" : "#fff3f5"};
            border:1px solid ${correct ? "#bde5c8" : "#f5c2c7"};
          ">
            
            <div style="
              font-weight:600;
              font-size:15px;
              margin-bottom:6px;
              color:#1a1410;
            ">
              ${step.title}
            </div>

            <div style="
              font-size:14px;
              color:#6b5f57;
              margin-bottom:8px;
            ">
              ${step.description}
            </div>

            <div style="
              font-size:14px;
              margin-bottom:4px;
            ">
              <strong>Votre réponse :</strong>
              <span style="color:${correct ? "#3daa6a" : "#d64550"}">
                ${userAnswer || "<i>Aucune réponse</i>"}
              </span>
            </div>

            <div style="
              font-size:13px;
              color:#555;
            ">
              <strong>Bonne réponse :</strong> ${correctAnswers}
            </div>

          </div>
        `;
      }
    });

    recapHTML += "</div>";

    // 🔹 Affichage final
    card.innerHTML = `
      <div style="text-align:center;padding:20px">
        <div style="font-size:64px;margin-bottom:10px">🎉</div>
        <h2 style="color:#ff4d6d">Félicitations !</h2>
        <p>Bravo à l'équipe <strong>${teamName}</strong> !</p>

        <div style="font-size:36px;margin:15px 0">${mention}</div>

        <div style="font-size:22px;color:#ff4d6d;font-weight:bold">
          ${score} / ${QUIZ_TOTAL}
        </div>

        <p style="color:#aaa;margin-top:8px">${pct}% de réussite</p>

        ${recapHTML}
      </div>
    `;

    card.classList.remove("hidden");
    return;
  }

  loadStep();
}

const RESET_URL = "https://phirtz.github.io/escape-mariage/reset.json";

async function checkReset() {
  try {
    const res = await fetch(RESET_URL + "?t=" + Date.now());
    const data = await res.json();

    const localVersion = parseInt(localStorage.getItem("resetVersion") || 0);

    if (data.version > localVersion) {

      // 🔥 reset propre (sans supprimer resetVersion après)
      localStorage.clear();

      // remettre la version APRÈS clear
      localStorage.setItem("resetVersion", data.version);

      alert("🔄 Le jeu a été réinitialisé par l'organisateur");

      location.reload();
    }

  } catch (e) {
    console.log("Erreur check reset");
  }
}

// ------------------ Reprise automatique -------------------
document.addEventListener("DOMContentLoaded", () => {
  const savedLevel = parseInt(localStorage.getItem("level"));
  const teamName   = localStorage.getItem("teamName");
  const gameOver   = localStorage.getItem("gameOver") === "true";

  setInterval(checkReset, 5000); // toutes les 5 sec
  checkReset();

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