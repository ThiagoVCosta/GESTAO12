




import React from 'react';
import { AppUser, Role, Vehicle, Request as CautelaRequest, ModalType, ChecklistItemConfig, HistoryLog, ChecklistDataItem } from '../../types'; 
import AdminPanel from '../panels/AdminPanel';
import ReservaPanel from '../panels/ReservaPanel'; 
import UserPanel from '../panels/UserPanel'; 
import Spinner from '../ui/Spinner';
import { AdminPanelTabId, ReservaPanelTabId } from '../../App'; // Import tab ID types

interface DashboardRouterProps {
  currentUser: AppUser;
  viewAsPolice: boolean;
  adminViewingAsRole: Role | null; 
  vehicles: Vehicle[];
  requests: CautelaRequest[];
  users: AppUser[];
  // locations: string[]; // Removed
  checklistItems: ChecklistItemConfig[];
  historyLogs: HistoryLog[]; 
  openModal: (type: ModalType, data?: any) => void;
  setModalState: React.Dispatch<React.SetStateAction<any>>; 
  isLoading: boolean;
  onAddOrUpdateVehicle: (vehicleData: Omit<Vehicle, 'id' | 'status'> | Vehicle) => Promise<void>;
  onDeleteVehicle: (vehicleId: string) => void; 
  onToggleVehicleMaintenanceStatus: (vehicleId: string) => Promise<void>; 
  onAddOrUpdateUser: (userData: Omit<AppUser, 'id' | 'hasSetInitialPassword'> | AppUser, isNew: boolean, initialPassword?: string) => Promise<void>;
  onDeleteUser: (userId: string) => void;
  onAdminResetUserPassword: (userId: string) => Promise<void>; 
  // onAddLocation: (locationName: string) => Promise<void>; // Removed
  // onDeleteLocation: (locationName: string) => void; // Removed
  onAddChecklistItem: (itemConfig: Omit<ChecklistItemConfig, 'id'>) => Promise<void>;
  onDeleteChecklistItem: (itemId: string) => void;
  onUpdateChecklistOrder: (reorderedItems: ChecklistItemConfig[]) => Promise<void>; 
  onProcessCheckoutApproval: (requestId: string, approved: boolean, observations?: string) => Promise<void>;
  onProcessCheckinConfirmation: (requestId: string, finalKm?: number, checkinChecklist?: any, observations?: string) => Promise<void>;
  onManualCautelaCreate: (
    vehicleId: string, 
    selectedUserId: string, 
    mission: string, 
    checkoutKm: number, 
    checkoutChecklist: ChecklistDataItem, 
    reservaObservations?: string
  ) => Promise<void>;
  adminActiveTab: AdminPanelTabId; 
  setAdminActiveTab: (tab: AdminPanelTabId) => void;
  reservaActiveTab: ReservaPanelTabId;
  setReservaActiveTab: (tab: ReservaPanelTabId) => void;
}

const DashboardRouter: React.FC<DashboardRouterProps> = (props) => {
  const {
    currentUser,
    viewAsPolice,
    adminViewingAsRole, 
    isLoading,
    vehicles,
    requests,
    users,
    // locations, // Removed
    checklistItems,
    historyLogs,
    openModal,
    onAddOrUpdateVehicle,
    onDeleteVehicle,
    onToggleVehicleMaintenanceStatus,
    onAddOrUpdateUser,
    onDeleteUser,
    onAdminResetUserPassword,
    // onAddLocation, // Removed
    // onDeleteLocation, // Removed
    onAddChecklistItem,
    onDeleteChecklistItem,
    onUpdateChecklistOrder, 
    onProcessCheckoutApproval,
    onProcessCheckinConfirmation,
    onManualCautelaCreate,
    adminActiveTab,
    setAdminActiveTab,
    reservaActiveTab,
    setReservaActiveTab,
  } = props;

  let roleToRender: Role = currentUser.role;

  if (viewAsPolice) { 
    roleToRender = Role.User;
  } else if (currentUser.role === Role.Admin && adminViewingAsRole === Role.Reserva) {
    roleToRender = Role.Reserva;
  } else {
    roleToRender = currentUser.role;
  }

  if (isLoading && !currentUser) { 
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px'}}><Spinner /></div>;
  }


  switch (roleToRender) {
    case Role.Admin:
      return <AdminPanel 
                currentUser={currentUser} 
                openModal={openModal} 
                vehicles={vehicles} 
                users={users} 
                historyLogs={historyLogs} 
                // locations={locations} // Removed
                checklistItems={checklistItems} 
                isLoading={isLoading}
                onAddOrUpdateVehicle={onAddOrUpdateVehicle}
                onDeleteVehicle={onDeleteVehicle}
                onToggleVehicleMaintenanceStatus={onToggleVehicleMaintenanceStatus}
                onAddOrUpdateUser={onAddOrUpdateUser}
                onDeleteUser={onDeleteUser}
                onAdminResetUserPassword={onAdminResetUserPassword}
                // onAddLocation={onAddLocation} // Removed
                // onDeleteLocation={onDeleteLocation} // Removed
                onAddChecklistItem={onAddChecklistItem}
                onDeleteChecklistItem={onDeleteChecklistItem}
                onUpdateChecklistOrder={onUpdateChecklistOrder} 
                activeTab={adminActiveTab}
                setActiveTab={setAdminActiveTab}
              />;
    case Role.Reserva:
      return <ReservaPanel 
                currentUser={currentUser} 
                openModal={openModal} 
                vehicles={vehicles} 
                requests={requests} 
                users={users}
                historyLogs={historyLogs} 
                isLoading={isLoading}
                onProcessCheckoutApproval={onProcessCheckoutApproval}
                onProcessCheckinConfirmation={onProcessCheckinConfirmation}
                onManualCautelaCreate={onManualCautelaCreate}
                activeTab={reservaActiveTab}
                setActiveTab={setReservaActiveTab}
             />;
    case Role.User:
      return <UserPanel 
                currentUser={currentUser} 
                vehicles={vehicles} 
                requests={requests} 
                users={users} // Pass users to UserPanel
                openModal={openModal} 
                isLoading={isLoading} 
              />;
    default:
      return <div className="dashboard-content"><p>Perfil de usuário desconhecido ou não implementado.</p></div>;
  }
};

export default DashboardRouter;