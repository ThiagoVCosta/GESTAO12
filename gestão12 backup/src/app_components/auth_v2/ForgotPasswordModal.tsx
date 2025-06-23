import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import './ForgotPasswordModal.css';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (matricula: string) => Promise<void>; // Changed to matricula
  isLoading: boolean;
  initialMessageData?: { successMessage?: string; errorMessage?: string };
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialMessageData,
}) => {
  const [matricula, setMatricula] = useState(''); // Changed from email to matricula
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setMatricula(''); // Reset matricula field
    if (initialMessageData?.successMessage) {
        setMessage({ type: 'success', text: initialMessageData.successMessage });
    } else if (initialMessageData?.errorMessage) {
        setMessage({ type: 'error', text: initialMessageData.errorMessage });
    } else {
        setMessage(null);
    }
  }, [isOpen, initialMessageData]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!matricula.trim()) { // Basic validation for matricula
      setMessage({ type: 'error', text: "Por favor, insira sua matrícula." });
      return;
    }
    if (isLoading) return;
    await onSubmit(matricula); // Pass matricula
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recuperar Senha"
      size="sm"
      footer={
        <>
          <button type="button" className="button button-secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button type="submit" form="forgot-password-form" className="button" disabled={isLoading}>
            {isLoading ? <Spinner small={true} /> : 'Enviar Solicitação'}
          </button>
        </>
      }
    >
      <form id="forgot-password-form" onSubmit={handleSubmit} className="modal-form">
        <p className="modal-instruction">
          Insira sua matrícula cadastrada abaixo. Um link para redefinição de senha será enviado para o email pessoal associado a ela.
        </p>
        {message && (
          <p className="modal-observation">
            OBS: SE PERDEU ACESSO A ESSE EMAIL, CONTATE O MILITAR ADMINISTRADOR DO SISTEMA.
          </p>
        )}
        <div className="form-group">
          <label htmlFor="matricula-forgot">Matrícula:</label> {/* Changed label */}
          <input
            type="text" // Changed type to text
            id="matricula-forgot"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            disabled={isLoading || !!message?.type}
            required
            autoFocus
            placeholder="Sua matrícula" // Changed placeholder
          />
        </div>
        {message && (
          <p className={message.type === 'error' ? 'auth-error form-error' : 'form-success-message'}>
            {message.text}
          </p>
        )}
      </form>
    </Modal>
  );
};

export default ForgotPasswordModal;