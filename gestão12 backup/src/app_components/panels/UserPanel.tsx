

import React from 'react';
import { AppUser, Vehicle, Request as CautelaRequest, ModalType, VehicleStatus, Role } from '../../types'; // Added Role
import VehicleCard from '../ui/VehicleCard';
import { translateStatus, ClipboardPencilIcon, SyncIcon } from '../../constants'; // Adicionado SyncIcon
import './UserPanel.css';

interface UserPanelProps {
  currentUser: AppUser;
  vehicles: Vehicle[];
  requests: CautelaRequest[];
  users: AppUser[]; // Added users prop
  openModal: (type: ModalType, data?: any) => void;
  isLoading: boolean;
}

const UserPanel: React.FC<UserPanelProps> = ({ currentUser, vehicles, requests, users, openModal, isLoading }) => {
  const vehicleInPossession = vehicles.find(v => 
    v.currentDriverId === currentUser.id && 
    (v.status === VehicleStatus.EmUso || v.status === VehicleStatus.AguardandoRecebimento)
  );
  const requestInPossession = vehicleInPossession ? requests.find(r => r.id === vehicleInPossession.currentRequestId) : null;

  const availableVehicles = vehicles.filter(v => v.status === VehicleStatus.Disponivel);
  const maintenanceVehicles = vehicles.filter(v => v.status === VehicleStatus.Manutencao);
  
  const handleVehicleCardClick = (vehicle: Vehicle) => {
    // Pass requests and users to the modal for last driver lookup
    openModal('vehicleDetail', { vehicle, requests, users });
  };
  
  const handleRequestDevolucao = () => {
    // A lógica para desabilitar o botão previne chamadas indevidas
    if (vehicleInPossession && requestInPossession && vehicleInPossession.status === VehicleStatus.EmUso) {
      openModal('checkinModal', { requestToReturn: requestInPossession, vehicleToReturn: vehicleInPossession });
    }
  };

  // Lógica para o botão de devolução
  let devolutionButtonText = "Solicitar Devolução";
  let isDevolutionButtonDisabled = false;
  let devolutionButtonIcon = <ClipboardPencilIcon className="button-icon"/>;
  let devolutionButtonClass = "button-success request-devolution-button";
  let devolutionButtonTitle = "Solicitar a devolução da viatura em sua posse";

  if (vehicleInPossession?.status === VehicleStatus.AguardandoRecebimento) {
      devolutionButtonText = "Aguardando Recebimento";
      isDevolutionButtonDisabled = true;
      devolutionButtonIcon = <SyncIcon />; 
      devolutionButtonClass = "button-secondary request-devolution-button"; 
      devolutionButtonTitle = "Sua solicitação de devolução está aguardando o recebimento pela Reserva.";
  }


  return (
    <div className="user-panel">
      {isLoading && <p>Carregando dados do painel...</p>}

      {/* Viatura em sua posse */}
      {vehicleInPossession && requestInPossession && (
        <section className="panel-section current-vehicle-section">
          <h2 className="section-title">Viatura em sua posse</h2>
          <div className="current-vehicle-card card">
            <div className="current-vehicle-header">
              <span className="current-vehicle-prefixo">{vehicleInPossession.prefixo}</span>
              <span className="current-vehicle-model">{vehicleInPossession.modelo}</span>
            </div>
            <div className="current-vehicle-details">
              <p><strong>Missão:</strong> {requestInPossession.mission || 'Não especificada'}</p>
              <p><strong>KM Atual:</strong> {vehicleInPossession.km.toLocaleString('pt-BR')} km</p>
              <p><strong>Retirada em:</strong> {new Date(requestInPossession.checkoutTimestamp!).toLocaleString('pt-BR')}</p>
            </div>
            <button 
              onClick={handleRequestDevolucao} 
              className={devolutionButtonClass}
              disabled={isDevolutionButtonDisabled}
              title={devolutionButtonTitle}
            >
              {devolutionButtonIcon} {devolutionButtonText}
            </button>
          </div>
        </section>
      )}

      {/* Frota Disponível */}
      <section className="panel-section">
        <h2 className="section-title">Frota Disponível ({availableVehicles.length})</h2>
        {availableVehicles.length > 0 ? (
          <div className="vehicle-grid">
            {availableVehicles.map(vehicle => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                onClick={handleVehicleCardClick} 
                showCautelarButton={true} // Pass prop to show "Cautelar" button
              />
            ))}
          </div>
        ) : (
          <p className="empty-state">Nenhuma viatura disponível no momento.</p>
        )}
      </section>

      {/* Viaturas em Manutenção */}
      {maintenanceVehicles.length > 0 && (
        <section className="panel-section">
          <h2 className="section-title">Viaturas em Manutenção ({maintenanceVehicles.length})</h2>
          <div className="vehicle-grid maintenance-grid">
            {maintenanceVehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} isMaintenanceCard={true} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default UserPanel;