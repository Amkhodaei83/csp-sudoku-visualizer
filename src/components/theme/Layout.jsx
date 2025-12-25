import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import RobotCompanion from '../RobotCompanion'; // Import the robot here

const Layout = ({ children, robotStatus, robotSpeed }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  
  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    document.body.classList.toggle('light-mode');
  };

  return (
    <>
      <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      <div className="layout-container">
        
        {/* SIDEBAR */}
        <aside className={isSidebarOpen ? 'active' : ''} style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* 1. Header */}
          <div className="mb-6 text-center">
            <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--primary)', textShadow: '0 0 10px var(--primary-glow)' }}>
                🧩 AI Sudoku
            </h2>
            <p className="text-muted text-xs uppercase tracking-widest mt-1">Visualizer v2.0</p>
          </div>
          
          {/* 2. Better Nav Buttons (Glass Pill Style) */}
          <div className="nav-pill-container">
            <NavLink to="/homework" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
              6x6
            </NavLink>
            <NavLink to="/advanced" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
              9x9
            </NavLink>
          </div>

          {/* 3. ROBOT (Centered in sidebar) */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <RobotCompanion status={robotStatus} speed={robotSpeed} />
          </div>

        </aside>

        {/* MAIN CONTENT */}
        <main>
          {children}
        </main>
      </div>

      {/* Theme Toggle */}
      <div className="floating-actions">
        <button className="float-btn" onClick={toggleTheme}>
          {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      {/* Internal CSS for the Nav Pill */}
      <style>{`
        .nav-pill-container {
            background: rgba(0,0,0,0.3);
            padding: 5px;
            border-radius: 50px;
            display: flex;
            border: 1px solid rgba(255,255,255,0.1);
            margin-bottom: 20px;
        }
        .nav-pill {
            flex: 1;
            text-align: center;
            padding: 10px 0;
            border-radius: 40px;
            text-decoration: none;
            color: var(--text-muted);
            font-weight: bold;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }
        .nav-pill:hover {
            color: white;
            background: rgba(255,255,255,0.05);
        }
        .nav-pill.active {
            background: var(--primary);
            color: #000 !important;
            box-shadow: 0 4px 15px var(--primary-glow);
            transform: scale(1.05);
        }
      `}</style>
    </>
  );
};

export default Layout;