

import React, { useState, useMemo } from 'react';
import { HistoryLog, HistoryEventType, ModalType } from '../../types'; 
import { PrintIcon, CalendarIcon, SearchIcon } from '../../constants'; 
import Spinner from '../ui/Spinner';
import './ManagementPages.css'; // Shared styles

interface HistoryManagementProps {
  historyLogs: HistoryLog[];
  isLoading: boolean;
  openModal: (type: ModalType, data?: any) => void; // Added openModal prop
}

interface ConsolidatedCautelaData {
  id: string; // requestId
  vehiclePrefixo?: string;
  solicitanteName?: string;
  liberadorNameReserva?: string;
  recebedorNameReserva?: string;
  checkoutTimestamp?: string;
  checkinConfirmationTimestamp?: string;
  mission?: string;
  checkoutKm?: number;
  checkinKm?: number;
  status: 'Em Andamento' | 'Concluída';
}

const HistoryManagement: React.FC<HistoryManagementProps> = ({ historyLogs, isLoading, openModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const displayedCautelas = useMemo(() => {
    // 1. Group logs by requestId (targetEntityId for request-related events)
    const cautelasMap = new Map<string, Partial<ConsolidatedCautelaData>>();

    historyLogs.forEach(log => {
      if (!log.targetEntityId || (log.targetEntityType !== 'REQUEST' && log.targetEntityType !== 'VEHICLE')) { // Assuming vehicle status updates might also use targetEntityId=requestId
        return;
      }
      // For history, targetEntityId for REQUEST_CHECKOUT and REQUEST_CHECKIN_CONFIRMED is the request.id
      const requestId = log.targetEntityId;

      if (!cautelasMap.has(requestId)) {
        cautelasMap.set(requestId, { id: requestId });
      }
      const cautelaData = cautelasMap.get(requestId)!;

      if (log.eventType === "REQUEST_CHECKOUT" && log.details) {
        cautelaData.vehiclePrefixo = log.details.vehiclePrefixo || cautelaData.vehiclePrefixo;
        cautelaData.solicitanteName = log.details.solicitanteName || cautelaData.solicitanteName;
        cautelaData.liberadorNameReserva = log.details.liberadorNameReserva || cautelaData.liberadorNameReserva;
        cautelaData.checkoutTimestamp = log.details.checkoutTimestamp || log.timestamp;
        cautelaData.mission = log.details.mission || cautelaData.mission;
        cautelaData.checkoutKm = typeof log.details.checkoutKm === 'number' ? log.details.checkoutKm : cautelaData.checkoutKm;
        cautelaData.status = 'Em Andamento'; // Default if only checkout is found
      } else if (log.eventType === "REQUEST_CHECKIN_CONFIRMED" && log.details) {
        cautelaData.recebedorNameReserva = log.details.recebedorNameReserva || cautelaData.recebedorNameReserva;
        cautelaData.checkinConfirmationTimestamp = log.details.checkinConfirmationTimestamp || log.timestamp;
        cautelaData.checkinKm = typeof log.details.checkinKm === 'number' ? log.details.checkinKm : cautelaData.checkinKm;
        cautelaData.status = 'Concluída';
        // Ensure other fields are populated if only checkin is found (less likely but possible)
        cautelaData.vehiclePrefixo = log.details.vehiclePrefixo || cautelaData.vehiclePrefixo;
        cautelaData.solicitanteName = log.details.solicitanteName || cautelaData.solicitanteName;
        cautelaData.liberadorNameReserva = log.details.liberadorNameReserva || cautelaData.liberadorNameReserva;
        cautelaData.checkoutTimestamp = log.details.checkoutTimestamp || cautelaData.checkoutTimestamp; // from checkin details
        cautelaData.mission = log.details.mission || cautelaData.mission;
        cautelaData.checkoutKm = typeof log.details.checkoutKm === 'number' ? log.details.checkoutKm : cautelaData.checkoutKm;
      }
    });
    
    let consolidatedArray: ConsolidatedCautelaData[] = Array.from(cautelasMap.values())
      .filter(cautela => cautela.checkoutTimestamp) // Only display cautelas that were actually checked out
      .map(cautela => ({
        id: cautela.id!,
        vehiclePrefixo: cautela.vehiclePrefixo,
        solicitanteName: cautela.solicitanteName,
        liberadorNameReserva: cautela.liberadorNameReserva,
        recebedorNameReserva: cautela.recebedorNameReserva,
        checkoutTimestamp: cautela.checkoutTimestamp,
        checkinConfirmationTimestamp: cautela.checkinConfirmationTimestamp,
        mission: cautela.mission,
        checkoutKm: cautela.checkoutKm,
        checkinKm: cautela.checkinKm,
        status: cautela.checkinConfirmationTimestamp ? 'Concluída' : 'Em Andamento',
      }));

    // 2. Apply filters (searchTerm, startDateFilter, endDateFilter)
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase().trim();
      consolidatedArray = consolidatedArray.filter(cautela =>
        (cautela.vehiclePrefixo && cautela.vehiclePrefixo.toLowerCase().includes(lowerSearchTerm)) ||
        (cautela.solicitanteName && cautela.solicitanteName.toLowerCase().includes(lowerSearchTerm)) ||
        (cautela.liberadorNameReserva && cautela.liberadorNameReserva.toLowerCase().includes(lowerSearchTerm)) ||
        (cautela.recebedorNameReserva && cautela.recebedorNameReserva.toLowerCase().includes(lowerSearchTerm)) ||
        (cautela.mission && cautela.mission.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (startDateFilter) {
      const filterStartDate = new Date(startDateFilter);
      filterStartDate.setHours(0, 0, 0, 0);
      consolidatedArray = consolidatedArray.filter(cautela => {
        const cautelaDate = cautela.checkoutTimestamp ? new Date(cautela.checkoutTimestamp) : null;
        return cautelaDate && cautelaDate >= filterStartDate;
      });
    }

    if (endDateFilter) {
      const filterEndDate = new Date(endDateFilter);
      filterEndDate.setHours(23, 59, 59, 999);
      consolidatedArray = consolidatedArray.filter(cautela => {
        // Filter based on checkout for active or checkin for completed for the range
        const dateToCompare = cautela.checkinConfirmationTimestamp ? new Date(cautela.checkinConfirmationTimestamp) : (cautela.checkoutTimestamp ? new Date(cautela.checkoutTimestamp) : null);
        return dateToCompare && dateToCompare <= filterEndDate;
      });
    }
    
    // 3. Sort (e.g., by checkout timestamp descending)
    return consolidatedArray.sort((a, b) => {
      const dateA = a.checkoutTimestamp ? new Date(a.checkoutTimestamp).getTime() : 0;
      const dateB = b.checkoutTimestamp ? new Date(b.checkoutTimestamp).getTime() : 0;
      return dateB - dateA;
    });

  }, [historyLogs, searchTerm, startDateFilter, endDateFilter]);

  const handlePrint = () => {
    document.body.classList.add('is-printing');
    window.print();
    document.body.classList.remove('is-printing');
  };

  const formatNullableDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'}) : 'N/A';
  };
  
  const formatNullableKm = (km?: number) => {
    return typeof km === 'number' ? km.toLocaleString('pt-BR') : 'N/A';
  };

  return (
    <div className="management-page history-management-page">
      <div className="management-header history-header">
        <h3 className="management-title">Histórico de Cautelas</h3>
        <div className="filter-controls history-filter-layout">
          <div className="search-input-group">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              className="filter-input search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Filtrar histórico por nome, viatura, missão ou outros detalhes"
            />
          </div>
          <div className="date-filter-group">
            <CalendarIcon className="date-icon" />
            <input
              type="date"
              className="filter-input date-input"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              aria-label="Filtrar histórico por data inicial (retirada)"
            />
          </div>
          <span className="date-separator">até</span>
          <div className="date-filter-group">
            <CalendarIcon className="date-icon" />
            <input
              type="date"
              className="filter-input date-input"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              aria-label="Filtrar histórico por data final (devolução/retirada)"
            />
          </div>
          <button className="button button-grey no-print" onClick={handlePrint} aria-label="Gerar relatório para impressão">
            <PrintIcon className="button-icon-sm" /> Gerar Relatório
          </button>
        </div>
      </div>

      {isLoading && displayedCautelas.length === 0 ? (
        <Spinner message="Carregando histórico..." />
      ) : (
        <div className="table-container print-area">
          <table className="management-table">
            <thead>
              <tr>
                <th scope="col">Viatura</th>
                <th scope="col">Solicitante</th>
                <th scope="col">Liberado por</th>
                <th scope="col">Recebido por</th>
                <th scope="col">Retirada</th>
                <th scope="col">KM INICIAL</th>
                <th scope="col">Devolução</th>
                <th scope="col">KM FINAL</th>
                <th scope="col">Missão</th>
                <th scope="col">Status</th>
                {/* Ações column removed */}
              </tr>
            </thead>
            <tbody>
              {displayedCautelas.map(cautela => (
                <tr key={cautela.id}>
                  <td 
                    className="table-cell-prefixo clickable-cell"
                    onClick={() => openModal('cautelaDetailHistory', { requestId: cautela.id })}
                    title={`Visualizar detalhes da cautela para ${cautela.vehiclePrefixo || 'N/A'}`}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && openModal('cautelaDetailHistory', { requestId: cautela.id })}
                  >
                    {cautela.vehiclePrefixo || 'N/A'}
                  </td>
                  <td>{cautela.solicitanteName || 'N/A'}</td>
                  <td>{cautela.liberadorNameReserva || 'N/A'}</td>
                  <td>{cautela.recebedorNameReserva || 'N/A'}</td>
                  <td>{formatNullableDate(cautela.checkoutTimestamp)}</td>
                  <td>{formatNullableKm(cautela.checkoutKm)}</td>
                  <td>{cautela.status === 'Concluída' ? formatNullableDate(cautela.checkinConfirmationTimestamp) : 'Em Andamento'}</td>
                  <td>{cautela.status === 'Concluída' ? formatNullableKm(cautela.checkinKm) : 'N/A'}</td>
                  <td style={{ whiteSpace: 'normal', minWidth: '200px' }}>{cautela.mission || 'N/A'}</td>
                  <td>
                     <span className={`status-tag status-${cautela.status === 'Concluída' ? 'concluido' : 'em_uso'}`}>
                       {cautela.status}
                     </span>
                  </td>
                  {/* Actions cell removed */}
                </tr>
              ))}
            </tbody>
          </table>
          {displayedCautelas.length === 0 && !isLoading && (
             <p className="empty-state">
              {searchTerm.trim() || startDateFilter || endDateFilter ? "Nenhuma cautela encontrada para os filtros aplicados." : "Nenhuma cautela registrada."}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryManagement;