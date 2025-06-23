// src/app_components/panels/ReservaPanel.tsx

import React, { useMemo } from 'react'; // Removed useState
import { AppUser, Role, Vehicle, Request as CautelaRequest, ModalType, RequestStatus, VehicleStatus, HistoryLog, ChecklistDataItem, FleetType } from '../../types'; 
import { translateStatus, HistoryIcon as TabHistoryIcon, ClipboardCheckIcon, CarIcon, PlusIcon, translateFleetType } from '../../constants';
import HistoryManagement from '../management/HistoryManagement';
import VehicleCard from '../ui/VehicleCard';
import './ReservaPanel.css';
import Spinner from '../ui/Spinner';
import { ReservaPanelTabId } from '../../App'; // Import tab ID type

interface ReservaPanelProps {
  currentUser: AppUser;
  vehicles: Vehicle[];
  requests: CautelaRequest[];
  users: AppUser[];
  historyLogs: HistoryLog[]; 
  openModal: (type: ModalType, data?: any) => void;
  isLoading: boolean;
  onProcessCheckoutApproval: (requestId: string, approved: boolean, observations?: string) => Promise<void>;
  onProcessCheckinConfirmation: (requestId: string, finalKm?: number, checkinChecklist?: any, observations?: string) => Promise<void>;
  onManualCautelaCreate: (
    vehicleId: string, 
    selectedUserId: string, 
    mission: string, 
    checkoutKm: number, 
    checkoutChecklist: ChecklistDataItem, 
    reservaObservations?: string
  ) => Promise<void>;
  activeTab: ReservaPanelTabId; 
  setActiveTab: (tab: ReservaPanelTabId) => void; 
}


