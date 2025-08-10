import React from 'react';

function InfoPopup({ onClose }) {
  return (
    <div className="info-overlay" onClick={onClose}>
      <div className="info-box" onClick={e => e.stopPropagation()}>
        <h3>About This App</h3>
        <p>This project demonstrates a 3-tier stack with a React frontend and Node backend.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default InfoPopup;
