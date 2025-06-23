import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import './SetInitialPasswordModal.css';

interface SetInitialPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: string, newPasswordPlain: string) => Promise<void>; // Removed personalEmail
  userId: string;
  isLoading: boolean;
}

const SetInitialPasswordModal: React.FC<SetInitialPasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userId,
  isLoading,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // const [personalEmail, setPersonalEmail] = useState(''); // Removed
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    // Email validation removed
    // if (!personalEmail.trim() || !personalEmail.includes('@')) {
    //   setError("Por favor, insira um email pessoal válido.");
    //   return;
    // }
    if (isLoading) return;
    await onSubmit(userId, newPassword); // Pass only userId and newPassword
    // onClose will be called by App.tsx after successful submission
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurar Senha Inicial" // Updated title
      size="md"
      footer={
        <>
          <button type="button" className="button button-secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button type="submit" form="set-initial-password-form" className="button" disabled={isLoading}>
            {isLoading ? <Spinner small={true} /> : 'Salvar Senha e Continuar'}
          </button>
        </>
      }
    >
      <form id="set-initial-password-form" onSubmit={handleSubmit} className="modal-form">
        <p className="modal-instruction">
          Este é seu primeiro acesso. Por favor, defina uma nova senha para sua conta.
        </p>
        <div className="form-group">
          <label htmlFor="newPassword">Nova Senha:</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
            required
            minLength={6}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Nova Senha:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        {/* Email input field removed
        <div className="form-group">
          <label htmlFor="personalEmail">Seu Email Pessoal (para recuperação):</label>
          <input
            type="email"
            id="personalEmail"
            value={personalEmail}
            onChange={(e) => setPersonalEmail(e.target.value)}
            disabled={isLoading}
            required
            placeholder="exemplo@seudominio.com"
          />
        </div>
        */}
        {error && <p className="auth-error form-error">{error}</p>}
      </form>
    </Modal>
  );
};

export default SetInitialPasswordModal;