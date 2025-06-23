// src/constants.tsx

import React from 'react';
import { AppUser, Role, Vehicle, Request as CautelaRequest, VehicleStatus, RequestStatus, ChecklistItemConfig, TranslateStatusType, HistoryLog, FleetType, TranslateFleetTypeType } from './types';

export const FULLY_SIMULATED_MODE = true; // Ensures app runs in simulated mode by default
export const SESSION_DURATION_MINUTES = 60; // Minutes for normal session
export const SIMULATED_SESSION_DURATION_MINUTES = 5; // Shorter duration for testing in simulated mode


export const DEFAULT_AUTH_EMAIL_DOMAIN = "pm.to.gov.br"; // Kept for reference if needed, but not for direct auth email construction
export const DEFAULT_INITIAL_PASSWORD = "123456"; 
export const MOCK_LOGIN_PASSWORD = "senha123";


export const INITIAL_CHECKLIST_ITEMS: ChecklistItemConfig[] = [
  { id: 'km_saida', label: 'Quilometragem Saída', type: 'number', required: true, isFixed: true },
  { id: 'km_final', label: 'Quilometragem Devolução', type: 'number', required: true, isFixed: true },
  { id: 'luzes', label: 'Luzes', type: 'boolean', defaultValue: false },
  { id: 'pneus', label: 'Pneus', type: 'boolean', defaultValue: false },
  { id: 'freios', label: 'Freios', type: 'boolean', defaultValue: false },
  { id: 'nivel_combustivel', label: 'Nível de Combustível (Ex: 1/4, 1/2, Cheio)', type: 'text', required: true, defaultValue: "Cheio" },
  { id: 'limpeza_externa', label: 'Limpeza Externa', type: 'boolean', defaultValue: false },
  { id: 'limpeza_interna', label: 'Limpeza Interna', type: 'boolean', defaultValue: false },
  { id: 'sirene_giroflex', label: 'Sirene e Giroflex', type: 'boolean', defaultValue: false },
  { id: 'radio_comunicador', label: 'Rádio Comunicador (HT)', type: 'boolean', defaultValue: false },
  { id: 'documentacao_obrigatoria', label: 'Documentação Obrigatória (CRLV)', type: 'boolean', defaultValue: false },
  { id: 'avarias_observacoes', label: 'Avarias Externas / Observações Gerais', type: 'textarea', defaultValue: 'Nenhuma avaria aparente.' },
];


