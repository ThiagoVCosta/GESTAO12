import React from 'react';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
// import './LocalConfirmDeleteModal.css'; // If specific styles are needed

interface LocalConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void; // Can be async or sync
  title: string;
  message: string | React.ReactNode;
  isLoading: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const LocalConfirmDeleteModal: React.FC<LocalConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
  confirmButtonText = "Confirmar Exclusão",
  cancelButtonText = "Cancelar",
}) => {
  const handleConfirm = async () => {
    await onConfirm();
    // onClose will typically be called by the handler in App.tsx after the operation
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm" // Smaller modal for confirmations
      footer={
        <>
          <button type="button" className="button button-secondary" onClick={onClose} disabled={isLoading}>
            {cancelButtonText}
          </button>
          <button 
            type="button" 
            className="button button-danger" // Danger style for delete confirmation
            onClick={handleConfirm} 
            disabled={isLoading}
          >
            {isLoading ? <Spinner small={true} /> : confirmButtonText}
          </button>
        </>
      }
    >
      <div className="confirm-delete-message">
        {typeof message === 'string' ? <p>{message}</p> : message}
      </div>
    </Modal>
  );
};

export default LocalConfirmDeleteModal;
