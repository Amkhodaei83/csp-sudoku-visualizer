import { selectNextVariable, orderDomainValues } from './Heuristics';

export function* solveGenerator(csp, options = {}) {
    const { 
        useMRV = false, 
        useLCV = false, 
        useForwardChecking = false 
    } = options;

    let nodesExpanded = 0;
    let backtracks = 0;

    // Helper to Deep Copy domains so React sees changes
    const getDomainSnapshot = () => {
        const snap = {};
        for(let key in csp.domains) {
            snap[key] = [...csp.domains[key]];
        }
        return snap;
    };

    function* log(message) {
        yield { type: 'LOG', message };
    }

    yield* log(`Starting... MRV:${useMRV} LCV:${useLCV} FC:${useForwardChecking}`);

    function* backtrack(depth = 0) {
        // 1. Check Success
        if (csp.board.every(cell => cell !== 0)) {
            yield* log("Puzzle Solved!");
            return true;
        }

        // 2. Select Variable
        const varIndex = selectNextVariable(csp, useMRV ? 'MRV' : 'FIRST_EMPTY');
        if (varIndex === -1) {
            return false; 
        }

        nodesExpanded++;
        
        // 3. Order Values
        // Note: LCV can be slow on 9x9. If it feels laggy, try turning LCV off.
        const sortedValues = orderDomainValues(csp, varIndex, useLCV ? 'LCV' : 'ASCENDING');
        
        // VISUALIZATION: Highlight the cell we are thinking about
        yield {
            type: 'STEP',
            board: [...csp.board],
            activeCell: varIndex,
            metrics: { nodesExpanded, backtracks },
            domains: getDomainSnapshot(),
            status: 'thinking' // Yellow highlight
        };

        // If domain is empty (due to previous Forward Checking or AC-3), report it
        if (sortedValues.length === 0) {
            yield* log(`[Backtrack] Cell ${varIndex} has no valid candidates left.`);
             yield {
                type: 'BACKTRACK',
                board: [...csp.board],
                activeCell: varIndex,
                metrics: { nodesExpanded, backtracks },
                domains: getDomainSnapshot(),
                status: 'error' // Red flash
            };
            return false;
        }

        for (const value of sortedValues) {
            // Check Consistency
            if (csp.isConsistent(varIndex, value)) {
                
                // Assign
                csp.board[varIndex] = value;
                yield* log(`Assigning ${value} to Cell ${varIndex}`);

                // Visual Update: Show the green number
                yield {
                    type: 'STEP',
                    board: [...csp.board],
                    activeCell: varIndex,
                    metrics: { nodesExpanded, backtracks },
                    domains: getDomainSnapshot(),
                    status: 'tentative'
                };

                let prunedData = null;

                // Forward Checking
                if (useForwardChecking) {
                    const result = csp.pruneNeighbors(varIndex, value);
                    if (!result.success) {
                        yield* log(`FC: Conflict caused by ${value} at ${varIndex}`);
                        
                        // Visual: Flash Red
                        yield {
                            type: 'PRUNE_FAIL',
                            activeCell: varIndex,
                            domains: getDomainSnapshot(),
                            status: 'error'
                        };

                        // Undo
                        csp.board[varIndex] = 0;
                        csp.restorePruned(result.pruned);
                        backtracks++;
                        continue; // Try next value
                    }
                    prunedData = result.pruned;
                }

                // Recurse
                const result = yield* backtrack(depth + 1);
                
                if (result) return true;

                // If we get here, the recursion failed. We must undo.
                yield* log(`<- Backtracking from Cell ${varIndex} (Value ${value} led to dead end)`);
                csp.board[varIndex] = 0;
                
                if (useForwardChecking && prunedData) {
                    csp.restorePruned(prunedData);
                }
                
                backtracks++;

                // Visual: Update board to show empty cell again
                yield {
                    type: 'BACKTRACK',
                    board: [...csp.board], 
                    activeCell: varIndex,
                    metrics: { nodesExpanded, backtracks },
                    domains: getDomainSnapshot(),
                    status: 'backtrack' 
                };

            } else {
                // Not consistent (handled silently usually, but we can log for strict debug)
                // yield* log(`Value ${value} invalid for Cell ${varIndex}`);
            }
        }

        // --- THE FIX: Log when we run out of values in the loop ---
        yield* log(`[Exhausted] No valid values left for Cell ${varIndex}. Going up.`);
        yield {
            type: 'BACKTRACK',
            board: [...csp.board], 
            activeCell: varIndex,
            metrics: { nodesExpanded, backtracks },
            domains: getDomainSnapshot(),
            status: 'error' // Flash red before leaving
        };

        return false;
    }

    const success = yield* backtrack();
    if (!success) {
        yield* log("Search finished. No solution found.");
        yield { type: 'DONE', success: false };
    } else {
        yield { type: 'DONE', success: true };
    }
}