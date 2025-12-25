import React from 'react';
import '../styles/Board.css';

const Cell = ({ val, domain, isFixed, status, regionId, hasRightBorder, hasBottomBorder }) => {
    let classes = `cell`;
    classes += regionId === -1 ? ` region-none` : ` region-${regionId}`;
    if (isFixed) classes += ' fixed';
    if (!isFixed && val !== 0) classes += ' tentative';
    if (status) classes += ` ${status}`;
    if (hasRightBorder) classes += ' border-right';
    if (hasBottomBorder) classes += ' border-bottom';

    return (
        <div className={classes}>
            {val !== 0 ? val : (
                <div className="cell-domain">
                    {domain && domain.map(d => <span key={d} className="domain-val">{d}</span>)}
                </div>
            )}
        </div>
    );
};
export default Cell;