let player
let ia
let currentPlayer
let isOver = false
const ROWS = 6
const COLUMNS = 7
let board = Array(ROWS).fill().map(() => Array(COLUMNS).fill(0))
const FALLING_TIME = 60
let winCombination = []
let ScorePoints = 0
let nbPlayerTurn = 0
let user = localStorage.getItem("user")
if (user !== 'undefined') {
    user = JSON.parse(user);
}
let gameType = localStorage.getItem("gameType")


document.getElementById('username').textContent = user.username !== null ? user.username : 1;
if (gameType === "pve" || gameType === "3minChallenge" || gameType === "15MovesChallenge" || gameType === "resume" || gameType === "pve#easy" || gameType === "pve#medium")
    document.getElementById('opponent').textContent = "IA";
else if (gameType === "friend" || gameType === "local")
    document.getElementById('opponent').textContent = "Friend";
else if (gameType === "pvp") document.getElementById('opponent').textContent = "Opponent";

else if (gameType === "local") document.getElementById('opponent').textContent = 2;


async function updateBoard(newBoard) {
    return new Promise(async (resolve, reject) => {
        if (gameType === "15MovesChallenge" && currentPlayer === player) {
            nbPlayerTurn++
            if (nbPlayerTurn === 15) {
                isOver = true
                alert("You have reached the maximum number of moves")
                location.href = "/pages/challenges/challenges.html"
            }
        }
        let updated = false;
        for (let j = 0; j < COLUMNS; j++) {
            for (let i = 0; i < ROWS; i++) {
                if (board[i][j] !== newBoard[i][j]) {
                    updated = true;
                    board[i][j] = newBoard[i][j]

                    //local game cases
                    if (localStorage.getItem("gameType") === "local") {
                        if (currentPlayer === player) {
                            document.getElementById(`top-row-0- ${j}`).classList.replace("yellow-circle", "red-circle")
                        } else {
                            document.getElementById(`top-row-0- ${j}`).classList.replace("red-circle", "yellow-circle")
                        }
                    }

                    if (localStorage.getItem("gameType") === "local")
                        await animateCircleFall(i, j, currentPlayer === player ? "yellow-circle" : "red-circle")
                    else
                        await animateCircleFall(i, j, currentPlayer === player ? "red-circle" : "yellow-circle") //ADDED

                    let circle = document.getElementById(i + "-" + j)
                    circle.classList.replace("purple-circle", getPlayerColor(i, j))

                    if (i - 1 < 0) { // column is full after the click, so we remove the effects for this col
                        let topRow = document.getElementById(`top-row-0- ${j}`)
                        topRow.classList.remove("red-circle", "yellow-circle", "circle")
                        topRow.classList.add("invisible-circle")
                        document.getElementById(`col-${j}`).classList.remove("show-col")
                    }
                    break
                }
            }
        }
        if (!updated) {
            // reject(new Error("Incorrect move, please try again"))
        } else {
            resolve()
        }
    })
}

function updateBoardRequest(e) {
    if (isOver) return
    if (currentPlayer !== player && gameType !== "local") return
    rmvColsEventListeners()
    let [, col] = e.target.id.split("-")
    if (board[0][col] !== 0) {
        addColsEventListeners()
        return
    }   //ADDED
    socket.emit('newMove', JSON.stringify([col]))
    console.log("updateBoardRequest sent", col)

}

function handleSaveGameRequest() {
    console.log("save Game Request by client")
    const user = JSON.parse(localStorage.getItem("user"))
    //console.log("user", user)
    if (!user) {
        alert("You must be logged in to save a game")
        return
    }
    localStorage.removeItem("gameType")
    socket.emit('saveGame', JSON.stringify({_id: user._id}));
}


function getPlayerColor(i, j) {
    return board[i][j] === player ? "red-circle" : "yellow-circle"
}

function initGame() {
    if (gameType === "3minChallenge") {
        let timer = 180; // 3 minutes
        let timeDisplay = document.getElementById("time-display");
        timeDisplay.textContent = `${Math.floor(timer / 60)}:${timer % 60 < 10 ? "0" : ""}${timer % 60}`;
        setInterval(() => {
            timer--;
            timeDisplay.textContent = `${Math.floor(timer / 60)}:${timer % 60 < 10 ? "0" : ""}${timer % 60}`;
            if (timer === 0) {
                alert("Time's up!")
                location.href = "/pages/challenges/challenges.html"
                return;
            }
        }, 1000);
    }
    addInvisibleRow() // to add a circle on top of the board

    if (user && (gameType === "local" || gameType.includes("pve") || gameType === "resume")) {
        let b = document.getElementById("b-save-game")
        b.style.visibility = "visible"
        if (b) b.addEventListener("click", handleSaveGameRequest)
    }

    for (let j = 0; j < COLUMNS; j++) {
        let colDiv = document.createElement("div")
        colDiv.id = "col-" + j
        for (let i = 0; i < ROWS; i++) {
            let circle = document.createElement("div")
            circle.id = i + "-" + j
            circle.classList.add("circle", "purple-circle")

            //Load a game from a saved state case
            if (board[i][j] === player) {
                circle.classList.replace("purple-circle", "red-circle")
            } else if (board[i][j] === ia) {
                circle.classList.replace("purple-circle", "yellow-circle")
            }

            colDiv.addEventListener("click", updateBoardRequest)
            colDiv.addEventListener("mouseenter", addTopCircle)
            colDiv.addEventListener("mouseleave", rmvTopCircle)
            colDiv.append(circle)
        }
        document.getElementById("board").append(colDiv)
    }
    document.querySelector("#p1 > p").classList.add("turn-display")
    document.querySelector("#p1 > div").classList.add("matchup-circle-zoom")
}


