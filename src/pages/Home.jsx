import React from 'react';
import { Link } from 'react-router-dom';
const Home = () => (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>CSP Solver</h1>
        <Link to="/homework" style={{ margin: '20px', fontSize: '20px' }}>Homework</Link>
        <Link to="/advanced" style={{ margin: '20px', fontSize: '20px' }}>Advanced</Link>
    </div>
);
export default Home;