const ReservaPanel: React.FC<ReservaPanelProps> = ({
  currentUser,
  vehicles,
  requests,
  users,
  historyLogs, 
  openModal,
  isLoading,
  onProcessCheckoutApproval,
  onProcessCheckinConfirmation,
  onManualCautelaCreate, 
  activeTab, 
  setActiveTab, 
}) => {
  const getUserName = (userId?: string) => users.find(u => u.id === userId)?.name || 'Desconhecido';

  const pendingCautionRequests = useMemo(() => 
    requests.filter(req => req.status === RequestStatus.PendenteReserva)
  , [requests]);

  const pendingCheckinRequests = useMemo(() => 
    requests.filter(req => req.status === RequestStatus.DevolucaoSolicitada)
  , [requests]);

  const vehiclesInUse = useMemo(() => 
    vehicles.filter(v => v.status === VehicleStatus.EmUso)
  , [vehicles]);
  
  const getRequestForVehicleInUse = (vehicleId: string): CautelaRequest | undefined => {
    return requests.find(r => r.vehicleId === vehicleId && r.status === RequestStatus.EmUso);
  }

  const availableVehicles = useMemo(() =>
    vehicles.filter(v => v.status === VehicleStatus.Disponivel)
  , [vehicles]);

  const maintenanceVehicles = useMemo(() =>
    vehicles.filter(v => v.status === VehicleStatus.Manutencao)
  , [vehicles]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderDashboard = () => (
    <div className="reserva-dashboard">
      <div className="reserva-quick-summary-panel">
        <div className="summary-item clickable" onClick={() => scrollToSection('section-pending-cautelas')} title="Ir para Solicitações de Cautela Pendentes">
          <span className="summary-icon">📝</span>
          <span className="summary-label">Cautelas Pendentes</span>
          <span className="summary-count">{pendingCautionRequests.length}</span>
        </div>
        <div className="summary-item clickable" onClick={() => scrollToSection('section-pending-devolucoes')} title="Ir para Solicitações de Devolução Pendentes">
          <span className="summary-icon">🔁</span>
          <span className="summary-label">Devoluções Pendentes</span>
          <span className="summary-count">{pendingCheckinRequests.length}</span>
        </div>
        <div className="summary-item clickable" onClick={() => scrollToSection('section-in-use-vehicles')} title="Ir para Viaturas em Uso">
          <span className="summary-icon">🚗</span>
          <span className="summary-label">Viaturas em Uso</span>
          <span className="summary-count">{vehiclesInUse.length}</span>
        </div>
        <div className="summary-item clickable" onClick={() => scrollToSection('section-maintenance-vehicles')} title="Ir para Viaturas em Manutenção">
          <span className="summary-icon">🛠️</span>
          <span className="summary-label">Em Manutenção</span>
          <span className="summary-count">{maintenanceVehicles.length}</span>
        </div>
        <div className="summary-item clickable" onClick={() => scrollToSection('section-available-vehicles')} title="Ir para Viaturas Disponíveis">
          <span className="summary-icon">✅</span>
          <span className="summary-label">Disponíveis</span>
          <span className="summary-count">{availableVehicles.length}</span>
        </div>
      </div>

      {/* Solicitações de Cautela Pendentes */}
      <section className="panel-section" id="section-pending-cautelas">
        <h3 className="reserva-section-title pending-caution">
          📝 Cautelas Pendentes ({pendingCautionRequests.length})
        </h3>
        {pendingCautionRequests.length > 0 ? (
          <div className="request-list">
            {pendingCautionRequests.map(req => (
              <div key={req.id} className="request-item-card card">
                <div className="request-card-header">
                  <h4>Viatura: {req.vehiclePrefixo}</h4>
                  <ClipboardCheckIcon className="card-icon" />
                </div>
                <p><strong>Solicitante:</strong> {getUserName(req.userId)}</p>
                <p><strong>Missão:</strong> {req.mission}</p>
                <p><strong>Data Solicitação:</strong> {new Date(req.requestTimestamp).toLocaleString('pt-BR')}</p>
                <button 
                  className="button analyze-caution-button"
                  onClick={() => openModal('approvalModal', { request: req })}
                >
                  Analisar Cautela
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state-reserva">Nenhuma solicitação de cautela pendente.</p>
        )}
      </section>

      {/* Solicitações de Devolução Pendentes */}
      <section className="panel-section" id="section-pending-devolucoes">
        <h3 className="reserva-section-title pending-checkin">
          🔁 Devolução Pendentes ({pendingCheckinRequests.length})
        </h3>
        {pendingCheckinRequests.length > 0 ? (
          <div className="request-list">
            {pendingCheckinRequests.map(req => (
              <div key={req.id} className="request-item-card card">
                 <div className="request-card-header">
                  <h4>Viatura: {req.vehiclePrefixo}</h4>
                   <ClipboardCheckIcon className="card-icon" />
                </div>
                <p><strong>Solicitante:</strong> {getUserName(req.userId)}</p>
                <p><strong>KM Devolução:</strong> {req.checkinKm?.toLocaleString('pt-BR') || 'Não informado'}</p>
                <p><strong>Obs. Devolução:</strong> {req.checkinObservations || 'Nenhuma'}</p>
                <p><strong>Data Solic. Devolução:</strong> {req.checkinRequestTimestamp ? new Date(req.checkinRequestTimestamp).toLocaleString('pt-BR') : 'N/A'}</p>
                <button 
                  className="button confirm-checkin-button"
                  onClick={() => openModal('approveCheckinModal', { request: req })}
                >
                  Confirmar Recebimento
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state-reserva">Nenhuma devolução pendente.</p>
        )}
      </section>

      {/* Viaturas em Uso */}
      <section className="panel-section" id="section-in-use-vehicles">
        <h3 className="reserva-section-title in-use-vehicles">
          🚗 Viaturas em Uso ({vehiclesInUse.length})
        </h3>
        {vehiclesInUse.length > 0 ? (
          <div className="vehicle-list-reserva">
            {vehiclesInUse.map(v => {
              const currentReq = getRequestForVehicleInUse(v.id);
              return (
                <div 
                  key={v.id} 
                  className="vehicle-in-use-card card" 
                >
                  <div className="request-card-header">
                    <h4>{v.prefixo} - {v.modelo}</h4>
                     <CarIcon className="card-icon"/>
                  </div>
                  <p><strong>Condutor:</strong> {getUserName(v.currentDriverId)}</p>
                  <p><strong>Missão:</strong> {currentReq?.mission || 'N/A'}</p>
                  <p><strong>Tipo Frota:</strong> {translateFleetType(v.frota)}</p>
                  <p><strong>KM Atual:</strong> {v.km.toLocaleString('pt-BR')}</p>
                  <p><strong>Retirada em:</strong> {currentReq?.checkoutTimestamp ? new Date(currentReq.checkoutTimestamp).toLocaleString('pt-BR') : 'N/A'}</p>
                  <div className="vehicle-in-use-actions">
                    <button
                        className="button button-outline view-history-button"
                        onClick={() => openModal('vehicleCautelaHistory', { vehicle: v })}
                        title={`Ver histórico de cautelas para ${v.prefixo}`}
                    >
                        Histórico
                    </button>
                    {currentReq && (
                        <button
                            className="button register-devolution-button"
                            onClick={() => openModal('approveCheckinModal', { request: currentReq })}
                            title={`Registrar devolução da viatura ${v.prefixo} pela Reserva`}
                        >
                            <ClipboardCheckIcon className="button-icon" /> Registrar Devolução
                        </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-state-reserva">Nenhuma viatura em uso.</p>
        )}
      </section>
      
      {/* Viaturas Disponíveis */}
      <section className="panel-section" id="section-available-vehicles">
        <h3 className="reserva-section-title available-vehicles">
          ✅ Viaturas Disponíveis ({availableVehicles.length})
        </h3>
        {availableVehicles.length > 0 ? (
          <div className="vehicle-grid-reserva">
            {availableVehicles.map(vehicle => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                onClick={(v) => openModal('vehicleCautelaHistory', { vehicle: v })}
              />
            ))}
          </div>
        ) : (
          <p className="empty-state-reserva">Nenhuma viatura disponível no momento.</p>
        )}
      </section>

      {/* Viaturas em Manutenção */}
      <section className="panel-section" id="section-maintenance-vehicles">
        <h3 className="reserva-section-title maintenance-vehicles">
          🛠️ Viaturas em Manutenção ({maintenanceVehicles.length})
        </h3>
        {maintenanceVehicles.length > 0 ? (
          <div className="vehicle-grid-reserva">
            {maintenanceVehicles.map(vehicle => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                isMaintenanceCard={true} 
                onClick={(v) => openModal('vehicleCautelaHistory', { vehicle: v })}
              />
            ))}
          </div>
        ) : (
          <p className="empty-state-reserva">Nenhuma viatura em manutenção.</p>
        )}
      </section>
    </div>
  );

  return (
    <div className="reserva-panel">
      <h2 className="panel-title">Painel da Reserva</h2>
      <div className="admin-tabs"> {/* Reusing admin-tabs styling for consistency */}
        <div className="tabs-navigation-group">
          <button
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <ClipboardCheckIcon className="tab-icon" /> Painel Reserva
          </button>
          <button
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <TabHistoryIcon className="tab-icon" /> Histórico
          </button>
        </div>
        <button
            className="button create-cautela-header-button"
            onClick={() => openModal('manualCautelaForm')}
            disabled={isLoading}
            title="Criar uma nova cautela manualmente"
        >
            <PlusIcon /> Criar Cautela
        </button>
      </div>
      <div className="admin-tab-content">
        {isLoading && <Spinner message="Carregando dados da reserva..." />}
        {!isLoading && activeTab === 'dashboard' && renderDashboard()}
        {!isLoading && activeTab === 'history' && (
          <HistoryManagement historyLogs={historyLogs} isLoading={isLoading} openModal={openModal} /> 
        )}
      </div>
    </div>
  );
};

export default ReservaPanel;