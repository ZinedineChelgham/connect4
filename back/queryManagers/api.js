// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.

require('dotenv').config()
const sha256 = require('js-sha256').sha256;
const user = require("../models/users");
const notifications = require("../models/notifications")
const {parseReqBody} = require("./parsing");
const challenge = require("../models/challenges");
const {v4: uuidv4} = require('uuid');
const hash = sha256('a');

//register a new user for testing purposes by creating a new user in the database
const mock = {
    id: 123,
    username: 'john_doe',
    email: 'john_doe@example.com',
    password: hash,
    challenges: [],
    ranking: 100,
    loses: 1,
    wins: 4,
    draws: 2,
    friends: ['456'],
    notifications: []
};

const mock2 = {
    id: 456,
    username: 'momo',
    email: 'momo@example.com',
    password: hash,
    challenges: ['test'],
    ranking: 100,
    loses: 0,
    wins: 2,
    draws: 1,
    friends: ['123'],
    notifications: []
};

user.model(mock).save((err, user) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('User created:', user);
});

user.model(mock2).save((err, user) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('User created:', user);
});



async function manageRequest(request, response) {

    //cancel CORS
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", ["GET", "POST", "PUT", "PATCH"]);
    response.setHeader("Access-Control-Allow-Headers", "*");

    console.log('Request type: ' + request.method + ' Endpoint: ' + request.url);

    if (request.method === 'OPTIONS') {
        response.statusCode = 200;
        response.end();

    } else if (request.method === 'POST') {
        const data = await parseReqBody(request);
        console.log(data);

        //inscribe the user in the database
        if (request.url.endsWith('/signup')) {
            //encrypt the password
            console.log("check pwd:" + data.password);
            data.password = sha256(data.password.toString());
            data.id = uuidv4();
            data.friends = [];
            data.notifications = [];
            console.log(request.url);



            console.log("dans le signup");
            user.model(data).save().then(async () => {
                response.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8',
                });
                const currentUser = await user.model.findByCredentials(data.email, data.password);
                const token = await currentUser.generateAuthToken();
                response.write(JSON.stringify({
                    token: token,
                    currentUser: currentUser
                }));
                console.log("User created")
                response.end();
            });

            //log the user in
        } else if (request.url.endsWith('/login')) {
            //encrypt the password
            console.log("check pwd:" + data.password);
            data.password = sha256(data.password.toString());
            data.id = uuidv4();
            data.friends = [];
            data.notifications = [];
            console.log(request.url);

            console.log("dans le login");
            try {
                const currentUser = await user.model.findByCredentials(data.email, data.password);
                const token = await currentUser.generateAuthToken();
                response.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8',
                });
                response.write(JSON.stringify({
                    token: token,
                    currentUser: currentUser
                }));
                response.end();
                console.log("User found 2: ", currentUser.username, "Token: ", token);
            } catch (e) {
                console.log("login error, user not found");
                //send to the front an error
                response.writeHead(404, {
                    'Content-Type': 'application/json; charset=utf-8',
                });
                response.write(JSON.stringify({ error: "User not found" }));
                response.end();
            }

        } else if (request.url.endsWith('/newNotif')) {
            console.log("dans newNotif");
            data.id = uuidv4()

            const notif = {
                id: data.id,
                nDescription: data.nDescription,
                nType: data.nType,
                nSender: data.nSender,
            }


            notifications.model(notif).save()
                .then(() => {
                    console.log("dans notification save then")
                    response.writeHead(200, {
                        'Content-Type': 'application/json; charset=utf-8',
                    });
                    response.write(JSON.stringify({
                        notif: notif
                    }));
                    console.log("Notif created")
                    response.end();
                });
        }
    } else if (request.method === 'GET' && request.url.startsWith('/api/challenges')) {
        // retrieve challenges from database
        const challenges = await challenge.model.findByChallengeName(request.url.split('/')[3]);

        // return challenges as JSON
        response.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
        });
        response.write(JSON.stringify({
            challenges: challenges
        }));
        response.end();
    } else if (request.method === 'GET' && request.url.startsWith('/api/users')) {
        console.log("dans get users by name")
        // retrieve users from database
        const users = await user.model.findByName(request.url.split('/')[3]);
        // return users as JSON
        response.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
        });
        response.write(JSON.stringify({
            users: users
        }));
        response.end();
    } else if (request.method === 'GET' && request.url.startsWith('/api/id/')) {
        // retrieve users from database
        const users = await user.model.findById(request.url.split('/')[3]);

        // return users as JSON
        response.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
        });
        response.write(JSON.stringify({
            users: users
        }));
        response.end();
    } else if (request.method === 'GET' && request.url.startsWith('/api/allUsers')) {
        try {
            const users = await user.model.find();
            response.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8',
            });
            response.write(JSON.stringify(users));
            response.end();
        } catch (error) {
            console.error("Error fetching users:", error);
            response.writeHead(500);
            response.end();
        }
    } else if (request.method === 'GET' && request.url.startsWith('/api/allNotifs')) {
        console.log("dans allNotifs")
        try {
            const notifs = await notifications.model.find();
            response.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8',
            });
            response.write(JSON.stringify(notifs));
            response.end();
        } catch (error) {
            console.error("Error fetching users:", error);
            response.writeHead(500);
            response.end();
        }
    } else if (request.method === 'GET' && request.url.startsWith('/api/notifications')) {
        // retrieve users from database
        const notif = await notifications.model.findWithId(request.url.split('/')[3]);

        // return users as JSON
        response.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
        });
        response.write(JSON.stringify({
            notif: notif
        }));
        response.end();
    } else if (request.method === 'PUT') {
        console.log("dans le put")
        const data = await parseReqBody(request);

        try {
            const userToUpdate = await user.model.findByEmail(request.url.split('/')[2]);
            console.log("user to update: ", userToUpdate)

            if (!userToUpdate) {
                response.writeHead(404, {'Content-Type': 'application/json'});
                response.write(JSON.stringify({error: 'User not found'}));
                response.end();
                return;
            }

            userToUpdate.username = data.username || userToUpdate.username;
            userToUpdate.email = data.email || userToUpdate.email;
            userToUpdate.password = data.password.toString() || userToUpdate.password;
            userToUpdate.challenges = data.challenges || userToUpdate.challenges;
            userToUpdate.ranking = data.ranking || userToUpdate.ranking;
            userToUpdate.wins = data.wins || userToUpdate.wins;
            userToUpdate.loses = data.loses || userToUpdate.loses;
            userToUpdate.draws = data.draws || userToUpdate.draws;
            userToUpdate.notifications = data.notifications || userToUpdate.notifications;
            userToUpdate.friends = data.friends || userToUpdate.friends;

            console.log("user updated: ", userToUpdate)
            await userToUpdate.save();

            response.writeHead(200, {'Content-Type': 'application/json'});
            response.write(JSON.stringify(userToUpdate));
            response.end();
        } catch (err) {
            console.error(err);
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.write(JSON.stringify({error: 'Internal server error'}));
            response.end();
        }
    }
}


/* This method is a helper in case you stumble upon CORS problems. It shouldn't be used as-is:
** Access-Control-Allow-Methods should only contain the authorized method for the url that has been targeted
** (for instance, some of your api urls may accept GET and POST request whereas some others will only accept
PUT).
** Access-Control-Allow-Headers is an example of how to authorize some headers, the ones given in this
example
** are probably not the ones you will need. */
function addCors(response) {
    // Website you wish to allow to connect to your server.
    response.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow.
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow.
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent to the API.
    response.setHeader('Access-Control-Allow-Credentials', true);
}

exports.manage = manageRequest;
