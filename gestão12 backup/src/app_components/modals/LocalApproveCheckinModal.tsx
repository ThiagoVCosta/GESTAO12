
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Request as CautelaRequest, AppUser, ChecklistItemConfig, ChecklistDataItem, Vehicle, RequestStatus } from '../../types';
import Spinner from '../ui/Spinner';
import './LocalApproveCheckinModal.css';

interface LocalApproveCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CautelaRequest;
  users: AppUser[];
  vehicles: Vehicle[]; // Still needed to potentially show vehicle.km if no request.checkinKm
  checklistItemsConfig: ChecklistItemConfig[];
  onSubmit: (requestId: string, finalKm?: number, checkinChecklist?: ChecklistDataItem, reservaCheckinObservations?: string) => Promise<void>;
  isLoading: boolean;
}

const LocalApproveCheckinModal: React.FC<LocalApproveCheckinModalProps> = ({
  isOpen,
  onClose,
  request,
  users,
  vehicles, // Keep for vehicleDetails lookup if needed for other display logic
  checklistItemsConfig,
  onSubmit,
  isLoading,
}) => {
  const [finalKm, setFinalKm] = useState<number | string>(''); // Input field state, starts blank
  const [currentChecklistData, setCurrentChecklistData] = useState<ChecklistDataItem>({});
  const [reservaCheckinObservations, setReservaCheckinObservations] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // const vehicleDetails = vehicles.find(v => v.id === request.vehicleId); // Keep if needed for other logic

  useEffect(() => {
    if (isOpen) {
      setFinalKm(''); // KM input for Reserva always starts blank
      
      let initialChecklist: ChecklistDataItem = {};
      // Populate checklist based on what the user submitted, or defaults
      if (request.status === RequestStatus.DevolucaoSolicitada && request.checkinChecklist) {
        checklistItemsConfig.forEach(item => {
          if (item.id === 'km_final') {
            // If user submitted a km_final, use that for the checklist's initial value,
            // but the input field (finalKm state) remains blank for Reserva to fill.
            initialChecklist[item.id] = request.checkinKm !== undefined ? request.checkinKm : '';
          } else if (request.checkinChecklist![item.id] !== undefined) {
            initialChecklist[item.id] = request.checkinChecklist![item.id];
          } else {
            initialChecklist[item.id] = item.defaultValue !== undefined 
              ? item.defaultValue 
              : (item.type === 'boolean' ? false : '');
          }
        });
      } else { // If no prior checkin data from user, or direct checkin by Reserva
        checklistItemsConfig.forEach(item => {
          if (item.id === 'km_final') {
            initialChecklist[item.id] = ''; // km_final in checklist also starts blank
          } else {
            initialChecklist[item.id] = item.defaultValue !== undefined 
              ? item.defaultValue 
              : (item.type === 'boolean' ? false : '');
          }
        });
      }
      
      setCurrentChecklistData(initialChecklist);
      setReservaCheckinObservations(request.reservaCheckinObservations || '');
      setValidationError(null);
    }
  }, [isOpen, request, checklistItemsConfig]);

  const handleChecklistItemChange = (id: string, value: string | number | boolean) => {
    setCurrentChecklistData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleKmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFinalKm(value); // Keep as string to allow empty input
     if (checklistItemsConfig.find(item => item.id === 'km_final')) { 
        handleChecklistItemChange('km_final', value === '' ? '' : Number(value)); // Allow empty string or number
    }
  };

  const handleSubmit = async () => {
    setValidationError(null);
    if (isLoading) return;

    if (finalKm === '') {
      setValidationError(`KM de Devolução é obrigatório.`);
      return;
    }
    const kmValue = Number(finalKm);
    if (isNaN(kmValue)) {
        setValidationError(`KM de Devolução deve ser um número válido.`);
        return;
    }

    if (kmValue < request.checkoutKm) {
      setValidationError(`KM de Devolução (${kmValue.toLocaleString('pt-BR')}) deve ser maior ou igual ao KM de Saída (${request.checkoutKm.toLocaleString('pt-BR')} km).`);
      return;
    }

    const finalChecklistSubmitData = { ...currentChecklistData };
    // Ensure km_final in checklist data matches the validated kmValue from the input
    if (checklistItemsConfig.find(item => item.id === 'km_final')) {
        finalChecklistSubmitData['km_final'] = kmValue;
    }

    await onSubmit(request.id, kmValue, finalChecklistSubmitData, reservaCheckinObservations);
  };

  const getUserName = (userId?: string) => users.find(u => u.id === userId)?.name || 'Desconhecido';

  // Display KM submitted by Policial if available
  const policialSubmittedKm = (request.status === RequestStatus.DevolucaoSolicitada && request.checkinKm !== undefined)
    ? request.checkinKm.toLocaleString('pt-BR') + " km"
    : "Não informado pelo policial";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Recebimento da Viatura"
      size="lg"
      footer={
        <>
          <button type="button" className="button button-secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button type="button" className="button button-success" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Spinner small={true} /> : 'Confirmar Recebimento'}
          </button>
        </>
      }
    >
      <div className="approve-checkin-modal-content">
        <h4>Detalhes da Devolução Solicitada</h4>
        <div className="details-grid">
          <p><strong>Solicitante:</strong> {getUserName(request.userId)}</p>
          <p><strong>Viatura:</strong> {request.vehiclePrefixo}</p>
          <p><strong>Missão Cumprida:</strong> {request.mission}</p>
          <p><strong>Data Solic. Devolução:</strong> {request.checkinRequestTimestamp ? new Date(request.checkinRequestTimestamp).toLocaleString('pt-BR') : 'N/A'}</p>
          <p><strong>KM Saída:</strong> {request.checkoutKm.toLocaleString('pt-BR')} km</p>
          {request.status === RequestStatus.DevolucaoSolicitada && (
            <p><strong>KM Devolução (Policial):</strong> {policialSubmittedKm}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="finalKm">KM de Devolução (Confirmar/Corrigir):</label>
          <input
            type="number"
            id="finalKm"
            value={finalKm}
            onChange={handleKmChange}
            min={request.checkoutKm}
            disabled={isLoading}
            required // HTML5 validation
            placeholder="KM da viatura na devolução (Confirmar/Corrigir)"
          />
        </div>
        
        {request.checkinObservations && request.status === RequestStatus.DevolucaoSolicitada && (
            <div className="observations-review">
                <strong>Observações do Policial na Devolução:</strong>
                <p>{request.checkinObservations}</p>
            </div>
        )}

        <h4>Checklist de Devolução (Reserva)</h4>
        <div className="checklist-form-section">
          {checklistItemsConfig.map(itemConfig => {
            if (itemConfig.id === 'km_saida' || itemConfig.id === 'km_final') return null;

            return (
            <div key={itemConfig.id} className="checkin-checklist-item">
              <label htmlFor={`checkin-${itemConfig.id}`} className="checkin-checklist-item-label">
                {itemConfig.label}{itemConfig.required && '*'}:
              </label>
              {itemConfig.type === 'boolean' ? (
                <div className="boolean-toggle">
                  <button
                    type="button"
                    className={`toggle-button ok ${currentChecklistData[itemConfig.id] === true ? 'active' : ''}`}
                    onClick={() => handleChecklistItemChange(itemConfig.id, true)}
                    disabled={isLoading}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    className={`toggle-button not-ok ${currentChecklistData[itemConfig.id] === false ? 'active' : ''}`}
                    onClick={() => handleChecklistItemChange(itemConfig.id, false)}
                    disabled={isLoading}
                  >
                    Não OK
                  </button>
                </div>
              ) : itemConfig.type === 'textarea' ? (
                <textarea
                  id={`checkin-${itemConfig.id}`}
                  value={currentChecklistData[itemConfig.id] as string || ''}
                  onChange={(e) => handleChecklistItemChange(itemConfig.id, e.target.value)}
                  disabled={isLoading}
                  required={itemConfig.required}
                  rows={3}
                  className="checkin-checklist-input"
                />
              ) : (
                <input
                  type={itemConfig.type === 'number' ? 'number' : 'text'}
                  id={`checkin-${itemConfig.id}`}
                  value={currentChecklistData[itemConfig.id] as string || ''}
                  onChange={(e) => handleChecklistItemChange(itemConfig.id, e.target.value)}
                  disabled={isLoading}
                  required={itemConfig.required}
                  className="checkin-checklist-input"
                />
              )}
            </div>
          );
          })}
        </div>

        <div className="form-group">
          <label htmlFor="reservaCheckinObservations">Observações da Reserva na Devolução (Opcional):</label>
          <textarea
            id="reservaCheckinObservations"
            value={reservaCheckinObservations}
            onChange={(e) => setReservaCheckinObservations(e.target.value)}
            rows={3}
            disabled={isLoading}
            placeholder="Registre aqui quaisquer observações sobre o estado da viatura no recebimento..."
          />
        </div>
        {validationError && <p className="auth-error form-error">{validationError}</p>}
      </div>
    </Modal>
  );
};

export default LocalApproveCheckinModal;
