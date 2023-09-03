const deepCopy = require("./utils");

let COLUMNS = 7;
let ROWS = 6;


class GameState {

    constructor(board, currentPlayer, rowTracker) {
        this.board = deepCopy(board)
        this.rowTracker = deepCopy(rowTracker)
        this.currentPlayer = currentPlayer
        this.player1 = 1
        this.player2 = 2
        this.COLUMNS = COLUMNS
        this.ROWS = ROWS
        this.winCombination = []

    }

    getValidMoves() {
        let validCols = [];
        for (let i = 0; i < this.COLUMNS; i++) {
            if (this.rowTracker[i] >= 0) {
                validCols.push(i);
            }
        }
        return validCols;
    }


    applyMove(col) {
        let board = deepCopy(this.board)
        let rowTracker = deepCopy(this.rowTracker)
        board[rowTracker[col]][col] = this.currentPlayer
        rowTracker[col]--
        let nxtPlayer = (this.currentPlayer === this.player1) ? this.player2 : this.player1
        return new GameState(board, nxtPlayer, rowTracker, col);
    }

    isTerminal() {
        let [iswin, winner] = this.checkHorizontal()
        if (iswin) return [true, winner];
        [iswin, winner] = this.checkVertical()
        if (iswin) return [true, winner];
        [iswin, winner] = this.checkDiagonal()
        if (iswin) return [true, winner];
        [iswin, winner] = this.checkAntiDiagonal()
        if (iswin) return [true, winner];
        if (this.checkForDraw()) return [true, null];
        return [false, null]


    }

    scoreAI() {
        let op = this.currentPlayer === this.player2 ? this.player1 : this.player2;

        const fours = this.checkForStreak(this.currentPlayer, 4);
        const threes = this.checkForStreak(this.currentPlayer, 3);
        const twos = this.checkForStreak(this.currentPlayer, 2);
        const opFours = this.checkForStreak(op, 4);
        const opThrees = this.checkForStreak(op, 3);
        const opTwos = this.checkForStreak(op, 2);

        return (fours * 100 + threes * 10 + twos * 2) - (opFours * 100 + opThrees * 10 + opTwos * 2);
    }


    checkForStreak(player, streak) {
        let count = 0;
        for (let i = 0; i < this.ROWS; i++) {
            for (let j = 0; j < this.COLUMNS; j++) {
                if (this.board[i][j] === player) {
                    count += this.verticalStreak(i, j, streak);
                    count += this.horizontalStreak(i, j, streak);
                    count += this.diagonalStreak(i, j, streak);
                    //count += this.antiDiagonalStreak(i, j, streak);
                }
            }
        }
        return count;
    }


    checkHorizontal() {
        for (let i = 0; i < this.ROWS; i++) {
            for (let j = 0; j < this.COLUMNS - 3; j++) {
                if (this.board[i][j] === 0) continue
                if (this.board[i][j] === this.board[i][j + 1]
                    && this.board[i][j + 1] === this.board[i][j + 2]
                    && this.board[i][j + 2] === this.board[i][j + 3]) {
                    this.winCombination.push([i, j], [i, j + 1], [i, j + 2], [i, j + 3])
                    return [true, this.board[i][j]];
                }
            }
        }
        return [false, null];
    }

    checkVertical() {
        for (let i = 0; i < this.ROWS - 3; i++) {
            for (let j = 0; j < this.COLUMNS; j++) {
                if (this.board[i][j] === 0) continue
                if (this.board[i][j] === this.board[i + 1][j]
                    && this.board[i + 1][j] === this.board[i + 2][j]
                    && this.board[i + 2][j] === this.board[i + 3][j]) {
                    this.winCombination.push([i, j], [i + 1, j], [i + 2, j], [i + 3, j])
                    return [true, this.board[i][j]];
                }
            }
        }
        return [false, null];
    }

