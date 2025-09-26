import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  onConfirm, 
  onCancel,
  type = 'danger' // 'danger', 'warning', 'info'
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          <h3 className="confirm-dialog-title">{title}</h3>
        </div>
        
        <div className="confirm-dialog-content">
          <p className="confirm-dialog-message">{message}</p>
        </div>
        
        <div className="confirm-dialog-actions">
          <button 
            className="cancel-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-btn ${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
