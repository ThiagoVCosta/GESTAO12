

import React from 'react'; // Removed useState as it's no longer used for activeTab
import { AppUser, Vehicle, Role, ModalType, ChecklistItemConfig, HistoryLog } from '../../types'; 
import VehicleManagement from '../management/VehicleManagement';
import UserManagement from '../management/UserManagement';
import HistoryManagement from '../management/HistoryManagement';
import SettingsManagement from '../management/SettingsManagement';
import { CarIcon, UsersIcon, HistoryIcon, SettingsIcon } from '../../constants';
import './AdminPanel.css';
import { AdminPanelTabId } from '../../App'; // Import tab ID type

interface AdminPanelProps {
  currentUser: AppUser;
  vehicles: Vehicle[];
  users: AppUser[];
  historyLogs: HistoryLog[]; 
  // locations: string[]; // Removed
  checklistItems: ChecklistItemConfig[];
  openModal: (type: ModalType, data?: any) => void;
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
  activeTab: AdminPanelTabId; 
  setActiveTab: (tab: AdminPanelTabId) => void; 
}


const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  vehicles,
  users,
  historyLogs, 
  // locations, // Removed
  checklistItems,
  openModal,
  isLoading,
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
  activeTab, 
  setActiveTab, 
}) => {
  // const [activeTab, setActiveTab] = useState<AdminPanelTabId>('vehicles'); // Removed local state

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vehicles':
        return <VehicleManagement 
                  vehicles={vehicles} 
                  openModal={openModal} 
                  isLoading={isLoading} />;
      case 'users':
        return <UserManagement 
                  users={users} 
                  openModal={openModal} 
                  isLoading={isLoading} 
                  />;
      case 'history':
        return <HistoryManagement historyLogs={historyLogs} isLoading={isLoading} openModal={openModal} />; 
      case 'settings':
        return <SettingsManagement 
                  // locations={locations} // Removed
                  checklistItems={checklistItems} 
                  // onAddLocation={onAddLocation} // Removed
                  // onDeleteLocation={onDeleteLocation} // Removed
                  onAddChecklistItem={onAddChecklistItem}
                  onDeleteChecklistItem={onDeleteChecklistItem}
                  onUpdateChecklistOrder={onUpdateChecklistOrder} 
                  isLoading={isLoading}
                  />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-panel">
      <h2 className="panel-title">Painel do Administrador</h2>
      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'vehicles' ? 'active' : ''}`}
          onClick={() => setActiveTab('vehicles')}
        >
          <CarIcon className="tab-icon" /> Viaturas
        </button>
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <UsersIcon className="tab-icon" /> Usuários
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <HistoryIcon className="tab-icon" /> Histórico
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon className="tab-icon" /> Configurações
        </button>
      </div>
      <div className="admin-tab-content">
        {isLoading && activeTab === 'vehicles' ? <p>Carregando viaturas...</p> : renderTabContent()}
      </div>
    </div>
  );
};

export default AdminPanel;