import React from 'react';
import Modal from '../ui/Modal';
import { AppUser, ModalType, Role } from '../../types';
import { EditIcon, DeleteIcon, KeyIcon } from '../../constants'; // Added KeyIcon
import './LocalUserActionsModal.css';

interface LocalUserActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser;
  currentUserAppUser: AppUser;
  openModal: (type: ModalType, data?: any) => void;
  onDeleteUser: (userId: string) => void;
  onAdminResetUserPassword: (userId: string) => void; // New prop
  isLoading: boolean;
}

const LocalUserActionsModal: React.FC<LocalUserActionsModalProps> = ({
  isOpen,
  onClose,
  user,
  currentUserAppUser,
  openModal,
  onDeleteUser,
  onAdminResetUserPassword, // New prop
  isLoading,
}) => {

  const handleEdit = () => {
    onClose(); // Close this actions modal first
    openModal('userForm', { user }); // Then open the new one
  };

  const handleDelete = () => {
    const userId = user.id; // Store id before potential closure issues
    onClose(); // Close this actions modal first
    onDeleteUser(userId); // This will open confirmDelete modal via App.tsx
  };

  const handleResetPassword = () => {
    const userId = user.id;
    onClose(); // Close the current actions modal before opening the confirmation
    onAdminResetUserPassword(userId);
    // Confirmation and actual reset logic is handled in App.tsx by onAdminResetUserPassword,
    // which opens a 'confirmDelete' modal.
  };

  const translateRole = (role: Role) => {
    switch (role) {
      case Role.Admin: return 'Administrador';
      case Role.Reserva: return 'Reserva';
      case Role.User: return 'Policial';
      default: return role;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ações para Usuário: ${user.name}`}
      size="sm"
      footer={
        <button type="button" className="button button-secondary" onClick={onClose}>
          Cancelar
        </button>
      }
    >
      <div className="local-actions-modal-content">
        <div className="item-info">
          <p><strong>Nome:</strong> {user.name}</p>
          <p><strong>Matrícula:</strong> {user.matricula}</p>
          <p><strong>Perfil:</strong> {translateRole(user.role)}</p>
        </div>
        <div className="actions-buttons-group">
          <button className="button action-modal-button" onClick={handleEdit} disabled={isLoading}>
            <EditIcon /> Editar Usuário
          </button>
          <button
            className="button action-modal-button" // Potentially style differently, e.g., button-warning or button-secondary
            onClick={handleResetPassword}
            disabled={isLoading || currentUserAppUser.id === user.id}
            title={currentUserAppUser.id === user.id ? "Você não pode resetar sua própria senha por aqui." : "Resetar Senha do Usuário"}
          >
            <KeyIcon /> Resetar Senha
          </button>
          <button
            className="button button-danger action-modal-button"
            onClick={handleDelete}
            disabled={isLoading || currentUserAppUser.id === user.id}
            title={currentUserAppUser.id === user.id ? "Você não pode excluir seu próprio usuário." : "Excluir Usuário"}
            >
            <DeleteIcon /> Excluir Usuário
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LocalUserActionsModal;