// Progression par table
let current = localStorage.getItem("level")
  ? parseInt(localStorage.getItem("level"))
  : 0

// Étapes du jeu (codes à 5 lettres)
const steps = [
{title:"🔍 Les gardiens", description:"Trouvez 5 personnes dont le prénom commence par C ou J. Elles ont chacune un indice.", code:"CLEFS"},
{title:"🧩 Mot mystère", description:"Avec les indices récupérés, trouvez le mot secret.", code:"AMOUR"},
{title:"🍸 Objet caché", description:"Un objet est caché près du bar.", code:"VERRE"},
{title:"🕵️ Enquête", description:"Une info sur les mariés est fausse. Trouvez laquelle.", code:"MENTE"},
{title:"📸 Mission photo", description:"Prenez une photo avec 3 inconnus et montrez-la à un témoin.", code:"PHOTO"},
{title:"🎭 Défi", description:"Faites un défi validé par un témoin.", code:"DEFI1"},
{title:"🔤 Puzzle", description:"Reconstituez un mot avec les lettres.", code:"BONHE"},
{title:"💌 Enveloppe", description:"Trouvez une enveloppe cachée dans la salle.", code:"SECRE"},
{title:"🔐 Code final", description:"Assemblez tous les indices.", code:"VIVEL"},
{title:"🏆 Victoire", description:"Retournez voir les mariés !", code:"GAGNE"}
]

function loadStep(){
  document.getElementById("title").innerText = steps[current].title
  document.getElementById("description").innerText = steps[current].description
  document.getElementById("progress").innerText = (current+1)+" / "+steps.length

  document.getElementById("feedback").innerText=""
  document.querySelectorAll(".digit").forEach(i => i.value = "")
  document.querySelector(".digit").focus()
}

function validate(){
  let inputs = document.querySelectorAll(".digit")
  let input = ""
  inputs.forEach(i => input += i.value)
  input = input.toUpperCase()

  let card = document.getElementById("card")
  card.classList.remove("error","success")

  // Code admin pour reset
  if(input === "RESET"){
    resetGame()
    return
  }

  if(input === steps[current].code){
    card.classList.add("success")
    current++
    localStorage.setItem("level", current)

    if(current >= steps.length){
      document.getElementById("card").innerHTML =
        "<h2>🎉 Bravo !</h2><p>Vous avez terminé l'escape game !</p>"
      return
    }

    document.getElementById("feedback").innerText="✔ Code correct"
    setTimeout(loadStep, 800)
  } else {
    card.classList.add("error")
    document.getElementById("feedback").innerText="❌ Code incorrect"
  }
}

// Auto-focus et backspace
document.addEventListener("input", function(e){
  if(e.target.classList.contains("digit")){
    if(e.target.value.length === 1){
      let next = e.target.nextElementSibling
      if(next) next.focus()
    }
  }
})

document.addEventListener("keydown", function(e){
  if(e.target.classList.contains("digit") && e.key === "Backspace" && !e.target.value){
    let prev = e.target.previousElementSibling
    if(prev) prev.focus()
  }
  // Validation avec Entrée
  if(e.key === "Enter"){
    validate()
  }
})

// Reset du jeu
function resetGame(){
  localStorage.removeItem("level")
  current = 0
  loadStep()
  document.getElementById("feedback").innerText = "🔄 Jeu réinitialisé !"
}

// Charger le premier niveau
loadStep()