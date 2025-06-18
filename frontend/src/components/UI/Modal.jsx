// src/components/UI/Modal.jsx
import React from 'react';
import './Modal.css'; // We'll create this CSS

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null; // Don't render if not open
  }

  // Prevent clicks inside the modal from closing it
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // Overlay covers the screen
    <div className="modal-overlay" onClick={onClose}>
      {/* Modal Content */}
      <div className="modal-content" onClick={handleContentClick}>
        {/* Close button */}
        <button className="modal-close-button" onClick={onClose} aria-label="Close modal">
          × {/* Simple 'X' */}
        </button>
        {/* Content passed from parent */}
        {children}
      </div>
    </div>
  );
};

export default Modal;