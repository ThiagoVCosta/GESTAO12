import React from 'react';
import Modal from '../ui/Modal';
import { Vehicle, ModalType, VehicleStatus } from '../../types';
import { EditIcon, DeleteIcon, HistoryIcon, WrenchIcon, PlayCircleIcon } from '../../constants';
import './LocalVehicleActionsModal.css';

interface LocalVehicleActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  openModal: (type: ModalType, data?: any) => void;
  onDeleteVehicle: (vehicleId: string) => void;
  onToggleVehicleMaintenanceStatus: (vehicleId: string) => Promise<void>;
  isLoading: boolean;
}

const LocalVehicleActionsModal: React.FC<LocalVehicleActionsModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  openModal,
  onDeleteVehicle,
  onToggleVehicleMaintenanceStatus,
  isLoading,
}) => {

  const handleEdit = () => {
    onClose(); // Close this actions modal first
    openModal('vehicleForm', { vehicle }); // Then open the new one
  };

  const handleHistory = () => {
    onClose(); // Close this actions modal first
    openModal('vehicleCautelaHistory', { vehicle }); // Then open the new one
  };

  const handleDelete = () => {
    const vehicleId = vehicle.id; // Store id before potential closure issues
    onClose(); // Close this actions modal first
    onDeleteVehicle(vehicleId); // This will open confirmDelete modal via App.tsx
  };

  const handleToggleMaintenance = async () => {
    // For async operations like this, it's often better to await the action
    // and then close, or let the parent handler manage closing if it's part of a longer flow.
    // However, if the action is quick and onClose is immediate, it's usually fine.
    // Given current structure where App.tsx handles state, closing here is reasonable.
    await onToggleVehicleMaintenanceStatus(vehicle.id);
    onClose(); // Close this actions modal after the async action completes
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ações para Viatura: ${vehicle.prefixo}`}
      size="sm"
      footer={
        <button type="button" className="button button-secondary" onClick={onClose}>
          Cancelar
        </button>
      }
    >
      <div className="local-actions-modal-content">
        <div className="item-info">
          <p><strong>Prefixo:</strong> {vehicle.prefixo}</p>
          <p><strong>Modelo:</strong> {vehicle.modelo}</p>
          <p><strong>Placa:</strong> {vehicle.placa}</p>
        </div>
        <div className="actions-buttons-group">
          <button className="button action-modal-button" onClick={handleEdit} disabled={isLoading}>
            <EditIcon /> Editar Viatura
          </button>
          <button className="button action-modal-button" onClick={handleHistory} disabled={isLoading}>
            <HistoryIcon /> Histórico de Cautelas
          </button>
          {(vehicle.status === VehicleStatus.Disponivel || vehicle.status === VehicleStatus.Manutencao) && (
            <button
              className="button action-modal-button"
              onClick={handleToggleMaintenance}
              disabled={isLoading}
            >
              {vehicle.status === VehicleStatus.Disponivel ? <WrenchIcon /> : <PlayCircleIcon />}
              {vehicle.status === VehicleStatus.Disponivel ? "Enviar para Manutenção" : "Tornar Disponível"}
            </button>
          )}
          <button
            className="button button-danger action-modal-button"
            onClick={handleDelete}
            disabled={isLoading || vehicle.status === VehicleStatus.EmUso || vehicle.status === VehicleStatus.AguardandoRecebimento}
            title={vehicle.status === VehicleStatus.EmUso || vehicle.status === VehicleStatus.AguardandoRecebimento ? "Viatura em uso ou aguardando recebimento não pode ser excluída." : "Excluir Viatura"}
            >
            <DeleteIcon /> Excluir Viatura
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LocalVehicleActionsModal;