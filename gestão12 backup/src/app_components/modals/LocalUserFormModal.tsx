import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { AppUser, Role } from '../../types';
import { DEFAULT_INITIAL_PASSWORD } from '../../constants'; // DEFAULT_AUTH_EMAIL_DOMAIN is no longer needed here for authEmail construction
import Spinner from '../ui/Spinner';
// import './LocalUserFormModal.css'; // If specific styles are needed

interface LocalUserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Omit<AppUser, 'id' | 'hasSetInitialPassword'> | AppUser, isNew: boolean, initialPassword?: string) => Promise<void>;
  userToEdit?: AppUser;
  isLoading: boolean;
}

const LocalUserFormModal: React.FC<LocalUserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userToEdit,
  isLoading,
}) => {
  const [name, setName] = useState('');
  const [matricula, setMatricula] = useState('');
  const [role, setRole] = useState<Role>(Role.User);
  const [authEmail, setAuthEmail] = useState(''); // This will be the personal email used for auth
  const [isNewUser, setIsNewUser] = useState(true);

  useEffect(() => {
    if (userToEdit) {
      setIsNewUser(false);
      setName(userToEdit.name);
      setMatricula(userToEdit.matricula);
      setRole(userToEdit.role);
      setAuthEmail(userToEdit.authEmail); // authEmail is the personal email used for login
    } else {
      setIsNewUser(true);
      setName('');
      setMatricula('');
      setRole(Role.User);
      setAuthEmail('');
    }
  }, [isOpen, userToEdit]);

  // No longer need useEffect to derive authEmail from matricula

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!name.trim() || !matricula.trim() || !authEmail.trim()) {
        alert("Nome, Matrícula e Email Pessoal (Login) são obrigatórios.");
        return;
    }
    if (!authEmail.includes('@')) { // Basic validation for the auth/personal email
        alert("O Email Pessoal (Login) fornecido não parece ser válido.");
        return;
    }
    if (!Object.values(Role).includes(role)) {
        alert("Perfil inválido selecionado.");
        return;
    }

    const userDataBase = {
      name: name.trim(),
      matricula: matricula.trim(), // Matrícula is still stored
      role,
      authEmail: authEmail.trim(), // This is the personal email
    };

    if (isNewUser) {
        await onSubmit(userDataBase, true, DEFAULT_INITIAL_PASSWORD);
    } else if (userToEdit) {
        const updatedUserData: AppUser = {
            ...userToEdit,
            ...userDataBase,
            // authEmail is part of userDataBase, if it were editable, it'd be updated here.
            // But we've made it read-only for existing users to simplify.
        };
        await onSubmit(updatedUserData, false);
    }
  };
  
  const modalTitle = isNewUser ? 'Adicionar Novo Usuário' : `Editar Usuário: ${userToEdit?.name}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="md"
      footer={
        <>
          <button type="button" className="button button-secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button type="submit" form="user-form" className="button" disabled={isLoading}>
            {isLoading ? <Spinner small={true} /> : (isNewUser ? 'Adicionar Usuário' : 'Salvar Alterações')}
          </button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label htmlFor="userName">Nome Completo:</label>
          <input
            type="text"
            id="userName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="userMatricula">Matrícula (Identificação):</label>
          <input
            type="text"
            id="userMatricula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            disabled={isLoading} // Keep matricula editable for admin correction if needed, even if not primary auth ID
            required
          />
        </div>
         <div className="form-group">
          <label htmlFor="userAuthEmail">Email Pessoal (Login e Autenticação):</label>
          <input
            type="email"
            id="userAuthEmail"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            disabled={isLoading || !isNewUser} // Read-only for existing users to avoid Firebase email change complexities
            required
            placeholder={isNewUser ? "email.pessoal@exemplo.com" : "Email de login (não alterável aqui)"}
          />
          {!isNewUser && <small className="form-text text-muted">O email de login não pode ser alterado diretamente aqui após a criação do usuário.</small>}
        </div>
        {/* Removed separate personalEmail field as authEmail now serves this role for Firebase */}
        <div className="form-group">
          <label htmlFor="userRole">Perfil:</label>
          <select 
            id="userRole" 
            value={role} 
            onChange={(e) => setRole(e.target.value as Role)}
            disabled={isLoading}
            required
          >
            <option value={Role.User}>Policial</option>
            <option value={Role.Reserva}>Reserva</option>
            <option value={Role.Admin}>Administrador</option>
          </select>
        </div>
        {isNewUser && (
            <div className="form-group info-text">
                <p>A senha inicial para este novo usuário será: <strong>"{DEFAULT_INITIAL_PASSWORD}"</strong></p>
                <p>O usuário será solicitado a alterar esta senha no primeiro login.</p>
            </div>
        )}
      </form>
    </Modal>
  );
};

export default LocalUserFormModal;