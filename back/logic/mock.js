let mockGameBoard = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0],
    [0, 0, 1, 2, 2, 1, 0],
    [0, 1, 2, 1, 1, 2, 2]
];

let mockGameBoard2 = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0], //8
    [0, 0, 0, 0, 0, 0, 0] //9  3 + 2 + 2
];

let mockCurrentPlayer = 2;

let mockRowTracker = [5, 4, 3, 2, 2, 3, 4];

let mockRowTracker2 = [5,5,5,4,4,5,5];


module.exports = {mockGameBoard, mockCurrentPlayer, mockRowTracker, mockGameBoard2, mockRowTracker2};
