const gameInfos = require("../models/gameInfos")
const user = require("../models/users");

const pveMode = require("../gameModes/pve");
const pvpMode = require("../gameModes/pvp");
const localMode = require("../gameModes/local");
const friendsMode = require("../gameModes/friends");

console.log("sockets.js")


gameInfos.deleteMany({}, function (err) {
    if (err) console.log(err);
    console.log("Successful deletion");
});


//empty the database at the start of the server
user.model.deleteMany({}, function (err) {
    if (err) console.log(err);
    console.log("Successful deletion");
});

//empty the notifications database at the start of the server
const notifications = require("../models/notifications");
notifications.model.deleteMany({}, function (err) {
    if (err) console.log(err);
    console.log("Successful deletion");
});


const handleGameModesConnections = (io) => {
    console.log("handleGameModesConnections")
    pveMode.handlePveConnection(io);
    pvpMode.handlePvpConnection(io);
    localMode.handleLocalConnections(io);
    friendsMode.handleFriendConnection(io);
};




module.exports = {handleGameModesConnections};