export const MOCK_USER_SEED_DATA: AppUser[] = [
  {
    id: 'admin001_uid_mock',
    name: 'SGT LUCAS',
    matricula: 'admin', 
    role: Role.Admin,
    authEmail: 'lucas.admin@example.com', // Personal email is now authEmail
    hasSetInitialPassword: true, 
  },
  {
    id: 'reserva001_uid_mock',
    name: 'TEN COSTA',
    matricula: 'reserva', 
    role: Role.Reserva,
    authEmail: 'costa.reserva@example.com', // Personal email is now authEmail
    hasSetInitialPassword: true, 
  },
  {
    id: 'user001_uid_mock',
    name: 'SD PAULO',
    matricula: 'user', 
    role: Role.User,
    authEmail: 'paulo.sd@example.com', // Example personal email
    hasSetInitialPassword: true, 
  },
   {
    id: 'user002_uid_mock', 
    name: 'Soldado Policial Ana Costa (Precisa Configurar)',
    matricula: 'user02', 
    role: Role.User,
    authEmail: 'ana.costa@example.com', // Example personal email
    hasSetInitialPassword: false, 
  },
  {
    id: 'user_guti_mock',
    name: 'GUTI',
    matricula: '010203',
    role: Role.User,
    authEmail: 'guti.policial@example.com', // Example personal email
    hasSetInitialPassword: false, 
  },
  {
    id: 'user_thiago_admin_mock',
    name: 'THIAGO VINICIUS (Admin Profile)', 
    matricula: '123456789', 
    role: Role.Admin,
    authEmail: 'thiago.admin@example.com', 
    hasSetInitialPassword: true,
  },
   {
    id: 'user_thiago_reserva_mock',
    name: 'THIAGO VINICIUS (Reserva Profile)',
    matricula: '987654321',
    role: Role.Reserva,
    authEmail: 'thiago.reserva@example.com',
    hasSetInitialPassword: true,
  },
  {
    id: 'user_thiago_user1_mock',
    name: 'THIAGO VINICIUS (User1 Profile)',
    matricula: '123456700',
    role: Role.User,
    authEmail: 'thiago.user1@example.com',
    hasSetInitialPassword: true,
  },
  { 
    id: 'user_thiago_user2_mock',
    name: 'THIAGO VINICIUS (User2 Profile - Precisa Configurar)',
    matricula: '123456701', 
    role: Role.User,
    authEmail: 'thiago.user2@example.com', 
    hasSetInitialPassword: false,
  },
  {
    id: 'user_random_001_uid_mock',
    name: 'João Silva',
    matricula: '2024001',
    role: Role.User,
    authEmail: 'joao.silva@example.com',
    hasSetInitialPassword: true,
  },
  {
    id: 'user_random_002_uid_mock',
    name: 'Maria Oliveira (Precisa Configurar)',
    matricula: '2024002',
    role: Role.User,
    authEmail: 'maria.oliveira@example.com',
    hasSetInitialPassword: false,
  },
  {
    id: 'user_random_003_uid_mock',
    name: 'Carlos Pereira',
    matricula: '2024003',
    role: Role.Reserva, 
    authEmail: 'carlos.pereira@example.com',
    hasSetInitialPassword: true,
  },
  {
    id: 'user_random_004_uid_mock',
    name: 'Ana Souza',
    matricula: '2024004',
    role: Role.User,
    authEmail: 'ana.souza@example.com',
    hasSetInitialPassword: true,
  },
];

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'vtr_mock_admin_001', prefixo: 'VTR-101', modelo: 'Fiat Palio Weekend', placa: 'SGV-A101', status: VehicleStatus.Disponivel, frota: FleetType.Propria, km: 95000, kmRevisao: 100000 },
  { id: 'vtr_mock_admin_002', prefixo: 'VTR-235', modelo: 'Chevrolet Trailblazer', placa: 'SGV-A235', status: VehicleStatus.AguardandoRecebimento, frota: FleetType.Alugada, km: 88730, kmRevisao: 90000, currentDriverId: 'user001_uid_mock', currentRequestId: 'req_mock_001_admin_devolucao_solicitada' }, 
  { id: 'vtr_mock_admin_003', prefixo: 'VTR-401', modelo: 'Ford Ranger', placa: 'SGV-A401', status: VehicleStatus.Manutencao, frota: FleetType.Propria, km: 215400, kmRevisao: 220000 },
  { id: 'vtr_mock_admin_004', prefixo: 'VTR-710', modelo: 'Renault Duster', placa: 'SGV-A710', status: VehicleStatus.Disponivel, frota: FleetType.Alugada, km: 120500, kmRevisao: 125000 }, 
  { id: 'vtr_mock_admin_005', prefixo: 'VTR-D01', modelo: 'Renault Duster', placa: 'SGV-D001', status: VehicleStatus.Disponivel, frota: FleetType.Propria, km: 35000, kmRevisao: 40000 },
  { id: 'vtr_mock_admin_006', prefixo: 'VTR-D02', modelo: 'Renault Duster', placa: 'SGV-D002', status: VehicleStatus.Manutencao, frota: FleetType.Alugada, km: 48000, kmRevisao: 50000 },
  { id: 'vtr_mock_admin_007', prefixo: 'VTR-D03', modelo: 'Renault Duster', placa: 'SGV-D003', status: VehicleStatus.Disponivel, frota: FleetType.Propria, km: 12000, kmRevisao: 15000 },
  { id: 'vtr_mock_admin_008', prefixo: 'VTR-D04', modelo: 'Renault Duster', placa: 'SGV-D004', status: VehicleStatus.Disponivel, frota: FleetType.Alugada, km: 29000, kmRevisao: 30000 },
  { id: 'vtr_mock_admin_009', prefixo: 'VTR-L01', modelo: 'Mitsubishi L200', placa: 'SGV-L001', status: VehicleStatus.Disponivel, frota: FleetType.Propria, km: 65000, kmRevisao: 70000 },
  { id: 'vtr_mock_admin_010', prefixo: 'VTR-L02', modelo: 'Mitsubishi L200', placa: 'SGV-L002', status: VehicleStatus.Disponivel, frota: FleetType.Alugada, km: 72000, kmRevisao: 75000 },
  {
    id: 'vtr_mock_001', 
    prefixo: 'PM-0285', 
    modelo: 'Toyota Hilux', 
    placa: 'SGV-0001',
    status: VehicleStatus.Disponivel,
    frota: FleetType.Propria,
    km: 0, 
    kmRevisao: 10000,
  },
  { 
    id: 'vtr_mock_em_uso_reserva',
    prefixo: 'VTR-888',
    modelo: 'VW Amarok',
    placa: 'SGV-R888',
    status: VehicleStatus.EmUso,
    frota: FleetType.Alugada,
    km: 55000,
    kmRevisao: 60000,
    currentDriverId: 'user_random_001_uid_mock',
    currentRequestId: 'request_em_uso_reserva_001'
  },
];

