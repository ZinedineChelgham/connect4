const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    }
}, {
    statics: {
        findByChallengeName: async (name) => {
            const challengeFound = await module.exports.model.findOne({name});
            if (!challengeFound) {
                console.log('challenge not found');
            } else
            {
                console.log("challenge found");
                return challengeFound;
            }
        }
    }
});

const Challenge = mongoose.model('Challenge', challengeSchema, 'challenges');
module.exports.model = mongoose.model("Challenge", exports.challengeSchema, "challenges");

const timerChallenge = new Challenge({
    name: "3minChallenge",
    icon: "fa-regular fa-timer"
});

timerChallenge.save()
    .then(challenge => {
        console.log('Challenge saved:', challenge);
    })
    .catch(error => {
        console.error('Error saving challenge:', error);
    });

const movesChallenge = new Challenge({
    name: "15MovesChallenge",
    icon: "fa-regular fa-timer"
});

movesChallenge.save()
    .then(challenge => {
        console.log('Challenge saved:', challenge);
    })
    .catch(error => {
        console.error('Error saving challenge:', error);
    });