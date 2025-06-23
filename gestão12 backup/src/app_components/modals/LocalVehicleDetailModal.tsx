// src/app_components/modals/LocalVehicleDetailModal.tsx

import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import { Vehicle, VehicleStatus, TranslateStatusType, AppUser, Request as CautelaRequest, RequestStatus, FleetType } from '../../types';
import { translateFleetType } from '../../constants';
import './LocalVehicleDetailModal.css';

interface LocalVehicleDetailModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onRequestVehicle: (vehicle: Vehicle) => void;
  onShowHistory: (vehicle: Vehicle) => void;
  translateStatus: TranslateStatusType;
  requests: CautelaRequest[]; // Added
  users: AppUser[]; // Added
}

const LocalVehicleDetailModal: React.FC<LocalVehicleDetailModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onRequestVehicle,
  onShowHistory,
  translateStatus,
  requests,
  users,
}) => {
  if (!isOpen) return null;

  const lastDriverInfo = useMemo(() => {
    if (vehicle.status !== VehicleStatus.Disponivel && vehicle.currentDriverId) {
       const currentDriver = users.find(u => u.id === vehicle.currentDriverId);
       return currentDriver ? `Em uso por ${currentDriver.name}` : `Em uso por ID: ${vehicle.currentDriverId}`;
    }

    const completedRequestsForVehicle = requests
      .filter(req => req.vehicleId === vehicle.id && req.status === RequestStatus.Concluido)
      .sort((a, b) => {
        // Ensure timestamps are valid before comparing
        const timeA = a.checkinConfirmationTimestamp ? new Date(a.checkinConfirmationTimestamp).getTime() : 0;
        const timeB = b.checkinConfirmationTimestamp ? new Date(b.checkinConfirmationTimestamp).getTime() : 0;
        return timeB - timeA; // Sort descending
      });

    if (completedRequestsForVehicle.length > 0) {
      const lastRequest = completedRequestsForVehicle[0];
      const lastDriver = users.find(user => user.id === lastRequest.userId);
      return lastDriver ? lastDriver.name : `Condutor desconhecido (ID: ${lastRequest.userId})`;
    }

    return "Nenhum uso recente registrado";
  }, [vehicle, requests, users]);


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalhes da Viatura: ${vehicle.prefixo}`}
      size="md"
      footer={
        <>
          <button className="button button-secondary" onClick={() => onShowHistory(vehicle)}>
            Histórico de Cautelas
          </button>
          <button 
            className="button" 
            onClick={() => onRequestVehicle(vehicle)}
            disabled={vehicle.status !== VehicleStatus.Disponivel}
          >
            Solicitar esta Viatura
          </button>
        </>
      }
    >
      <div className="vehicle-detail-content">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Modelo:</span>
            <span className="detail-value">{vehicle.modelo}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Placa:</span>
            <span className="detail-value">{vehicle.placa}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">KM Atual:</span>
            <span className="detail-value">{vehicle.km.toLocaleString('pt-BR')} km</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Tipo de Frota:</span>
            <span className="detail-value">{translateFleetType(vehicle.frota)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span className={`detail-value status-${vehicle.status.toLowerCase()}`}>
              {translateStatus(vehicle.status, 'vehicle')}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Último Condutor:</span>
            <span className="detail-value">{lastDriverInfo}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LocalVehicleDetailModal;