export const MOCK_REQUESTS: CautelaRequest[] = [
  { 
    id: 'req_reserva_pending_caution_001',
    vehicleId: 'vtr_mock_admin_004', 
    userId: 'user001_uid_mock',     
    userName: 'SD PAULO', 
    vehiclePrefixo: 'VTR-710',
    mission: 'Patrulhamento Ostensivo Área Central', 
    status: RequestStatus.PendenteReserva, 
    requestTimestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), 
    checkoutKm: 120500, 
    checkoutChecklist: { km_saida: 120500, luzes: false, pneus: false }, // Updated to false
  },
  { 
    id: 'req_mock_001_admin_devolucao_solicitada',
    vehicleId: 'vtr_mock_admin_002', 
    userId: 'user001_uid_mock',    
    userName: 'SD PAULO', 
    vehiclePrefixo: 'VTR-235',
    mission: 'Missão Especial Admin', 
    status: RequestStatus.DevolucaoSolicitada, 
    requestTimestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), 
    approvalTimestamp: new Date(Date.now() - 9.9 * 60 * 60 * 1000).toISOString(),
    checkoutTimestamp: new Date(Date.now() - 9.8 * 60 * 60 * 1000).toISOString(),
    checkinRequestTimestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), 
    checkoutKm: 88000, 
    checkinKm: 88730, 
    checkoutChecklist: { km_saida: 88000, luzes: false, pneus: false }, // Updated to false
    checkinChecklist: { km_final: 88730, luzes: false, pneus: false, avarias_observacoes: "Viatura retornou sem avarias." }, // Updated to false
    checkinObservations: "Viatura retornou sem avarias.",
    approverIdReserva: 'reserva001_uid_mock',
  },
   { 
    id: 'request_em_uso_reserva_001',
    vehicleId: 'vtr_mock_em_uso_reserva', 
    userId: 'user_random_001_uid_mock',    
    userName: 'João Silva',
    vehiclePrefixo: 'VTR-888',
    mission: 'Apoio Tático Setor Leste',
    status: RequestStatus.EmUso,
    requestTimestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    approvalTimestamp: new Date(Date.now() - 4.9 * 60 * 60 * 1000).toISOString(),
    checkoutTimestamp: new Date(Date.now() - 4.8 * 60 * 60 * 1000).toISOString(),
    checkoutKm: 54800,
    checkoutChecklist: { km_saida: 54800, luzes: false }, // Updated to false
    approverIdReserva: 'reserva001_uid_mock',
  },
   {
    id: 'req_mock_hist_001',
    vehicleId: 'vtr_mock_admin_001',
    userId: 'user002_uid_mock',
    userName: 'Soldado Policial Ana Costa (Precisa Configurar)',
    vehiclePrefixo: 'VTR-101',
    mission: 'Patrulha de Rotina',
    status: RequestStatus.Concluido,
    requestTimestamp: new Date('2023-10-01T10:00:00Z').toISOString(),
    approvalTimestamp: new Date('2023-10-01T10:05:00Z').toISOString(),
    checkoutTimestamp: new Date('2023-10-01T10:15:00Z').toISOString(),
    checkinRequestTimestamp: new Date('2023-10-01T18:00:00Z').toISOString(),
    checkinConfirmationTimestamp: new Date('2023-10-01T18:05:00Z').toISOString(),
    checkoutKm: 94500,
    checkinKm: 95000,
    checkoutChecklist: { km_saida: 94500, luzes: false }, // Updated to false
    checkinChecklist: { km_final: 95000, luzes: false }, // Updated to false
    approverIdReserva: 'reserva001_uid_mock',
    receiverIdReserva: 'reserva001_uid_mock',
  }
];