function wait(ms) {
    return new Promise((resolve) => {
        setInterval(resolve, ms);
    });
}

async function countDown() {
    document.getElementById("board").style.visibility = "hidden"
    let countdown = document.getElementById("countdown")
    for (let i = 3; i > 0; i--) {
        countdown.innerHTML = i.toString()
        //playSound() dont work yet
        await wait(1000);
    }
    countdown.innerHTML = "GO!"
    await wait(900);
    countdown.innerHTML = ""
    document.getElementById("board").style.visibility = "visible";
    initGame()
}

function playSound() {
    const audio = new Audio(
        'https://media.geeksforgeeks.org/wp-content/uploads/20190531135120/beep.mp3');
    document.body.appendChild(audio)
    window.focus()
    audio.play().then(r => console.log(r)).catch(e => console.log(e));
}

function addInvisibleRow() {
    for (let j = 0; j < COLUMNS; j++) {
        let circle = document.createElement("div")
        circle.id = "top-row-0- " + j.toString()
        circle.classList.add("invisible-circle")
        document.getElementById("top-row").append(circle)
    }
}

function addTopCircle(e) {
    // if (isOver) return
    if (currentPlayer !== player && gameType !== "local") return
    let [, col] = e.target.id.split("-")
    if (col < 0 || col > COLUMNS - 1) return
    if (board[0][col] !== 0) return // if the column is full don't show the top circle
    e.target.classList.add("show-col")
    let circle = document.getElementById(`top-row-0- ${col}`)
    circle.classList.replace("invisible-circle", "circle")
    if (localStorage.getItem("gameType") === "local")
        circle.classList.add(currentPlayer === player ? "yellow-circle" : "red-circle")
    else
        circle.classList.add(currentPlayer === player ? "red-circle" : "yellow-circle")

}

function rmvTopCircle(e) {
    let [, col] = e.target.id.split("-")
    let circle = document.getElementById(`top-row-0- ${col}`)
    circle.classList.replace("circle", "invisible-circle")
    circle.classList.remove("red-circle", "yellow-circle")
    e.target.classList.remove("show-col")
}


function rmvColsEventListeners() {
    for (let j = 0; j < COLUMNS; j++) {
        let colDiv = document.getElementById(`col-${j}`)
        colDiv.removeEventListener("click", updateBoardRequest)
        //colDiv.removeEventListener("mouseenter", addTopCircle)
    }
}

function addColsEventListeners() {
    for (let j = 0; j < COLUMNS; j++) {
        let colDiv = document.getElementById(`col-${j}`)
        colDiv.addEventListener("click", updateBoardRequest)
        //colDiv.addEventListener("mouseenter", addTopCircle)
    }
}

async function animateCircleFall(row, col, colorClass) {
    let i
    for (i = 0; i < row; i++) {
        let circle = document.getElementById(`${i}-${col}`)
        circle.classList.replace("purple-circle", colorClass)
        await wait(FALLING_TIME).then(() => {
            circle.classList.replace(colorClass, "purple-circle")
        })
    }
    document.getElementById(`${i}-${col}`).classList.replace("purple-circle", colorClass)
}


//Toggles player 1 off and player 2 on
function togglePlayer(p1, p2) {
    //circle.classList.replace("purple-circle", colorClass)
    document.querySelector(`#${p1} > p`).classList.remove("turn-display");
    document.querySelector(`#${p2} > p`).classList.add("turn-display");
    document.querySelector(`#${p1} > div`).classList.remove("matchup-circle-zoom");
    document.querySelector(`#${p2} > div`).classList.add("matchup-circle-zoom");
}


