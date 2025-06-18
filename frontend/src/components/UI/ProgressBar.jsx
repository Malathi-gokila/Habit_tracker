import React from 'react';
import './ProgressBar.css'; // Create this CSS file

const ProgressBar = ({ value, max, label }) => {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  return (
    <div className="progress-bar-container">
      {label && <span className="progress-bar-label">{label}</span>}
      <div className="progress-bar-background">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin="0"
          aria-valuemax={max}
        >
          <span className="progress-bar-text">{`${value} / ${max} XP`}</span>
          {/* Or just {percentage}% */}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;