export const MOCK_HISTORY_LOGS: HistoryLog[] = [
  {
    id: 'hist_mock_checkout_001',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    eventType: "REQUEST_CHECKOUT",
    userId: 'reserva001_uid_mock', 
    userName: 'TEN COSTA', 
    targetEntityType: "REQUEST",
    targetEntityId: 'request_em_uso_reserva_001',
    description: "Viatura VTR-888 retirada por João Silva. Liberada por TEN COSTA.",
    details: {
      vehicleId: 'vtr_mock_em_uso_reserva',
      vehiclePrefixo: 'VTR-888',
      solicitanteId: 'user_random_001_uid_mock',
      solicitanteName: 'João Silva',
      liberadorIdReserva: 'reserva001_uid_mock',
      liberadorNameReserva: 'TEN COSTA', 
      checkoutTimestamp: new Date(Date.now() - 4.8 * 60 * 60 * 1000).toISOString(), 
      checkoutKm: 54800, 
      mission: 'Apoio Tático Setor Leste' 
    }
  },
  {
    id: 'hist_mock_checkin_001',
    timestamp: new Date('2023-10-01T18:05:00Z').toISOString(), 
    eventType: "REQUEST_CHECKIN_CONFIRMED",
    userId: 'reserva001_uid_mock', 
    userName: 'TEN COSTA', 
    targetEntityType: "REQUEST",
    targetEntityId: 'req_mock_hist_001',
    description: "Viatura VTR-101 devolvida por Soldado Policial Ana Costa (Precisa Configurar). Recebida por TEN COSTA. (Liberada por: TEN COSTA).",
    details: {
      vehicleId: 'vtr_mock_admin_001',
      vehiclePrefixo: 'VTR-101',
      solicitanteId: 'user002_uid_mock',
      solicitanteName: 'Soldado Policial Ana Costa (Precisa Configurar)',
      liberadorIdReserva: 'reserva001_uid_mock',
      liberadorNameReserva: 'TEN COSTA', 
      recebedorIdReserva: 'reserva001_uid_mock',
      recebedorNameReserva: 'TEN COSTA', 
      checkoutTimestamp: new Date('2023-10-01T10:15:00Z').toISOString(), 
      checkinConfirmationTimestamp: new Date('2023-10-01T18:05:00Z').toISOString(), 
      checkoutKm: 94500, 
      checkinKm: 95000, 
      mission: 'Patrulha de Rotina' 
    }
  },
];

// MOCK_NOTIFICATIONS removed

export const translateStatus: TranslateStatusType = (status, type) => {
  if (!status) return 'Status Desconhecido';
  if (type === 'vehicle') {
    switch (status as VehicleStatus) {
      case VehicleStatus.Disponivel: return 'Disponível';
      case VehicleStatus.EmUso: return 'Em Uso';
      case VehicleStatus.Manutencao: return 'Manutenção';
      case VehicleStatus.AguardandoRecebimento: return 'Aguardando Recebimento';
      default: return status as string;
    }
  } else if (type === 'request') {
    switch (status as RequestStatus) {
      case RequestStatus.PendenteReserva: return 'Pendente Aprovação Reserva';
      case RequestStatus.Aprovado: return 'Aprovado para Saída';
      case RequestStatus.Recusado: return 'Recusado pela Reserva';
      case RequestStatus.EmUso: return 'Viatura em Uso';
      case RequestStatus.DevolucaoSolicitada: return 'Devolução Solicitada';
      case RequestStatus.Concluido: return 'Concluído';
      case RequestStatus.Cancelado: return 'Cancelado';
      default: return status as string;
    }
  }
  return status as string;
};

