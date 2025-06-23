import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Request as CautelaRequest, AppUser, ChecklistItemConfig, ChecklistDataItem } from '../../types';
import Spinner from '../ui/Spinner';
import './LocalApprovalModal.css';

interface LocalApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CautelaRequest;
  users: AppUser[];
  checklistItemsConfig: ChecklistItemConfig[];
  onSubmit: (requestId: string, approved: boolean, reservaObservations?: string) => Promise<void>;
  isLoading: boolean;
}

const LocalApprovalModal: React.FC<LocalApprovalModalProps> = ({
  isOpen,
  onClose,
  request,
  users,
  checklistItemsConfig,
  onSubmit,
  isLoading,
}) => {
  const [reservaObservations, setReservaObservations] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReservaObservations(''); // Reset observations when modal opens
    }
  }, [isOpen]);

  const handleSubmit = async (approved: boolean) => {
    if (isLoading) return;
    await onSubmit(request.id, approved, reservaObservations);
  };

  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Desconhecido';

  const renderChecklistItemValue = (itemConfig: ChecklistItemConfig, value: any) => {
    if (itemConfig.type === 'boolean') {
      return value ? <span className="status-ok">OK</span> : <span className="status-not-ok">Não OK</span>;
    }
    if (value === undefined || value === null || value === '') {
        return <span className="value-na">N/A</span>
    }
    return String(value);
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Analisar Solicitação de Cautela"
      size="lg"
      footer={
        <>
          <button type="button" className="button button-danger" onClick={() => handleSubmit(false)} disabled={isLoading}>
            {isLoading ? <Spinner small={true} /> : 'Recusar Solicitação'}
          </button>
          <button type="button" className="button button-success" onClick={() => handleSubmit(true)} disabled={isLoading}>
            {isLoading ? <Spinner small={true} /> : 'Aprovar Saída da Viatura'}
          </button>
        </>
      }
    >
      <div className="approval-modal-content">
        <h4>Detalhes da Solicitação</h4>
        <div className="details-grid">
          <p><strong>Solicitante:</strong> {getUserName(request.userId)}</p>
          <p><strong>Viatura:</strong> {request.vehiclePrefixo}</p>
          <p><strong>Missão:</strong> {request.mission}</p>
          <p><strong>Data Solicitação:</strong> {new Date(request.requestTimestamp).toLocaleString('pt-BR')}</p>
          <p><strong>KM Saída (Solicitado):</strong> {request.checkoutKm.toLocaleString('pt-BR')} km</p>
          {request.checkoutObservations && <p><strong>Obs. Solicitante:</strong> {request.checkoutObservations}</p>}
        </div>

        <h4>Checklist de Saída (Policial)</h4>
        <div className="checklist-review">
          {checklistItemsConfig.map(itemConfig => {
            const value = request.checkoutChecklist?.[itemConfig.id];
            // Don't show km_saida here again if it's already displayed above, or handle as part of checklist
            if (itemConfig.id === 'km_saida' && request.checkoutKm !== undefined) return null;

            return (
              <div key={itemConfig.id} className="checklist-review-item">
                <span className="checklist-label">{itemConfig.label}:</span>
                <span className="checklist-value">
                  {renderChecklistItemValue(itemConfig, value)}
                </span>
              </div>
            );
          })}
           {(!request.checkoutChecklist || Object.keys(request.checkoutChecklist).length === 0) && (
             <p>Checklist não preenchido pelo solicitante.</p>
           )}
        </div>

        <div className="form-group">
          <label htmlFor="reservaObservations">Observações da Reserva (Opcional):</label>
          <textarea
            id="reservaObservations"
            value={reservaObservations}
            onChange={(e) => setReservaObservations(e.target.value)}
            rows={3}
            disabled={isLoading}
            placeholder="Adicione aqui quaisquer observações relevantes para esta aprovação ou recusa..."
          />
        </div>
      </div>
    </Modal>
  );
};

export default LocalApprovalModal;