import React, { useState } from 'react';
import './MatriculaLoginScreen.css';
import { Role } from '../../types'; 
import { MOCK_LOGIN_PASSWORD } from '../../constants'; 

interface MatriculaLoginScreenProps {
  onLogin: (matricula: string, senha: string) => Promise<void>; // Changed to matricula
  authError: string | null;
  isLoading: boolean;
  onForgotPassword: () => void;
  isSimulatedMode: boolean; 
  quickLoginUsers?: Array<{ name: string; matricula: string; role: Role; authEmail: string; hasSetInitialPassword: boolean }>;
}

const MatriculaLoginScreen: React.FC<MatriculaLoginScreenProps> = ({
  onLogin,
  authError,
  isLoading,
  onForgotPassword,
  isSimulatedMode, 
  quickLoginUsers, 
}) => {
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Represents matricula
  const [senha, setSenha] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onLogin(loginIdentifier, senha); // Pass loginIdentifier as matricula
    }
  };

  const handleQuickLogin = (userMatricula: string) => { // Quick login uses matricula
    if (!isLoading) {
      // For simulated quick login, we still use MOCK_LOGIN_PASSWORD.
      // The onLogin handler in App.tsx will resolve matricula to authEmail if needed.
      onLogin(userMatricula, MOCK_LOGIN_PASSWORD);
    }
  };

  const translateRoleForButton = (role: Role) => {
    switch (role) {
      case Role.Admin: return 'Admin';
      case Role.Reserva: return 'Reserva';
      case Role.User: return 'Policial';
      default: return role;
    }
  }

  return (
    <div className="login-screen-container">
      <div className="login-card">
        <div className="login-logo-container">
          <img src="/assets/logo.png" alt="Logo SGV" className="login-logo" />
        </div>
        <h1 className="login-title">GIT - Gestão Interna de Trabalho 12ºBPM</h1>
        <p className="login-subtitle">Sistema de Gerenciamento</p>

        {isSimulatedMode && quickLoginUsers && quickLoginUsers.length > 0 && (
          <div className="simulated-login-options">
            <h2 className="simulated-login-title">Acesso Rápido (Modo Simulado)</h2>
            <div className="simulated-user-buttons-grid">
              {quickLoginUsers.map(user => (
                <button
                  key={user.matricula} 
                  className="button button-secondary simulated-login-button" 
                  onClick={() => handleQuickLogin(user.matricula)} // Use matricula for quick login
                  disabled={isLoading}
                  title={`Entrar como ${user.name} (${translateRoleForButton(user.role)})${!user.hasSetInitialPassword ? ' - Requer configuração de senha' : ''} (Mat: ${user.matricula})`}
                >
                  {user.name} ({translateRoleForButton(user.role)})
                  {!user.hasSetInitialPassword && <span className="setup-required-indicator">*</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="loginIdentifier">Matrícula:</label> {/* Changed label */}
            <input
              type="text" // Changed type to text for matricula
              id="loginIdentifier"
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
              disabled={isLoading}
              placeholder="Sua matrícula" // Changed placeholder
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="senha">Senha:</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={isLoading}
              placeholder="Sua senha"
            />
          </div>
          {authError && <p className="auth-error">{authError}</p>}
          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? 'Autenticando...' : 'Entrar'}
          </button>
          <div className="forgot-password-link">
            <a href="#" onClick={(e) => { e.preventDefault(); onForgotPassword(); }}>
              Esqueceu sua senha?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatriculaLoginScreen;