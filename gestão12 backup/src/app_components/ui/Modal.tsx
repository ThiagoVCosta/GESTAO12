import React, { useEffect } from 'react';
import './Modal.css';
import { CloseIcon } from '../../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Optional size prop
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.classList.add('modal-open-noscroll');
    } else {
      document.body.classList.remove('modal-open-noscroll');
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.classList.remove('modal-open-noscroll');
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={`modal-content modal-size-${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">{title}</h2>
          <button onClick={onClose} className="modal-close-button" aria-label="Fechar modal">
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
