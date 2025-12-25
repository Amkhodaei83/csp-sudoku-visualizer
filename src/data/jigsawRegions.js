// src/data/jigsawRegions.js

// This file defines the default static regions (Vertical 2x3)
// and the helper function for standard 9x9 Sudoku.

const JIGSAW_6X6_MAP = [
    0, 0, 1, 1, 2, 2,
    0, 0, 1, 1, 2, 2,
    0, 0, 1, 1, 2, 2,
    3, 3, 4, 4, 5, 5,
    3, 3, 4, 4, 5, 5,
    3, 3, 4, 4, 5, 5
];

export const getJigsawRegion = (row, col) => {
    const index = row * 6 + col;
    if (index < 0 || index >= 36) return -1;
    return JIGSAW_6X6_MAP[index];
};

// --- THIS WAS MISSING ---
export const getStandardRegion = (row, col) => {
    // Calculates which 3x3 block a cell belongs to (for 9x9 Sudoku)
    const regionRow = Math.floor(row / 3);
    const regionCol = Math.floor(col / 3);
    return regionRow * 3 + regionCol;
};