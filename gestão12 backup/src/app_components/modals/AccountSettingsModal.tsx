import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import { AppUser } from '../../types';
import { EmailIcon, LockClosedIcon } from '../../constants';
import './AccountSettingsModal.css';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  // onChangeEmail removed
  onChangePassword: (currentPasswordForPwd: string, newPassword: string) => Promise<void>;
  // isLoadingEmail removed
  isLoadingPassword: boolean;
  // emailError removed
  passwordError: string | null;
  clearAuthErrors: () => void;
}

const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  // onChangeEmail, // Removed
  onChangePassword,
  // isLoadingEmail, // Removed
  isLoadingPassword,
  // emailError, // Removed
  passwordError,
  clearAuthErrors,
}) => {
  // Email change states removed
  // const [newEmail, setNewEmail] = useState('');
  // const [confirmNewEmail, setConfirmNewEmail] = useState('');
  // const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');

  const [currentPasswordForPwd, setCurrentPasswordForPwd] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset fields when modal opens
      // Email fields reset removed
      setCurrentPasswordForPwd('');
      setNewPassword('');
      setConfirmNewPassword('');
      clearAuthErrors(); // Clear previous errors
    }
  }, [isOpen, clearAuthErrors]);

  // handleEmailChangeSubmit function removed

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthErrors(); // Should only clear password error now
    if (newPassword.length < 6) {
      alert("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("As novas senhas não coincidem.");
      return;
    }
    if (!currentPasswordForPwd) {
        alert("Senha atual é obrigatória para alterar a senha.");
        return;
    }
    await onChangePassword(currentPasswordForPwd, newPassword);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurações da Conta"
      size="lg" // Can be md if content is less
      footer={
        <button type="button" className="button button-secondary" onClick={onClose}>
          Fechar
        </button>
      }
    >
      <div className="account-settings-content">
        <div className="current-email-display">
          <EmailIcon className="display-icon" />
          Email Atual: <strong>{currentUser.authEmail}</strong>
        </div>

        {/* Email Change Information Section */}
        <div className="settings-form card email-info-section">
          <p className="email-change-admin-notice">
            Caso queira mudar o email, contate o administrador.
          </p>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handlePasswordChangeSubmit} className="settings-form card">
          <h4 className="form-title"><LockClosedIcon/> Alterar Senha</h4>
          <div className="form-group">
            <label htmlFor="currentPasswordForPwd">Senha Atual:</label>
            <input
              type="password"
              id="currentPasswordForPwd"
              value={currentPasswordForPwd}
              onChange={(e) => setCurrentPasswordForPwd(e.target.value)}
              disabled={isLoadingPassword}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPasswordModal">Nova Senha:</label> {/* Changed id to avoid conflict */}
            <input
              type="password"
              id="newPasswordModal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              disabled={isLoadingPassword}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmNewPasswordModal">Confirmar Nova Senha:</label> {/* Changed id */}
            <input
              type="password"
              id="confirmNewPasswordModal"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              disabled={isLoadingPassword}
              required
            />
          </div>
          {passwordError && <p className="auth-error form-error">{passwordError}</p>}
          <button type="submit" className="button" disabled={isLoadingPassword}>
            {isLoadingPassword ? <Spinner small={true} /> : 'Salvar Nova Senha'}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default AccountSettingsModal;