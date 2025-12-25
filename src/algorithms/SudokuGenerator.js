// src/algorithms/SudokuGenerator.js

import { getStandardRegion } from '../data/jigsawRegions';

// 1. Generate a completely filled, valid 9x9 board
export const generateFullBoard = () => {
    const board = Array(81).fill(0);
    
    // Helper to check validity (simplified version of our CSP logic)
    const isValid = (board, idx, num) => {
        const row = Math.floor(idx / 9);
        const col = idx % 9;
        const region = getStandardRegion(row, col);

        for (let i = 0; i < 81; i++) {
            if (board[i] === num) {
                const r = Math.floor(i / 9);
                const c = i % 9;
                const reg = getStandardRegion(r, c);
                if (r === row || c === col || reg === region) return false;
            }
        }
        return true;
    };

    const fillBoard = (idx = 0) => {
        if (idx >= 81) return true; // Success

        // Shuffle numbers 1-9 for randomness
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);

        for (const num of nums) {
            if (isValid(board, idx, num)) {
                board[idx] = num;
                if (fillBoard(idx + 1)) return true;
                board[idx] = 0; // Backtrack
            }
        }
        return false;
    };

    fillBoard();
    return board;
};

// 2. Remove numbers to create the puzzle
export const generatePuzzle = (difficulty = 0.5) => {
    // difficulty: 0 (Easy) to 1 (Expert)
    // Holes: Min 30 (Easy), Max 60 (Hard)
    const minHoles = 30;
    const maxHoles = 58; // 64 is theoretically max for unique solution, but 58 is safer
    const totalHoles = Math.floor(minHoles + (maxHoles - minHoles) * difficulty);

    const board = generateFullBoard();
    
    // Determine which cells to empty
    const indices = Array.from({ length: 81 }, (_, i) => i);
    indices.sort(() => Math.random() - 0.5); // Shuffle indices

    // Remove numbers
    for (let i = 0; i < totalHoles; i++) {
        board[indices[i]] = 0;
    }

    return board;
};