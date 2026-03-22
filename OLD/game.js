let current = localStorage.getItem("level") ? parseInt(localStorage.getItem("level")) : 0;
let attempts = 0;

const steps = [
  {type:"code", title:"Intro", description:"Trouvez un code", code:"CLE"},
  {type:"quiz", title:"Quiz Mariée", description:"Quel est le prénom de la mariée ?", question:"Prénom de la mariée ?", options:["Clémence","Alex","Léa"], answer:"CLÉMENCE"},
  {type:"code", title:"Indice 2", description:"Code à 5 lettres", code:"BONHE"},
  {type:"memory", title:"Memory", description:"Retrouvez toutes les paires", pairs:[1,1,2,2,3,3,4,4]},
  {type:"puzzle", title:"Puzzle Image", description:"Reconstituez l'image !", image:"images/mariage.jpg", size:3},
  {type:"code", title:"Objet 1", description:"Code secret", code:"VERRE"},
  {type:"quiz", title:"Quiz Lieu", description:"Quel est le lieu du premier rendez-vous ?", question:"Lieu du 1er RDV ?", options:["Paris","Lyon","Marseille"], answer:"PARIS"},
  {type:"memory", title:"Memory 2", description:"Retrouvez toutes les paires", pairs:[5,5,6,6,7,7,8,8]},
  {type:"code", title:"Final", description:"Dernier code", code:"GAGNE"},
  {type:"code", title:"Victoire", description:"Retournez voir les mariés", code:"BRAVO"}
];

// ------------------ Load Step -------------------
function loadStep(){
  let step = steps[current];
  document.getElementById("title").innerText = step.title;
  document.getElementById("description").innerText = step.description;
  document.getElementById("progress").innerText = (current+1)+" / "+steps.length;
  document.getElementById("feedback").innerText="";
  document.getElementById("lock").classList.remove("unlocked");
  attempts=0;
  document.getElementById("validateBtn").style.display="block";
  const content=document.getElementById("gameContent");
  content.innerHTML="";

  switch(step.type){
    case "code": createInputs(step.code.length); break;
    case "quiz": createQuiz(step); break;
    case "memory": createMemory(step); break;
    case "puzzle": createPuzzle(step); break;
  }
  setTimeout(()=>document.querySelector(".digit")?.focus(),50);
}

// ------------------ Inputs Code -------------------
function createInputs(length){
  const content=document.getElementById("gameContent");
  content.innerHTML="";
  for(let i=0;i<length;i++){
    let input=document.createElement("input");
    input.classList.add("digit");
    input.maxLength=1;
    content.appendChild(input);
  }
}

// ------------------ Validate Code -------------------
function validate(){
  let step = steps[current];
  if(step.type!=="code") return;
  let inputs=document.querySelectorAll(".digit");
  let input="";
  inputs.forEach(i=>input+=i.value);
  input=input.toUpperCase().trim();
  let card=document.getElementById("card");
  card.classList.remove("error","success");

  if("RESET".startsWith(input) && input.length>0){ resetGame(); return; }

  attempts++;
  if(input===step.code){
    card.classList.add("success")
    document.getElementById("lock").classList.add("unlocked")
    setTimeout(nextStep,500)
  }else{
    card.classList.add("error")
    document.getElementById("feedback").innerText=`❌ Incorrect - tentatives: ${attempts}`;
  }
}

// ------------------ Quiz -------------------
function createQuiz(step){
  const content=document.getElementById("gameContent");
  content.innerHTML="";
  step.options.forEach(opt=>{
    let btn=document.createElement("button");
    btn.innerText=opt;
    btn.onclick=()=>{
      if(opt.toUpperCase()===step.answer.toUpperCase()) nextStep();
      else document.getElementById("feedback").innerText="❌ Mauvaise réponse";
    };
    content.appendChild(btn);
  });
  document.getElementById("validateBtn").style.display="none";
}

