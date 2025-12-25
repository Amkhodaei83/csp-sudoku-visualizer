// src/data/jigsawMaps.js

// 1. STANDARD (2x3 Blocks) - Vertical Rectangles
const MAP_VERTICAL = [
    0, 0, 1, 1, 2, 2,
    0, 0, 1, 1, 2, 2,
    0, 0, 1, 1, 2, 2,
    3, 3, 4, 4, 5, 5,
    3, 3, 4, 4, 5, 5,
    3, 3, 4, 4, 5, 5
];

// 2. HORIZONTAL (3x2 Blocks) - Horizontal Rectangles
const MAP_HORIZONTAL = [
    0, 0, 0, 1, 1, 1,
    0, 0, 0, 1, 1, 1,
    2, 2, 2, 3, 3, 3,
    2, 2, 2, 3, 3, 3,
    4, 4, 4, 5, 5, 5,
    4, 4, 4, 5, 5, 5
];

// 3. SNAKE (The one we built from your image)
const MAP_SNAKE = [
    0, 0, 1, 1, 1, 5,
    0, 2, 1, 1, 3, 5,
    0, 2, 1, 3, 3, 5,
    0, 2, 2, 2, 3, 5,
    0, 4, 4, 2, 3, 5,
    4, 4, 4, 4, 3, 5
];

// 4. STEPS (Corrected Valid Map)
// Replaces the broken Diamond map
const MAP_STEPS = [
    0, 0, 0, 1, 1, 1,
    2, 0, 0, 0, 1, 1,
    2, 2, 3, 3, 1, 4,
    2, 2, 2, 3, 4, 4,
    5, 5, 3, 3, 3, 4,
    5, 5, 5, 5, 4, 4
];

export const JIGSAW_MAPS = [
    { name: "Vertical (2x3)", map: MAP_VERTICAL },
    { name: "Horizontal (3x2)", map: MAP_HORIZONTAL },
    { name: "Snake", map: MAP_SNAKE },
    { name: "Steps", map: MAP_STEPS }
];

export const getRegionFromMap = (map, row, col) => {
    const idx = row * 6 + col;
    if (idx < 0 || idx >= 36) return 0;
    return map[idx];
};