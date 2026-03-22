let current = localStorage.getItem("level") ? parseInt(localStorage.getItem("level")) : 0

const steps = [
  {title:"Intro", description:"Trouvez un code", code:"CLE"},
  {title:"Indice 1", description:"Code à 4 lettres", code:"AMOR"},
  {title:"Indice 2", description:"Code à 5 lettres", code:"BONHE"},
  {title:"Objet 1", description:"Code secret", code:"VERRE"},
  {title:"Défi 1", description:"Code mystère", code:"DEFI"},
  {title:"Indice 3", description:"Petit code", code:"COEUR"},
  {title:"Objet 2", description:"Code caché", code:"FETE"},
  {title:"Défi 2", description:"Encore un code", code:"CLEF"},
  {title:"Final", description:"Dernier code", code:"GAGNE"},
  {title:"Victoire", description:"Retournez voir les mariés", code:"BRAVO"}
]

let attempts = 0

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

function loadStep(){
  let step = steps[current]
  document.getElementById("title").innerText = step.title
  document.getElementById("description").innerText = step.description
  document.getElementById("progress").innerText = (current+1)+" / "+steps.length
  document.getElementById("feedback").innerText = ""
  document.getElementById("lock").classList.remove("unlocked")

  createInputs(step.code.length)
  document.getElementById("validateBtn").style.display = "block"
  setTimeout(()=>document.querySelector(".digit").focus(),50)
  attempts = 0
}

function validate(){
  let inputs = document.querySelectorAll(".digit")
  let input = ""
  inputs.forEach(i => input += i.value)
  input = input.toUpperCase().trim()

  let card = document.getElementById("card")
  card.classList.remove("error","success")

  // 🔹 RESET dynamique
  if("RESET".startsWith(input) && input.length > 0){
    resetGame()
    return
  }

  attempts++
  if(input === steps[current].code){
    card.classList.add("success")
    document.getElementById("lock").classList.add("unlocked")
    setTimeout(nextStep, 500)
  } else {
    card.classList.add("error")
    document.getElementById("feedback").innerText = `❌ Incorrect - tentatives: ${attempts}`
  }
}

function nextStep(){
  const card = document.getElementById("card")
  card.classList.add("hidden")
  setTimeout(()=>{
    current++
    localStorage.setItem("level", current)
    if(current >= steps.length){
      card.innerHTML = "<h2>🎉 Bravo !</h2><p>Vous avez terminé !</p>"
      return
    }
    loadStep()
    card.classList.remove("hidden")
  }, 300)
}

function resetGame(){
  localStorage.removeItem("level")
  current = 0
  loadStep()
}

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

loadStep()