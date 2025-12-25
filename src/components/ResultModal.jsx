import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

const ResultModal = ({ status, onClose }) => {
    // 1. ALWAYS CALL HOOKS FIRST
    const [showPanel, setShowPanel] = useState(false);
    
    // Derived state is fine here
    const isWin = status === 'won';

    // 2. USE EFFECT (Always runs, handles the logic inside)
    useEffect(() => {
        if (status) {
            // Logic for when the modal opens
            if (isWin) {
                try {
                    const duration = 3000;
                    const end = Date.now() + duration;

                    const frame = () => {
                        confetti({
                            particleCount: 3, angle: 60, spread: 55, 
                            origin: { x: 0, y: 0.9 },
                            colors: ['#FFD700', '#FFA500', '#FF4500'],
                            zIndex: 3001
                        });
                        confetti({
                            particleCount: 3, angle: 120, spread: 55, 
                            origin: { x: 1, y: 0.9 },
                            colors: ['#00BFFF', '#1E90FF', '#4169E1'],
                            zIndex: 3001
                        });
                        if (Date.now() < end) requestAnimationFrame(frame);
                    };
                    setTimeout(frame, 500);
                } catch (err) {
                    console.error(err);
                }
            }

            // Show panel delay
            const timer = setTimeout(() => setShowPanel(true), 2500);
            return () => clearTimeout(timer);
        } else {
            // Reset state if status clears
            setShowPanel(false);
        }
    }, [status, isWin]); // Dependencies

    // 3. CONDITIONAL RETURN (Only AFTER all hooks are declared)
    if (!status) return null;

    // Styles
    const modalOverlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', zIndex: 3000,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    };

    const glassPanelStyle = {
        pointerEvents: showPanel ? 'auto' : 'none',
        opacity: showPanel ? 1 : 0,
        transform: showPanel ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(50px)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        padding: '40px 60px',
        borderRadius: '24px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        maxWidth: '500px'
    };

    const titleStyle = {
        fontSize: '48px', margin: '0 0 10px', fontWeight: '900',
        background: isWin ? 'linear-gradient(to right, #30CFD0 0%, #330867 100%)' 
                        : 'linear-gradient(to right, #ed213a 0%, #93291e 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
    };

    const buttonStyle = {
        background: isWin ? '#212121' : '#ff5252', color: 'white', border: 'none',
        padding: '14px 40px', fontSize: '16px', fontWeight: 'bold', borderRadius: '50px',
        cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
        transition: 'transform 0.2s', textTransform: 'uppercase', letterSpacing: '1px'
    };

    return (
        <div style={modalOverlayStyle}>
            {isWin && (
                <>
                    <div className="trumpet-left"><TrumpetSVG /></div>
                    <div className="trumpet-right"><TrumpetSVG /></div>
                </>
            )}

            <div style={glassPanelStyle}>
                <h2 style={titleStyle}>{isWin ? "VICTORY!" : "FAILED"}</h2>
                <p style={{ color: '#444', fontSize: '18px', marginBottom: '30px', fontWeight: '500' }}>
                    {isWin ? "The AI successfully solved the puzzle." : "The solver hit a dead end."}
                </p>
                <button 
                    onClick={onClose}
                    style={buttonStyle}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    Continue
                </button>
            </div>

            <style>{`
                .trumpet-left {
                    position: fixed; bottom: -20px; left: -60px; width: 250px;
                    transform: rotate(-30deg);
                    animation: slideInLeft 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    z-index: 2999;
                }
                .trumpet-right {
                    position: fixed; bottom: -20px; right: -60px; width: 250px;
                    transform: scaleX(-1) rotate(-30deg);
                    animation: slideInRight 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    z-index: 2999;
                }
                @keyframes slideInLeft {
                    from { transform: translate(-200px, 200px) rotate(-45deg); }
                    to { transform: translate(0, 0) rotate(-25deg); }
                }
                @keyframes slideInRight {
                    from { transform: translate(200px, 200px) scaleX(-1) rotate(-45deg); }
                    to { transform: translate(0, 0) scaleX(-1) rotate(-25deg); }
                }
            `}</style>
        </div>
    );
};

const TrumpetSVG = () => (
    <svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))' }}>
        <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDB931" />
                <stop offset="50%" stopColor="#FFFFE0" />
                <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
            <linearGradient id="goldDark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BF953F" />
                <stop offset="100%" stopColor="#AA771C" />
            </linearGradient>
        </defs>
        <path d="M 40 85 L 120 75 L 120 95 Z" fill="url(#goldDark)" />
        <rect x="40" y="80" width="80" height="10" rx="5" fill="url(#goldGrad)" />
        <path d="M 120 75 Q 160 30 190 10 L 190 160 Q 160 140 120 95 Z" fill="url(#goldGrad)" stroke="url(#goldDark)" strokeWidth="1" />
        <ellipse cx="190" cy="85" rx="10" ry="75" fill="rgba(0,0,0,0.1)" />
        <g transform="translate(60, 65)">
             <rect x="0" y="0" width="8" height="15" fill="#eee" rx="2" />
             <rect x="15" y="0" width="8" height="15" fill="#eee" rx="2" />
             <rect x="30" y="0" width="8" height="15" fill="#eee" rx="2" />
        </g>
    </svg>
);

export default ResultModal;