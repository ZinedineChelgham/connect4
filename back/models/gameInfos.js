const mongoose = require("mongoose");
const {ObjectId} = require("mongodb");

const gameInfosSchema = new mongoose.Schema({
    userId: { type: ObjectId, required: true },
    board: { type: Array, required: true },
    currentPlayer: { type: Number, required: true },
    rowTracker: { type: Array, required: true },
});

gameInfosSchema.statics.saveGame = async function(userId, board, currentPlayer, rowTracker) {
    try {
        const game = await this.findOne({ userId });
        if (game) {
            game.board = board;
            game.currentPlayer = currentPlayer;
            game.rowTracker = rowTracker;
            await game.save();
        } else {
            const gameInfos = new this({
                userId,
                board,
                currentPlayer,
                rowTracker,
            });
            await gameInfos.save();
            console.log("Game saved", gameInfos);

        }
    } catch (err) {
        console.error(err);
    }
};

gameInfosSchema.statics.getGameInfos = async function(userId) {
    try {
        return await this.findOne({ userId });
    } catch (err) {
        throw err;
    }
};

const GameInfos = mongoose.model("GameInfos", gameInfosSchema, "gameInfos");

module.exports = GameInfos;
