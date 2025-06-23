// src/app_components/modals/LocalCautelaDetailHistoryModal.tsx

import React from 'react';
import Modal from '../ui/Modal';
import { Request as CautelaRequest, AppUser, ChecklistItemConfig, ChecklistDataItem } from '../../types';
import Spinner from '../ui/Spinner';
import './LocalCautelaDetailHistoryModal.css';

interface LocalCautelaDetailHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  request?: CautelaRequest; // Allow request to be undefined
  users: AppUser[];
  checklistItemsConfig: ChecklistItemConfig[];
  isLoading: boolean;
}

const LocalCautelaDetailHistoryModal: React.FC<LocalCautelaDetailHistoryModalProps> = ({
  isOpen,
  onClose,
  request,
  users,
  checklistItemsConfig,
  isLoading,
}) => {
  if (!isOpen) return null;

  const getUserName = (userId?: string): string => {
    if (!userId) return 'N/A';
    const user = users.find(u => u.id === userId);
    return user ? user.name : `ID: ${userId}`;
  };

  const formatNullableDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A';
  };
  
  const formatNullableKm = (km?: number) => {
    return typeof km === 'number' ? km.toLocaleString('pt-BR') : 'N/A';
  };

  const renderChecklistItemValue = (itemConfig: ChecklistItemConfig, value: any) => {
    if (value === undefined || value === null || value === '') {
      if (itemConfig.type === 'boolean') return <span className="value-boolean-na">Não Preenchido</span>; // Specific for boolean
      return <span className="value-na">N/A</span>;
    }
    if (itemConfig.type === 'boolean') {
      return value ? <span className="status-ok">OK</span> : <span className="status-not-ok">Não OK</span>;
    }
    return String(value);
  };

  const renderChecklistSection = (
    title: string,
    checklistData?: ChecklistDataItem,
    kmFieldLabel?: string, // e.g., "KM Saída (Solicitado)"
    kmValue?: number,
    observations?: string,
    obsLabel: string = "Observações"
  ) => {
    if (!checklistData && kmValue === undefined && !observations) {
      return (
        <div className="checklist-container empty">
          <h4>{title}</h4>
          <p className="no-data-message">Nenhum dado de {title.toLowerCase()} registrado.</p>
        </div>
      );
    }

    return (
      <div className="checklist-container">
        <h4>{title}</h4>
        {kmFieldLabel && kmValue !== undefined && (
          <div className="detail-item">
            <span className="detail-label">{kmFieldLabel}:</span>
            <span className="detail-value">{formatNullableKm(kmValue)}</span>
          </div>
        )}
        {checklistItemsConfig.map(itemConfig => {
          // If a specific KM field label is provided, don't re-render it from the generic checklist item list.
          if (kmFieldLabel && (itemConfig.id === 'km_saida' || itemConfig.id === 'km_final')) {
            // Only skip if the kmValue for this section (checkout/checkin) is directly passed and displayed
            if ((kmFieldLabel.toLowerCase().includes('saída') && itemConfig.id === 'km_saida') ||
                (kmFieldLabel.toLowerCase().includes('devolução') && itemConfig.id === 'km_final')) {
                 if (kmValue !== undefined) return null; // Already shown
            }
          }

          const value = checklistData?.[itemConfig.id];
          return (
            <div key={`${title}-${itemConfig.id}`} className="checklist-review-item">
              <span className="checklist-label">{itemConfig.label}:</span>
              <span className="checklist-value">
                {renderChecklistItemValue(itemConfig, value)}
              </span>
            </div>
          );
        })}
        {observations && (
          <div className="observations-section">
            <span className="detail-label">{obsLabel}:</span>
            <p className="detail-text-block">{observations}</p>
          </div>
        )}
        {(!checklistData || Object.keys(checklistData).length === 0) && !kmValue && !observations && (
            <p className="no-data-message">Checklist não preenchido.</p>
        )}
      </div>
    );
  };
  
  if (isLoading) {
    return (
        <Modal isOpen={true} onClose={onClose} title="Carregando Detalhes da Cautela..." size="md">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <Spinner />
            </div>
        </Modal>
    );
  }

  if (!request) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Erro" size="sm">
        <p>Detalhes da cautela não encontrados. Por favor, tente novamente.</p>
      </Modal>
    );
  }


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalhes da Cautela: VTR ${request.vehiclePrefixo}`}
      size="xl"
      footer={<button type="button" className="button button-secondary" onClick={onClose}>Fechar</button>}
    >
      <div className="cautela-detail-history-modal-content">
        <div className="section general-info">
          <h3>Informações Gerais da Cautela</h3>
          <div className="details-grid-cautela">
            <p><strong>Viatura:</strong> {request.vehiclePrefixo}</p>
            <p><strong>Solicitante:</strong> {getUserName(request.userId)}</p>
            <p><strong>Missão:</strong> {request.mission}</p>
            <p><strong>Status Atual:</strong> {request.status}</p>
            <p><strong>Data Solicitação:</strong> {formatNullableDate(request.requestTimestamp)}</p>
            {request.approverIdReserva && <p><strong>Liberado por (Reserva):</strong> {getUserName(request.approverIdReserva)}</p>}
            {request.approvalTimestamp && <p><strong>Data Liberação:</strong> {formatNullableDate(request.approvalTimestamp)}</p>}
            {request.checkoutTimestamp && <p><strong>Data Saída Efetiva:</strong> {formatNullableDate(request.checkoutTimestamp)}</p>}
          </div>
        </div>

        <div className="section checkout-info">
          <h3>Dados de Saída (Checkout)</h3>
          {renderChecklistSection(
            "Checklist de Saída (Policial)",
            request.checkoutChecklist,
            "KM Saída (Policial)",
            request.checkoutKm,
            request.checkoutObservations,
            "Observações do Policial na Saída"
          )}
          {request.reservaCheckoutObservations && (
            <div className="observations-section reserva-obs">
              <span className="detail-label">Observações da Reserva na Saída:</span>
              <p className="detail-text-block">{request.reservaCheckoutObservations}</p>
            </div>
          )}
        </div>

        {(request.status === 'DEVOLUCAO_SOLICITADA' || request.status === 'CONCLUIDO') && (
          <div className="section checkin-info">
            <h3>Dados de Devolução (Check-in)</h3>
            {request.checkinRequestTimestamp && <p className="timestamp-info"><strong>Data Solic. Devolução (Policial):</strong> {formatNullableDate(request.checkinRequestTimestamp)}</p>}
            
            {renderChecklistSection(
              "Checklist de Devolução (Policial)",
              request.checkinChecklist,
              "KM Devolução (Policial)",
              request.checkinKm,
              request.checkinObservations,
              "Observações do Policial na Devolução"
            )}

            {request.receiverIdReserva && <p className="timestamp-info"><strong>Recebido por (Reserva):</strong> {getUserName(request.receiverIdReserva)}</p>}
            {request.checkinConfirmationTimestamp && <p className="timestamp-info"><strong>Data Confirmação Devolução (Reserva):</strong> {formatNullableDate(request.checkinConfirmationTimestamp)}</p>}
            
            {request.reservaCheckinObservations && (
              <div className="observations-section reserva-obs">
                <span className="detail-label">Observações da Reserva na Devolução:</span>
                <p className="detail-text-block">{request.reservaCheckinObservations}</p>
              </div>
            )}
             {request.status === 'CONCLUIDO' && !request.checkinChecklist && !request.reservaCheckinObservations && (
                <p className="no-data-message">Dados de devolução (checklist/observações da reserva) não totalmente registrados para esta cautela concluída.</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LocalCautelaDetailHistoryModal;