// src/algorithms/AC3.js
export function* ac3Generator(csp) {
    let queue = [];
    for (let i = 0; i < csp.totalCells; i++) {
        for (const neighbor of csp.neighbors[i]) {
            queue.push([i, neighbor]);
        }
    }

    while (queue.length > 0) {
        const [xi, xj] = queue.shift();
        
        if (revise(csp, xi, xj)) {
            if (csp.domains[xi].length === 0) {
                yield { type: 'AC3_FAIL' };
                return false; 
            }
            for (const neighbor of csp.neighbors[xi]) {
                if (neighbor !== xj) queue.push([neighbor, xi]);
            }
            yield { type: 'AC3_PRUNE', activeCell: xi };
        }
    }
    return true;
}

function revise(csp, xi, xj) {
    let revised = false;
    const domainXi = [...csp.domains[xi]];
    for (const x of domainXi) {
        const allowed = csp.domains[xj].some(y => y !== x);
        if (!allowed) {
            csp.domains[xi] = csp.domains[xi].filter(val => val !== x);
            revised = true;
        }
    }
    return revised;
}