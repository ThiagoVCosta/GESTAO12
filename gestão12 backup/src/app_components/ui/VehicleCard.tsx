import React from 'react';
import { Vehicle, VehicleStatus, FleetType } from '../../types';
import { translateStatus, translateFleetType } from '../../constants';
import './VehicleCard.css';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick?: (vehicle: Vehicle) => void;
  isMaintenanceCard?: boolean; // To alter style/info for maintenance list
  showCautelarButton?: boolean; // New prop to show "Cautelar" button
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onClick, isMaintenanceCard = false, showCautelarButton = false }) => {
  const cardClasses = `vehicle-card ${isMaintenanceCard ? 'maintenance' : ''} status-${vehicle.status.toLowerCase()}`;
  
  const handleCardClick = () => {
    if (onClick) {
      onClick(vehicle);
    }
  };

  return (
    <div className={cardClasses} onClick={onClick ? handleCardClick : undefined} tabIndex={onClick ? 0 : -1} onKeyPress={onClick ? (e) => e.key === 'Enter' && handleCardClick() : undefined}>
      <div className="card-header">
        <h3 className="vehicle-prefixo">{vehicle.prefixo}</h3>
        {!isMaintenanceCard && vehicle.status === VehicleStatus.Disponivel && (
           <span className="status-badge available">Disponível</span>
        )}
         {!isMaintenanceCard && vehicle.status !== VehicleStatus.Disponivel && (
           <span className={`status-badge ${vehicle.status.toLowerCase()}`}>{translateStatus(vehicle.status, 'vehicle')}</span>
        )}
        {isMaintenanceCard && (
            <span className="status-badge maintenance-badge">Manutenção</span>
        )}
      </div>
      <div className="card-body">
        <p className="vehicle-modelo">{vehicle.modelo}</p>
        <p className="vehicle-info">
          KM: <span className="vehicle-km">{vehicle.km.toLocaleString('pt-BR')}</span>
        </p>
        <p className="vehicle-info">
          Frota: <span className="vehicle-fleet-type">{translateFleetType(vehicle.frota)}</span>
        </p>
      </div>
      {/* Footer: Show "Cautelar" or "Detalhes" button only if not maintenance, vehicle is available, and onClick is provided */}
      {onClick && !isMaintenanceCard && vehicle.status === VehicleStatus.Disponivel && (
        <div className="card-footer">
          <button 
            className={`details-button ${showCautelarButton ? 'cautelar-action-button' : ''}`}
            onClick={handleCardClick} // Ensure button click also uses the main handler
            aria-label={showCautelarButton ? `Cautelar viatura ${vehicle.prefixo}` : `Ver detalhes da viatura ${vehicle.prefixo}`}
          >
            {showCautelarButton ? 'Cautelar' : 'Detalhes'}
          </button>
        </div>
      )}
       {/* Footer for maintenance cards (currently empty or for specific maintenance info) */}
       {isMaintenanceCard && (
        <div className="card-footer maintenance-footer">
          {/* Add specific info for maintenance if needed */}
        </div>
      )}
    </div>
  );
};

export default VehicleCard;