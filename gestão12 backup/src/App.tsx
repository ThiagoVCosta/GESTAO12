/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback, useRef } from 'react'; 
import './App.css';
import { AppUser, Role, Vehicle, Request as CautelaRequest, ModalState, ModalType, ChecklistItemConfig, ChecklistDataItem, RequestStatus, VehicleStatus, UnitMetadata, HistoryLog, FleetType } from './types'; 
import { 
  FULLY_SIMULATED_MODE, 
  SESSION_DURATION_MINUTES,       
  SIMULATED_SESSION_DURATION_MINUTES, 
  emailMasker, 
  translateStatus, 
  DEFAULT_INITIAL_PASSWORD,
  MOCK_LOGIN_PASSWORD,
  MOCK_USER_SEED_DATA, 
  MOCK_HISTORY_LOGS,
  MOCK_VEHICLES, 
  MOCK_REQUESTS,
  INITIAL_CHECKLIST_ITEMS,
  // MOCK_NOTIFICATIONS // Removed mock notifications
} from './constants';
import { 
  fbSignInUser, 
  fbListenToAuthState, 
  fbFetchAppUserProfile,
  fbFetchAllAppUserProfiles,
  fbSignOutUser,
  fbReauthenticateUser, 
  fbUpdateUserPassword,
  fbSaveUserProfile,
  fbSendPasswordReset,
  fbDeleteUserProfile,
  fbEnsureMetadataExists, 
  fbUpdateMetadata,       
  fbListenToAllRequests, 
  fbListenToAllVehicles, 
  fbSaveVehicle,          
  fbDeleteVehicle,        
  fbSaveRequest,          
  fbAddHistoryLog,
  fbFetchHistoryLogs, 
  fbGetUserAuthEmailByMatricula,   
  auth as firebaseAuthService, 
  FirebaseUser 
} from './services/firebaseService';


import MatriculaLoginScreen from './app_components/auth_v2/MatriculaLoginScreen';
import DashboardRouter from './app_components/routing/DashboardRouter';
import LocalHeader from './app_components/layout/LocalHeader';
import LocalVehicleDetailModal from './app_components/modals/LocalVehicleDetailModal';
import LocalRequestVehicleModal from './app_components/modals/LocalRequestVehicleModal';
import LocalVehicleFormModal from './app_components/modals/LocalVehicleFormModal';
import LocalUserFormModal from './app_components/modals/LocalUserFormModal';
import LocalConfirmDeleteModal from './app_components/modals/LocalConfirmDeleteModal';
import SetInitialPasswordModal from './app_components/auth_v2/SetInitialPasswordModal';
import ForgotPasswordModal from './app_components/auth_v2/ForgotPasswordModal';
import AccountSettingsModal from './app_components/modals/AccountSettingsModal'; 
import Spinner from './app_components/ui/Spinner'; 
import LocalApprovalModal from './app_components/modals/LocalApprovalModal';
import LocalApproveCheckinModal from './app_components/modals/LocalApproveCheckinModal';
import LocalUserCheckinModal from './app_components/modals/LocalUserCheckinModal'; 
import VehicleCautelaHistoryModal from './app_components/modals/VehicleCautelaHistoryModal'; 
import LocalVehicleActionsModal from './app_components/modals/LocalVehicleActionsModal'; 
import LocalUserActionsModal from './app_components/modals/LocalUserActionsModal'; 
import LocalManualCautelaModal from './app_components/modals/LocalManualCautelaModal';
import LocalCautelaDetailHistoryModal from './app_components/modals/LocalCautelaDetailHistoryModal'; // Added import
// import NotificationPanelModal from './app_components/modals/NotificationPanelModal'; // Removed import

import { Unsubscribe } from 'firebase/firestore'; 


const cleanUndefinedProps = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefinedProps(item));
  }
  const cleanedObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
      cleanedObj[key] = cleanUndefinedProps(obj[key]); 
    }
  }
  return cleanedObj;
};

export type AdminPanelTabId = 'vehicles' | 'users' | 'history' | 'settings';
export type ReservaPanelTabId = 'dashboard' | 'history';

// Removed NOTIFICATION_LIFESPAN_HOURS and isNotificationRecent from App.tsx
// This logic is now managed in NotificationPanelModal.tsx for read notifications.