// ------------------ Memory -------------------
function createMemory(step){
  const content = document.getElementById("gameContent");
  content.innerHTML="";
  let cards = step.pairs.slice().sort(()=>Math.random()-0.5);
  let first=null, second=null;
  let busy = false; // bloque les clics pendant animation

  let grid = document.createElement("div");
  grid.classList.add("memory-grid");

  cards.forEach((val,i)=>{
    let cell = document.createElement("div");
    cell.classList.add("memory-cell");
    cell.dataset.val = val;
    cell.onclick = () => {
      if(busy) return; // on ignore les clics
      if(cell.classList.contains("matched") || cell===first || cell===second) return;
      
      cell.innerText = val;

      if(!first){
        first = cell;
      } else {
        second = cell;
        if(first.dataset.val === second.dataset.val){
          first.classList.add("matched"); 
          second.classList.add("matched");
          first = second = null;
          if(document.querySelectorAll(".memory-cell:not(.matched)").length===0) nextStep();
        } else {
          busy = true; // bloquer clics pendant animation
          setTimeout(()=>{
            first.innerText = "";
            second.innerText = "";
            first = second = null;
            busy = false; // débloquer
          }, 500);
        }
      }
    };
    grid.appendChild(cell);
  });

  content.appendChild(grid);
  document.getElementById("validateBtn").style.display = "none";
}


// ------------------ Puzzle Image Drag & Drop -------------------
function createPuzzle(step){
  const content = document.getElementById("gameContent");
  content.innerHTML = "";

  const containerWidth = Math.min(window.innerWidth*0.9, 400);
  const size = step.size; // NxN puzzle
  const pieceSize = containerWidth / size;

  const container = document.createElement("div");
  container.classList.add("puzzle-container");
  container.style.width = containerWidth + "px";
  container.style.height = containerWidth + "px";
  content.appendChild(container);

  let indices = [];
  for(let i=0;i<size*size;i++) indices.push(i);
  indices.sort(()=>Math.random()-0.5);

  indices.forEach(idx=>{
    const piece = document.createElement("div");
    piece.classList.add("puzzle-piece");
    piece.style.width = pieceSize + "px";
    piece.style.height = pieceSize + "px";
    piece.style.backgroundImage = `url(${step.image})`;
    piece.style.backgroundSize = `${containerWidth}px ${containerWidth}px`;
    piece.style.backgroundPosition = `-${idx%size*pieceSize}px -${Math.floor(idx/size)*pieceSize}px`;
    piece.dataset.idx = idx;
    piece.addEventListener("click", handlePieceClick);
    container.appendChild(piece);
  });

  document.getElementById("validateBtn").style.display="none";
}

let firstPiece = null;
function handlePieceClick(e){
  const clicked = e.currentTarget;
  if(!firstPiece){
    firstPiece = clicked;
    clicked.style.outline = "2px solid #0f0";
  } else {
    const tempBg = clicked.style.backgroundPosition;
    const tempIdx = clicked.dataset.idx;

    clicked.style.backgroundPosition = firstPiece.style.backgroundPosition;
    clicked.dataset.idx = firstPiece.dataset.idx;

    firstPiece.style.backgroundPosition = tempBg;
    firstPiece.dataset.idx = tempIdx;

    firstPiece.style.outline = "none";
    firstPiece = null;

    checkPuzzle();
  }
}
function checkPuzzle(){
  const pieces = document.querySelectorAll(".puzzle-piece");
  for(let i=0;i<pieces.length;i++){
    if(pieces[i].dataset.idx != i) return;
  }
  nextStep();
}

// ------------------ Next Step -------------------
function nextStep(){
  const card=document.getElementById("card");
  card.classList.add("hidden");
  setTimeout(()=>{
    current++;
    localStorage.setItem("level",current);
    if(current>=steps.length){
      card.innerHTML="<h2>🎉 Bravo !</h2><p>Vous avez terminé !</p>";
      return;
    }
    loadStep();
    card.classList.remove("hidden");
  },300);
}

// ------------------ Reset -------------------
function resetGame(){
  localStorage.removeItem("level");
  current=0;
  loadStep();
}

// ------------------ UX Clavier -------------------
document.addEventListener("input",function(e){
  if(e.target.classList.contains("digit")){
    e.target.value=e.target.value.slice(-1).toUpperCase();
    if(e.target.value){
      let next=e.target.nextElementSibling;
      if(next) next.focus();
    }
  }
});
document.addEventListener("focusin",function(e){
  if(e.target.classList.contains("digit")) setTimeout(()=>e.target.select(),0);
});
document.addEventListener("keydown",function(e){
  if(e.target.classList.contains("digit")){
    if(e.key==="Backspace" && !e.target.value){
      let prev=e.target.previousElementSibling;
      if(prev) prev.focus();
    }
    if(e.key==="Enter") validate();
  }
});

// ------------------ Start -------------------
loadStep();