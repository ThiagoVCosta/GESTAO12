import React from 'react';
import { AppUser, Role } from '../../types';
import './LocalHeader.css';
import { LogoutIcon, SettingsIcon, UsersIcon, CarIcon as CautelasIcon, ClipboardIcon } from '../../constants'; // BellIcon removed

interface LocalHeaderProps {
  unitName: string;
  currentUser: AppUser;
  currentEffectiveRole: Role; 
  // unreadNotificationCount: number; // Prop removed
  onNavigateToAdminView?: () => void;
  onNavigateToReservaView?: () => void;
  onNavigateToUserView?: () => void; // For "CAUTELAS"
  onOpenAccountSettings: () => void;
  // onOpenNotificationPanel: () => void; // Prop removed
  onLogout: () => void;
}

const LocalHeader: React.FC<LocalHeaderProps> = ({
  unitName,
  currentUser,
  currentEffectiveRole,
  // unreadNotificationCount, // Prop removed
  onNavigateToAdminView,
  onNavigateToReservaView,
  onNavigateToUserView,
  onOpenAccountSettings,
  // onOpenNotificationPanel, // Prop removed
  onLogout,
}) => {
  const originalRoleName = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1).toLowerCase();

  const nameParts = currentUser.name.split(' ');
  const posto = nameParts[0] || '';
  const nomeGuerra = nameParts.slice(1).join(' ');
  const displayUserName = `${posto} ${nomeGuerra}`.trim();

  const canShowAdminNav = currentUser.role === Role.Admin;
  const canShowReservaNav = currentUser.role === Role.Admin || currentUser.role === Role.Reserva;
  const canShowCautelasNav = currentUser.role === Role.Admin || currentUser.role === Role.Reserva;

  return (
    <header className="local-header">
      <div className="header-brand">
        <img src="/assets/logo.png" alt="Logo SGV" className="header-brand-logo" />
        <span className="header-title-text">GESTÃO {unitName}</span>
      </div>

      <div className="header-nav-views">
        {canShowAdminNav && onNavigateToAdminView && (
          <button
            onClick={onNavigateToAdminView}
            className={`header-nav-button ${currentEffectiveRole === Role.Admin ? 'active' : ''}`}
            title="Visualizar Painel Admin"
          >
            <UsersIcon /> ADMIN
          </button>
        )}
        {canShowReservaNav && onNavigateToReservaView && (
          <button
            onClick={onNavigateToReservaView}
            className={`header-nav-button ${currentEffectiveRole === Role.Reserva && currentUser.role === Role.Reserva ? 'active' : ''}`}
            title="Visualizar Painel Reserva"
          >
            <ClipboardIcon /> RESERVA
          </button>
        )}
         {canShowCautelasNav && onNavigateToUserView && (
          <button
            onClick={onNavigateToUserView}
            className={`header-nav-button ${currentEffectiveRole === Role.User ? 'active' : ''}`}
            title="Visualizar Painel de Cautelas (Policial)"
          >
            <CautelasIcon /> CAUTELAS
          </button>
        )}
      </div>

      <div className="header-actions">
        <div className="user-greeting">
          <span className="user-name-bold">{displayUserName}</span>
          <span className="user-role-detail">{originalRoleName}</span>
        </div>
        {/* Notification Bell Button Removed */}
        <button 
            onClick={onOpenAccountSettings}
            className="header-button account-settings-button icon-only-button" 
            title="Configurações da Conta"
        >
            <SettingsIcon />
        </button>
        <button onClick={onLogout} className="header-button logout-button icon-only-button" title="Sair do Sistema">
          <LogoutIcon />
        </button>
      </div>
    </header>
  );
};

export default LocalHeader;