const GameState = require('./gameState')
const EloRating = require("elo-rating");
const user = require("../models/users");

const ROWS = 6;
const COLUMNS = 7;
let opponentUser = null;
let currentUser = null;
let rooms = [];

class Game {

    constructor(firstPlayer) {
        this.currentPlayer = firstPlayer
        this.gameState = new GameState(
            new Array(ROWS).fill(null).map(() => new Array(COLUMNS).fill(0).slice()),
            firstPlayer,
            [5, 5, 5, 5, 5, 5, 5],
        )
    }

    loadGameState(gameState) {
        this.gameState = gameState
    }

    loadGameStateFromRawDatas(board, currentPlayer, rowTracker) {
        this.currentPlayer = currentPlayer
        this.gameState = new GameState(board, currentPlayer, rowTracker)
    }

    getBoard() {
        return this.gameState.board
    }

    isOver() {
        return this.gameState.isTerminal()[0]
    }


    isMoveValid(col) {
        return this.gameState.isMoveValid(col) && !this.isOver()
    }

    updateBoard(col) {
        this.gameState = this.gameState.applyMove(col)
        this.currentPlayer = this.gameState.currentPlayer
    }

    checkForWin() {
        return this.gameState.isTerminal()[1] !== null
    }

    checkForDraw() {
        return this.gameState.checkForDraw()
    }

    getCurrentPlayer() {
        return this.currentPlayer
    }

    handleTurn(col, player, socket, opponentPlayer, currentPlayer) {
        if (this.isOver()) return;
        this.updateBoard(col);
        socket.emit('updatedBoard', JSON.stringify(this.getBoard()));
        if (this.checkForWin()) {
            console.log("win")
            this.handleSendWinData(player, socket, opponentPlayer, currentPlayer);
        } else if (this.checkForDraw()) {
            console.log("draw")
            this.handleSendDrawData(player, socket, opponentPlayer, currentPlayer);
        }
    }

    handleSendDrawData(player, socket, opponentPlayer, currentPlayer) {
        console.log("opponentPlayer", opponentPlayer)
        console.log("currentPlayer", currentPlayer)
        let winData
        let isPvp = opponentPlayer !== undefined && currentPlayer !== undefined && opponentPlayer!== null && currentPlayer!== null; // undefined better than null for function calls in null cases
        if (isPvp) {
            const currentPlayerPreviousranking = currentPlayer.ranking; // pour avoir le + - nbPoints gagnés
            if (currentPlayer.ranking > opponentPlayer.ranking) {
                const result = EloRating.calculate(currentPlayer.ranking, opponentPlayer.ranking, false, 10);
                winData = {
                    winner: 0,
                    points: currentPlayer.ranking - currentPlayerPreviousranking,
                    newrankingWinner: result.playerRating,
                    newrankingLoser: result.opponentRating,
                    winCombination: this.gameState.winCombination,
                };
            }else if (currentPlayer.ranking < opponentPlayer.ranking) {
                const result = EloRating.calculate(currentPlayer.ranking, opponentPlayer.ranking, true, 10);
                winData = {
                    winner: 0,
                    points: currentPlayer.ranking - currentPlayerPreviousranking,
                    newrankingWinner: result.playerRating,
                    newrankingLoser: result.opponentRating,
                    winCombination: this.gameState.winCombination,
                };
            }
        } else {
            winData = {winner: 0, points: 0};
        }
        socket.emit('endGame', JSON.stringify(winData));
    }

    handleSendWinData(player, socket, opponentPlayer, currentPlayer) {
        console.log("opponentPlayer", opponentPlayer)
        console.log("currentPlayer", currentPlayer)
        let winData;
        let isPvp = opponentPlayer !== undefined && currentPlayer !== undefined;
        console.log("isPvp" + isPvp)
        if (isPvp) { //pvp game
            const currentPlayerPreviousranking = currentPlayer.ranking;
            const result = EloRating.calculate(currentPlayer.ranking, opponentPlayer.ranking, true);
            console.log("result", result)
            winData = {
                winner: player,
                points: currentPlayer.ranking - currentPlayerPreviousranking,
                newrankingWinner: result.playerRating,
                newrankingLoser: result.opponentRating,
                winCombination: this.gameState.winCombination,
            };
        } else { //pve or local game
            winData = {
                winner: player,
                winCombination: this.gameState.winCombination,
            }
        }
        socket.emit('endGame', JSON.stringify(winData));
    }

}

module.exports = Game;