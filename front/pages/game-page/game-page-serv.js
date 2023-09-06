const typeOfGame = localStorage.getItem("gameType")
switch (typeOfGame){
    case "pvp":
        npName = "/api/game/pvp";
        break;
    case "friend":
        npName = "/api/game/friend";
        console.log("vs friend")
        break;
    case "local":
        npName = "/api/game/local";
        break;
    default:
        npName = "/api/game";
        break;
}
var socket
if (typeOfGame === "pvp" || typeOfGame === "friend") {
    socket = io(npName, {auth: {token: localStorage.getItem("token")}})
} else socket = io(npName);

console.log(socket, npName)
const topRow = document.querySelector("#top-row")
const cp = topRow.cloneNode(true)
console.log(localStorage.getItem("firstTurn"))
let firstTurn = parseInt(localStorage.getItem("firstTurn"))
const token = localStorage.getItem("token")

document.addEventListener('DOMContentLoaded', function () {
    if (typeOfGame === "pvp" || typeOfGame === "friend") {

        const MAX_MESSAGES = 5; // maximum number of messages allowed in a 10-second window
        const WINDOW_SIZE = 10000; // size of the time window in milliseconds
        let messageCount = 0;
        let windowStart = Date.now();

        const messageButtons = document.getElementById('message-buttons');
        const btnDisplay = document.getElementById('btn-display');
        const loser = document.getElementById('Loser');
        const ahhhhh = document.getElementById('Ahhhhh');
        const cheh = document.getElementById('Cheh');
        const messageList = document.getElementById('message-list');

        btnDisplay.style.display = "block"

        btnDisplay.addEventListener('click', (event) => {
            btnDisplay.style.display = "none"
            loser.style.display = "block"
            ahhhhh.style.display = "block"
            cheh.style.display = "block"

            const timer = setTimeout(() => {
                loser.style.display = "none";
                ahhhhh.style.display = "none";
                cheh.style.display = "none";
                btnDisplay.style.display = "block";
            }, 8000);
        })

        messageButtons.addEventListener('click', (event) => {
            let data = {
                message: event.target.getAttribute('data-message'),
                user: localStorage.getItem("user")
            }

            // check if the user has exceeded the message limit
            if (messageCount >= MAX_MESSAGES && Date.now() - windowStart < WINDOW_SIZE) {
                displayToast("Please do not spam, wait to send another message", "warning")
                return;
            }

            // send the message and increment the message count
            if (data.message !== null) {
                socket.emit("sendMessage", data);
                console.log("message " + data.message)
                console.log("user " + data.user)
                displayMessage(data.message, true);
                messageCount++;
                windowStart = Date.now();
            }
        });

        function displayMessage(str, isSent) {
            console.log("isSent: " + isSent)
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');

            const bubbleElement = document.createElement('div');
            bubbleElement.classList.add('bubble');
            bubbleElement.textContent = str;

            if (isSent) {
                bubbleElement.classList.add('sent');
            } else {
                bubbleElement.classList.add('received');
            }

            messageElement.appendChild(bubbleElement);
            messageList.appendChild(messageElement);
            messageList.scrollTop = messageList.scrollHeight;

            setTimeout(() => {
                messageList.removeChild(messageElement);
            }, 8000);
        }

        socket.on("updateChat", data => {
            console.log("message received from chatDuringGame.js " + data.message);
            console.log("message dans server " + data.message);
            console.log("user dans server " + localStorage.getItem("user"));
            console.log("sender dans server " + data.user);
            if (data.user !== localStorage.getItem("user")) {
                console.log("dans le if du server");
                displayMessage(data.message, false);
            }
        });
    }
})

