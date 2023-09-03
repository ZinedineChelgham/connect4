const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports.schema = new Schema({
    id: {
        type: String,
        required: false,
        unique: true
    },
    nDescription: {
        type: String,
        required: true
    },
    nType: {
        type: String,
        required: true
    },
    nSender: {
        type: String,
        required: true
    }

}, {
    statics: {
        findWithId: async (id) => {
            const notifFound = await module.exports.model.findOne({id});
            if (!notifFound) {
                console.log('notif with id ' + id + ' not found');
            } else {
                console.log("notif found with id " + id);
                return notifFound;
            }
        }
    }
});

module.exports.model = mongoose.model("Notification", exports.schema, "notifications");