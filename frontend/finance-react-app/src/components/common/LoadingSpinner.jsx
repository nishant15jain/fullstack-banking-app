import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-state">
      <div className="spinner"></div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
