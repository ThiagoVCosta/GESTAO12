import React, { useState, useMemo } from 'react';
import { AppUser, ModalType, Role } from '../../types';
import { PlusIcon, SearchIcon } from '../../constants'; 
import Spinner from '../ui/Spinner';
import './ManagementPages.css'; // Shared styles

interface UserManagementProps {
  users: AppUser[];
  openModal: (type: ModalType, data?: any) => void;
  isLoading: boolean;
  // onDeleteUser is now handled via LocalUserActionsModal opening confirmDelete
}

const UserManagement: React.FC<UserManagementProps> = ({ users, openModal, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    let usersToFilter = [...users];
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase().trim();
      usersToFilter = usersToFilter.filter(user =>
        user.name.toLowerCase().includes(lowerSearchTerm) ||
        user.matricula.toLowerCase().includes(lowerSearchTerm) ||
        user.authEmail.toLowerCase().includes(lowerSearchTerm)
      );
    }
    return usersToFilter.sort((a,b) => a.name.localeCompare(b.name));
  }, [users, searchTerm]);

  const translateRole = (role: Role) => {
    switch (role) {
      case Role.Admin: return 'Admin';
      case Role.Reserva: return 'Reserva';
      case Role.User: return 'Policial';
      default: return role;
    }
  };


  return (
    <div className="management-page">
      <div className="management-header">
        <h3 className="management-title">Gerenciar Usuários</h3>
        <div className="filter-controls user-management-controls">
          <div className="search-input-group">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              className="filter-input search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Filtrar usuários por nome, matrícula ou email de autenticação"
            />
          </div>
          <button className="button add-button" onClick={() => openModal('userForm')}>
            <PlusIcon /> Adicionar Usuário
          </button>
        </div>
      </div>

      {isLoading && filteredUsers.length === 0 ? (
        <Spinner message="Carregando usuários..." />
      ) : (
        <div className="table-container">
          <table className="management-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Matrícula</th>
                <th>Email de Autenticação</th>
                <th>Perfil</th>
                {/* Ações header removed */}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td 
                    className="clickable-cell"
                    onClick={() => openModal('userActions', { user })}
                    title={`Ações para ${user.name}`}
                  >
                    {user.name}
                  </td>
                  <td>{user.matricula}</td>
                  <td>{user.authEmail}</td>
                  <td>{translateRole(user.role)}</td>
                  {/* Actions cell removed */}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && !isLoading && (
            <p className="empty-state">
              {searchTerm.trim() ? "Nenhum usuário encontrado para os filtros aplicados." : "Nenhum usuário cadastrado."}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;