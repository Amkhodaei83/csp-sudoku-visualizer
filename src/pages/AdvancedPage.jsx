import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/theme/Layout'; // <--- IMPORT LAYOUT
import Board from '../components/Board';
import Controls from '../components/Controls';
import Metrics from '../components/Metrics';
import ResultModal from '../components/ResultModal';
import { CSP } from '../algorithms/CSP';
import { solveGenerator } from '../algorithms/Solver';
import { ac3Generator } from '../algorithms/AC3';
import { getStandardRegion } from '../data/jigsawRegions';
import { generatePuzzle } from '../algorithms/SudokuGenerator';
import { HARD_9X9 } from '../data/puzzleInputs';

const AdvancedPage = () => {
    // --- State ---
    const [board, setBoard] = useState([...HARD_9X9]);
    const [domains, setDomains] = useState({});
    
    // History & Logic
    const [history, setHistory] = useState([]); 
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [initialBoardState, setInitialBoardState] = useState([...HARD_9X9]);
    const [difficulty, setDifficulty] = useState(0.5);

    // Visual State
    const [activeCell, setActiveCell] = useState(null);
    const [errorCell, setErrorCell] = useState(null);
    const [metrics, setMetrics] = useState({ nodesExpanded: 0, backtracks: 0 });
    
    // Robot State
    const [robotStatus, setRobotStatus] = useState('idle');
    const [winStatus, setWinStatus] = useState(null); 

    // Controls
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(80);
    const [algOptions, setAlgOptions] = useState({
        useMRV: true,
        useLCV: false,
        useForwardChecking: true
    });

    const solverIterRef = useRef(null);
    const cspRef = useRef(null);
    const timerRef = useRef(null);

    // Initialize
    useEffect(() => { handleGenerate(); }, []);

    // --- LOGIC FUNCTIONS ---
    const triggerEmotion = (emotion, duration = 1500) => {
        setRobotStatus(emotion);
        setTimeout(() => {
            setRobotStatus(prev => (prev === emotion ? (isPlaying ? 'thinking' : 'idle') : prev));
        }, duration);
    };

    const resetPuzzle = (grid = initialBoardState) => {
        stopTimer();
        setIsPlaying(false);
        setWinStatus(null);
        setRobotStatus('idle');
        
        const newCSP = new CSP(9, grid, getStandardRegion);
        cspRef.current = newCSP;
        solverIterRef.current = null;

        const initialState = {
            board: [...newCSP.board],
            domains: JSON.parse(JSON.stringify(newCSP.domains)),
            activeCell: null,
            errorCell: null,
            metrics: { nodesExpanded: 0, backtracks: 0 }
        };

        setBoard(initialState.board);
        setDomains(initialState.domains);
        setActiveCell(null);
        setErrorCell(null);
        setMetrics(initialState.metrics);

        setHistory([initialState]);
        setHistoryIndex(0);
    };

    const handleGenerate = () => {
        triggerEmotion('surprised'); 
        const newPuzzle = generatePuzzle(difficulty);
        setInitialBoardState([...newPuzzle]);
        resetPuzzle(newPuzzle);
    };

    const handleAlgChange = (newOptions) => {
        setAlgOptions(newOptions);
        triggerEmotion('smart');
    };

    const handleSpeedChange = (newSpeed) => {
        setSpeed(newSpeed);
        if (newSpeed >= 90) triggerEmotion('surprised');
    };

    const computeNextStep = () => {
        if (historyIndex < history.length - 1) {
            const nextIdx = historyIndex + 1;
            applyState(history[nextIdx]);
            setHistoryIndex(nextIdx);
            return true;
        }
        if (!solverIterRef.current) {
            solverIterRef.current = solveGenerator(cspRef.current, algOptions);
        }
        const { value, done } = solverIterRef.current.next();
        if (done) {
            setIsPlaying(false);
            setRobotStatus('idle');
            return false;
        }
        if (value.type === 'DONE') {
            setIsPlaying(false);
            const isWin = value.success;
            setWinStatus(isWin ? 'won' : 'lost');
            setRobotStatus(isWin ? 'won' : 'lost');
            return false;
        }
        if (value.type === 'LOG') return computeNextStep();

        if (value.type === 'BACKTRACK' || value.type === 'PRUNE_FAIL') {
            setRobotStatus('frustrated');
        } else {
            setRobotStatus('thinking');
        }

        const newFrame = {
            board: value.board ? [...value.board] : [...board],
            domains: value.domains ? value.domains : domains,
            activeCell: value.activeCell !== undefined ? value.activeCell : null,
            errorCell: (value.type === 'PRUNE_FAIL' || value.type === 'BACKTRACK') ? value.activeCell : null,
            metrics: value.metrics || metrics
        };

        const newHistory = [...history, newFrame];
        if(newHistory.length > 5000) newHistory.shift();

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        applyState(newFrame);
        return true;
    };

    const applyState = (frame) => {
        setBoard(frame.board);
        setDomains(frame.domains);
        setActiveCell(frame.activeCell);
        setErrorCell(frame.errorCell);
        setMetrics(frame.metrics);
    };

    const stopTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = null;
    };

    useEffect(() => {
        if (isPlaying) {
            let delay = 0;
            if (speed < 100) {
                delay = Math.pow(100 - speed, 2) / 20; 
                delay = Math.max(0, delay);
            }
            const loop = () => {
                const keepGoing = computeNextStep();
                if (keepGoing && isPlaying) {
                    timerRef.current = setTimeout(loop, delay);
                } else {
                    setIsPlaying(false);
                }
            };
            loop();
        } else {
            stopTimer();
        }
        return () => stopTimer();
    }, [isPlaying, speed]);

    const togglePlay = () => setIsPlaying(!isPlaying);
    const handleStepForward = () => { setIsPlaying(false); computeNextStep(); };
    const handleStepBack = () => {
        setIsPlaying(false);
        if (historyIndex > 0) {
            const prevIdx = historyIndex - 1;
            applyState(history[prevIdx]);
            setHistoryIndex(prevIdx);
        }
    };

    const handleAC3 = () => {
        if(history.length > 1 && !window.confirm("Restart to run AC-3?")) return;
        resetPuzzle(); 
        triggerEmotion('confused', 1500);
        const iter = ac3Generator(cspRef.current);
        let res = iter.next();
        let count = 0;
        while (!res.done) {
            if(res.value.type === 'AC3_PRUNE') count++;
            res = iter.next();
        }
        const ac3State = {
            board: [...cspRef.current.board],
            domains: JSON.parse(JSON.stringify(cspRef.current.domains)),
            activeCell: null,
            errorCell: null,
            metrics: { nodesExpanded: 0, backtracks: 0 }
        };
        setDomains(ac3State.domains);
        setHistory([ac3State]);
        setHistoryIndex(0);
        alert(`AC-3 Optimized ${count} domains.`);
    };

    return (
        <Layout robotStatus={robotStatus} robotSpeed={speed}>
            
            <div className="animate-fade-in p-2">
                <ResultModal status={winStatus} onClose={() => setWinStatus(null)} />

                {/* Header Card with Generator Controls */}
                <div className="card card-compact mb-4">
    <div className="d-flex justify-between items-center wrap-mobile gap-4">
        <div style={{ flex: 1, width: '100%' }}>
            <h2 className="m-0 text-xl" style={{ color: 'white', marginBottom: '10px' }}>Advanced: 9x9 Generator</h2>
            
            {/* The Slider Row */}
            <div className="d-flex items-center gap-4 mt-2" style={{ width: '100%' }}>
                <span className="text-sm font-bold whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.9)', minWidth: '100px' }}>
                    Difficulty: {Math.floor(difficulty * 100)}%
                </span>
                
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(parseFloat(e.target.value))}
                    className="slider-primary" 
                    style={{ 
                        flex: 1,                // This makes it stretch to fill space
                        height: '12px',         // Makes the track thicker
                        cursor: 'pointer',
                        accentColor: '#00d2ff', // Matching that bright blue in your image
                        outline: 'none'
                    }}
                />

                <button 
                    onClick={handleGenerate} 
                    className="btn-primary-sm"
                    style={{ 
                        padding: '10px 25px', 
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        color: '#1976d2',
                        border: 'none',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }}
                >
                    Generate New
                </button>
            </div>
        </div>

        {/* Standardized Metrics Widget */}
        <div className="d-flex gap-4 text-right">
            <div>
                <span className="text-xl font-bold text-primary block line-height-1" style={{ color: '#00d2ff' }}>{metrics.nodesExpanded}</span>
                <span className="text-xs text-muted" style={{ color: 'white' }}>Nodes</span>
            </div>
            <div>
                <span className="text-xl font-bold text-error block line-height-1" style={{ color: '#ff4d4d' }}>{metrics.backtracks}</span>
                <span className="text-xs text-muted" style={{ color: 'white' }}>Backtracks</span>
            </div>
        </div>
    </div>
</div>

                <div className="grid-layout" style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                    
                    {/* Controls */}
                    <Controls 
                        isPlaying={isPlaying} 
                        togglePlay={togglePlay}
                        onStepForward={handleStepForward} 
                        onStepBack={handleStepBack}
                        onReset={() => resetPuzzle()}
                        speed={speed} 
                        setSpeed={handleSpeedChange} 
                        algOptions={algOptions} 
                        setAlgOptions={handleAlgChange} 
                        canStepBack={historyIndex > 0} 
                        canStepForward={true}
                        onRunAC3={handleAC3}
                    />

                    {/* Board Area */}
                    <div className="d-flex justify-center" style={{ overflowX: 'auto', paddingBottom: '10px' }}>
                        <Board 
                            grid={board} 
                            domains={domains} 
                            size={9} 
                            initialGrid={initialBoardState} 
                            activeCell={activeCell} 
                            errorCell={errorCell} 
                            regionMapper={getStandardRegion} 
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdvancedPage;