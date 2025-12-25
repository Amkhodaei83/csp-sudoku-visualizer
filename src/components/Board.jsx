import React from 'react';
import Cell from './Cell';
import '../styles/Board.css';

const Board = ({ grid, domains, size, initialGrid, activeCell, errorCell, regionMapper }) => {
    
    // Pass CSS variable for grid columns
    const style = {
        '--size': size, // This allows CSS to know if it's 6 or 9 columns
    };

    return (
        <div className="sudoku-board" style={style}>
            {grid.map((val, index) => {
                const row = Math.floor(index / size);
                const col = index % size;
                const regionId = regionMapper(row, col);

                // Border Logic
                let rightBorder = false;
                if (col < size - 1) {
                    const nextRegion = regionMapper(row, col + 1);
                    if (regionId !== nextRegion) rightBorder = true;
                }

                let bottomBorder = false;
                if (row < size - 1) {
                    const belowRegion = regionMapper(row + 1, col);
                    if (regionId !== belowRegion) bottomBorder = true;
                }
                
                let status = null;
                if (index === activeCell) status = 'active';
                if (index === errorCell) status = 'error';
                
                return (
                    <Cell 
                        key={index}
                        val={val}
                        domain={domains[index]}
                        isFixed={initialGrid[index] !== 0}
                        status={status}
                        regionId={regionId}
                        hasRightBorder={rightBorder}
                        hasBottomBorder={bottomBorder}
                    />
                );
            })}
        </div>
    );
};

export default Board;