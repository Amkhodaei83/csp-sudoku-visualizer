import React from 'react';
const Metrics = ({ nodes, backtracks }) => (
    <div style={{ padding: '10px', background: '#eee', borderRadius: '4px' }}>
        <strong>Nodes:</strong> {nodes} | <strong>Backtracks:</strong> {backtracks}
    </div>
);
export default Metrics;