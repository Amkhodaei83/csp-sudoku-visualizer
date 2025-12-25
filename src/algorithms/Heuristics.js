// src/algorithms/Heuristics.js
export const selectNextVariable = (csp, strategy = 'FIRST_EMPTY') => {
    let bestVar = -1;
    let minDomainSize = Infinity;

    for (let i = 0; i < csp.totalCells; i++) {
        if (csp.board[i] === 0) { 
            if (strategy === 'FIRST_EMPTY') return i; 

            if (strategy === 'MRV') {
                const domainSize = csp.domains[i].length;
                if (domainSize < minDomainSize) {
                    minDomainSize = domainSize;
                    bestVar = i;
                }
            }
        }
    }
    return bestVar;
};

export const orderDomainValues = (csp, varIndex, strategy = 'ASCENDING') => {
    const values = [...csp.domains[varIndex]];

    if (strategy === 'LCV') {
        return values.sort((valA, valB) => {
            const countA = countConstraints(csp, varIndex, valA);
            const countB = countConstraints(csp, varIndex, valB);
            return countA - countB; 
        });
    }
    return values.sort((a, b) => a - b);
};

const countConstraints = (csp, varIndex, value) => {
    let count = 0;
    for (const neighbor of csp.neighbors[varIndex]) {
        if (csp.board[neighbor] === 0 && csp.domains[neighbor].includes(value)) {
            count++;
        }
    }
    return count;
};