function showEndGameModal(winnerPlayer) {
    console.log(gameType)
    console.log(winnerPlayer)
    document.getElementById("end-game-modal").style.display = "flex"

    let modalBtns = document.querySelectorAll("#btn-group > button")
    modalBtns[0].addEventListener("click", () => {
        modalBtns[0].classList.add("clicked")
        localStorage.removeItem("gameType")
        backTotheMenu()
    })
    modalBtns[1].addEventListener("click", () => {
        modalBtns[1].classList.add("clicked")
        resetGame()
    })

    let winner = document.getElementById("winner")
    let points = document.getElementById("points")
    if (gameType === "pvp" || gameType === "friend") {
        if (winnerPlayer === player) {
            updateStatsUser(2)
            winner.classList.add("green-title")
            winner.innerHTML = "You are the winner!"
            points.innerHTML = `Your new ranking score is ${ScorePoints} points!`
        } else if (winnerPlayer === ia) {
            updateStatsUser(0)
            points.classList.add("red-title")
            winner.innerHTML = "Your opponent is the winner!"
            points.innerHTML = `Your new ranking score is ${ScorePoints} points!`
        } else {
            updateStatsUser(1)
            winner.innerHTML = "It's a draw!"
            points.innerHTML = `Your new ranking score is ${ScorePoints} points!`
        }
    } else {
        if (gameType === "local") {
            winner.classList.add("green-title")
            winner.innerHTML = "GG WP!"
            points.innerHTML = `It was a close one... or not?`
        } else {
            if (winnerPlayer === player) {
                winner.classList.add("green-title")
                winner.innerHTML = "You are the winner!"
                points.innerHTML = "You defeated our robot... How dare you!"
            } else if (winnerPlayer === ia) {
                points.classList.add("red-title")
                winner.innerHTML = "Our robot is the winner!"
                points.innerHTML = "Will you be able to defeat him next time?"
            } else {
                winner.innerHTML = "It's a draw!"
                points.innerHTML = "Close one!"
            }
        }
    }
}

async function setWinner(winner, win = true) {
    isOver = true
    //use winCombination to highlight the winning circles
    if (win) winCombination.forEach(([row, col]) => document.getElementById(`${row}-${col}`).classList.add("win-circle"));
    await wait(620)
    if (gameType === "3minChallenge" && winner === player) {
        displayToast("3minChallenge success", "success")
        updateUserWhenChallengeSuccess("3minChallenge")
    }
    if (gameType === "15MovesChallenge" && winner === player) {
        displayToast("15MovesChallenge success")
        updateUserWhenChallengeSuccess("15MovesChallenge")
    }

    showEndGameModal(win === true ? winner : null)

//hide the turn
    document.querySelector("#p1 > p").classList.remove("turn-display")
    document.querySelector("#p2 > p").classList.remove("turn-display")
//remove the zoom effect
    document.querySelector("#p1 > div").classList.remove("matchup-circle-zoom")
    document.querySelector("#p2 > div").classList.remove("matchup-circle-zoom")


}

function updateUserWhenChallengeSuccess(challenge) {
    fetch('/api/challenges/' + challenge)
        .then(response => response.json())
        .then(challenge => {
            console.log("dans le fetch" + challenge)
            user.challenges.push(challenge.name);
            updateUser()
        })
        .catch(error => {
            console.error('Error fetching challenges', error);
        });
}

function updaterankingUser(newranking) {
    console.log("ranking before : " + user.ranking + "ranking after : " + newranking)
    user.ranking = newranking;
    updateUser()

}

function updateStatsUser(winOrLoseOrDraw) {
    console.log("winOrLoseOrDraw : " + winOrLoseOrDraw)
    switch (winOrLoseOrDraw) {
        case 0:
            user.loses += 1;
            break;
        case 1:
            user.draws += 1;
            break;
        case 2:
            user.wins += 1;
            break;
    }
    updateUser()
}

function updateUser() {
    fetch('/api/' + user.email, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => response.json())
        .then(updatedUser => {
            console.log('User updated:', updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
        })
        .catch(error => {
            console.error('Error updating user:', error);

        });
}

function backTotheMenu() {
    wait(300).then(() => location.href = "../home/home.html")

}

function resetGame() {
    //isOver = false
    wait(300).then(() => location.reload())
}


// define the Konami code sequence as an array of key codes
const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

// keep track of the index of the current key being pressed
let konamiIndex = 0;

// attach a keydown event listener to the document
document.addEventListener('keydown', function (event) {
    // check if the current key pressed matches the next key in the Konami code sequence
    if (event.keyCode === konamiCode[konamiIndex]) {
        // if so, increment the index and check if the end of the sequence has been reached
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            // if so, trigger the animation
            const board = document.querySelector('#board');
            board.classList.add('rotate');
            console.log('Konami code entered!')
            // reset the index for future use
            konamiIndex = 0;
            // restore the initial state after the animation finishes
            setInterval(() => {
                board.classList.toggle('rotate');
            }, 3000);
        }
    } else {
        // if the current key pressed does not match the next key in the sequence, reset the index
        konamiIndex = 0;
    }
});





