require('dotenv').config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;

module.exports.schema = new Schema({
    id: {
        type: String,
        required: false,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    challenges: [{
        type: String,
        ref: 'Challenge'
    }],
    ranking: {
        type: Number,
        default: 100
    },
    loses: {
        type: Number,
        default: 0
    },
    wins: {
        type: Number,
        default: 0
    },
    draws: {
        type: Number,
        default: 0
    },
    friends: [{
        type: String,
        ref: 'User'
    }],
    notifications: [{
        type: String,
        ref: 'Notification'
    }],
    hasSavedAGame: {
        type: Boolean,
        default: false
    }
}, {
    methods: {
        generateAuthToken: async function () {
            const user = this;
            const token = jwt.sign({
                _id: user._id.toString(),
                username: user.username
            }, process.env.JWT_SECRET, {expiresIn: '1h'});
            console.log("Token in usersMethod: " + token)
            return token;
        }
    },
    statics: {
        findByCredentials: async (email, password) => {
            const userFound = await module.exports.model.findOne({email});
            if (!userFound) {
                console.log('user not found');
            } else if (!await (password === userFound.password)) {
                console.log('password incorrect');
            } else {
                console.log("user found");
                return userFound;
            }
        },
        findByEmail: async (email) => {
            const userFound = await module.exports.model.findOne({email});
            if (!userFound) {
                console.log('user with email ' + email + ' not found');
            } else {
                console.log("user found with email " + email);
                return userFound;
            }
        },
        findByName: async (username) => {
            const userFound = await module.exports.model.find({username});
            if (!userFound) {
                console.log('user with name ' + username + ' not found');
            } else {
                console.log("user found with name " + username);
                return userFound;
            }
        },
        findById: async (id) => {
            const userFound = await module.exports.model.find({id});
            if (!userFound) {
                console.log('user with id ' + id + ' not found');
            } else {
                console.log("user found with id " + id);
                return userFound;
            }
        },

        findByObjectId: async (_id) => {
            const user  = await this.model.find({ _id })
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        },

        findFriends: async function(email) {
            const user = await this.model.findOne({ email });
            if (!user) {
                throw new Error("User not found");
            }
            const friends = await this.model.find({ email: { $in: user.friends } });
            return friends;
        }
    }
});

module.exports.model = mongoose.model("User", exports.schema, "users");
