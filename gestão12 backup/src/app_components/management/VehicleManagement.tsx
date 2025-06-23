import React from 'react';
import { Vehicle, ModalType, VehicleStatus, FleetType } from '../../types';
import { translateStatus, translateFleetType, PlusIcon } from '../../constants';
import Spinner from '../ui/Spinner';
import './ManagementPages.css'; // Shared styles for management tables

interface VehicleManagementProps {
  vehicles: Vehicle[];
  openModal: (type: ModalType, data?: any) => void;
  isLoading: boolean;
}

const VehicleManagement: React.FC<VehicleManagementProps> = ({ 
  vehicles, 
  openModal, 
  isLoading 
}) => {
  return (
    <div className="management-page">
      <div className="management-header">
        <h3 className="management-title">Gerenciar Frota</h3>
        <button className="button add-button" onClick={() => openModal('vehicleForm')}>
          <PlusIcon /> Adicionar Viatura
        </button>
      </div>

      {isLoading && vehicles.length === 0 ? (
        <Spinner message="Carregando viaturas..." />
      ) : (
        <div className="table-container">
          <table className="management-table">
            <thead>
              <tr>
                <th>Prefixo</th>
                <th>Viatura (Modelo)</th>
                <th>Status</th>
                <th>Frota</th>
                <th>KM</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(vehicle => (
                <tr key={vehicle.id}>
                  <td 
                    className="table-cell-prefixo clickable-cell" 
                    onClick={() => openModal('vehicleActions', { vehicle })}
                    title={`Ações para ${vehicle.prefixo}`}
                  >
                    {vehicle.prefixo}
                  </td>
                  <td>{vehicle.modelo}</td>
                  <td>
                    <span className={`status-tag status-${vehicle.status.toLowerCase()}`}>
                      {translateStatus(vehicle.status, 'vehicle')}
                    </span>
                  </td>
                  <td>{translateFleetType(vehicle.frota)}</td>
                  <td>{vehicle.km.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {vehicles.length === 0 && !isLoading && <p className="empty-state">Nenhuma viatura cadastrada.</p>}
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;