    checkDiagonal() {
        for (let i = 3; i < this.ROWS; i++) {
            for (let j = 0; j < this.COLUMNS - 3; j++) {
                if (this.board[i][j] === 0) continue
                if (this.board[i][j] === this.board[i - 1][j + 1]
                    && this.board[i - 1][j + 1] === this.board[i - 2][j + 2]
                    && this.board[i - 2][j + 2] === this.board[i - 3][j + 3]) {
                    this.winCombination.push([i, j], [i - 1, j + 1], [i - 2, j + 2], [i - 3, j + 3])
                    return [true, this.board[i][j]];
                }
            }
        }
        return [false, null];
    }

    checkAntiDiagonal() {
        for (let i = 0; i < this.ROWS - 3; i++) {
            for (let j = 0; j < this.COLUMNS - 3; j++) {
                if (this.board[i][j] === 0) continue
                if (this.board[i][j] === this.board[i + 1][j + 1]
                    && this.board[i + 1][j + 1] === this.board[i + 2][j + 2]
                    && this.board[i + 2][j + 2] === this.board[i + 3][j + 3]) {
                    this.winCombination.push([i, j], [i + 1, j + 1], [i + 2, j + 2], [i + 3, j + 3])
                    return [true, this.board[i][j]];
                }
            }
        }
        return [false, null];
    }

    checkForDraw() {
        return this.board.every(row => row.every(col => col !== 0))
    }

    verticalStreak(row, col, streak) {
        let consecutiveCount = 0;
        let b = false;
        for (let i = row; i < this.ROWS; i++) {
            if (this.board[i][col] === this.board[row][col]) {
                consecutiveCount++;
                if (row === this.ROWS / 2 || col === Math.floor(this.COLUMNS / 2)) {
                    b = true;
                }
            } else {
                break;
            }
        }
        if (consecutiveCount >= streak) {
            return b ? 3 : 1
        } else {
            return 0;
        }

    }

    horizontalStreak(row, col, streak) {
        let count = 0;
        let b = false;
        for (let j = col; j < this.COLUMNS; j++) {
            if (this.board[row][j] === this.board[row][col]) {
                count += 1;
                if (row === this.ROWS / 2 || col === Math.floor(this.COLUMNS / 2)) {
                    b = true;
                }

            } else {
                break;
            }
        }
        if (count >= streak) {
            return b ? 3 : 1;
        } else {
            return 0;
        }

    }

    diagonalStreak(row, col, streak) {
        let total = 0;
        let count = 0;
        let j = col;
        let b = false;
        for (let i = row; i < this.ROWS; i++) {
            if (j > this.ROWS) {
                break;
            } else if (this.board[i][j] === this.board[row][col]) {
                count++;
                if (row === this.ROWS / 2 || col === Math.floor(this.COLUMNS / 2)) {
                    b = true;
                }
            } else {
                break;
            }
            j++;
        }
        if (count >= streak) {
            total++;
        }
        count = 0;
        j = col;
        for (let i = row; i >= 0; i--) {
            if (j > 6) {
                break;
            } else if (this.board[i][j] === this.board[row][col]) {
                count++;
                if (row === this.ROWS / 2 || col === Math.floor(this.COLUMNS / 2)) {
                    b = true;
                }
            } else {
                break;
            }
            j++;
        }
        if (count >= streak) {
            total++;
        }
        return b ? total : total;
    }

    isMoveValid(col) {
        return this.getValidMoves().includes(col);
    }


    getHash() {
        let hash = '';
        for (let i = 0; i < this.ROWS; i++) {
            for (let j = 0; j < this.COLUMNS; j++) {
                hash += this.board[i][j];
            }
        }
        hash += this.currentPlayer;
        return this.getHashCode(hash)
    }

    getHashCode(str) {
        let hash = 0;
        if (str.length === 0) {
            return hash;
        }
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    getRowTracker() {
        return this.rowTracker;
    }

}

module.exports = GameState;
