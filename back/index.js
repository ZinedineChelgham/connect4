require('dotenv').config()
// The http module contains methods to handle http queries.
const http = require('http')
// Let's import our logic.
const fileQuery = require('./queryManagers/front.js')
const apiQuery = require('./queryManagers/api.js')
const mongoose = require("mongoose");


/* The http module contains a createServer function, which takes one argument, which is the function that
** will be called whenever a new request arrives to the server.
 */
console.log("Server is running...");

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://mongo:27017/ps8', {
    useNewUrlParser: true
}).then(() => {console.log("Connected to MongoDB")}).catch((err) => {console.log(err)});

console.log("Server is running...")

const port = process.env.PORT || 8000;

const server = http.createServer(function (request, response) {
    // First, let's check the URL to see if it's a REST request or a file request.
    // We will remove all cases of "../" in the url for security purposes.
    let filePath = request.url.split("/").filter(function(elem) {
        return elem !== "..";
    });

    try {
        // If the URL starts by /api, then it's a REST request (you can change that if you want).
        if (filePath[1] === "api") {
            apiQuery.manage(request, response);
            // If it doesn't start by /api, then it's a request for a file.
        } else {
            fileQuery.manage(request, response);
        }
    } catch(error) {
        response.statusCode = 400;
        response.end(`Something in your request (${request.url}) is strange...`);
    }
// For the server to be listening to request, it needs a port, which is set thanks to the listen function.
}).listen(port, () => {
    console.log("Server listening at port %d", port);
});

const { Server } = require("socket.io");
const io = new Server(server);
const sockets = require('./socket/sockets.js')
sockets.handleGameModesConnections(io)
module.exports = {
    io
}