socket.on('connect', () => {
    console.log("connected")

    const token = localStorage.getItem("token")
    if (token) {
        console.log("token: " + token + " is being sent to server")
        socket.auth = { token }; // add token to socket authentication object
        socket.connect(); // connect to server with authentication
    }

    if (typeOfGame.includes("pve")
        || typeOfGame === "local"
        || typeOfGame === null
        || typeOfGame === "3minChallenge"
        || typeOfGame === "15MovesChallenge") {
        console.log("new Game Request " + typeOfGame)
        if (typeOfGame === "3minChallenge") {
            console.log("is a 3minChallenge")
            document.getElementById("time-display").style.display = "block"
        } else {
            document.getElementById("time-display").style.display = "none"
        }

        let difficulty
        if(typeOfGame.includes("pve")) difficulty = typeOfGame.split("#")[1]
        socket.emit('setup', {AIplays: firstTurn, difficulty: difficulty})
        if (firstTurn === 1) {
            ia = 1
            currentPlayer = ia
            player = 2
        } else {
            player = 1
            currentPlayer = player
            ia = 2

        }

        initGame()
    } else if (typeOfGame === "resume") {
        console.log("load Game Request")
        const user = JSON.parse(localStorage.getItem("user"))
        console.log("FRONT- user: " + user._id);
        socket.emit('resumeGame', JSON.stringify({_id: user._id}))
    } else if (typeOfGame === "pvp") {
        console.log("pvp Game Request")
    } else if (typeOfGame === "friend") {
        console.log("friend Game Request");
    }

    if(typeOfGame.includes("pve")) {
        document.getElementById("opponent").innerText = "Robot"
        document.getElementById("username").innerText = "Guest";
    }

})

socket.on('onWaitingQueue', () => {  //POT
    console.log("waiting for opponent")
    topRow.remove()
    //waiting animation css
    const spinnerDiv = document.createElement('div');
    const spinnerTxt = document.createElement('p');
    spinnerTxt.innerText = "Waiting for an opponent"
    spinnerDiv.classList.add('spinner');
    spinnerDiv.appendChild(spinnerTxt)
    // create the child divs
    const parentDotsDiv = document.createElement('div');
    parentDotsDiv.classList.add('spinner-dots');
    for (let i = 0; i < 3; i++) {
        const dotDiv = document.createElement('div');
        dotDiv.classList.add('spinner-dot');
        parentDotsDiv.appendChild(dotDiv);
    }
    spinnerDiv.appendChild(parentDotsDiv);
    document.getElementById("countdown").appendChild(spinnerDiv)
})


socket.on('setup', (first) => {
    console.log("setup received")
    const firstTurn = first.AIplays
    if (firstTurn === 1) {
        ia = 1
        currentPlayer = ia
        player = 2
    } else {
        player = 1
        currentPlayer = player
        ia = 2
    }
    const spinner = document.querySelector('.spinner')
    if (spinner) spinner.remove()
    const topRow = document.querySelector("#top-row")
    if(!topRow) document.getElementById("countdown").appendChild(cp)
    initGame()

})

socket.on("savedGameAcc", () => {
    console.log("savedGameAcc")
    let user = JSON.parse(localStorage.getItem("user"))
    user.hasSavedAGame = true
    localStorage.setItem("user", JSON.stringify(user))
    location.href = "/pages/home/home.html"
})


socket.on("loadGameState", (infos) => {
    console.log("load game state ", infos)
    const info = JSON.parse(infos)
    if(info.board === null && info.currentPlayer === null) {
        displayToast("No game to resume", "warning")
        wait(1000).then(() => location.href = "/")
        return
    }

    board = info.board
    currentPlayer = info.currentPlayer
    player = currentPlayer
    ia = currentPlayer === 1 ? 2 : 1
    initGame()
})


socket.on('endGame', async (infos) => {
    console.log("endGameReceived")
    console.log(infos)
    const info = JSON.parse(infos)
    const winner = info.winner;
    console.log("player: " + player)
    if (winner !== 0 && typeOfGame === "pvp" || typeOfGame === "friend") {
        if (winner === player) {
            ScorePoints = info.newrankingWinner
        }else {
            ScorePoints = info.newrankingLoser
        }
        winCombination = info.winCombination;
        updaterankingUser(ScorePoints)
        await setWinner(winner)
    } else if (winner !== 0 && typeOfGame !== "pvp"){
        console.log("dans le bon endGame")
        winCombination = info.winCombination;
        await setWinner(winner)
    } else {
        ScorePoints = info.points
        await setWinner(null, false)
    }


})

socket.on("invalidToken", () => {
    displayToast("Invalid Token", "error")
    wait(900).then(() => location.href = "/")
})

socket.on('updatedBoard', async (board) => {
    try {
        console.log("updateBoardReceived", board)
        await updateBoard(JSON.parse(board))
        currentPlayer = currentPlayer === player ? ia : player
        togglePlayer(currentPlayer === player ? "p2" : "p1", currentPlayer === player ? "p1" : "p2")
        if(typeOfGame === "local") {
            togglePlayer(currentPlayer === player ? "p1" : "p2", currentPlayer === player ? "p2" : "p1")
        }
    } catch (err) {
        alert(err.message)
    }
    addColsEventListeners()
})