export const translateFleetType: TranslateFleetTypeType = (type) => {
  if (!type) return 'Desconhecido';
  switch (type as FleetType) {
    case FleetType.Propria: return 'Própria';
    case FleetType.Alugada: return 'Alugada';
    default: return type as string;
  }
};

export const emailMasker = (email?: string): string => {
  if (!email) return 'Email não fornecido';
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return 'Email inválido';

  const maskedLocalPart = localPart.length > 3 
    ? localPart.substring(0, 3) + '***'
    : localPart.substring(0, 1) + '***';
  
  return `${maskedLocalPart}@${domain}`;
};

export const formatNotificationTimestamp = (isoTimestamp: string): string => {
  const date = new Date(isoTimestamp);
  const now = new Date();
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);

  if (diffSeconds < 60) return `${diffSeconds}s atrás`;
  if (diffMinutes < 60) return `${diffMinutes}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  
  // For older dates, show date and time
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


// Icons as React Components
export const KeyIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path fillRule="evenodd" d="M11.022 1.01a.75.75 0 01.794.062l4.25 3.5a.75.75 0 01.062.794l-1.01 4.042a.75.75 0 01-.856.606l-4.042-1.01a.75.75 0 01-.606-.856l1.01-4.042a.75.75 0 01.398-.592L11.022 1.01zm1.06 1.06L9.667 3.985l-.558 2.23L11.34 7.44l2.23-.558L12.082 2.07z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M3.75 6.75A.75.75 0 014.5 6h4.518L7.33 8.185A2.25 2.25 0 006.32 10.5H5.25a.75.75 0 000 1.5h1.07a2.25 2.25 0 002.002-1.315L10.49 8.5H12a.75.75 0 010 1.5H8.75A.75.75 0 018 9.25V7.5H4.5A.75.75 0 013.75 6.75zM12.5 12.375a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008zM14.25 10.875a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008zM16 12.375a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" clipRule="evenodd" />
    <path d="M5.01 12.657a4.5 4.5 0 006.364 6.364 4.5 4.5 0 006.364-6.364l-2.022-2.022A2.25 2.25 0 0014.07 10.5H12.75a.75.75 0 000 1.5h1.32c.318 0 .629.131.849.351l1.767 1.768a3 3 0 11-4.242 4.242 3 3 0 01-4.242-4.242l1.768-1.767a.75.75 0 10-1.06-1.06l-1.768 1.767A4.501 4.501 0 005.01 12.657z" />
  </svg>
);

export const CarIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} version="1.1" id="fi_635735" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enableBackground="new 0 0 512 512" xmlSpace="preserve" width="1em" height="1em" fill="currentColor">
    <g>
      <g>
        <polygon points="32,405.333 32,469.333 138.667,469.333 138.667,416 		"/>
      </g>
    </g>
    <g>
      <g>
        <path d="M138.667,405.333c-5.888,0-10.667,4.779-10.667,10.667v42.667H42.667v-53.333c0-5.888-4.779-10.667-10.667-10.667
			s-10.667,4.779-10.667,10.667v64C21.333,475.221,26.112,480,32,480h106.667c5.888,0,10.667-4.779,10.667-10.667V416
			C149.333,410.112,144.555,405.333,138.667,405.333z"/>
      </g>
    </g>
    <g>
      <g>
        <path d="M511.552,309.333h-56.555c-8.533,0-16.576,3.328-22.613,9.365L399.083,352h111.339c0.939-10.027,1.579-20.821,1.579-32
			C512,316.267,511.744,312.853,511.552,309.333z"/>
      </g>
    </g>
    <g>
      <g>
        <path d="M79.616,318.699c-6.037-6.037-14.08-9.365-22.635-9.365H0.448C0.256,312.853,0,316.267,0,320
			c0,11.179,0.64,21.973,1.579,32h111.339L79.616,318.699z"/>
      </g>
    </g>
    <g>
      <g>
        <path d="M363.477,366.741c-1.664-3.989-0.747-8.576,2.304-11.627l51.499-51.499C427.349,293.547,440.747,288,454.997,288h54.229
			c-5.675-29.653-20.352-49.579-45.632-62.784c-29.419-15.381-95.381-22.549-207.595-22.549s-178.176,7.168-207.595,22.549
			C23.125,238.421,8.448,258.347,2.773,288h54.229c14.251,0,27.648,5.547,37.717,15.616l51.499,51.499
			c3.051,3.051,3.968,7.637,2.304,11.627c-1.643,3.989-5.547,6.592-9.856,6.592H4.224c3.008,20.032,6.549,33.792,6.805,34.752
			c1.237,4.672,5.461,7.915,10.304,7.915h93.483l40.427,20.203c1.472,0.747,3.093,1.131,4.757,1.131h192
			c1.664,0,3.285-0.384,4.779-1.131L397.205,416h93.461c4.843,0,9.067-3.243,10.304-7.915c0.256-0.96,3.797-14.72,6.805-34.752
			H373.333C369.024,373.333,365.12,370.731,363.477,366.741z M328.192,369.493c-2.027,2.432-5.035,3.84-8.192,3.84H192
			c-3.157,0-6.165-1.408-8.192-3.84l-53.333-64c-2.645-3.179-3.221-7.616-1.451-11.349c1.728-3.755,5.504-6.144,9.643-6.144h234.667
			c4.139,0,7.915,2.389,9.664,6.144c1.771,3.733,1.195,8.171-1.451,11.349L328.192,369.493z"/>
      </g>
    </g>
    <g>
      <g>
        <polygon points="161.429,309.333 196.992,352 315.008,352 350.571,309.333 		"/>
      </g>
    </g>
    <g>
      <g>
        <polygon points="373.333,416 373.333,469.333 480,469.333 480,405.333 		"/>
      </g>
    </g>
    <g>
      <g>
        <path d="M480,394.667c-5.888,0-10.667,4.779-10.667,10.667v53.333H384V416c0-5.888-4.779-10.667-10.667-10.667
			c-5.888,0-10.667,4.779-10.667,10.667v53.333c0,5.888,4.779,10.667,10.667,10.667H480c5.888,0,10.667-4.779,10.667-10.667v-64
			C490.667,399.445,485.888,394.667,480,394.667z"/>
      </g>
    </g>
    <g>
      <g>
        <path d="M352,32H160c-17.643,0-32,14.357-32,32s14.357,32,32,32h192c17.643,0,32-14.357,32-32S369.643,32,352,32z M234.667,74.667
			c0,5.888-4.779,10.667-10.667,10.667s-10.667-4.779-10.667-10.667V53.333c0-5.888,4.779-10.667,10.667-10.667
			s10.667,4.779,10.667,10.667V74.667z M298.667,74.667c0,5.888-4.779,10.667-10.667,10.667s-10.667-4.779-10.667-10.667V53.333
			c0-5.888,4.779-10.667,10.667-10.667s10.667,4.779,10.667,10.667V74.667z"/>
      </g>
    </g>
    <g>
      <g>
        <path d="M468.437,230.421c-12.117-27.904-52.757-119.872-66.88-131.883c-14.656-12.459-52.309-20.651-103.061-23.061
			c-0.427,5.504-4.885,9.856-10.496,9.856c-5.824,0-10.517-4.672-10.624-10.475c-3.584-0.064-7.019-0.192-10.709-0.192h-21.333
			c-3.691,0-7.125,0.128-10.709,0.192c-0.107,5.803-4.8,10.475-10.624,10.475c-5.611,0-10.069-4.352-10.496-9.856
			c-50.773,2.411-88.427,10.603-103.061,23.061C96.32,110.549,55.68,202.517,43.563,230.421c-2.347,5.397,0.128,11.691,5.525,14.037
			s11.691-0.128,14.037-5.525c24.085-55.467,53.547-117.056,61.12-124.117C132.459,107.819,167.189,96,245.333,96h21.333
			c78.144,0,112.875,11.819,121.045,18.752c7.616,7.104,37.099,68.715,61.184,124.16c1.749,4.011,5.675,6.421,9.792,6.421
			c1.408,0,2.859-0.277,4.245-0.896C468.331,242.112,470.805,235.819,468.437,230.421z"/>
      </g>
    </g>
  </svg>
);
export const UsersIcon: React.FC<{className?: string}> = ({className}) => (
 <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
  </svg>
);
export const HistoryIcon: React.FC<{className?: string}> = ({className}) => ( 
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
  </svg>
);
export const TabHistoryIcon: React.FC<{className?: string}> = HistoryIcon; 

export const SettingsIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
    <path fillRule="evenodd" d="M11.828 2.25c-.916 0-1.699.663-1.921 1.566l-.317 1.268a11.953 11.953 0 00-1.043.606l-1.267-.317a2.25 2.25 0 00-2.529.729l-1.385 2.426a2.25 2.25 0 00.73 2.53l1.268.317a11.953 11.953 0 000 2.498l-1.268.317a2.25 2.25 0 00-.73 2.53l1.385 2.426a2.25 2.25 0 002.53.729l1.267-.317a11.953 11.953 0 001.043.606l.317 1.268c.222.903.996 1.566 1.921 1.566h1.844c.916 0 1.699-.663 1.921-1.566l.317-1.268a11.953 11.953 0 001.043-.606l1.267.317a2.25 2.25 0 002.53-.729l1.385-2.426a2.25 2.25 0 00-.73-2.53l-1.268-.317a11.953 11.953 0 000-2.498l1.268-.317a2.25 2.25 0 00.73-2.53l-1.385-2.426a2.25 2.25 0 00-2.53-.729l-1.267.317a11.953 11.953 0 00-1.043-.606l-.317-1.268A2.25 2.25 0 0013.672 2.25h-1.844zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
  </svg>
);


export const LogoutIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
  </svg>
);
export const EyeIcon: React.FC = () => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893 2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);
export const SyncIcon: React.FC<{className?: string}> = ({className}) => ( // Added className prop
 <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
  <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.204 2.108L3.43 16.07A7.5 7.5 0 0010 18.5a7.502 7.502 0 007.458-6.075 1.5 1.5 0 00-2.146-1.001zM4.688 8.576a5.5 5.5 0 019.204-2.108L16.57 3.93A7.5 7.5 0 0010 1.5a7.502 7.502 0 00-7.458 6.075 1.5 1.5 0 002.146 1.001z" clipRule="evenodd" />
</svg>
);
export const PlusIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);
export const EditIcon: React.FC<{className?: string}> = ({className}) => (
 <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25-1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
  </svg>
);
export const DeleteIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25V4h2.5zM8.496 6.675a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM7.5 10.5a.75.75 0 00.75.75h4a.75.75 0 000-1.5h-4a.75.75 0 00-.75.75z" clipRule="evenodd" />
  </svg>
);
export const CheckIcon: React.FC = () => <span role="img" aria-label="Confirmar">✔️</span>;
export const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);
export const PrintIcon: React.FC<{className?: string}> = ({className}) => (
 <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path fillRule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.5A1.75 1.75 0 0113.25 8H6.75A1.75 1.75 0 015 6.25v-3.5zm0 9.5c0-.966.784-1.75 1.75-1.75h6.5A1.75 1.75 0 0115 12.25v3.5c0 .966-.784 1.75-1.75 1.75h-6.5A1.75 1.75 0 015 15.75v-3.5zM8 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    <path d="M.5 6.25A1.75 1.75 0 012.25 4.5h15.5A1.75 1.75 0 0119.5 6.25v7.5A1.75 1.75 0 0117.75 15.5H16V14h.25a.25.25 0 00.25-.25V6.5a.25.25 0 00-.25-.25H3.5a.25.25 0 00-.25.25v7.25c0 .138.112.25.25.25H4v1.5H2.25A1.75 1.75 0 01.5 13.75v-7.5z" />
  </svg>
);
export const CalendarIcon: React.FC<{className?: string}> = ({className}) => (
 <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
  <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c0-.69.56-1.25 1.25-1.25H14c.69 0 1.25.56 1.25 1.25v1.5c0 .69-.56 1.25-1.25 1.25H6A1.25 1.25 0 014.75 9v-1.5z" clipRule="evenodd" />
</svg>
);
export const SearchIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
  </svg>
);

export const CheckCircleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

export const XCircleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

export const ClipboardCheckIcon: React.FC<{className?: string}> = ({ className }) => ( 
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path d="M7.5 3.75A1.75 1.75 0 005.75 2h-3.5A1.75 1.75 0 00.5 3.75v12.5A1.75 1.75 0 002.25 18h11.5A1.75 1.75 0 0015.5 16.25V3.75A1.75 1.75 0 0013.75 2h-3.5A1.75 1.75 0 008.5 3.75v1.75h-1V3.75z" />
    <path fillRule="evenodd" d="M8.586 8.207a.5.5 0 00-.707 0l-2.5 2.5a.5.5 0 00.707.707L8 9.586l3.646 3.647a.5.5 0 00.707-.707l-4-4a.5.5 0 00-.06-.05z" clipRule="evenodd" />
    <path d="M11.5 1.75a.25.25 0 01.25-.25h2a.25.25 0 01.25.25V5h-2.5V1.75z" />
  </svg>
);

export const ClipboardPencilIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path fillRule="evenodd" d="M14.044 3.73a.75.75 0 011.06 0l1.167 1.166a.75.75 0 010 1.06l-8.5 8.5a.75.75 0 01-.363.208l-2.5.75a.75.75 0 01-.84-.84l.75-2.5a.75.75 0 01.208-.363l8.5-8.5zM12.984 4.79l-8.25 8.25.962 1.925 1.925.962 8.25-8.25-2.887-2.887z" clipRule="evenodd" />
    <path d="M2.5 2.75A.75.75 0 001.75 3.5v13.5c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75V9.914a.75.75 0 00-1.5 0V17H2.5V3.5h7.414a.75.75 0 000-1.5H2.5z" />
  </svg>
);

export const WrenchIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path fillRule="evenodd" d="M10.99 3.018a.75.75 0 010 1.06l-1.35 1.352c.22.115.432.24.636.376l1.35-1.352a.75.75 0 111.06 1.06l-1.35 1.35a2.502 2.502 0 01-.176 3.033L8.802 12.31a.75.75 0 11-1.06-1.06l2.368-2.368a2.502 2.502 0 013.033-.176l1.35-1.35a.75.75 0 111.06 1.06l-1.35 1.35a2.502 2.502 0 01-.176 3.033L10.3 14.678a.75.75 0 11-1.06-1.06l2.368-2.368a2.502 2.502 0 013.033-.176l1.352-1.35a.75.75 0 011.06 1.06l-1.351 1.35a2.502 2.502 0 01-.176 3.033L3.81 16.982a.75.75 0 11-1.06-1.06L5.118 13.56a2.502 2.502 0 01-.176-3.033L2.58 8.169a.75.75 0 011.06-1.06l2.362 2.362a2.502 2.502 0 013.033-.176L10.395 8.01a.75.75 0 111.06-1.06l-1.28-1.28a2.502 2.502 0 01-.177-3.033L10.99 3.018zM12.94 9.01a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

export const PlayCircleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

export const UserCircleIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" width="1em" height="1em">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
  </svg>
);

export const EmailIcon: React.FC<{className?: string}> = ({className}) => (
 <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" width="1em" height="1em">
    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
  </svg>
);

export const LockClosedIcon: React.FC<{className?: string}> = ({className}) => (
 <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" width="1em" height="1em">
    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
  </svg>
);

export const ClipboardIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
  <path fillRule="evenodd" d="M10.5 3A1.501 1.501 0 0 0 9 4.5h6A1.5 1.5 0 0 0 13.5 3h-3Zm-2.693.178A3 3 0 0 1 10.5 1.5h3a3 3 0 0 1 2.694 1.678c.497.042.992.092 1.486.15 1.497.173 2.57 1.46 2.57 2.929V19.5a3 3 0 0 1-3 3H6.75a3 3 0 0 1-3-3V6.257c0-1.47 1.073-2.756 2.57-2.93.493-.057.989-.107 1.487-.15Z" clipRule="evenodd" />
</svg>

);

export const GripVerticalIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em">
    <path d="M7 2a1 1 0 011-1h4a1 1 0 011 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1V2zM6 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 5a1 1 0 100 2h6a1 1 0 100-2H7zM6 16a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z"/>
  </svg>
);

// BellIcon removed

// console.log("constants.ts loaded."); 
// console.log("firebaseService.ts loaded. FULLY_SIMULATED_MODE:", FULLY_SIMULATED_MODE); 
// initializeFirebase();
