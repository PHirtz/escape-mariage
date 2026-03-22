// 🔹 Niveau actuel
let current = localStorage.getItem("level") ? parseInt(localStorage.getItem("level")) : 0

// 🔹 Définition des niveaux / codes
const steps = [
  {title:"Intro", description:"Trouvez un code", code:"CLE"},
  {title:"Indice", description:"Code à 5 lettres", code:"AMOUR"},
  {title:"Objet", description:"Objet caché", code:"VERRE"},
  {title:"Défi", description:"Code secret du défi", code:"DEFI"},
  {title:"Victoire", description:"Retournez voir les mariés", code:"GAGNE"}
]

// 🔹 Crée les inputs dynamiques pour le code
function createInputs(length){
  let container = document.getElementById("codeLock")
  container.innerHTML = ""
  for(let i=0;i<length;i++){
    let input = document.createElement("input")
    input.classList.add("digit")
    input.maxLength = 1
    container.appendChild(input)
  }
}

// 🔹 Charger le niveau
function loadStep(){
  let step = steps[current]
  document.getElementById("title").innerText = step.title
  document.getElementById("description").innerText = step.description
  document.getElementById("progress").innerText = (current+1)+" / "+steps.length
  document.getElementById("feedback").innerText = ""
  
  let container = document.getElementById("codeLock")
  container.innerHTML = ""
  createInputs(step.code.length)
  document.getElementById("validateBtn").style.display = "block"

  // focus sur la première case
  setTimeout(()=>document.querySelector(".digit").focus(),50)
}

// 🔹 Valider le code
function validate(){
  let inputs = document.querySelectorAll(".digit")
  let input = ""
  inputs.forEach(i => input += i.value)
  input = input.toUpperCase()

  let card = document.getElementById("card")
  card.classList.remove("error","success")

  // ✅ RESET dynamique : si le code commence par "RESET"
  if(input.startsWith("RES")){
    resetGame()
    return
  }

  if(input === steps[current].code){
    card.classList.add("success")
    nextStep()
  } else {
    card.classList.add("error")
    document.getElementById("feedback").innerText = "❌ Incorrect"
  }
}

// 🔹 Passer au niveau suivant
function nextStep(){
  current++
  localStorage.setItem("level", current)
  if(current >= steps.length){
    document.getElementById("card").innerHTML = "<h2>🎉 Bravo !</h2><p>Vous avez terminé !</p>"
    return
  }
  loadStep()
}

// 🔹 Reset du jeu
function resetGame(){
  localStorage.removeItem("level")
  current = 0
  loadStep()
}

// 🔹 Gestion UX clavier
document.addEventListener("input", function(e){
  if(e.target.classList.contains("digit")){
    e.target.value = e.target.value.slice(-1).toUpperCase()
    if(e.target.value){
      let next = e.target.nextElementSibling
      if(next) next.focus()
    }
  }
})

document.addEventListener("focusin", function(e){
  if(e.target.classList.contains("digit")){
    setTimeout(()=>e.target.select(),0)
  }
})

document.addEventListener("keydown", function(e){
  if(e.target.classList.contains("digit")){
    if(e.key === "Backspace" && !e.target.value){
      let prev = e.target.previousElementSibling
      if(prev) prev.focus()
    }
    if(e.key === "Enter") validate()
  }
})

// 🔹 Démarrer le jeu
loadStep()