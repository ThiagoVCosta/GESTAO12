

import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Vehicle, ChecklistItemConfig, ChecklistDataItem } from '../../types';
import Spinner from '../ui/Spinner';
import './LocalRequestVehicleModal.css';

interface LocalRequestVehicleModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicleId: string, mission: string, checkoutKm: number, checklistData: ChecklistDataItem, observations?: string) => Promise<void>;
  checklistItemsConfig: ChecklistItemConfig[];
  isLoading: boolean;
}

const LocalRequestVehicleModal: React.FC<LocalRequestVehicleModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSubmit,
  checklistItemsConfig,
  isLoading,
}) => {
  const [mission, setMission] = useState('');
  const [currentKm, setCurrentKm] = useState<number | string>(''); // Initialize as empty
  const [checklistData, setChecklistData] = useState<ChecklistDataItem>({});
  const [observations, setObservations] = useState('');

  useEffect(() => {
    // Initialize checklistData with default values from config
    if (isOpen) {
      const initialData: ChecklistDataItem = {};
      checklistItemsConfig.forEach(item => {
        if (item.id === 'km_saida') { 
          initialData[item.id] = ''; // Initialize km_saida in checklist as empty
        } else {
          initialData[item.id] = item.defaultValue !== undefined 
            ? item.defaultValue 
            : (item.type === 'boolean' ? false : '');
        }
      });
      setChecklistData(initialData);
      setCurrentKm(''); // Set currentKm input field to empty
      setMission(''); 
      setObservations('');
    }
  }, [isOpen, vehicle, checklistItemsConfig]);


  const handleChecklistItemChange = (id: string, value: string | number | boolean) => {
    setChecklistData(prev => ({ ...prev, [id]: value }));
  };

  const handleKmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentKm(value === '' ? '' : Number(value));
    if (checklistItemsConfig.find(item => item.id === 'km_saida')) {
        handleChecklistItemChange('km_saida', value === '' ? '' : Number(value)); // Update checklist with empty string or number
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (currentKm === '') {
        alert(`Quilometragem de saída é obrigatória.`);
        return;
    }
    const kmValue = Number(currentKm);
    if (isNaN(kmValue)) {
        alert(`Quilometragem de saída deve ser um número válido.`);
        return;
    }
    if (kmValue < vehicle.km) {
      alert(`Quilometragem de saída (${kmValue}) deve ser um número igual ou maior que a KM atual da viatura (${vehicle.km} km).`);
      return;
    }
    if (!mission.trim()) {
        alert("O campo 'Missão' é obrigatório.");
        return;
    }

    const finalChecklistData = { ...checklistData };
    if (checklistItemsConfig.find(item => item.id === 'km_saida')) {
        finalChecklistData['km_saida'] = kmValue;
    }
    
    await onSubmit(vehicle.id, mission, kmValue, finalChecklistData, observations);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Solicitar Viatura: ${vehicle.prefixo}`}
      size="lg"
      footer={
        <>
          <button type="button" className="button button-secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button type="submit" form="request-vehicle-form" className="button" disabled={isLoading}>
            {isLoading ? <Spinner small={true} /> : 'Enviar Solicitação'}
          </button>
        </>
      }
    >
      <form id="request-vehicle-form" onSubmit={handleSubmit} className="request-vehicle-form">
        <div className="form-section">
          <label htmlFor="mission">Missão:</label>
          <input
            type="text"
            id="mission"
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-section checklist-section">
          <h4>Checklist de Saída</h4>
          {checklistItemsConfig.map(item => (
            <div key={item.id} className="checklist-item">
              <label htmlFor={item.id} className="checklist-item-label">{item.label}{item.required && '*'}:</label>
              {item.id === 'km_saida' ? (
                 <input
                    type="number"
                    id={item.id}
                    value={currentKm} // Reflects the new empty initial state
                    onChange={handleKmChange}
                    min={vehicle.km} 
                    disabled={isLoading}
                    required={item.required} // Already required from constants
                    className="checklist-input"
                    placeholder="KM atual da Viatura para saída"
                  />
              ) : item.type === 'boolean' ? (
                <div className="boolean-toggle">
                  <button
                    type="button"
                    className={`toggle-button ok ${checklistData[item.id] === true ? 'active' : ''}`}
                    onClick={() => handleChecklistItemChange(item.id, true)}
                    disabled={isLoading}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    className={`toggle-button not-ok ${checklistData[item.id] === false ? 'active' : ''}`}
                    onClick={() => handleChecklistItemChange(item.id, false)}
                    disabled={isLoading}
                  >
                    Não OK
                  </button>
                </div>
              ) : item.type === 'textarea' ? (
                <textarea
                  id={item.id}
                  value={checklistData[item.id] as string || ''}
                  onChange={(e) => handleChecklistItemChange(item.id, e.target.value)}
                  disabled={isLoading}
                  required={item.required}
                  rows={3}
                  className="checklist-input"
                />
              ) : (
                <input
                  type={item.type === 'number' ? 'number' : 'text'}
                  id={item.id}
                  value={checklistData[item.id] as string || ''}
                  onChange={(e) => handleChecklistItemChange(item.id, e.target.value)}
                  disabled={isLoading}
                  required={item.required}
                  className="checklist-input"
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="form-section">
          <label htmlFor="observations">Observações Pré Cautela (Opcional):</label>
          <textarea
            id="observations"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={4}
            disabled={isLoading}
            placeholder="Registre aqui qualquer observação sobre o estado da viatura antes da saída..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default LocalRequestVehicleModal;
