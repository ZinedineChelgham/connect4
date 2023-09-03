const Game = require("../logic/game")
const {v4: uuidv4} = require('uuid');
const user = require("../models/users");

const baseNamespaceUrl = '/api/game';
const friendNamespaceUrl = `${baseNamespaceUrl}/friend`;

let waitingQueue = []
let rooms = []
let player1Socket = null;
let player2Socket = null;

let opponentUser = null;
let currentUser = null;

const handleFriendConnection = (io) => {
    console.log(friendNamespaceUrl)
    friendsGameEvents(io.of(friendNamespaceUrl));
}

const friendsGameEvents = (nsp) => {
    nsp.on("connection", async (socket) => {
        console.log("New client connected to friend namespace");
        await handleConnection(socket);

        socket.on("newMove", (pos) => {
            handleNewMove(pos, socket, nsp);
        });

        socket.on("userJoined", () => {
            console.log("User joined the chat");
            socket.broadcast.emit("message");
        });

        socket.on("message", (message) => {
            console.log(`Received message: ${message}`);
            nsp.emit("message", message);
        });

        socket.on("sendMessage", (data) => {
            console.log("message received dans le socket: " + data.message)
            nsp.emit("updateChat", data);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected from friend namespace");
            waitingQueue = waitingQueue.filter(socket => socket.id !== socket.id);
        });
    });
}

const handleConnection = async (socket) => {
    /*console.log("handleConnection dans friends");
    let room = rooms.find(room => room[1] === socket.id || room[2] === socket.id);
    if (!room) {
        if (waitingQueue.length === 0) {
            console.log("Waiting queue is empty");
            waitingQueue.push(socket);
        } else {
            console.log("Waiting queue is not empty");
            let friendSocket = waitingQueue.pop();
            let room = {
                id: uuidv4(),
                1: friendSocket.id,
                2: socket.id,
                game: new Game(1)
            };
            //store the friend user
            friendUser = await user.model.findOne({socketId: friendSocket.id});
            //store the current user
            currentUser = await user.model.findOne({socketId: socket.id});
            rooms.push(room);
            socket.join(room.id);
            friendSocket.join(room.id);
            friendSocket.emit('setup', {AIplays: 0})
            socket.emit('setup', {AIplays: 1});
            console.log("New Room created: " + room.id, socket.id, friendSocket.id);*/

    // code needed to handle connection
    const firstUserId = socket.handshake.query.firstUserId;
    const secondUserId = socket.handshake.query.secondUserId;

    // Check if both users are connected
    const firstUser = await user.model.findById(firstUserId);
    const secondUser = await user.model.findById(secondUserId);

    if (!firstUser || !secondUser) {
        socket.emit("error", "One of the users is not connected");
        return;
    }

    // Create a new game room
    const roomId = uuidv4();

    // Add the socket to the waiting queue
    waitingQueue.push(socket);

    if (waitingQueue.length >= 2) {
        // Start a new game
        player1Socket = waitingQueue.shift();
        player2Socket = waitingQueue.shift();
        let newRoom = rooms.find(room => room.id === roomId);

        if (!newRoom) {
            // Create a new game room if not found
            newRoom = {
                id: roomId,
                1: player1Socket.id,
                2: player2Socket.id,
                game: new Game(1)
            }
            //store the opponent user
            opponentUser = await user.model.findOne({socketId: player2Socket.id});
            //store the current user
            currentUser = await user.model.findOne({socketId: player1Socket.id});
            rooms.push(newRoom);
            player1Socket.join(roomId);
            player2Socket.join(roomId);
            player1Socket.emit('setup', {AIplays: 0})
            player2Socket.emit('setup', {AIplays: 1});
            console.log("new room created");
        }
    } else {
        // Notify the player that they are in the waiting queue
        socket.emit("waiting");
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
        socket.emit('updateBoard', JSON.stringify(room.game.getBoard()));
        return;
    }
    room.game.handleTurn(col, curPlayer, nsp.to(room.id), currentUser, opponentUser);
    if (room.game.isOver())
        rooms = rooms.filter(room => room.id !== room.id);
}
module.exports = {
    handleFriendConnection
}
