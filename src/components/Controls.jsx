import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Zap } from 'lucide-react';

const Controls = ({ 
    isPlaying, togglePlay, onStepForward, onStepBack, onReset, 
    speed, setSpeed, algOptions, setAlgOptions, canStepBack,
    onRunAC3 
}) => {
    
    // Visual style for disabled state
    const disabledStyle = {
        opacity: isPlaying ? 0.5 : 1,
        pointerEvents: isPlaying ? 'none' : 'auto', // Prevents clicking
        cursor: isPlaying ? 'not-allowed' : 'pointer'
    };

    return (
        <div className="card card-compact mb-4">
            {/* Header + AC3 Button */}
            <div className="d-flex justify-between items-center mb-3">
                <h4 className="m-0 text-primary">Configuration</h4>
                {onRunAC3 && (
                    <button 
                        onClick={onRunAC3} 
                        // Disable AC-3 button while playing too
                        disabled={isPlaying} 
                        className="btn btn-outline btn-sm py-1 text-xs" 
                        style={{borderWidth:'1px', ...disabledStyle}}
                    >
                        <Zap size={14} style={{display:'inline'}}/> Run AC-3
                    </button>
                )}
            </div>

            {/* Checkboxes - Compact Grid */}
            <div className="d-flex gap-4 mb-3 text-sm flex-wrap">
                
                <label className="checkbox-group m-0" style={disabledStyle}>
                    <input 
                        type="checkbox" 
                        checked={algOptions.useMRV}
                        onChange={(e) => setAlgOptions({...algOptions, useMRV: e.target.checked})} 
                        disabled={isPlaying} // <--- Disable Input
                    /> 
                    <span>MRV</span>
                </label>

                <label className="checkbox-group m-0" style={disabledStyle}>
                    <input 
                        type="checkbox" 
                        checked={algOptions.useLCV}
                        onChange={(e) => setAlgOptions({...algOptions, useLCV: e.target.checked})} 
                        disabled={isPlaying} // <--- Disable Input
                    /> 
                    <span>LCV</span>
                </label>

                <label className="checkbox-group m-0" style={disabledStyle}>
                    <input 
                        type="checkbox" 
                        checked={algOptions.useForwardChecking}
                        onChange={(e) => setAlgOptions({...algOptions, useForwardChecking: e.target.checked})} 
                        disabled={isPlaying} // <--- Disable Input
                    /> 
                    <span>Forward Check</span>
                </label>
            </div>

            <div style={{ height: '1px', background: 'var(--border)', marginBottom: '15px' }}></div>

            {/* Controls Row */}
            <div className="d-flex gap-2 items-center">
                <button onClick={onReset} className="btn btn-error btn-sm px-3" title="Reset">
                    <RotateCcw size={16} />
                </button>
                
                <div className="d-flex gap-1 flex-1 justify-center">
                    <button onClick={onStepBack} disabled={!canStepBack || isPlaying} className="btn btn-outline btn-sm px-2">
                        <SkipBack size={16} />
                    </button>
                    <button onClick={togglePlay} className={`btn btn-sm ${isPlaying ? 'btn-warning' : 'btn-success'}`} style={{minWidth:'90px'}}>
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button onClick={onStepForward} disabled={isPlaying} className="btn btn-outline btn-sm px-2">
                        <SkipForward size={16} />
                    </button>
                </div>

                {/* Compact Speed Slider */}
                <div style={{ width: '100px' }}>
                    <div className="d-flex justify-between text-xs text-muted">
                        <span>Speed</span>
                        <span>{speed}%</span>
                    </div>
                    <input type="range" min="1" max="100" value={speed} 
                        onChange={(e) => setSpeed(Number(e.target.value))} style={{height:'4px'}} />
                </div>
            </div>
        </div>
    );
};

export default Controls;