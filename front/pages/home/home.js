// Get references to the buttons
const today = new Date();
const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
const gameModes = document.querySelectorAll(".logo-text-assoc")
const icons = Array.from(gameModes).map(gameMode => gameMode.children[0].children[0])
const checkbox = document.querySelector('.switch input[type="checkbox"]');
const logoLockClassName = "fa-solid fa-lock fa-beat fa-2xl"
const cardOnline = document.getElementById("card-online");
let isOnlineLocked = true;

const gameModeMapper = {
    0: "pve",
    1: "local",
    2: "pvp",
    3: "resume",
    4: "challenges",
    5: "pve#easy",
    6: "pve#medium",
}
const modalDiffChoice = document.getElementsByClassName("modal-choice-container");
// Get the modal
const modal = document.getElementById("myModal");
// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];

function handleLockEffect(){
    let user = localStorage.getItem("user")
    if(!user || user === "undefined"){
        let lockIcon = document.createElement("i");
        let allClass = logoLockClassName.split(" ");
        lockIcon.classList.add(...allClass);
        lockIcon.style.marginTop = "3.5rem"
        lockIcon.style.marginBottom = "1rem"
        cardOnline.prepend(lockIcon)
        cardOnline.classList.add("card-locked");

        for (let i = 2; i < 5 ; i++) {
            icons[i].classList.remove("fa-bounce");
        }
        isOnlineLocked = true;

    } else {
        user = JSON.parse(user);
        isOnlineLocked = false;
        cardOnline.classList.remove("card-locked");
        let lockIcon = document.querySelector(logoLockClassName);
        if (lockIcon) lockIcon.remove();
        for (let i = 2; i < 5; i++) {
            icons[i].classList.add("fa-bounce");
        }
        document.querySelector("#card-online > h3").style.marginTop = "2rem"
        document.querySelector("#card-online > h3").style.marginBottom = "1rem"

        document.querySelector("#card-local > h3").style.marginTop = "-5rem"
        document.querySelector("#card-local-sel").style.marginTop = "-5.5rem"

    }
}

function handleGameModeEffect(){
    const bounceClass = "fa-bounce"; // define the class for the animation
    let bouncing = false; // flag to indicate if the icons are currently bouncing

    function toggleBounce() {
        for (let i = 0; i < icons.length; i++){
            if(isOnlineLocked && (i===2 || i===3 || i===4)) continue;
            const icon = icons[i];
            icon.classList.toggle(bounceClass);
        }
    }

    gameModes.forEach(iconContainer => {
        iconContainer.addEventListener("mouseenter", () => {
            if((gameModes[2] === iconContainer || gameModes[3] === iconContainer || gameModes[4] === iconContainer) && isOnlineLocked) return;
            bouncing = false
            toggleBounce();
        })
        iconContainer.addEventListener("mouseleave", () => {
            if((gameModes[2] === iconContainer || gameModes[3] === iconContainer || gameModes[4] === iconContainer) && isOnlineLocked) return;
            bouncing = true
            toggleBounce();
        })

    })
}

function handleIconClick() {
    for (let i = 0; i < gameModes.length; i++) {
        let gameMode = gameModes[i];
        if(i === 0){
            gameMode.addEventListener("click", () => {
                modal.style.display = "block";
            })
            continue;
        }
        gameMode.addEventListener("click", () => {
            if((i===2 || i===3 || i===4)){
                const user = JSON.parse(localStorage.getItem("user"))
                if(!user){
                    displayToast("You must be logged to access this game mode", "warning")
                    return;
                }
                if(!user.hasSavedAGame && i===3){
                    displayToast("You have no saved game", "warning")
                    return;
                }
                if (i===4){
                    window.location.href = "/pages/challenges/challenges.html"
                    return;
                }
            }
            localStorage.setItem("gameType", gameModeMapper[i]);
            goToGamePage();
        })
    }
}

handleGameModeEffect();
handleIconClick();
handleLockEffect()

document.getElementById("year").innerHTML = ` ${date} all rights reserved by `;


// Add a change event listener to the checkbox
checkbox.addEventListener('change', function() {
    let firstTurn = this.checked ? 1 : 2;
    localStorage.setItem("firstTurn", firstTurn.toString());
});


function goToGamePage() {
    window.location.href = "/pages/game-page/game-page.html"
}

// When the user clicks on <span> (x), close the modal
span.onclick = () => {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}






