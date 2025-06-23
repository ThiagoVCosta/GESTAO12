
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Vehicle, Request as CautelaRequest, ChecklistItemConfig, ChecklistDataItem } from '../../types';
import Spinner from '../ui/Spinner';
import './LocalUserCheckinModal.css'; // Create this CSS file

interface LocalUserCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestToReturn: CautelaRequest;
  vehicleToReturn: Vehicle;
  checklistItemsConfig: ChecklistItemConfig[];
  onSubmit: (requestId: string, finalKm: number, checkinChecklistData: ChecklistDataItem, checkinObservations?: string) => Promise<void>;
  isLoading: boolean;
}

const LocalUserCheckinModal: React.FC<LocalUserCheckinModalProps> = ({
  isOpen,
  onClose,
  requestToReturn,
  vehicleToReturn,
  checklistItemsConfig,
  onSubmit,
  isLoading,
}) => {
  const [finalKm, setFinalKm] = useState<number | string>(''); // Initialize as empty string
  const [checkinChecklistData, setCheckinChecklistData] = useState<ChecklistDataItem>({});
  const [checkinObservations, setCheckinObservations] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFinalKm(''); // KM input starts blank
      const initialData: ChecklistDataItem = {};
      checklistItemsConfig.forEach(item => {
        if (item.id === 'km_final') {
          initialData[item.id] = ''; // Checklist item km_final also starts blank
        } else {
          initialData[item.id] = item.defaultValue !== undefined 
            ? item.defaultValue 
            : (item.type === 'boolean' ? false : '');
        }
      });
      setCheckinChecklistData(initialData);
      setCheckinObservations('');
      setValidationError(null);
    }
  }, [isOpen, checklistItemsConfig]); // vehicleToReturn removed as KM is not pre-filled from it

  const handleChecklistItemChange = (id: string, value: string | number | boolean) => {
    setCheckinChecklistData(prev => ({ ...prev, [id]: value }));
  };

  const handleKmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFinalKm(value); // Keep as string to allow empty input
     if (checklistItemsConfig.find(item => item.id === 'km_final')) {
        // Update checklist with empty string or number
        handleChecklistItemChange('km_final', value === '' ? '' : Number(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (isLoading) return;

    if (finalKm === '') {
        setValidationError("KM de Devolução é obrigatório.");
        return;
    }
    const kmValue = Number(finalKm);
    if (isNaN(kmValue)) {
        setValidationError("KM de Devolução deve ser um número válido.");
        return;
    }

    if (kmValue < requestToReturn.checkoutKm) {
      setValidationError(`KM de Devolução (${kmValue.toLocaleString('pt-BR')}) deve ser maior ou igual ao KM de Saída (${requestToReturn.checkoutKm.toLocaleString('pt-BR')} km).`);
      return;
    }
    
    const finalChecklistSubmitData = { ...checkinChecklistData };
    // Ensure km_final in checklist data matches the validated kmValue
    if (checklistItemsConfig.find(item => item.id === 'km_final')) {
        finalChecklistSubmitData['km_final'] = kmValue;
    }

    await onSubmit(requestToReturn.id, kmValue, finalChecklistSubmitData, checkinObservations);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Solicitar Devolução da Viatura: ${vehicleToReturn.prefixo}`}
      size="lg"
      footer={
        <>
          <button type="button" className="button button-secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button type="submit" form="user-checkin-form" className="button button-success" disabled={isLoading}>
            {isLoading ? <Spinner small={true} /> : 'Confirmar e Solicitar Devolução'}
          </button>
        </>
      }
    >
      <form id="user-checkin-form" onSubmit={handleSubmit} className="user-checkin-form">
        <div className="form-section">
          <label htmlFor="finalKm">KM de Devolução:</label>
          <input
            type="number"
            id="finalKm"
            value={finalKm}
            onChange={handleKmChange}
            min={requestToReturn.checkoutKm}
            disabled={isLoading}
            required // HTML5 validation
            placeholder="KM atual da viatura na devolução"
          />
        </div>
        {validationError && <p className="auth-error form-error" style={{marginTop: '10px'}}>{validationError}</p>}

        <div className="form-section checklist-section">
          <h4>Checklist de Devolução</h4>
          {checklistItemsConfig.map(item => {
            if (item.id === 'km_saida' || item.id === 'km_final') return null;
            
            return (
                <div key={item.id} className="checklist-item">
                <label htmlFor={`checkin-${item.id}`} className="checklist-item-label">{item.label}{item.required && '*'}:</label>
                {item.type === 'boolean' ? (
                    <div className="boolean-toggle">
                    <button
                        type="button"
                        className={`toggle-button ok ${checkinChecklistData[item.id] === true ? 'active' : ''}`}
                        onClick={() => handleChecklistItemChange(item.id, true)}
                        disabled={isLoading}
                    >
                        OK
                    </button>
                    <button
                        type="button"
                        className={`toggle-button not-ok ${checkinChecklistData[item.id] === false ? 'active' : ''}`}
                        onClick={() => handleChecklistItemChange(item.id, false)}
                        disabled={isLoading}
                    >
                        Não OK
                    </button>
                    </div>
                ) : item.type === 'textarea' ? (
                    <textarea
                    id={`checkin-${item.id}`}
                    value={checkinChecklistData[item.id] as string || ''}
                    onChange={(e) => handleChecklistItemChange(item.id, e.target.value)}
                    disabled={isLoading}
                    required={item.required}
                    rows={3}
                    className="checklist-input"
                    />
                ) : (
                    <input
                    type={item.type === 'number' ? 'number' : 'text'}
                    id={`checkin-${item.id}`}
                    value={checkinChecklistData[item.id] as string || ''}
                    onChange={(e) => handleChecklistItemChange(item.id, e.target.value)}
                    disabled={isLoading}
                    required={item.required}
                    className="checklist-input"
                    />
                )}
                </div>
            );
        })}
        </div>
        
        <div className="form-section">
          <label htmlFor="checkinObservations">Observações de Devolução (Opcional):</label>
          <textarea
            id="checkinObservations"
            value={checkinObservations}
            onChange={(e) => setCheckinObservations(e.target.value)}
            rows={4}
            disabled={isLoading}
            placeholder="Registre aqui quaisquer avarias, problemas ou observações sobre a viatura na devolução..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default LocalUserCheckinModal;
