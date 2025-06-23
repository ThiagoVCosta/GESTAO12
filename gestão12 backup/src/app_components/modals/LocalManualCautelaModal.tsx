
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Vehicle, AppUser, ChecklistItemConfig, ChecklistDataItem, Role } from '../../types';
import Spinner from '../ui/Spinner';
import './LocalManualCautelaModal.css';

interface LocalManualCautelaModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableVehicles: Vehicle[];
  allUsers: AppUser[];
  checklistItemsConfig: ChecklistItemConfig[];
  onSubmit: (
    vehicleId: string,
    selectedUserId: string,
    mission: string,
    checkoutKm: number,
    checkoutChecklist: ChecklistDataItem,
    reservaObservations?: string
  ) => Promise<void>;
  isLoading: boolean;
  currentUser: AppUser; // Reserva user
}

const LocalManualCautelaModal: React.FC<LocalManualCautelaModalProps> = ({
  isOpen,
  onClose,
  availableVehicles,
  allUsers,
  checklistItemsConfig,
  onSubmit,
  isLoading,
  currentUser,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [mission, setMission] = useState('');
  const [checkoutKm, setCheckoutKm] = useState<number | string>('');
  const [checkoutChecklist, setCheckoutChecklist] = useState<ChecklistDataItem>({});
  const [reservaObservations, setReservaObservations] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedVehicle = availableVehicles.find(v => v.id === selectedVehicleId);

  useEffect(() => {
    if (isOpen) {
      setSelectedVehicleId(availableVehicles.length > 0 ? availableVehicles[0].id : '');
      setSelectedUserId('');
      setMission('');
      setReservaObservations('');
      setValidationError(null);

      const initialVehicle = availableVehicles.length > 0 ? availableVehicles[0] : null;
      if (initialVehicle) {
        setCheckoutKm(initialVehicle.km);
        const initialChecklistData: ChecklistDataItem = {};
        checklistItemsConfig.forEach(item => {
          if (item.id === 'km_saida') {
            initialChecklistData[item.id] = initialVehicle.km;
          } else {
            initialChecklistData[item.id] = item.defaultValue !== undefined 
              ? item.defaultValue 
              : (item.type === 'boolean' ? false : ''); // Default for boolean
          }
        });
        setCheckoutChecklist(initialChecklistData);
      } else {
        setCheckoutKm('');
        setCheckoutChecklist({});
      }
    }
  }, [isOpen, availableVehicles, checklistItemsConfig]);

  useEffect(() => {
    if (selectedVehicle) {
      setCheckoutKm(selectedVehicle.km);
      const newChecklistData: ChecklistDataItem = {};
      checklistItemsConfig.forEach(item => {
        if (item.id === 'km_saida') {
          newChecklistData[item.id] = selectedVehicle.km;
        } else {
          newChecklistData[item.id] = checkoutChecklist[item.id] !== undefined 
            ? checkoutChecklist[item.id] 
            : (item.defaultValue !== undefined 
                ? item.defaultValue 
                : (item.type === 'boolean' ? false : '')); // Default for boolean
        }
      });
      setCheckoutChecklist(newChecklistData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [selectedVehicleId, checklistItemsConfig]); // checkoutChecklist removed from deps to avoid loop with its own update

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVehicleId(e.target.value);
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(e.target.value);
  };
  
  const handleChecklistItemChange = (id: string, value: string | number | boolean) => {
    setCheckoutChecklist(prev => ({ ...prev, [id]: value }));
  };

  const handleKmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCheckoutKm(value === '' ? '' : Number(value));
    if (checklistItemsConfig.find(item => item.id === 'km_saida')) {
      handleChecklistItemChange('km_saida', value === '' ? 0 : Number(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (isLoading) return;

    if (!selectedVehicleId) {
      setValidationError("Por favor, selecione uma viatura.");
      return;
    }
    if (!selectedUserId) {
      setValidationError("Por favor, selecione um militar.");
      return;
    }
    if (!mission.trim()) {
      setValidationError("O campo 'Missão' é obrigatório.");
      return;
    }

    const kmValue = Number(checkoutKm);
    if (isNaN(kmValue) || (selectedVehicle && kmValue < selectedVehicle.km)) {
      setValidationError(`Quilometragem de saída deve ser um número igual ou maior que a KM atual da viatura (${selectedVehicle?.km || 0} km).`);
      return;
    }
    
    const finalChecklistData = { ...checkoutChecklist };
    if (checklistItemsConfig.find(item => item.id === 'km_saida')) {
        finalChecklistData['km_saida'] = kmValue;
    }

    await onSubmit(selectedVehicleId, selectedUserId, mission.trim(), kmValue, finalChecklistData, reservaObservations.trim());
  };
  
  const filteredUsersForSelection = allUsers.filter(u => u.role === Role.User || u.role === Role.Reserva || u.role === Role.Admin);


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Cautela Manual"
      size="lg"
      footer={
        <>
          <button type="button" className="button button-secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button type="submit" form="manual-cautela-form" className="button" disabled={isLoading}>
            {isLoading ? <Spinner small={true} /> : 'Confirmar Cautela'}
          </button>
        </>
      }
    >
      <form id="manual-cautela-form" onSubmit={handleSubmit} className="manual-cautela-form">
        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="select-vehicle">Viatura Disponível:</label>
            <select
              id="select-vehicle"
              value={selectedVehicleId}
              onChange={handleVehicleChange}
              disabled={isLoading || availableVehicles.length === 0}
              required
            >
              {availableVehicles.length === 0 && <option value="">Nenhuma viatura disponível</option>}
              {availableVehicles.map(v => (
                <option key={v.id} value={v.id}>{v.prefixo} - {v.modelo} (KM: {v.km})</option>
              ))}
            </select>
          </div>
          <div className="form-group half-width">
            <label htmlFor="select-user">Militar Responsável:</label>
            <select
              id="select-user"
              value={selectedUserId}
              onChange={handleUserChange}
              disabled={isLoading || filteredUsersForSelection.length === 0}
              required
            >
              <option value="">Selecione um militar...</option>
              {filteredUsersForSelection.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.matricula}) - {u.role}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="mission-manual">Missão:</label>
          <input
            type="text"
            id="mission-manual"
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        {validationError && <p className="auth-error form-error">{validationError}</p>}

        <div className="form-section checklist-section">
          <h4>Checklist de Saída (Preenchido pela Reserva)</h4>
          {checklistItemsConfig.map(item => (
            <div key={item.id} className="checklist-item">
              <label htmlFor={`manual-${item.id}`} className="checklist-item-label">{item.label}{item.required && '*'}:</label>
              {item.id === 'km_saida' ? (
                 <input
                    type="number"
                    id={`manual-${item.id}`}
                    value={checkoutKm}
                    onChange={handleKmChange}
                    min={selectedVehicle?.km || 0}
                    disabled={isLoading || !selectedVehicle}
                    required={item.required}
                    className="checklist-input"
                  />
              ) : item.type === 'boolean' ? (
                <div className="boolean-toggle">
                  <button
                    type="button"
                    className={`toggle-button ok ${checkoutChecklist[item.id] === true ? 'active' : ''}`}
                    onClick={() => handleChecklistItemChange(item.id, true)}
                    disabled={isLoading}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    className={`toggle-button not-ok ${checkoutChecklist[item.id] === false ? 'active' : ''}`}
                    onClick={() => handleChecklistItemChange(item.id, false)}
                    disabled={isLoading}
                  >
                    Não OK
                  </button>
                </div>
              ) : item.type === 'textarea' ? (
                <textarea
                  id={`manual-${item.id}`}
                  value={checkoutChecklist[item.id] as string || ''}
                  onChange={(e) => handleChecklistItemChange(item.id, e.target.value)}
                  disabled={isLoading}
                  required={item.required}
                  rows={3}
                  className="checklist-input"
                />
              ) : (
                <input
                  type={item.type === 'number' ? 'number' : 'text'}
                  id={`manual-${item.id}`}
                  value={checkoutChecklist[item.id] as string || ''}
                  onChange={(e) => handleChecklistItemChange(item.id, e.target.value)}
                  disabled={isLoading}
                  required={item.required}
                  className="checklist-input"
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="form-group">
          <label htmlFor="reserva-observations-manual">Observações da Reserva (Opcional):</label>
          <textarea
            id="reserva-observations-manual"
            value={reservaObservations}
            onChange={(e) => setReservaObservations(e.target.value)}
            rows={4}
            disabled={isLoading}
            placeholder="Registre aqui qualquer observação sobre a viatura ou a cautela..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default LocalManualCautelaModal;
