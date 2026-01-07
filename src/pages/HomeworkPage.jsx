import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/theme/Layout';
import Board from '../components/Board';
import Controls from '../components/Controls';
import ResultModal from '../components/ResultModal';
import { CSP } from '../algorithms/CSP';
import { solveGenerator } from '../algorithms/Solver';
import { ac3Generator } from '../algorithms/AC3';

// Import Jigsaw Data & Generator
import { JIGSAW_MAPS, getRegionFromMap } from '../data/jigsawMaps';
import { generateJigsawPuzzle } from '../algorithms/JigsawGenerator';

const HomeworkPage = () => {
    // --- State ---
    const [currentMapIndex, setCurrentMapIndex] = useState(0);
    const [currentMap, setCurrentMap] = useState(JIGSAW_MAPS[0].map); // Default: Vertical
    
    // Board State
    const [initialBoard, setInitialBoard] = useState([]);
    const [board, setBoard] = useState([]);
    const [domains, setDomains] = useState({});
    const [difficulty, setDifficulty] = useState(0.5);

    // History & Logic
    const [history, setHistory] = useState([]); 
    const [historyIndex, setHistoryIndex] = useState(-1);
    
    // Visual State
    const [activeCell, setActiveCell] = useState(null);
    const [errorCell, setErrorCell] = useState(null);
    const [metrics, setMetrics] = useState({ nodesExpanded: 0, backtracks: 0 });
    const [robotStatus, setRobotStatus] = useState('idle');
    const [winStatus, setWinStatus] = useState(null); 
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(50);
    const [algOptions, setAlgOptions] = useState({
        useMRV: true,
        useLCV: false,
        useForwardChecking: true
    });

    const solverIterRef = useRef(null);
    const cspRef = useRef(null);
    const timerRef = useRef(null);

    // Dynamic Region Mapper for the Board Component
    const dynamicRegionMapper = (row, col) => {
        return getRegionFromMap(currentMap, row, col);
    };

    // Initialize on load
    useEffect(() => { handleGenerate(true); }, []);

    // --- GENERATOR LOGIC ---
    const handleGenerate = (isInitial = false) => {
        // Only show "thinking" emotion if the user clicked the button
        if (!isInitial) setRobotStatus('thinking');
        
        // 1. Pick a random map configuration
        const randIndex = Math.floor(Math.random() * JIGSAW_MAPS.length);
        const selectedMapObj = JIGSAW_MAPS[randIndex];
        
        setCurrentMapIndex(randIndex);
        setCurrentMap(selectedMapObj.map);

        // 2. Generate a valid puzzle for this specific map geometry
        const newPuzzle = generateJigsawPuzzle(selectedMapObj.map, difficulty);
        
        setInitialBoard([...newPuzzle]);
        resetPuzzle(newPuzzle, selectedMapObj.map);
        
        // Only show "surprised" emotion if the user clicked the button
        if (!isInitial) {
            setTimeout(() => setRobotStatus('surprised'), 500);
        }
    };

    const resetPuzzle = (grid = initialBoard, map = currentMap) => {
        stopTimer();
        setIsPlaying(false);
        setWinStatus(null);
        setRobotStatus('idle');
        
        // Initialize CSP with the dynamic region function
        const regionFunc = (r, c) => getRegionFromMap(map, r, c);
        const newCSP = new CSP(6, grid, regionFunc);
        
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

    // --- SOLVER LOGIC ---
    const triggerEmotion = (e) => {
        setRobotStatus(e);
        setTimeout(() => setRobotStatus(isPlaying ? 'thinking' : 'idle'), 1500);
    };
    const handleAlgChange = (o) => { setAlgOptions(o); triggerEmotion('smart'); };
    const handleSpeedChange = (s) => { setSpeed(s); if(s > 90) triggerEmotion('surprised'); };

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
            setWinStatus(value.success ? 'won' : 'lost');
            setRobotStatus(value.success ? 'won' : 'lost');
            return false;
        }

        if (value.type === 'LOG') return computeNextStep();

        if (value.type === 'BACKTRACK' || value.type === 'PRUNE_FAIL') setRobotStatus('frustrated');
        else setRobotStatus('thinking');

        const newFrame = {
            board: [...value.board],
            domains: value.domains || domains,
            activeCell: value.activeCell,
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

    const stopTimer = () => { if (timerRef.current) clearTimeout(timerRef.current); };

    useEffect(() => {
        if (isPlaying) {
            let delay = 0;
            if (speed < 100) {
                delay = Math.pow(100 - speed, 2) / 20; 
                delay = Math.max(0, delay);
            }
            const loop = () => {
                if (computeNextStep() && isPlaying) {
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
        if(historyIndex > 0) {
            const prev = historyIndex - 1;
            applyState(history[prev]);
            setHistoryIndex(prev);
        }
    };

    const handleAC3 = () => {
        if(history.length > 1 && !window.confirm("Restart puzzle to run AC-3?")) return;
        
        resetPuzzle(initialBoard, currentMap);
        triggerEmotion('confused');
        
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
        
        alert(`AC-3 Pre-processing complete. Pruned ${count} values.`);
    };

    return (
        <Layout robotStatus={robotStatus} robotSpeed={speed}>
            <div className="animate-fade-in p-2">
                <ResultModal status={winStatus} onClose={() => setWinStatus(null)} />

                {/* --- CUSTOM HEADER CARD (Requested Style) --- */}
                {/* --- CUSTOM HEADER CARD (FIXED LAYOUT) --- */}
                <div className="card mb-4" style={{ 
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '20px'
                }}>
                    
                    {/* ROW 1: Title (Left) and Metrics (Right) */}
                    <div className="d-flex justify-between items-start mb-4">
                        {/* Title Section */}
                        <div className="d-flex items-center gap-2">
                            <h2 className="m-0 text-xl" style={{ color: 'white' }}>Jigsaw: 6x6 Generator</h2>
                            <span className="badge badge-info text-xs">{JIGSAW_MAPS[currentMapIndex].name}</span>
                        </div>

                        {/* Metrics Widget (Moved Up) */}
                        <div className="d-flex gap-4 text-right">
                            <div>
                                <span className="text-xl font-bold block line-height-1" style={{ color: '#00d2ff' }}>{metrics.nodesExpanded}</span>
                                <span className="text-xs text-muted" style={{ color: 'rgba(255,255,255,0.7)' }}>Nodes</span>
                            </div>
                            <div>
                                <span className="text-xl font-bold block line-height-1" style={{ color: '#ff4d4d' }}>{metrics.backtracks}</span>
                                <span className="text-xs text-muted" style={{ color: 'rgba(255,255,255,0.7)' }}>Backtracks</span>
                            </div>
                        </div>
                    </div>

                    {/* ROW 2: Slider Controls (Full Width) */}
                    <div className="d-flex items-center gap-4" style={{ width: '100%' }}>
                        <span className="text-sm font-bold whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.9)', minWidth: '100px' }}>
                            Difficulty: {Math.floor(difficulty * 100)}%
                        </span>
                        
                        <input 
                            type="range" 
                            min="0.2" 
                            max="0.8" 
                            step="0.1" 
                            value={difficulty} 
                            onChange={(e) => setDifficulty(parseFloat(e.target.value))}
                            style={{ 
                                flex: 1,
                                height: '8px',
                                cursor: 'pointer',
                                accentColor: '#00d2ff',
                                borderRadius: '5px'
                            }}
                        />

                        <button 
                            onClick={() => handleGenerate(false)} 
                            style={{ 
                                padding: '10px 25px', 
                                fontSize: '14px', 
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                backgroundColor: 'white',
                                color: '#1976d2',
                                border: 'none',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            Generate New
                        </button>
                    </div>
                </div>
                {/* ------------------------------------------- */}
                {/* ------------------------------------------- */}

                <div className="grid-layout" style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                    
                    <Controls 
                        isPlaying={isPlaying} togglePlay={togglePlay}
                        onStepForward={handleStepForward} onStepBack={handleStepBack}
                        onReset={() => resetPuzzle(initialBoard, currentMap)}
                        speed={speed} setSpeed={handleSpeedChange} 
                        algOptions={algOptions} setAlgOptions={handleAlgChange} 
                        canStepBack={historyIndex > 0} canStepForward={true}
                        onRunAC3={handleAC3}
                    />

                    <div className="d-flex justify-center" style={{ overflowX: 'auto', paddingBottom: '10px' }}>
                        <Board 
                            grid={board} 
                            domains={domains} 
                            size={6} 
                            initialGrid={initialBoard} 
                            activeCell={activeCell} 
                            errorCell={errorCell} 
                            regionMapper={dynamicRegionMapper} 
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default HomeworkPage;