import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import { Vehicle, HistoryLog, AppUser, HistoryEventType, VehicleStatus } from '../../types'; // Added VehicleStatus
import Spinner from '../ui/Spinner';
import './VehicleCautelaHistoryModal.css';
import { translateStatus } from '../../constants'; // Import translateStatus

interface VehicleCautelaHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  historyLogs: HistoryLog[];
  users: AppUser[]; // For resolving names like Solicitante, Liberado por, Recebido por
  isLoading: boolean;
}

const VehicleCautelaHistoryModal: React.FC<VehicleCautelaHistoryModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  historyLogs,
  users,
  isLoading,
}) => {

  const getUserName = (userId?: string): string => {
    if (!userId) return 'N/A';
    const user = users.find(u => u.id === userId);
    return user ? user.name : `ID: ${userId}`;
  };
  
  const filteredVehicleHistory = useMemo(() => {
    return historyLogs
      .filter(log => log.details?.vehicleId === vehicle.id || log.details?.vehiclePrefixo === vehicle.prefixo)
      .sort((a,b) => {
        const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return dateB.getTime() - dateA.getTime();
    });
  }, [historyLogs, vehicle.id, vehicle.prefixo]);

  const formatNullableDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short'});
  };

  const currentDriverName = 
    (vehicle.status === VehicleStatus.EmUso || vehicle.status === VehicleStatus.AguardandoRecebimento) && vehicle.currentDriverId 
    ? getUserName(vehicle.currentDriverId) 
    : "Nenhum";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Histórico de Cautelas: ${vehicle.prefixo} (${vehicle.modelo})`}
      size="xl" // Use a larger modal for tables
      footer={
        <button type="button" className="button button-secondary" onClick={onClose}>
          Fechar
        </button>
      }
    >
      <div className="vehicle-cautela-history-content">
        <div className="vehicle-current-details card">
          <div className="detail-item">
            <span className="detail-label">Status Atual:</span>
            <span className={`detail-value status-${vehicle.status.toLowerCase()}`}>
              {translateStatus(vehicle.status, 'vehicle')}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Condutor Atual:</span>
            <span className="detail-value">{currentDriverName}</span>
          </div>
        </div>

        {isLoading && filteredVehicleHistory.length === 0 ? (
          <Spinner message="Carregando histórico da viatura..." />
        ) : (
          <div className="table-container">
            <table className="management-table">
              <thead>
                <tr>
                  <th>Viatura</th>
                  <th>Solicitante</th>
                  <th>Liberado por (Reserva)</th>
                  <th>Recebido por (Reserva)</th>
                  <th>Data/Hora Retirada</th>
                  <th>Data/Hora Devolução</th>
                  <th>Missão</th> 
                </tr>
              </thead>
              <tbody>
                {filteredVehicleHistory.map(log => (
                  <tr key={log.id}>
                    <td className="table-cell-prefixo">{log.details?.vehiclePrefixo || vehicle.prefixo}</td>
                    <td>{log.details?.solicitanteName || (log.eventType === 'REQUEST_CREATED' ? log.userName : 'N/A')}</td>
                    <td>{log.details?.liberadorNameReserva || 'N/A'}</td>
                    <td>{log.details?.recebedorNameReserva || 'N/A'}</td>
                    <td>{formatNullableDate(log.details?.checkoutTimestamp || (log.eventType === 'REQUEST_CHECKOUT' ? log.timestamp : undefined))}</td>
                    <td>{formatNullableDate(log.details?.checkinConfirmationTimestamp || (log.eventType === 'REQUEST_CHECKIN_CONFIRMED' ? log.timestamp : undefined))}</td>
                    <td>{log.details?.mission || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredVehicleHistory.length === 0 && !isLoading && (
              <p className="empty-state">Nenhum registro de cautela encontrado para esta viatura.</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default VehicleCautelaHistoryModal;