const SGVAppFinal: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false); 
  const [isAuthLoading, setIsAuthLoading] = useState(false); 
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [viewAsPolice, setViewAsPolice] = useState(false);
  const [adminViewingAsRole, setAdminViewingAsRole] = useState<Role | null>(null); 


  const [isLoadingPasswordChange, setIsLoadingPasswordChange] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);


  const [vehicles, setVehicles] = useState<Vehicle[]>(FULLY_SIMULATED_MODE ? MOCK_VEHICLES : []);
  const [users, setUsersState] = useState<AppUser[]>(FULLY_SIMULATED_MODE ? MOCK_USER_SEED_DATA : []); 
  const [requests, setRequests] = useState<CautelaRequest[]>(FULLY_SIMULATED_MODE ? MOCK_REQUESTS : []);
  const [checklistItems, setChecklistItems] = useState<ChecklistItemConfig[]>(INITIAL_CHECKLIST_ITEMS);
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>(FULLY_SIMULATED_MODE ? MOCK_HISTORY_LOGS : []); 
  const [appIsLoading, setAppIsLoading] = useState(true); 
  
  const [modalState, setModalState] = useState<ModalState>({ type: null });

  const [adminActiveTab, setAdminActiveTab] = useState<AdminPanelTabId>('vehicles');
  const [reservaActiveTab, setReservaActiveTab] = useState<ReservaPanelTabId>('dashboard');

  // Notification State Removed
  // const [notifications, setNotifications] = useState<Notification[]>(FULLY_SIMULATED_MODE ? MOCK_NOTIFICATIONS : []);
  // const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);


  const unitName = (window as any).__app_id ? (window as any).__app_id.replace('sgv_', '').toUpperCase() : "SGV";

  const isUserBeingCreatedByAdminRef = useRef(false);
  const adminUserCreatingProfileRef = useRef<AppUser | null>(null);
  const activeListeners = useRef<Unsubscribe[]>([]);
  const sessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  const openModal = useCallback((type: ModalType, data?: any) => {
    setModalState({ type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ type: null });
  }, []);

  const clearAccountSettingsErrors = useCallback(() => {
    setPasswordChangeError(null);
  }, []);

  const clearSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setIsAuthLoading(true); 
    clearSessionTimeout(); 
    setAdminViewingAsRole(null); 
    setAdminActiveTab('vehicles'); 
    setReservaActiveTab('dashboard'); 
    if (!FULLY_SIMULATED_MODE && firebaseAuthUser) { 
      await fbSignOutUser(); 
    } else if (FULLY_SIMULATED_MODE) {
      setCurrentUser(null); 
      setFirebaseAuthUser(null); 
      setUsersState(MOCK_USER_SEED_DATA); 
      setVehicles(MOCK_VEHICLES);
      setRequests(MOCK_REQUESTS);
      setHistoryLogs(MOCK_HISTORY_LOGS);
      // setNotifications(MOCK_NOTIFICATIONS); // Reset notifications removed
    }
    setViewAsPolice(false);
    setAuthError(null); 
    setIsAuthLoading(false);
    if (!isAuthReady) setIsAuthReady(true); 
  }, [firebaseAuthUser, isAuthReady, clearSessionTimeout]);


  const startSessionTimeout = useCallback(() => {
    clearSessionTimeout(); 
    const durationMinutes = FULLY_SIMULATED_MODE ? SIMULATED_SESSION_DURATION_MINUTES : SESSION_DURATION_MINUTES;
    const durationMs = durationMinutes * 60 * 1000;
    
    sessionTimeoutRef.current = setTimeout(() => {
      alert(`Sua sessão de ${durationMinutes} minutos expirou. Por favor, faça login novamente.`);
      handleLogout(); 
    }, durationMs);
  }, [clearSessionTimeout, handleLogout]);


  useEffect(() => {
    const initializeApp = async () => {
      setAppIsLoading(true);
      if (FULLY_SIMULATED_MODE) {
        setUsersState(MOCK_USER_SEED_DATA);
        setVehicles(MOCK_VEHICLES);
        setRequests(MOCK_REQUESTS);
        setChecklistItems(INITIAL_CHECKLIST_ITEMS);
        setHistoryLogs(MOCK_HISTORY_LOGS);
        // setNotifications(MOCK_NOTIFICATIONS); // Load mock notifications removed
        setIsAuthReady(true);
        setAppIsLoading(false);
        return;
      }

      // TODO: Load notifications from localStorage if not fully simulated (Removed)
      // const storedNotifications = localStorage.getItem('sgv_notifications');
      // if (storedNotifications) {
      //   setNotifications(JSON.parse(storedNotifications));
      // }


      const authUnsubscribe = fbListenToAuthState(async (fbUser) => {
        setFirebaseAuthUser(fbUser);
        
        activeListeners.current.forEach(unsub => unsub());
        activeListeners.current = [];
        clearSessionTimeout(); 
        setAdminViewingAsRole(null); 
        setAdminActiveTab('vehicles');
        setReservaActiveTab('dashboard');

        if (isUserBeingCreatedByAdminRef.current && adminUserCreatingProfileRef.current && fbUser && fbUser.uid !== adminUserCreatingProfileRef.current.id) {
          try {
            const requestsUnsub = fbListenToAllRequests(
              setRequests, 
              (err) => { console.error("Request listener error for admin:", err); setAuthError("Erro ao carregar solicitações.");}
            );
            activeListeners.current.push(requestsUnsub);

            const vehiclesUnsub = fbListenToAllVehicles(
              setVehicles,
              (err) => { console.error("Vehicle listener error for admin:", err); setAuthError("Erro ao carregar viaturas.");}
            );
            activeListeners.current.push(vehiclesUnsub);
            
            const [appMetadata, allHistoryLogs] = await Promise.all([
                fbEnsureMetadataExists(),
                fbFetchHistoryLogs(),
            ]);
            setChecklistItems(appMetadata.checklistItems);
            setHistoryLogs(allHistoryLogs);

          } catch (dataFetchError) {
              console.error("Error fetching data for admin after user creation:", dataFetchError);
              setAuthError("Erro ao recarregar dados do administrador.");
          } finally {
              isUserBeingCreatedByAdminRef.current = false; 
              adminUserCreatingProfileRef.current = null;  
              setIsAuthReady(true); 
              setAppIsLoading(false); 
          }
          return; 
        }

        if (fbUser) {
          try {
            const userProfile = await fbFetchAppUserProfile(fbUser.uid);
            if (userProfile) {
              setCurrentUser(userProfile);
              startSessionTimeout(); 

              const requestsUnsub = fbListenToAllRequests(
                (updatedRequests) => setRequests(updatedRequests),
                (error) => {
                  console.error("Error listening to requests:", error);
                  setAuthError("Erro ao carregar solicitações em tempo real.");
                }
              );
              activeListeners.current.push(requestsUnsub);

              const vehiclesUnsub = fbListenToAllVehicles(
                (updatedVehicles) => setVehicles(updatedVehicles),
                (error) => {
                  console.error("Error listening to vehicles:", error);
                  setAuthError("Erro ao carregar viaturas em tempo real.");
                }
              );
              activeListeners.current.push(vehiclesUnsub);
              
              const [appMetadata, allHistoryLogs, allProfiles] = await Promise.all([
                fbEnsureMetadataExists(),
                fbFetchHistoryLogs(), 
                (userProfile.role === Role.Admin || userProfile.role === Role.Reserva) ? fbFetchAllAppUserProfiles() : Promise.resolve([userProfile])
              ]);

              setChecklistItems(appMetadata.checklistItems);
              setHistoryLogs(allHistoryLogs); 
              setUsersState(allProfiles);
              // Set mock notifications for now, even for Firebase mode. (Removed)
              // Later, this could be loaded from Firestore or localStorage. (Removed)
              // setNotifications(MOCK_NOTIFICATIONS); (Removed)
              
              if (!userProfile.hasSetInitialPassword) {
                 openModal('setInitialPassword', { userId: userProfile.id });
              }
            } else {
              console.warn("Firebase user authenticated, but no AppUser profile found. Logging out app-level.");
              setAuthError("Sua conta foi autenticada, mas o perfil de usuário no sistema está ausente. Você foi desconectado. Contate o suporte.");
              await fbSignOutUser(); 
            }
          } catch (error) {
            console.error("Error fetching app data:", error);
            setAuthError("Erro ao carregar dados da aplicação.");
            setCurrentUser(null);
            clearSessionTimeout(); 
            setUsersState([]); setVehicles([]); setRequests([]); setChecklistItems([]); setHistoryLogs([]); // setNotifications([]); (Removed)
          } finally {
            setIsAuthReady(true); 
            setAppIsLoading(false);
          }
        } else { 
          setCurrentUser(null);
          clearSessionTimeout(); 
          setUsersState([]); setVehicles([]); setRequests([]); setChecklistItems([]); setHistoryLogs([]); // setNotifications([]); (Removed)
          setIsAuthReady(true); 
          setAppIsLoading(false); 
        }
      });
      
      return () => {
        authUnsubscribe();
        activeListeners.current.forEach(unsub => unsub());
        activeListeners.current = [];
        clearSessionTimeout(); 
      };
    };

    initializeApp();
  }, [openModal, startSessionTimeout, clearSessionTimeout]); 

  // Update unread notification count (Removed)
  // useEffect(() => {
  //   if (!currentUser) {
  //     setUnreadNotificationCount(0);
  //     return;
  //   }
  //   // Count all relevant unread notifications, regardless of age
  //   const count = notifications.filter(n => {
  //     if (n.isRead) return false;
  //     // Relevance check
  //     if (n.targetUserIds === 'ALL_ADMINS' && currentUser.role === Role.Admin) return true;
  //     if (n.targetUserIds === 'ALL_RESERVAS' && (currentUser.role === Role.Reserva || currentUser.role === Role.Admin)) return true;
  //     if (Array.isArray(n.targetUserIds) && n.targetUserIds.includes(currentUser.id)) return true;
  //     return false;
  //   }).length;
  //   setUnreadNotificationCount(count);
  // }, [notifications, currentUser]);

  // const markNotificationsAsRead = useCallback(() => { (Removed)
  //   if (!currentUser) return;
  //   setNotifications(prevNotifications =>
  //     prevNotifications.map(n => {
  //       const isRelevant = 
  //         (n.targetUserIds === 'ALL_ADMINS' && currentUser.role === Role.Admin) ||
  //         (n.targetUserIds === 'ALL_RESERVAS' && (currentUser.role === Role.Reserva || currentUser.role === Role.Admin)) ||
  //         (Array.isArray(n.targetUserIds) && n.targetUserIds.includes(currentUser.id));

  //       if (isRelevant && !n.isRead) { // Mark if relevant AND unread
  //         return { ...n, isRead: true };
  //       }
  //       return n;
  //     })
  //   );
  //   // TODO: Persist to localStorage if using it for notifications (Removed)
  //   // localStorage.setItem('sgv_notifications', JSON.stringify(updatedNotifications));
  // }, [currentUser]);


  const handleMatriculaLogin = async (matricula: string, senha: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      if (FULLY_SIMULATED_MODE) {
        const simulatedUser = MOCK_USER_SEED_DATA.find(u => u.matricula.toLowerCase() === matricula.toLowerCase().trim());
        if (simulatedUser && senha === MOCK_LOGIN_PASSWORD) {
            setCurrentUser(simulatedUser);
            startSessionTimeout(); 
            if (!simulatedUser.hasSetInitialPassword) {
                openModal('setInitialPassword', { userId: simulatedUser.id });
            }
        } else {
            throw new Error("Matrícula ou senha inválida (simulado).");
        }
      } else {
         const personalAuthEmail = await fbGetUserAuthEmailByMatricula(matricula);
         if (personalAuthEmail) {
            await fbSignInUser(personalAuthEmail, senha); 
         } else {
            throw new Error("Matrícula não encontrada ou não associada a um email de login.");
         }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.message === "Matrícula não encontrada ou não associada a um email de login.") {
          setAuthError(error.message);
      } else if (error.message.includes("Email ou senha inválida")) { 
          setAuthError("Matrícula ou senha inválida.");
      } else {
          setAuthError(error.message || 'Falha no login.');
      }
      setCurrentUser(null); 
      clearSessionTimeout();
    } finally {
      setIsAuthLoading(false);
    }
  };

  
  const handleNavigateToAdminView = useCallback(() => {
    if (currentUser?.role === Role.Admin) {
      setAdminViewingAsRole(null);
      setViewAsPolice(false);
    }
  }, [currentUser]);

  const handleNavigateToReservaView = useCallback(() => {
    if (currentUser?.role === Role.Admin) {
      setAdminViewingAsRole(Role.Reserva);
      setViewAsPolice(false);
    } else if (currentUser?.role === Role.Reserva) {
      setAdminViewingAsRole(null); 
      setViewAsPolice(false);
    }
  }, [currentUser]);
  
  const handleNavigateToUserView = useCallback(() => {
    if (currentUser?.role === Role.Admin || currentUser?.role === Role.Reserva) {
      setAdminViewingAsRole(null);
      setViewAsPolice(true);
    }
  }, [currentUser]);

  
  const handleSetInitialPassword = async (userId: string, newPasswordPlain: string) => {
    setAppIsLoading(true);
    try {
      let updatedProfile: AppUser | undefined;
      
      if (FULLY_SIMULATED_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        setUsersState(prevUsers => 
            prevUsers.map(user => 
                user.id === userId 
                ? (updatedProfile = { ...user, hasSetInitialPassword: true }) 
                : user
            )
        );
      } else {
        if (!firebaseAuthUser || firebaseAuthUser.uid !== userId) {
          throw new Error("Conflito de autenticação ao definir senha inicial.");
        }
        await fbUpdateUserPassword(newPasswordPlain);
        const userToUpdate = users.find(u => u.id === userId) || currentUser; 
        if (userToUpdate) {
            const profileUpdateData: Partial<AppUser> = { 
                hasSetInitialPassword: true,
            };
            
            updatedProfile = cleanUndefinedProps({ ...userToUpdate, ...profileUpdateData }) as AppUser;
            await fbSaveUserProfile(updatedProfile);
        } else {
            throw new Error("Usuário não encontrado para atualizar perfil.");
        }
      }
      if (updatedProfile) {
        setCurrentUser(updatedProfile); 
         setUsersState(prevUsers => prevUsers.map(user => user.id === userId ? updatedProfile! : user));
      }
      closeModal();
      alert("Senha atualizada com sucesso!");
    } catch (error: any) {
        console.error("Error setting initial password:", error);
        alert(error.message || "Falha ao atualizar senha. Tente novamente.");
    } finally {
        setAppIsLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (matricula: string) => {
    setAppIsLoading(true);
    try {
        if (FULLY_SIMULATED_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const user = MOCK_USER_SEED_DATA.find(u => u.matricula.toLowerCase() === matricula.trim().toLowerCase());
            let successMsg = `Link de redefinição enviado para o email pessoal associado à matrícula ${matricula} (Simulado: ${user ? emailMasker(user.authEmail) : 'Email não encontrado'}).`;
            
            if (user && user.authEmail) { 
                setModalState({ type: 'forgotPassword', data: { successMessage: successMsg }});
            } else {
                setModalState({ type: 'forgotPassword', data: { errorMessage: "Matrícula não encontrada ou não associada a um email pessoal (Simulado)." }});
            }
        } else {
            const personalAuthEmail = await fbGetUserAuthEmailByMatricula(matricula);
            if (personalAuthEmail) {
                const result = await fbSendPasswordReset(personalAuthEmail); 
                let successMsg = `Se a matrícula estiver correta e associada a um email pessoal cadastrado, um link de redefinição foi enviado para ${emailMasker(result.emailSentTo)}. Verifique sua caixa de entrada e spam.`;
                setModalState({ type: 'forgotPassword', data: { successMessage: successMsg }});
            } else {
                throw new Error("Matrícula não encontrada ou não associada a um email pessoal para recuperação.");
            }
        }
    } catch (error: any) {
        setModalState({ 
            type: 'forgotPassword', 
            data: { errorMessage: error.message || "Falha ao solicitar redefinição de senha." }
        });
    } finally {
        setAppIsLoading(false);
    }
  };
  
  const handleChangeUserPassword = async (currentPasswordForPwd: string, newPasswordPlain: string) => {
    if (!currentUser) return;
    setIsLoadingPasswordChange(true);
    setPasswordChangeError(null);
    try {
        if (FULLY_SIMULATED_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (currentPasswordForPwd !== MOCK_LOGIN_PASSWORD) {
                throw new Error("Senha atual incorreta (simulado).");
            }
            alert("Senha alterada com sucesso (simulado)!");
            closeModal();
        } else {
            await fbReauthenticateUser(currentPasswordForPwd);
            await fbUpdateUserPassword(newPasswordPlain); 
            alert("Senha alterada com sucesso!");
            closeModal();
        }
    } catch (error: any) {
        console.error("Error changing user password:", error);
        setPasswordChangeError(error.message || "Falha ao alterar senha.");
    } finally {
        setIsLoadingPasswordChange(false);
    }
  };


  const handleAddOrUpdateUser = async (userData: Omit<AppUser, 'id' | 'hasSetInitialPassword'> | AppUser, isNew: boolean) => {
    if (!currentUser) return;
    setAppIsLoading(true);
    
    let attemptedAuthEmailForError = 'N/A'; 
    let newAuthUserUID: string | undefined = undefined; 
  
    try {
      let savedUser: AppUser;
  
      if (isNew) {
        const newUserDataInput = userData as Omit<AppUser, 'id' | 'hasSetInitialPassword'>; 
        
        if (!newUserDataInput.matricula || typeof newUserDataInput.matricula !== 'string' || newUserDataInput.matricula.trim() === '') {
          throw new Error("Matrícula é obrigatória para novos usuários.");
        }
        if (!newUserDataInput.authEmail || !newUserDataInput.authEmail.includes('@')) {
            throw new Error("Email Pessoal (Login e Autenticação) é obrigatório e deve ser válido.");
        }
  
        const matriculaClean = newUserDataInput.matricula.trim().toLowerCase(); 
        const authEmailClean = newUserDataInput.authEmail.trim().toLowerCase(); 
        attemptedAuthEmailForError = authEmailClean; 
        
        if (!FULLY_SIMULATED_MODE) {
          isUserBeingCreatedByAdminRef.current = true; 
          adminUserCreatingProfileRef.current = currentUser; 

          const fbUserCredential = await firebaseAuthService.createUserWithEmailAndPassword(authEmailClean, DEFAULT_INITIAL_PASSWORD);
          if (!fbUserCredential.user) {
            throw new Error("Falha ao criar usuário na autenticação Firebase.");
          }
          newAuthUserUID = fbUserCredential.user.uid;
        } else {
          if (MOCK_USER_SEED_DATA.some(u => u.authEmail === authEmailClean)) { 
              const err = new Error("Simulated: Email already in use.") as any;
              err.code = 'auth/email-already-in-use';
              throw err;
          }
           if (MOCK_USER_SEED_DATA.some(u => u.matricula === matriculaClean)) {
              throw new Error("Simulated: Matrícula já em uso.");
          }
          newAuthUserUID = `usr_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        }
  
        const userProfileData: AppUser = { 
          ...(newUserDataInput as Omit<AppUser, 'id' | 'hasSetInitialPassword' | 'matricula' | 'authEmail'>), 
          id: newAuthUserUID,
          name: newUserDataInput.name, 
          matricula: matriculaClean, 
          authEmail: authEmailClean, 
          role: newUserDataInput.role, 
          hasSetInitialPassword: false,
        };
        savedUser = cleanUndefinedProps(userProfileData) as AppUser;

      } else { 
        const existingUser = users.find(u => u.id === (userData as AppUser).id);
        if (!existingUser) {
          throw new Error("Usuário existente não encontrado para atualização.");
        }
        const updatedDataFromForm = userData as AppUser; 
        
        savedUser = cleanUndefinedProps({ 
            id: existingUser.id, 
            name: updatedDataFromForm.name, 
            matricula: updatedDataFromForm.matricula.trim(), 
            role: updatedDataFromForm.role, 
            authEmail: existingUser.authEmail, 
            hasSetInitialPassword: existingUser.hasSetInitialPassword, 
        }) as AppUser;

        if (savedUser.matricula.trim() === '') { 
            throw new Error("Matrícula não pode ser vazia para usuários existentes.");
        }
      }
  
      if (!FULLY_SIMULATED_MODE) {
        try {
          await fbSaveUserProfile(savedUser);
        } catch (firestoreError: any) {
          if (isNew && newAuthUserUID) {
            alert(`ATENÇÃO: A conta de autenticação para ${savedUser.authEmail} foi criada, mas houve uma falha ao salvar o perfil no banco de dados: ${firestoreError.message}. Por favor, verifique o Firestore ou exclua a conta de autenticação manualmente se necessário.`);
          }
          throw firestoreError; 
        }
      }
  
      if (isNew) {
        setUsersState(prev => [savedUser, ...prev.filter(u => u.id !== savedUser.id)]);
      } else {
        setUsersState(prev => prev.map(u => u.id === savedUser.id ? savedUser : u));
      }
      if (currentUser?.id === savedUser.id) { 
        setCurrentUser(savedUser);
      }
      closeModal();
      alert(`Usuário ${isNew ? 'adicionado' : 'atualizado'} com sucesso.${isNew ? ` A conta de autenticação foi criada com senha inicial "${DEFAULT_INITIAL_PASSWORD}".` : ''}`);
    } catch (error: any) {
      console.error("Error adding/updating user:", error);
      let alertMessage = `Falha ao ${isNew ? 'adicionar' : 'atualizar'} usuário.`;
  
      if (isNew && error.code === 'auth/email-already-in-use') {
        alertMessage = `Falha ao adicionar novo usuário: O email pessoal "${attemptedAuthEmailForError}" já está registrado no sistema de autenticação.`;
      } else if (error.message) {
        alertMessage += ` Detalhes: ${error.message}`;
      }
      alert(alertMessage);
    } finally {
      if (isNew && !FULLY_SIMULATED_MODE) { 
        isUserBeingCreatedByAdminRef.current = false;
        adminUserCreatingProfileRef.current = null;
      }
      setAppIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!currentUser) return;
    if (currentUser?.id === userId) {
        alert("Você não pode excluir seu próprio usuário.");
        closeModal();
        return;
    }
    setAppIsLoading(true);
    try {
        if (!FULLY_SIMULATED_MODE) {
            await fbDeleteUserProfile(userId); 
        }
        setUsersState(prev => prev.filter(u => u.id !== userId)); 
        closeModal();
        alert("Perfil do usuário excluído do Firestore com sucesso. A conta de autenticação (se existir) precisa ser removida manualmente se necessário.");
    } catch (error: any) {
        console.error("Error deleting user:", error);
        alert(`Falha ao excluir usuário: ${error.message}`);
    } finally {
        setAppIsLoading(false);
    }
  };

  const handleAdminResetUserPassword = async (userId: string) => {
    if (!currentUser || currentUser.id === userId) {
      alert("Ação não permitida ou usuário inválido.");
      return;
    }
    const userToReset = users.find(u => u.id === userId);
    if (!userToReset) {
      alert("Usuário não encontrado.");
      return;
    }

    openModal('confirmDelete', {
      title: 'Confirmar Reset de Senha',
      message: (
        <>
          <p>Você está prestes a marcar o usuário <strong>{userToReset.name}</strong> (Matrícula: {userToReset.matricula}) para reconfigurar a senha no próximo login.</p>
          <p><strong>Importante:</strong></p>
          <ul style={{ textAlign: 'left', paddingLeft: '20px', fontSize: '0.9em' }}>
            <li>Esta ação NÃO ALTERA a senha atual do usuário no sistema de autenticação.</li>
            <li>Para que o usuário possa definir uma nova senha através deste mecanismo, ele <strong>PRECISA CONSEGUIR FAZER LOGIN COM SUA SENHA ATUAL</strong>.</li>
            <li>Após logar com a senha atual, ele será forçado a criar uma nova senha.</li>
          </ul>
          <p><strong>Se o usuário ESQUECEU COMPLETAMENTE A SENHA ATUAL:</strong></p>
          <ul style={{ textAlign: 'left', paddingLeft: '20px', fontSize: '0.9em' }}>
            <li>Instrua-o a usar a opção 'Esqueceu sua senha?' na tela de login, usando sua matrícula: <strong>{userToReset.matricula}</strong>. O sistema tentará enviar um link para o email pessoal associado: <strong>{userToReset.authEmail}</strong>.</li>
            <li>Se ele não tiver acesso a esse email, um administrador com acesso ao Firebase Console precisará intervir (ex: excluindo a conta de autenticação e recriando-a através deste sistema SGV para resetar para a senha padrão '{DEFAULT_INITIAL_PASSWORD}').</li>
          </ul>
          <p>Deseja continuar marcando este usuário para reconfiguração (assumindo que ele pode logar com a senha atual)?</p>
        </>
      ),
      confirmButtonText: "Resetar Senha",
      onConfirm: async () => {
        setAppIsLoading(true);
        try {
          const updatedUser: AppUser = { ...userToReset, hasSetInitialPassword: false };
          if (!FULLY_SIMULATED_MODE) {
            await fbSaveUserProfile(updatedUser);
          }
          setUsersState(prev => prev.map(u => u.id === userId ? updatedUser : u)); 
          closeModal(); 
          
          let successAlertMessage = `O usuário ${userToReset.name} foi marcado para reconfigurar sua senha. No próximo login bem-sucedido (usando a senha atual), ele será solicitado a definir uma nova senha.`;
          if (FULLY_SIMULATED_MODE) {
              successAlertMessage = `Simulado: ${userToReset.name} marcado para reset de senha. No próximo login (com senha atual), será solicitado a definir nova senha. (A senha padrão simulada para novos usuários é '${DEFAULT_INITIAL_PASSWORD}')`;
          }
          alert(successAlertMessage);

        } catch (error: any) {
          console.error("Error resetting user password flag:", error);
          alert(`Falha ao resetar senha do usuário: ${error.message}`);
        } finally {
          setAppIsLoading(false);
        }
      },
    });
  };

  const handleAddChecklistItem = async (itemConfig: Omit<ChecklistItemConfig, 'id'>) => {
    if (!currentUser) return;
    if (!itemConfig.label.trim()) {
      alert("Nome do item do checklist não pode ser vazio.");
      return;
    }
    if (checklistItems.some(item => item.label.toLowerCase() === itemConfig.label.toLowerCase().trim())) {
      alert("Um item de checklist com este nome já existe.");
      return;
    }
    setAppIsLoading(true);
    const newItem: ChecklistItemConfig = { ...itemConfig, id: `chk_item_${Date.now()}` };
    const newChecklistItems = [...checklistItems, newItem];
    try {
        const metadataToSave = cleanUndefinedProps({ checklistItems: newChecklistItems });
        if(!FULLY_SIMULATED_MODE) {
            await fbUpdateMetadata(metadataToSave);
        }
        setChecklistItems(newChecklistItems); 
    } catch (error: any) {
        alert(`Falha ao adicionar item de checklist: ${error.message}`);
    } finally {
        setAppIsLoading(false);
    }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    if (!currentUser) return;
    const itemToDelete = checklistItems.find(item => item.id === itemId);
    if (itemToDelete?.isFixed) {
        alert("Este item do checklist é fixo e não pode ser excluído.");
        return;
    }
    setAppIsLoading(true);
    const newChecklistItems = checklistItems.filter(item => item.id !== itemId);
    try {
        const metadataToSave = cleanUndefinedProps({ checklistItems: newChecklistItems });
        if(!FULLY_SIMULATED_MODE) {
            await fbUpdateMetadata(metadataToSave);
        }
        setChecklistItems(newChecklistItems); 
        closeModal();
    } catch (error: any) {
        alert(`Falha ao excluir item de checklist: ${error.message}`);
    } finally {
        setAppIsLoading(false);
    }
  };

  const handleUpdateChecklistOrder = async (reorderedItems: ChecklistItemConfig[]) => {
    if (!currentUser) return;
    setAppIsLoading(true);
    try {
        const metadataToSave = cleanUndefinedProps({ checklistItems: reorderedItems });
        if (!FULLY_SIMULATED_MODE) {
            await fbUpdateMetadata(metadataToSave);
        }
        setChecklistItems(reorderedItems); 
    } catch (error: any) {
        alert(`Falha ao atualizar ordem do checklist: ${error.message}`);
    } finally {
        setAppIsLoading(false);
    }
  };

  const handleAddOrUpdateVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'status' | 'currentDriverId' | 'currentRequestId'> | Vehicle) => {
    if (!currentUser) return;
    setAppIsLoading(true);
    let savedVehicle: Vehicle;
    const isNew = !('id' in vehicleData);

    if (isNew) {
        const newVehicleDataInput = vehicleData as Omit<Vehicle, 'id' | 'status' | 'currentDriverId' | 'currentRequestId'>;
        savedVehicle = cleanUndefinedProps({ 
            ...newVehicleDataInput, 
            id: `veh_firestore_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, 
            status: VehicleStatus.Disponivel,
            currentDriverId: null,
            currentRequestId: null, 
        }) as Vehicle;
    } else {
        const existingVehicle = vehicles.find(v => v.id === (vehicleData as Vehicle).id);
        if (!existingVehicle) throw new Error("Viatura para edição não encontrada.");
        savedVehicle = cleanUndefinedProps({ ...existingVehicle, ...(vehicleData as Vehicle) }) as Vehicle;
    }
    
    try {
        if (!FULLY_SIMULATED_MODE) {
            await fbSaveVehicle(savedVehicle); 
        } else {
            const index = MOCK_VEHICLES.findIndex(v => v.id === savedVehicle.id);
            if (index > -1) MOCK_VEHICLES[index] = savedVehicle;
            else MOCK_VEHICLES.push(savedVehicle);
            setVehicles([...MOCK_VEHICLES]); 
        }
        closeModal();
    } catch (error: any) {
        console.error("Error adding/updating vehicle:", error);
        alert(`Falha ao ${isNew ? 'adicionar' : 'atualizar'} viatura: ${error.message}`);
    } finally {
        setAppIsLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!currentUser) return;
    setAppIsLoading(true);
    try {
        if (!FULLY_SIMULATED_MODE) {
            await fbDeleteVehicle(vehicleId); 
        } else {
            const index = MOCK_VEHICLES.findIndex(v => v.id === vehicleId);
            if (index > -1) MOCK_VEHICLES.splice(index, 1);
            setVehicles([...MOCK_VEHICLES]); 
        }
        closeModal(); 
    } catch (error: any) {
        console.error("Error deleting vehicle:", error);
        alert(`Falha ao excluir viatura: ${error.message}`);
    } finally {
        setAppIsLoading(false);
    }
  };
  
  const handleToggleVehicleMaintenanceStatus = async (vehicleId: string) => {
    if (!currentUser) return;
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
        alert("Viatura não encontrada.");
        return;
    }

    if (vehicle.status !== VehicleStatus.Disponivel && vehicle.status !== VehicleStatus.Manutencao) {
        alert(`Apenas viaturas com status "Disponível" ou "Manutenção" podem ter seu status de manutenção alternado. Status atual: ${translateStatus(vehicle.status, 'vehicle')}.`);
        return;
    }

    setAppIsLoading(true);
    const oldStatus = vehicle.status;
    const newStatus = oldStatus === VehicleStatus.Disponivel ? VehicleStatus.Manutencao : VehicleStatus.Disponivel;
    const updatedVehicle: Vehicle = cleanUndefinedProps({ ...vehicle, status: newStatus }) as Vehicle;

    try {
        const logEntryDetails = cleanUndefinedProps({
            vehicleId: vehicle.id,
            vehiclePrefixo: vehicle.prefixo,
            oldStatus: oldStatus,
            newStatus: newStatus,
            updatedByUserId: currentUser.id,
            updatedByUserName: currentUser.name,
        });
        const logEntry: Omit<HistoryLog, 'id' | 'timestamp'> = {
            eventType: "VEHICLE_STATUS_UPDATED",
            userId: currentUser.id,
            userName: currentUser.name,
            targetEntityType: "VEHICLE",
            targetEntityId: vehicle.id,
            description: `Status da viatura ${vehicle.prefixo} alterado de ${translateStatus(oldStatus, 'vehicle')} para ${translateStatus(newStatus, 'vehicle')} por ${currentUser.name}.`,
            details: logEntryDetails
        };

        if (!FULLY_SIMULATED_MODE) {
            await fbSaveVehicle(updatedVehicle); 
            await fbAddHistoryLog(cleanUndefinedProps(logEntry)); 
        } else {
            const index = MOCK_VEHICLES.findIndex(v => v.id === updatedVehicle.id);
            if (index > -1) MOCK_VEHICLES[index] = updatedVehicle;
            setVehicles([...MOCK_VEHICLES]);
            setHistoryLogs(prev => [{ ...logEntry, id: `hist_sim_${Date.now()}`, timestamp: new Date().toISOString() } as HistoryLog, ...prev]);
        }
        alert(`Status da viatura ${vehicle.prefixo} alterado para ${translateStatus(newStatus, 'vehicle')}.`);
    } catch (error: any) {
        console.error("Error toggling vehicle maintenance status:", error);
        alert(`Falha ao alterar status da viatura: ${error.message}`);
    } finally {
        setAppIsLoading(false);
    }
  };


  const handleRequestVehicleSubmit = async (vehicleId: string, mission: string, checkoutKm: number, checklistData: ChecklistDataItem, observations?: string) => {
    if (!currentUser) return;
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) { alert("Viatura não encontrada!"); return; }
    setAppIsLoading(true); 
    
    const newRequest: CautelaRequest = cleanUndefinedProps({
      id: `req_firestore_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, 
      vehicleId, 
      userId: currentUser.id, 
      userName: currentUser.name, 
      vehiclePrefixo: vehicle.prefixo, 
      mission, 
      status: RequestStatus.PendenteReserva,
      requestTimestamp: new Date().toISOString(), 
      checkoutKm, 
      checkoutChecklist: checklistData,
      checkoutObservations: observations,
    }) as CautelaRequest;

    try {
        const logDetails = cleanUndefinedProps({ vehicleId, vehiclePrefixo: vehicle.prefixo, mission, solicitanteName: currentUser.name });
        const logEntryData: Omit<HistoryLog, 'id'|'timestamp'> = {
            eventType: "REQUEST_CREATED",
            userId: currentUser.id, userName: currentUser.name,
            targetEntityType: "REQUEST", targetEntityId: newRequest.id,
            description: `Solicitação para ${vehicle.prefixo} (Missão: ${mission}) criada por ${currentUser.name}.`,
            details: logDetails
        };

        if(!FULLY_SIMULATED_MODE){
            await fbSaveRequest(newRequest); 
            await fbAddHistoryLog(cleanUndefinedProps(logEntryData));
        } else {
             MOCK_REQUESTS.unshift(newRequest);
             setRequests([...MOCK_REQUESTS]);
             setHistoryLogs(prev => [{...logEntryData, id: `hist_sim_${Date.now()}`, timestamp: new Date().toISOString()} as HistoryLog, ...prev]);
        }
        closeModal();
        alert(`Solicitação para ${vehicle.prefixo} enviada para aprovação.`);
    } catch (error: any) {
        console.error("Error submitting request:", error);
        alert(`Falha ao enviar solicitação: ${error.message}`);
    } finally {
        setAppIsLoading(false);
    }
  };

  const handleProcessCheckoutApproval = async (requestId: string, approved: boolean, reservaObservations?: string) => {
    if (!currentUser) return;
    setAppIsLoading(true);
    const originalRequest = requests.find(req => req.id === requestId);
    if (!originalRequest) { alert("Solicitação não encontrada."); setAppIsLoading(false); return; }
    
    const updatedRequest: CautelaRequest = cleanUndefinedProps({ 
        ...originalRequest, 
        status: approved ? RequestStatus.EmUso : RequestStatus.Recusado, 
        approverIdReserva: currentUser?.id, 
        approvalTimestamp: new Date().toISOString(),
        checkoutTimestamp: approved ? new Date().toISOString() : undefined, 
        reservaCheckoutObservations: reservaObservations,
    }) as CautelaRequest;
    
    let updatedVehicle: Vehicle | undefined = undefined;
    if (approved) {
        const vehicleToUpdate = vehicles.find(v => v.id === originalRequest.vehicleId);
        if (vehicleToUpdate) {
            updatedVehicle = cleanUndefinedProps({ 
                ...vehicleToUpdate, 
                status: VehicleStatus.EmUso, 
                currentDriverId: originalRequest.userId, 
                currentRequestId: requestId 
            }) as Vehicle;
        }
    }

    try {
        const logEntryDetailsBase = cleanUndefinedProps({ 
            approved, 
            reservaObservations, 
            vehicleId: originalRequest.vehicleId, 
            vehiclePrefixo: originalRequest.vehiclePrefixo,
            solicitanteName: originalRequest.userName,
            liberadorNameReserva: currentUser.name,
            mission: originalRequest.mission,
            checkoutKm: originalRequest.checkoutKm
        });

        const logEntry: Omit<HistoryLog, 'id' | 'timestamp'> = {
            eventType: approved ? "REQUEST_CHECKOUT" : "REQUEST_REJECTED",
            userId: currentUser.id, userName: currentUser.name,
            targetEntityType: "REQUEST", targetEntityId: requestId,
            description: `Solicitação ${originalRequest.id} para ${originalRequest.vehiclePrefixo} foi ${approved ? 'APROVADA e VTR EM USO' : 'RECUSADA'} por ${currentUser.name}.`,
            details: approved 
                ? { ...logEntryDetailsBase, checkoutTimestamp: updatedRequest.checkoutTimestamp } 
                : logEntryDetailsBase
        };

        if(!FULLY_SIMULATED_MODE){
            await fbSaveRequest(updatedRequest); 
            if (updatedVehicle) {
                await fbSaveVehicle(updatedVehicle); 
            }
            await fbAddHistoryLog(cleanUndefinedProps(logEntry));
        } else {
            const reqIndex = MOCK_REQUESTS.findIndex(r => r.id === updatedRequest.id);
            if (reqIndex > -1) MOCK_REQUESTS[reqIndex] = updatedRequest;
            setRequests([...MOCK_REQUESTS]);

            if (updatedVehicle) {
                const vehIndex = MOCK_VEHICLES.findIndex(v => v.id === updatedVehicle!.id);
                if (vehIndex > -1) MOCK_VEHICLES[vehIndex] = updatedVehicle;
                setVehicles([...MOCK_VEHICLES]);
            }
            setHistoryLogs(prev => [{...logEntry, id:`hist_${Date.now()}`, timestamp: new Date().toISOString()} as HistoryLog, ...prev]);
        }
        closeModal();
        alert(`Solicitação ${approved ? 'aprovada e viatura marcada como Em Uso' : 'recusada'}.`);
    } catch (error: any) {
        console.error("Error processing checkout approval:", error);
        alert(`Falha ao processar solicitação: ${error.message}`);
    } finally {
        setAppIsLoading(false);
    }
  };

  const handleUserInitiateCheckin = async (
    requestId: string, 
    finalKm: number, 
    checkinChecklistData: ChecklistDataItem, 
    checkinObservations?: string
  ) => {
    if (!currentUser) return;
    setAppIsLoading(true);
    const request = requests.find(req => req.id === requestId);
    const vehicle = vehicles.find(v => v.id === request?.vehicleId);

    if (!request || !vehicle) {
      alert("Solicitação ou viatura não encontrada.");
      setAppIsLoading(false);
      return;
    }

    const updatedRequest: CautelaRequest = cleanUndefinedProps({
      ...request,
      status: RequestStatus.DevolucaoSolicitada,
      checkinKm: finalKm,
      checkinChecklist: checkinChecklistData,
      checkinObservations: checkinObservations,
      checkinRequestTimestamp: new Date().toISOString(),
    }) as CautelaRequest;

    const updatedVehicle: Vehicle = cleanUndefinedProps({
      ...vehicle,
      status: VehicleStatus.AguardandoRecebimento,
      km: finalKm, 
    }) as Vehicle;

    try {
      const logDetails = cleanUndefinedProps({ 
          vehicleId: vehicle.id, 
          vehiclePrefixo: vehicle.prefixo,
          solicitanteName: currentUser.name, 
          finalKm, 
          checkinObservations,
          mission: request.mission 
      });
      const logEntry: Omit<HistoryLog, 'id' | 'timestamp'> = {
          eventType: "REQUEST_CHECKIN_INITIATED",
          userId: currentUser.id, userName: currentUser.name,
          targetEntityType: "REQUEST", targetEntityId: requestId,
          description: `Devolução da VTR ${vehicle.prefixo} solicitada por ${currentUser.name}. KM Final: ${finalKm}.`,
          details: logDetails
      };
      if (!FULLY_SIMULATED_MODE) {
        await fbSaveRequest(updatedRequest); 
        await fbSaveVehicle(updatedVehicle); 
        await fbAddHistoryLog(cleanUndefinedProps(logEntry));
      } else {
            const reqIndex = MOCK_REQUESTS.findIndex(r => r.id === updatedRequest.id);
            if (reqIndex > -1) MOCK_REQUESTS[reqIndex] = updatedRequest;
            setRequests([...MOCK_REQUESTS]);

            const vehIndex = MOCK_VEHICLES.findIndex(v => v.id === updatedVehicle.id);
            if (vehIndex > -1) MOCK_VEHICLES[vehIndex] = updatedVehicle;
            setVehicles([...MOCK_VEHICLES]);
            setHistoryLogs(prev => [{...logEntry, id:`hist_${Date.now()}`, timestamp: new Date().toISOString()} as HistoryLog, ...prev]);
      }
      closeModal();
      alert("Solicitação de devolução enviada para a Reserva.");
    } catch (error: any) {
      console.error("Error initiating check-in:", error);
      alert(`Falha ao solicitar devolução: ${error.message}`);
    } finally {
      setAppIsLoading(false);
    }
  };


  const handleProcessCheckinConfirmation = async ( requestId: string, finalKm?: number, checkinChecklist?: ChecklistDataItem, reservaCheckinObservations?: string ) => {
    if (!currentUser) return;
    setAppIsLoading(true);
    const originalRequest = requests.find(req => req.id === requestId);
    if (!originalRequest) { alert("Solicitação não encontrada."); setAppIsLoading(false); return; }

    const confirmedKm = finalKm !== undefined ? finalKm : originalRequest.checkinKm;
    const confirmedChecklist = checkinChecklist !== undefined ? checkinChecklist : originalRequest.checkinChecklist;


    const updatedRequest: CautelaRequest = cleanUndefinedProps({
        ...originalRequest,
        status: RequestStatus.Concluido, 
        receiverIdReserva: currentUser?.id, 
        checkinConfirmationTimestamp: new Date().toISOString(),
        checkinKm: confirmedKm, 
        checkinChecklist: confirmedChecklist,
        reservaCheckinObservations: reservaCheckinObservations,
    }) as CautelaRequest;

    let updatedVehicle: Vehicle | undefined = undefined;
    const vehicleToUpdate = vehicles.find(v => v.id === originalRequest.vehicleId);
    if (vehicleToUpdate) {
        updatedVehicle = cleanUndefinedProps({
            ...vehicleToUpdate,
            status: VehicleStatus.Disponivel,
            currentDriverId: null,
            currentRequestId: null,
            km: confirmedKm !== undefined ? confirmedKm : vehicleToUpdate.km 
        }) as Vehicle;
    }

    try {
        const logDetails = cleanUndefinedProps({ 
            finalKm: confirmedKm, 
            vehicleId: originalRequest.vehicleId,
            vehiclePrefixo: originalRequest.vehiclePrefixo,
            solicitanteName: originalRequest.userName, 
            recebedorNameReserva: currentUser.name,
            liberadorNameReserva: users.find(u => u.id === originalRequest.approverIdReserva)?.name, 
            checkoutTimestamp: originalRequest.checkoutTimestamp,
            checkinConfirmationTimestamp: updatedRequest.checkinConfirmationTimestamp, 
            mission: originalRequest.mission,
            checkoutKm: originalRequest.checkoutKm,
            checkinKm: confirmedKm
        });
        const logEntry: Omit<HistoryLog, 'id' | 'timestamp'> = {
            eventType: "REQUEST_CHECKIN_CONFIRMED",
            userId: currentUser.id, userName: currentUser.name,
            targetEntityType: "REQUEST", targetEntityId: requestId,
            description: `Devolução da viatura ${originalRequest.vehiclePrefixo} (Solicitação ${requestId}) confirmada por ${currentUser.name}. KM Final: ${confirmedKm}.`,
            details: logDetails
        };
        if(!FULLY_SIMULATED_MODE){
            await fbSaveRequest(updatedRequest); 
            if (updatedVehicle) {
                await fbSaveVehicle(updatedVehicle); 
            }
            await fbAddHistoryLog(cleanUndefinedProps(logEntry));
        } else {
            const reqIndex = MOCK_REQUESTS.findIndex(r => r.id === updatedRequest.id);
            if (reqIndex > -1) MOCK_REQUESTS[reqIndex] = updatedRequest;
            setRequests([...MOCK_REQUESTS]);

            if (updatedVehicle) {
                const vehIndex = MOCK_VEHICLES.findIndex(v => v.id === updatedVehicle!.id);
                if (vehIndex > -1) MOCK_VEHICLES[vehIndex] = updatedVehicle;
                setVehicles([...MOCK_VEHICLES]);
            }
            setHistoryLogs(prev => [{...logEntry, id:`hist_${Date.now()}`, timestamp: new Date().toISOString()} as HistoryLog, ...prev]);
        }
        closeModal(); 
        alert("Devolução da viatura confirmada com sucesso.");
    } catch (error: any) {
        console.error("Error processing checkin confirmation:", error);
        alert(`Falha ao confirmar devolução: ${error.message}`);
    } finally {
        setAppIsLoading(false);
    }
  };
  
  const handleManualCautelaCreate = async (
    vehicleId: string,
    selectedUserId: string,
    mission: string,
    checkoutKm: number,
    checkoutChecklist: ChecklistDataItem,
    reservaObservations?: string
  ) => {
    if (!currentUser || currentUser.role !== Role.Reserva && currentUser.role !== Role.Admin) {
      alert("Apenas usuários da Reserva ou Admin podem criar cautelas manualmente.");
      return;
    }
    setAppIsLoading(true);

    const vehicle = vehicles.find(v => v.id === vehicleId);
    const selectedUser = users.find(u => u.id === selectedUserId);

    if (!vehicle) {
      alert("Viatura selecionada não encontrada.");
      setAppIsLoading(false);
      return;
    }
    if (vehicle.status !== VehicleStatus.Disponivel) {
      alert(`A viatura ${vehicle.prefixo} não está disponível.`);
      setAppIsLoading(false);
      return;
    }
    if (!selectedUser) {
      alert("Usuário selecionado não encontrado.");
      setAppIsLoading(false);
      return;
    }

    const newRequestId = `req_manual_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const nowISO = new Date().toISOString();

    const newRequest: CautelaRequest = cleanUndefinedProps({
      id: newRequestId,
      vehicleId: vehicle.id,
      userId: selectedUser.id,
      userName: selectedUser.name,
      vehiclePrefixo: vehicle.prefixo,
      mission,
      status: RequestStatus.EmUso, 
      requestTimestamp: nowISO, 
      approvalTimestamp: nowISO, 
      checkoutTimestamp: nowISO, 
      checkoutKm,
      checkoutChecklist,
      approverIdReserva: currentUser.id, 
      reservaCheckoutObservations: reservaObservations, 
    }) as CautelaRequest;

    const updatedVehicle: Vehicle = cleanUndefinedProps({
      ...vehicle,
      status: VehicleStatus.EmUso,
      currentDriverId: selectedUser.id,
      currentRequestId: newRequestId,
      km: checkoutKm, 
    }) as Vehicle;

    try {
      const logDetails = cleanUndefinedProps({
        vehicleId: vehicle.id,
        vehiclePrefixo: vehicle.prefixo,
        solicitanteName: selectedUser.name, 
        liberadorNameReserva: currentUser.name, 
        mission,
        checkoutKm,
        checkoutTimestamp: nowISO,
        manualCreation: true,
        reservaCheckoutObservations: reservaObservations 
      });
      const logEntry: Omit<HistoryLog, 'id' | 'timestamp'> = {
        eventType: "REQUEST_CHECKOUT", 
        userId: currentUser.id, 
        userName: currentUser.name,
        targetEntityType: "REQUEST",
        targetEntityId: newRequestId,
        description: `Cautela manual para ${vehicle.prefixo} (Condutor: ${selectedUser.name}, Missão: ${mission}) criada por ${currentUser.name}.`,
        details: logDetails
      };

      if (!FULLY_SIMULATED_MODE) {
        await fbSaveRequest(newRequest);
        await fbSaveVehicle(updatedVehicle);
        await fbAddHistoryLog(cleanUndefinedProps(logEntry));
      } else {
        MOCK_REQUESTS.unshift(newRequest);
        setRequests([...MOCK_REQUESTS]);

        const vehIndex = MOCK_VEHICLES.findIndex(v => v.id === updatedVehicle.id);
        if (vehIndex > -1) MOCK_VEHICLES[vehIndex] = updatedVehicle;
        setVehicles([...MOCK_VEHICLES]);

        setHistoryLogs(prev => [{ ...logEntry, id: `hist_sim_${Date.now()}`, timestamp: new Date().toISOString() } as HistoryLog, ...prev]);
      }
      closeModal();
      alert(`Cautela manual para ${vehicle.prefixo} (Condutor: ${selectedUser.name}) criada com sucesso.`);
    } catch (error: any) {
      console.error("Error creating manual cautela:", error);
      alert(`Falha ao criar cautela manual: ${error.message}`);
    } finally {
      setAppIsLoading(false);
    }
  };


  if (!isAuthReady || (appIsLoading && !currentUser)) { 
    return (
      <div className="app-loading-container">
        <Spinner />
        <p>{!isAuthReady ? 'Verificando autenticação...' : 'Carregando aplicação...'}</p>
      </div>
    );
  }
  
  if (!currentUser) { 
    const quickLoginUsersForDisplay = FULLY_SIMULATED_MODE ? MOCK_USER_SEED_DATA
    .filter(u => [Role.Admin, Role.Reserva, Role.User].includes(u.role)) 
    .slice(0, 4) 
    .map(u => ({ name: u.name, matricula: u.matricula, role: u.role, authEmail: u.authEmail, hasSetInitialPassword: u.hasSetInitialPassword}))
    : undefined;


    return (
      <>
        <MatriculaLoginScreen
          onLogin={handleMatriculaLogin} 
          authError={authError}
          isLoading={isAuthLoading}
          onForgotPassword={() => openModal('forgotPassword')}
          isSimulatedMode={FULLY_SIMULATED_MODE}
          quickLoginUsers={quickLoginUsersForDisplay}
        />
        {modalState.type === 'forgotPassword' && (
          <ForgotPasswordModal
            isOpen={true}
            onClose={closeModal}
            onSubmit={handleForgotPasswordRequest} 
            isLoading={appIsLoading} 
            initialMessageData={modalState.data}
          />
        )}
      </>
    );
  }
  
  if (currentUser && !currentUser.hasSetInitialPassword) {
    if (!appIsLoading && modalState.type !== 'setInitialPassword') { 
      openModal('setInitialPassword', { userId: currentUser.id });
    }
  }

  if (appIsLoading && currentUser && currentUser.hasSetInitialPassword) { 
      return (
        <div className="app-loading-container">
          <Spinner />
          <p>Carregando dados da aplicação...</p>
        </div>
      );
  }

  let activeHeaderRole: Role = currentUser.role;
  if (viewAsPolice) {
    activeHeaderRole = Role.User; 
  } else if (currentUser.role === Role.Admin && adminViewingAsRole === Role.Reserva) {
    activeHeaderRole = Role.Reserva; 
  } else if (currentUser.role === Role.Admin && !adminViewingAsRole) {
    activeHeaderRole = Role.Admin; 
  }


  return (
    <div className="sgv-app">
      {currentUser && ( 
          <LocalHeader
            unitName={unitName}
            currentUser={currentUser}
            currentEffectiveRole={activeHeaderRole}
            // unreadNotificationCount={unreadNotificationCount} // Prop removed
            onNavigateToAdminView={currentUser.role === Role.Admin ? handleNavigateToAdminView : undefined}
            onNavigateToReservaView={(currentUser.role === Role.Admin || currentUser.role === Role.Reserva) ? handleNavigateToReservaView : undefined}
            onNavigateToUserView={(currentUser.role === Role.Admin || currentUser.role === Role.Reserva) ? handleNavigateToUserView : undefined}
            onOpenAccountSettings={() => openModal('accountSettings')} 
            // onOpenNotificationPanel={() => openModal('notificationPanel')} // Handler removed
            onLogout={handleLogout}
          />
      )}
      <main className="dashboard-container">
        { (currentUser.hasSetInitialPassword || modalState.type === 'setInitialPassword') ? (
            <DashboardRouter
              currentUser={currentUser}
              viewAsPolice={viewAsPolice}
              adminViewingAsRole={adminViewingAsRole} 
              vehicles={vehicles} 
              requests={requests} 
              users={users} 
              checklistItems={checklistItems} 
              historyLogs={historyLogs} 
              openModal={openModal}
              setModalState={setModalState} 
              isLoading={appIsLoading || isAuthLoading} 
              onAddOrUpdateVehicle={handleAddOrUpdateVehicle}
              onDeleteVehicle={(vehicleId: string) => openModal('confirmDelete', {
                title: 'Confirmar Exclusão de Viatura',
                message: `Tem certeza que deseja excluir a viatura ${vehicles.find(v=>v.id === vehicleId)?.prefixo || vehicleId}? Esta ação não pode ser desfeita.`,
                onConfirm: () => handleDeleteVehicle(vehicleId),
              })}
              onToggleVehicleMaintenanceStatus={handleToggleVehicleMaintenanceStatus}
              onAddOrUpdateUser={handleAddOrUpdateUser}
              onDeleteUser={(userId: string) => {
                const user = users.find(u => u.id === userId);
                openModal('confirmDelete', {
                    title: 'Confirmar Exclusão de Usuário',
                    message: `Tem certeza que deseja excluir o usuário ${user?.name || userId} (Matrícula: ${user?.matricula})? Esta ação excluirá o perfil do Firestore, mas não a conta de autenticação.`,
                    onConfirm: () => handleDeleteUser(userId),
                });
              }}
              onAdminResetUserPassword={handleAdminResetUserPassword} 
              onAddChecklistItem={handleAddChecklistItem}
              onDeleteChecklistItem={(itemId: string) => {
                const item = checklistItems.find(ci => ci.id === itemId);
                if (item?.isFixed) {
                  alert("Este item do checklist é fixo e não pode ser excluído.");
                  return;
                }
                openModal('confirmDelete', {
                  title: 'Confirmar Exclusão de Item do Checklist',
                  message: `Tem certeza que deseja excluir o item de checklist "${item?.label || itemId}"?`,
                  onConfirm: () => handleDeleteChecklistItem(itemId),
                });
              }}
              onUpdateChecklistOrder={handleUpdateChecklistOrder} 
              onProcessCheckoutApproval={handleProcessCheckoutApproval}
              onProcessCheckinConfirmation={handleProcessCheckinConfirmation}
              onManualCautelaCreate={handleManualCautelaCreate}
              adminActiveTab={adminActiveTab}
              setAdminActiveTab={setAdminActiveTab}
              reservaActiveTab={reservaActiveTab}
              setReservaActiveTab={setReservaActiveTab}
            />
        ) : (
            <div className="app-loading-container"><Spinner /><p>Aguardando configuração inicial...</p></div>
        )}
      </main>
      {currentUser && ( 
        <footer className="app-footer">
            <p>&copy; {new Date().getFullYear()} Sistema Exclusivo P7 {unitName} . Todos os direitos reservados.</p>
        </footer>
      )}

      {modalState.type === 'vehicleDetail' && modalState.data && (
        <LocalVehicleDetailModal
          vehicle={modalState.data.vehicle as Vehicle}
          requests={requests} 
          users={users} 
          isOpen={true}
          onClose={closeModal}
          onRequestVehicle={() => { closeModal(); openModal('requestVehicle', { vehicle: modalState.data.vehicle }); }}
          onShowHistory={() => openModal('vehicleCautelaHistory', { vehicle: modalState.data.vehicle as Vehicle})} 
          translateStatus={translateStatus}
        />
      )}
      {modalState.type === 'requestVehicle' && modalState.data && (
        <LocalRequestVehicleModal
          vehicle={modalState.data.vehicle as Vehicle} isOpen={true} onClose={closeModal}
          onSubmit={handleRequestVehicleSubmit} checklistItemsConfig={checklistItems}
          isLoading={appIsLoading}
        />
      )}
      {modalState.type === 'vehicleForm' && (
        <LocalVehicleFormModal
          isOpen={true} onClose={closeModal} onSubmit={handleAddOrUpdateVehicle}
          vehicleToEdit={modalState.data?.vehicle as Vehicle | undefined}
          isLoading={appIsLoading}
        />
      )}
      {modalState.type === 'userForm' && (
        <LocalUserFormModal
            isOpen={true} onClose={closeModal} onSubmit={handleAddOrUpdateUser}
            userToEdit={modalState.data?.user as AppUser | undefined}
            isLoading={appIsLoading}
        />
      )}
      {modalState.type === 'confirmDelete' && modalState.data && (
        <LocalConfirmDeleteModal
          isOpen={true} onClose={closeModal}
          title={modalState.data.title || "Confirmar Exclusão"}
          message={modalState.data.message || "Tem certeza que deseja prosseguir com esta ação?"}
          onConfirm={modalState.data.onConfirm} 
          isLoading={appIsLoading}
          confirmButtonText={modalState.data.confirmButtonText}
        />
      )}
      {modalState.type === 'setInitialPassword' && modalState.data && currentUser && (
        <SetInitialPasswordModal
          isOpen={true}
          onClose={() => {
            if (!currentUser.hasSetInitialPassword) { handleLogout(); } 
            closeModal();
          }}
          onSubmit={handleSetInitialPassword} 
          userId={currentUser.id} isLoading={appIsLoading}
        />
      )}
      
      {modalState.type === 'approvalModal' && modalState.data?.request && (
        <LocalApprovalModal 
          isOpen={true} onClose={closeModal} request={modalState.data.request as CautelaRequest}
          users={users} checklistItemsConfig={checklistItems}
          onSubmit={handleProcessCheckoutApproval} isLoading={appIsLoading}
        />
      )}
      {modalState.type === 'checkinModal' && modalState.data?.requestToReturn && modalState.data?.vehicleToReturn && (
        <LocalUserCheckinModal
          isOpen={true}
          onClose={closeModal}
          requestToReturn={modalState.data.requestToReturn as CautelaRequest}
          vehicleToReturn={modalState.data.vehicleToReturn as Vehicle}
          checklistItemsConfig={checklistItems}
          onSubmit={handleUserInitiateCheckin}
          isLoading={appIsLoading}
        />
      )}
      {modalState.type === 'approveCheckinModal' && modalState.data?.request && (
        <LocalApproveCheckinModal 
          isOpen={true} onClose={closeModal} request={modalState.data.request as CautelaRequest}
          users={users} vehicles={vehicles} checklistItemsConfig={checklistItems}
          onSubmit={handleProcessCheckinConfirmation} isLoading={appIsLoading}
        />
      )}
      {modalState.type === 'vehicleCautelaHistory' && modalState.data?.vehicle && (
        <VehicleCautelaHistoryModal
          isOpen={true}
          onClose={closeModal}
          vehicle={modalState.data.vehicle as Vehicle}
          historyLogs={historyLogs}
          users={users} 
          isLoading={appIsLoading}
        />
      )}
      {modalState.type === 'vehicleActions' && modalState.data?.vehicle && (
        <LocalVehicleActionsModal
          isOpen={true}
          onClose={closeModal}
          vehicle={modalState.data.vehicle as Vehicle}
          openModal={openModal}
          onDeleteVehicle={(vehicleId: string) => openModal('confirmDelete', {
            title: 'Confirmar Exclusão de Viatura',
            message: `Tem certeza que deseja excluir a viatura ${vehicles.find(v=>v.id === vehicleId)?.prefixo || vehicleId}? Esta ação não pode ser desfeita.`,
            onConfirm: () => handleDeleteVehicle(vehicleId),
          })}
          onToggleVehicleMaintenanceStatus={handleToggleVehicleMaintenanceStatus}
          isLoading={appIsLoading}
        />
      )}
      {modalState.type === 'userActions' && modalState.data?.user && currentUser && (
        <LocalUserActionsModal
          isOpen={true}
          onClose={closeModal}
          user={modalState.data.user as AppUser}
          currentUserAppUser={currentUser}
          openModal={openModal}
          onDeleteUser={(userId: string) => {
             const userToDelete = users.find(u => u.id === userId);
             openModal('confirmDelete', {
                title: 'Confirmar Exclusão de Usuário',
                message: `Tem certeza que deseja excluir o usuário ${userToDelete?.name || userId} (Matrícula: ${userToDelete?.matricula})? Esta ação excluirá o perfil do Firestore, mas não a conta de autenticação.`,
                onConfirm: () => handleDeleteUser(userId),
             });
          }}
          onAdminResetUserPassword={handleAdminResetUserPassword} 
          isLoading={appIsLoading}
        />
      )}
       {modalState.type === 'accountSettings' && currentUser && (
        <AccountSettingsModal
          isOpen={true}
          onClose={closeModal}
          currentUser={currentUser}
          onChangePassword={handleChangeUserPassword}
          isLoadingPassword={isLoadingPasswordChange}
          passwordError={passwordChangeError}
          clearAuthErrors={clearAccountSettingsErrors}
        />
      )}
      {modalState.type === 'manualCautelaForm' && currentUser && (currentUser.role === Role.Reserva || currentUser.role === Role.Admin) && (
        <LocalManualCautelaModal
          isOpen={true}
          onClose={closeModal}
          availableVehicles={vehicles.filter(v => v.status === VehicleStatus.Disponivel)}
          allUsers={users} 
          checklistItemsConfig={checklistItems}
          onSubmit={handleManualCautelaCreate}
          isLoading={appIsLoading}
          currentUser={currentUser} 
        />
      )}
      {modalState.type === 'cautelaDetailHistory' && modalState.data?.requestId && (() => {
          const fullRequest = requests.find(r => r.id === modalState.data.requestId);
          if (!fullRequest) {
            console.error(`Cautela with ID ${modalState.data.requestId} not found for detail view.`);
            return (
                 <LocalCautelaDetailHistoryModal
                    isOpen={true}
                    onClose={closeModal}
                    request={undefined} 
                    users={users}
                    checklistItemsConfig={checklistItems}
                    isLoading={false}
                 />
            );
          }
          return (
            <LocalCautelaDetailHistoryModal
              isOpen={true}
              onClose={closeModal}
              request={fullRequest}
              users={users}
              checklistItemsConfig={checklistItems}
              isLoading={appIsLoading}
            />
          );
        })()}
      {/* NotificationPanelModal Removed */}
    </div>
  );
};

export default SGVAppFinal;