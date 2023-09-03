const  baseNamespaceUrl = '/api';
const pveNamespaceUrl = `${baseNamespaceUrl}/game`;
const Game = require("../logic/game");
const AI = require("../logic/ai");
const gameInfos = require("../models/gameInfos");
const user = require("../models/users");
let gameDifficulty = "null";
let turnMapper = {}

const handlePveConnection = (io) => {
    console.log(pveNamespaceUrl)
    pveGameEvents(io.of(pveNamespaceUrl));
}


const pveGameEvents = (nsp) => {
    nsp.on("connection", async (socket) => {
        console.log("New client connected to game pve namespace");
        let game;

        socket.on("setup", (setupInfo) => game = handleSetup(setupInfo, game, socket));

        socket.on('newMove', async (pos) => await handleNewMove(pos, game, socket));

        socket.on("saveGame", (Userinfo) => handleSaveGame(Userinfo, game, socket));

        socket.on("resumeGame", async (userId) =>  game = await handleResumeGame(userId, socket));

        socket.on("disconnect", () => console.log("Client disconnected from game namespace"));
    });
};

function handleSetup(setupInfo, game, socket) {
    console.log(setupInfo)
    let aiPlay = setupInfo.AIplays;
    let diff = setupInfo.difficulty;

    let firstTurn = aiPlay
    gameDifficulty = diff;
    game = new Game(1);
    if (firstTurn === 1) {
        turnMapper["ia"] = 1;
        turnMapper["player"] = 2;
        let col = moveMapper(game);
        game.updateBoard(col);
        socket.emit('updatedBoard', JSON.stringify(game.getBoard()))
    } else {
        turnMapper["ia"] = 2;
        turnMapper["player"] = 1;
    }
    return game;
}

async function handleNewMove(pos, game, socket) {
    console.log("handleNewMove ", game)
    if(turnMapper["player"] !== game.getCurrentPlayer()) return;
    console.log("handleNewMove")
    let colStr = JSON.parse(pos)[0];
    let col = parseInt(colStr);
    if (!game.isMoveValid(col)) {
        console.log("Invalid move ");
        socket.emit('updatedBoard', JSON.stringify(game.getBoard()));
        return;
    }
    game.handleTurn(col, game.getCurrentPlayer(), socket, undefined, undefined);
    await sleep(800);
    game.handleTurn(moveMapper(game), game.getCurrentPlayer(), socket, undefined, undefined);
}

function moveMapper(game) {
    if (gameDifficulty === "medium") return AI.computeMove(game, turnMapper["ia"]);
    else return AI.randomMove(game);
}

async function handleSaveGame(Userinfo, game, socket) {
    console.log("Saving game " + Userinfo)
    //set the hasSavedGame attribute to true for the user id
    let userId = JSON.parse(Userinfo)._id;
    user.model.findByIdAndUpdate({"_id": userId}, {hasSavedAGame: true}, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            console.log("user updated")
        }
    })
    gameInfos.saveGame(
        userId,
        game.getBoard(),
        game.getCurrentPlayer(),
        game.gameState.getRowTracker()
    )
    socket.emit("savedGameAcc")
}

async function handleResumeGame(userId, socket) {
    console.log("param from front" + userId)
    let game = null
    try {
        const {board, currentPlayer, rowTracker} = await gameInfos.getGameInfos(JSON.parse(userId)._id);
        game = new Game(1);
        turnMapper["ia"] = 2;
        turnMapper["player"] = currentPlayer;
        game.loadGameStateFromRawDatas(board, currentPlayer, rowTracker);
        socket.emit('loadGameState', JSON.stringify({board, currentPlayer}));
    } catch (err) {
        console.log(err);
        socket.emit('loadGameState', JSON.stringify({board: null, currentPlayer: null}));
    }
    return game;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { handlePveConnection };

