// src/algorithms/CSP.js
export class CSP {
    constructor(size, initialBoard, regionMapper) {
        this.size = size;
        this.totalCells = size * size;
        this.board = [...initialBoard];
        this.regionMapper = regionMapper;
        
        // Initialize Domains
        this.domains = {};
        for (let i = 0; i < this.totalCells; i++) {
            if (this.board[i] !== 0) {
                this.domains[i] = [this.board[i]];
            } else {
                this.domains[i] = Array.from({ length: size }, (_, k) => k + 1);
            }
        }

        this.neighbors = {}; 
        this._buildConstraintGraph();
    }

    _buildConstraintGraph() {
        for (let i = 0; i < this.totalCells; i++) {
            const row = Math.floor(i / this.size);
            const col = i % this.size;
            const region = this.regionMapper(row, col);
            
            const myNeighbors = new Set();

            for (let j = 0; j < this.totalCells; j++) {
                if (i === j) continue;

                const r = Math.floor(j / this.size);
                const c = j % this.size;
                const reg = this.regionMapper(r, c);

                // Row & Column are always constraints
                const isRow = r === row;
                const isCol = c === col;
                
                // Region is only a constraint if valid (>=0) and matches
                const isRegion = (region !== -1) && (reg === region);

                if (isRow || isCol || isRegion) {
                    myNeighbors.add(j);
                }
            }
            this.neighbors[i] = Array.from(myNeighbors);
        }
    }

    isConsistent(varIndex, value) {
        for (const neighbor of this.neighbors[varIndex]) {
            if (this.board[neighbor] === value) {
                return false;
            }
        }
        return true;
    }

    pruneNeighbors(varIndex, value) {
        const pruned = {}; 
        for (const neighbor of this.neighbors[varIndex]) {
            if (this.board[neighbor] === 0) { 
                const domain = this.domains[neighbor];
                if (domain.includes(value)) {
                    this.domains[neighbor] = domain.filter(v => v !== value);
                    if (!pruned[neighbor]) pruned[neighbor] = [];
                    pruned[neighbor].push(value);

                    if (this.domains[neighbor].length === 0) {
                        return { success: false, pruned };
                    }
                }
            }
        }
        return { success: true, pruned };
    }

    restorePruned(pruned) {
        for (const [neighborIdx, values] of Object.entries(pruned)) {
            this.domains[neighborIdx].push(...values);
            this.domains[neighborIdx].sort((a, b) => a - b);
        }
    }
}