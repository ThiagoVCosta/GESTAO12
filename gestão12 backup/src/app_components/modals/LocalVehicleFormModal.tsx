import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Vehicle, VehicleStatus, FleetType } from '../../types';
import Spinner from '../ui/Spinner';
import { translateFleetType } from '../../constants';
// import './LocalVehicleFormModal.css'; // If specific styles are needed

interface LocalVehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicleData: Omit<Vehicle, 'id' | 'status'> | Vehicle) => Promise<void>;
  vehicleToEdit?: Vehicle;
  isLoading: boolean;
}

const LocalVehicleFormModal: React.FC<LocalVehicleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vehicleToEdit,
  isLoading,
}) => {
  const [prefixo, setPrefixo] = useState('');
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [km, setKm] = useState<number | string>('');
  const [frota, setFrota] = useState<FleetType>(FleetType.Propria);
  const [kmRevisao, setKmRevisao] = useState<number | string>('');


  useEffect(() => {
    if (isOpen) { // Ensures reset only when modal becomes visible or vehicleToEdit changes
      if (vehicleToEdit) {
        setPrefixo(vehicleToEdit.prefixo);
        setModelo(vehicleToEdit.modelo);
        setPlaca(vehicleToEdit.placa);
        setKm(vehicleToEdit.km);
        setFrota(vehicleToEdit.frota);
        setKmRevisao(vehicleToEdit.kmRevisao ?? '');
      } else {
        // Reset for new vehicle
        setPrefixo('');
        setModelo('');
        setPlaca('');
        setKm('');
        setFrota(FleetType.Propria); // Default to Propria for new vehicles
        setKmRevisao('');
      }
    }
  }, [isOpen, vehicleToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const kmValue = Number(km);
    if (isNaN(kmValue) || kmValue < 0) {
      alert("Quilometragem deve ser um número positivo.");
      return;
    }
    const kmRevisaoValue = kmRevisao === '' ? undefined : Number(kmRevisao);
    if (kmRevisaoValue !== undefined && (isNaN(kmRevisaoValue) || kmRevisaoValue < 0)) {
      alert("KM para Revisão deve ser um número positivo ou deixado em branco.");
      return;
    }
    if (kmRevisaoValue !== undefined && kmRevisaoValue <= kmValue) {
      alert("KM para Revisão deve ser maior que a KM Inicial/Atual da viatura.");
      return;
    }

    if (!prefixo.trim() || !modelo.trim() || !placa.trim() || !frota) {
        alert("Todos os campos são obrigatórios, incluindo Tipo de Frota.");
        return;
    }

    const vehicleDataPayload = {
      prefixo: prefixo.trim(),
      modelo: modelo.trim(),
      placa: placa.trim().toUpperCase(),
      km: kmValue,
      frota: frota,
      kmRevisao: kmRevisaoValue,
      // status will be handled by App.tsx or backend logic
    };

    if (vehicleToEdit) {
      await onSubmit({ ...vehicleToEdit, ...vehicleDataPayload });
    } else {
      // For new vehicles, status is set server-side or in App.tsx
      await onSubmit(vehicleDataPayload as Omit<Vehicle, 'id' | 'status' | 'currentDriverId' | 'currentRequestId'>);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vehicleToEdit ? `Editar Viatura: ${vehicleToEdit.prefixo}` : 'Adicionar Nova Viatura'}
      size="md"
      footer={
        <>
          <button type="button" className="button button-secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button type="submit" form="vehicle-form" className="button" disabled={isLoading}>
            {isLoading ? <Spinner small={true} /> : (vehicleToEdit ? 'Salvar Alterações' : 'Adicionar Viatura')}
          </button>
        </>
      }
    >
      <form id="vehicle-form" onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label htmlFor="prefixo">Prefixo:</label>
          <input
            type="text"
            id="prefixo"
            value={prefixo}
            onChange={(e) => setPrefixo(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="modelo">Modelo:</label>
          <input
            type="text"
            id="modelo"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="placa">Placa:</label>
          <input
            type="text"
            id="placa"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            disabled={isLoading}
            required
            maxLength={8} // e.g., AAA-1234 or AAA1B34
          />
        </div>
        <div className="form-group">
          <label htmlFor="km">KM Inicial:</label>
          <input
            type="number"
            id="km"
            value={km}
            onChange={(e) => setKm(e.target.value === '' ? '' : Number(e.target.value))}
            min="0"
            disabled={isLoading}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="frota">Tipo de Frota:</label>
          <select
            id="frota"
            value={frota}
            onChange={(e) => setFrota(e.target.value as FleetType)}
            disabled={isLoading}
            required
          >
            <option value={FleetType.Propria}>{translateFleetType(FleetType.Propria)}</option>
            <option value={FleetType.Alugada}>{translateFleetType(FleetType.Alugada)}</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="kmRevisao">KM para Revisão (Opcional):</label>
          <input
            type="number"
            id="kmRevisao"
            value={kmRevisao}
            onChange={(e) => setKmRevisao(e.target.value === '' ? '' : Number(e.target.value))}
            min="0"
            disabled={isLoading}
            placeholder="Ex: 100000"
          />
        </div>
      </form>
    </Modal>
  );
};

export default LocalVehicleFormModal;