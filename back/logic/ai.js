const Game = require("./game")
const GameState = require('./gameState')
const deepCopy = require("./utils")

let cache = {}
function computeMove(game, ia) {
    let gameStat = new GameState(game.getBoard(), game.currentPlayer, game.gameState.rowTracker)
    let [move, score] = minimax(gameStat, 4, -Infinity, Infinity, true, ia)
    return move
}

function randomMove(game){
    while(true) {
        let col = Math.floor(Math.random() * 7);
        if(game.gameState.rowTracker[col] >= 0) {
            return col;
        }
    }
}


function minimax(gameStat, depth, alpha, beta, maximizingPlayer, ia) {
    //console.log("enter minimax ", [gameState, validMoves])
    const [isTerminal, winner] = gameStat.isTerminal();
    if (depth === 0 || isTerminal) {
        if(isTerminal){
            if(winner === ia) return [null, 1000000000];
            else if(winner === (ia===1 ? 2 : 1)) return [null, -1000000000];
            else return [null, 0];
        }else{
            const hash = gameStat.getHash();
            if (hash in cache) {
                return cache[hash];
            } else{
                const score = gameStat.scoreAI();
                cache[hash] = [null, score];
                return [null, score];
            }
        }
    }

    let bestMove = null;
    let bestScore = maximizingPlayer ? -Infinity : Infinity;
    let validMoves = gameStat.getValidMoves();

    for (const move of validMoves) {
        const childState = gameStat.applyMove(move);
        const [_, newScore] = minimax(childState, depth - 1, alpha, beta, !maximizingPlayer);
        if (maximizingPlayer && newScore > bestScore) {
            bestMove = move;
            bestScore = newScore;
            alpha = Math.max(alpha, bestScore);
            if (alpha >= beta) {
                break;
            }
        } else if (!maximizingPlayer && newScore < bestScore) {
            bestMove = move;
            bestScore = newScore;
            beta = Math.min(beta, bestScore);
            if (alpha >= beta) {
                break;
            }
        }
    }
    const hash = gameStat.getHash();
    cache[hash] = [bestMove, bestScore];
    return [bestMove, bestScore];
}



function resetCache(){
    cache = {};
}

function getCache(){
    return cache;
}


module.exports = {computeMove, randomMove};