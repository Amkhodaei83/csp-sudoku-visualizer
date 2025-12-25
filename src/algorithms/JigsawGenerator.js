// src/algorithms/JigsawGenerator.js

/* 
   Generates a valid 6x6 Jigsaw puzzle based on a provided Region Map.
*/

const isValid = (board, idx, num, map) => {
    const row = Math.floor(idx / 6);
    const col = idx % 6;
    const regionId = map[idx];

    // Check Row
    for (let c = 0; c < 6; c++) {
        if (board[row * 6 + c] === num) return false;
    }

    // Check Col
    for (let r = 0; r < 6; r++) {
        if (board[r * 6 + col] === num) return false;
    }

    // Check Jigsaw Region
    for (let i = 0; i < 36; i++) {
        if (map[i] === regionId) {
            if (board[i] === num) return false;
        }
    }

    return true;
};

const fillBoard = (board, map) => {
    // Find empty cell
    let idx = board.indexOf(0);
    if (idx === -1) return true; // Full

    const nums = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5); // Randomize

    for (let num of nums) {
        if (isValid(board, idx, num, map)) {
            board[idx] = num;
            if (fillBoard(board, map)) return true;
            board[idx] = 0; // Backtrack
        }
    }
    return false;
};

export const generateJigsawPuzzle = (mapArray, difficulty = 0.5) => {
    // 1. Create Empty Board
    let solvedBoard = new Array(36).fill(0);

    // 2. Fill it with a valid solution
    const success = fillBoard(solvedBoard, mapArray);

    // --- SAFETY CHECK (Prevents Infinite Loop) ---
    if (!success) {
        console.error("Critical Error: Map is unsolvable. Returning empty board.");
        return new Array(36).fill(0);
    }

    // 3. Clone it to make the playable puzzle
    let puzzle = [...solvedBoard];

    // 4. Remove numbers based on difficulty
    const cellsToRemove = Math.floor(10 + (difficulty * 15)); 

    let attempts = cellsToRemove;
    // Safety break to prevent infinite loops even here
    let safetyCounter = 0; 
    
    while (attempts > 0 && safetyCounter < 500) {
        let idx = Math.floor(Math.random() * 36);
        if (puzzle[idx] !== 0) {
            puzzle[idx] = 0;
            attempts--;
        }
        safetyCounter++;
    }

    return puzzle;
};