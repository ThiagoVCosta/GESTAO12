// src/types.ts

export enum Role {
  Admin = 'ADMIN',
  Reserva = 'RESERVA',
  User = 'USER', // Policial
}

export enum VehicleStatus {
  Disponivel = 'DISPONIVEL',
  EmUso = 'EM_USO',
  Manutencao = 'MANUTENCAO',
  AguardandoRecebimento = 'AGUARDANDO_RECEBIMENTO', // Policial solicitou devolução, aguardando Reserva
}

export enum RequestStatus {
  PendenteReserva = 'PENDENTE_RESERVA', // Solicitado pelo Policial, aguardando aprovação da Reserva
  Aprovado = 'APROVADO', // Reserva aprovou a cautela
  Recusado = 'RECUSADO', // Reserva recusou a cautela
  EmUso = 'EM_USO', // Policial retirou a viatura
  DevolucaoSolicitada = 'DEVOLUCAO_SOLICITADA', // Policial solicitou devolução da viatura
  Concluido = 'CONCLUIDO', // Reserva confirmou o recebimento da viatura
  Cancelado = 'CANCELADO', // Cautela cancelada (antes do uso ou por outros motivos)
}

export enum FleetType {
  Propria = 'PROPRIA', // Owned
  Alugada = 'ALUGADA', // Rented
}

export interface AppUser {
  id: string; // Firebase Auth UID
  name: string;
  matricula: string; // Still used for identification within the app and records
  role: Role;
  authEmail: string; // This will now be the user's personal email, used for Firebase Auth
  // personalEmail?: string; // Removed as authEmail now serves this purpose for Firebase Auth
  hasSetInitialPassword: boolean;
}

export interface Vehicle {
  id: string;
  prefixo: string;
  modelo: string;
  placa: string;
  status: VehicleStatus;
  frota: FleetType; // Added frota field
  km: number;
  kmRevisao?: number; // Added KM for revision
  // imageUrl?: string; // Removido
  currentDriverId?: string | null;
  currentRequestId?: string | null;
}

export interface ChecklistDataItem {
  [key: string]: string | number | boolean | undefined;
}

export interface Request {
  id: string;
  vehicleId: string;
  userId: string;

  userName: string;
  vehiclePrefixo: string;

  mission: string;
  status: RequestStatus;

  requestTimestamp: string;
  approvalTimestamp?: string;
  checkoutTimestamp?: string;
  expectedReturnTimestamp?: string;

  checkinRequestTimestamp?: string;
  checkinConfirmationTimestamp?: string;

  checkoutKm: number;
  checkinKm?: number;

  checkoutChecklist: ChecklistDataItem;
  checkinChecklist?: ChecklistDataItem;

  approverIdReserva?: string;
  receiverIdReserva?: string;

  checkoutObservations?: string;
  checkinObservations?: string;
  reservaCheckoutObservations?: string;
  reservaCheckinObservations?: string;
}

export interface ChecklistItemConfig {
  id: string;
  label: string;
  type: 'boolean' | 'text' | 'number' | 'textarea';
  defaultValue?: string | number | boolean;
  required?: boolean;
  isFixed?: boolean; // Indicates if the item cannot be deleted (e.g., Quilometragem)
}

export interface UnitMetadata {
  id?: string;
  checklistItems: ChecklistItemConfig[];
}

export type ModalType =
  | null
  | 'setInitialPassword'
  | 'forgotPassword'
  | 'vehicleForm'
  | 'confirmDelete' // Generic confirm delete
  | 'vehicleHistory' // This was a placeholder, might be replaced by vehicleCautelaHistory
  | 'vehicleCautelaHistory' // New modal for specific vehicle cautela history
  | 'vehicleDetail'
  | 'userForm'
  // | 'confirmDeleteUser' // Replaced by generic 'confirmDelete'
  | 'requestVehicle'
  | 'approvalModal' // Added for Reserva
  | 'checkinModal'
  | 'approveCheckinModal' // Added for Reserva
  | 'vehicleActions' // New: Modal to show actions for a vehicle
  | 'userActions' // New: Modal to show actions for a user
  | 'accountSettings' // New: Modal for user to change their own email/password
  | 'manualCautelaForm' // New: Modal for Reserva to manually create a cautela
  | 'cautelaDetailHistory'; // Added for viewing cautela history details
  // | 'notificationPanel'; // Removed for notifications
  // | 'locationManagement'; // These will be part of SettingsManagement page, not separate modals
  // | 'checklistItemManagement';

export interface ModalState {
  type: ModalType;
  data?: any;
}

// Type for the translateStatus function
export type TranslateStatusType = (
  status: VehicleStatus | RequestStatus | string | undefined,
  type: 'vehicle' | 'request'
) => string;

// Type for the translateFleetType function
export type TranslateFleetTypeType = (
  type: FleetType | string | undefined
) => string;


// Expanded HistoryEventType for Cautelas
export type HistoryEventType =
  | "REQUEST_CREATED"           // User creates a request
  | "REQUEST_APPROVED"          // Reserva approves a request (might not lead to immediate checkout)
  | "REQUEST_REJECTED"          // Reserva rejects a request
  | "REQUEST_CHECKOUT"          // Reserva marks vehicle as EmUso / User checks out vehicle
  | "REQUEST_CHECKIN_INITIATED" // User initiates check-in
  | "REQUEST_CHECKIN_CONFIRMED" // Reserva confirms check-in
  | "REQUEST_CANCELLED"         // Request is cancelled
  | "VEHICLE_STATUS_UPDATED"    // Vehicle status manually changed (e.g., to/from Maintenance)
  | "SYSTEM_ERROR";             // For critical errors during request processing


export interface HistoryLog {
  id?: string; // Auto-generated by Firestore
  timestamp: any; // Firestore ServerTimestamp
  eventType: HistoryEventType;
  userId?: string; // UID of the user performing the action (often the Reserva or the User)
  userName?: string; // Name of the user (denormalized)
  targetEntityType?: 'REQUEST' | 'SYSTEM' | 'VEHICLE' | 'USER'; // Expanded target entities
  targetEntityId?: string; // ID of the Request document, Vehicle ID, User ID, etc.
  description: string; // Human-readable description
  details?: Record<string, any>; // Optional structured details, e.g., { vehicleId, mission }
}

// Notification System Types Removed
