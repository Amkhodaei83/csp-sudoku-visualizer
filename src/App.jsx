import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import HomeworkPage from './pages/HomeworkPage';
import AdvancedPage from './pages/AdvancedPage';
import BackgroundOrbs from './components/theme/BackgroundOrbs';
import './styles/theme.css'; 
import './styles/Board.css';

function App() {
  return (
    <Router>
      <BackgroundOrbs />
      <Routes>
        {/* This line forces the app to go to /homework immediately */}
        <Route path="/" element={<Navigate to="/homework" replace />} />
        
        {/* Keep these if you still want to access them */}
        <Route path="/home" element={<Home />} /> 
        <Route path="/homework" element={<HomeworkPage />} />
        <Route path="/advanced" element={<AdvancedPage />} />
      </Routes>
    </Router>
  );
}

export default App;