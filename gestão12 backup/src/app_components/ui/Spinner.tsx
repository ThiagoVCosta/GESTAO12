import React from 'react';
import './Spinner.css';

interface SpinnerProps {
  small?: boolean; // For inline spinners
  message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ small = false, message }) => {
  const spinnerClasses = `spinner ${small ? 'spinner-small' : ''}`;
  return (
    <div className={small ? 'spinner-container-small' : 'spinner-container-large'}>
      <div className={spinnerClasses}></div>
      {message && !small && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export default Spinner;
