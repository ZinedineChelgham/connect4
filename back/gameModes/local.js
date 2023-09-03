const baseNamespace = '/api/game'
const localGameNamespace = `${baseNamespace}/local`
const Game = require('../logic/game')


const handleLocalConnections = (io) => {
    console.log(localGameNamespace)
    localGameEvents(io.of(localGameNamespace));
}


const localGameEvents = (nsp) => {
    nsp.on("connection", async (socket) => {
        console.log("New client connected to local namespace");
        let game = new Game(1);

        socket.on("newMove", (pos) => {
            handleNewMove(game, pos, socket);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected from local namespace");
        });
    });
}

async function handleNewMove(game, pos, socket) {
    console.log("handleNewMove")
    let colStr = JSON.parse(pos)[0];
    let col = parseInt(colStr);
    if (!game.isMoveValid(col)) {
        console.log("Invalid move ");
        socket.emit('updatedBoard', JSON.stringify(game.getBoard()));
        return;
    }
    game.handleTurn(col, game.getCurrentPlayer(), socket);
    await sleep(800)
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {handleLocalConnections}
