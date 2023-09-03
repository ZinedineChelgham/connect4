const Game = require("../logic/game")
const { v4: uuidv4 } = require('uuid');
const user = require("../models/users");
const jwt = require("jsonwebtoken");



const baseNamespaceUrl = '/api/game';
const pvpNamespaceUrl = `${baseNamespaceUrl}/pvp`;

let waitingQueue = []
let rooms = []
let opponentUser = null;
let currentUser = null;

const handlePvpConnection = (io) => {
    console.log(pvpNamespaceUrl)
    pvpGameEvents(io.of(pvpNamespaceUrl));
}

const pvpGameEvents = (nsp) => {
    nsp.on("connection", async (socket) => {
        console.log("New client connected to pvp namespace");

        if(!tokenIsValid(socket)) {
            socket.emit("invalidToken");
            return;
        }

        await handleConnection(socket);

        socket.on("newMove", (pos) => {
            handleNewMove(pos, socket, nsp);
        });

        socket.on("sendMessage", (data) => {
            console.log("message received dans le socket: " + data.message)
            nsp.emit("updateChat", data);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected from pvp namespace");
            waitingQueue = waitingQueue.filter(socket => socket.id !== socket.id);
        });
    });
}

async function handleConnection(socket) {
    let room = rooms.find(room => room[1] === socket.id || room[2] === socket.id);
    if (!room) {
        if (waitingQueue.length === 0) {
            waitingQueue.push(socket);
            socket.emit('onWaitingQueue');
        } else {
            let opponentSocket = waitingQueue.pop();
            let room = {
                id: uuidv4(),
                1: opponentSocket.id,
                2: socket.id,
                game: new Game(1)
            };
            //store the opponent user
            opponentUser = await user.model.findOne({socketId: opponentSocket.id});
            //store the current user
            currentUser = await user.model.findOne({socketId: socket.id});
            rooms.push(room);
            socket.join(room.id);
            opponentSocket.join(room.id);
            opponentSocket.emit('setup', {AIplays: 0});
            socket.emit('setup', {AIplays: 1});
            console.log("New Room created: " + room.id, socket.id, opponentSocket.id);
        }
    }
}

function handleNewMove(pos, socket, nsp) {
    //Player turn
    console.log("New move ", pos);
    let colStr = JSON.parse(pos)[0];
    let col = parseInt(colStr);
    let room = rooms.find(room => room[1] === socket.id || room[2] === socket.id);
    let curPlayer = room.game.currentPlayer;
    if (room[curPlayer] !== socket.id) {
        console.log(curPlayer, room[curPlayer], socket.id, room.game);
        console.log("Not your turn ", socket.id);
        return;
    }
    if (!room.game.isMoveValid(col)) {
        console.log("Invalid move ");
        socket.emit('updatedBoard', JSON.stringify(room.game.getBoard()));
        return;
    }
    room.game.handleTurn(col, curPlayer, nsp.to(room.id), opponentUser, currentUser);
    if(room.game.isOver())
        rooms = rooms.filter(room => room.id !== room.id);

}

function tokenIsValid(socket) {
    try {
        const token = socket.handshake.auth.token;
        // Verify the token with the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token was issued more than 1 hour ago
        const issuedAt = decoded.iat * 1000; // Convert Unix time to milliseconds
        const oneHourAgo = Date.now() - (60 * 60 * 1000); // Calculate 1 hour ago in milliseconds
        if (issuedAt < oneHourAgo) {
            return false;
        }
        // Token is valid
        return true;
    } catch (err) {
        // Token is invalid
        return false;
    }
}

module.exports = {handlePvpConnection}
