/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { 
  AppUser, 
  Vehicle, 
  Request as CautelaRequest, 
  UnitMetadata,
  Role,
  HistoryLog 
} from '../types';
import { 
  FULLY_SIMULATED_MODE, 
  MOCK_USER_SEED_DATA, 
  MOCK_VEHICLES, 
  MOCK_REQUESTS,
  // INITIAL_LOCATIONS, // Removed
  INITIAL_CHECKLIST_ITEMS,
  DEFAULT_INITIAL_PASSWORD,
  MOCK_LOGIN_PASSWORD,
  MOCK_HISTORY_LOGS 
} from '../constants';

// Import the initialized firebase instance and specific compat modules
import { firebase, app as firebaseApp } from '../../firebase'; // firebaseApp here is the v8 app object
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


// Types
export type FirebaseUser = firebase.User;
export type Unsubscribe = () => void;

// Initialize Firebase services using v8 compat style
export const auth = firebase.auth(); 
const db = firebase.firestore();


export const initializeFirebase = () => {
  if (FULLY_SIMULATED_MODE) {
    console.log("SGV running in FULLY_SIMULATED_MODE. Firebase SDK calls will be mocked.");
  } else {
    console.log("SGV running with Firebase integration. Initializing Auth and Firestore (Compat Mode)...");
    try {
      console.log("Firebase App Options (config used by SDK):", JSON.stringify(firebaseApp.options, null, 2));
      
      if (db && db.app) {
        console.log(`Firestore SDK is attempting to connect to projectId: ${db.app.options.projectId}`);
      } else {
        console.warn("Firestore db instance or db.app is not fully initialized for logging projectId.");
      }

      db.enableNetwork()
        .then(() => console.log("Firestore network connection successfully enabled (or was already online)."))
        .catch((error: any) => console.warn("Failed to explicitly enable Firestore network connection. Client might remain offline or use cached data.", error.message, error.code));
    } catch (e: any) {
      console.error("Error during Firebase service initialization:", e);
    }
  }
};


export const fbListenToAuthState = (callback: (user: FirebaseUser | null) => void): Unsubscribe => {
  return auth.onAuthStateChanged(callback);
};

export const fbGetUserAuthEmailByMatricula = async (matricula: string): Promise<string | null> => {
  if (FULLY_SIMULATED_MODE) {
    const user = MOCK_USER_SEED_DATA.find(u => u.matricula.toLowerCase() === matricula.toLowerCase().trim());
    return user ? user.authEmail : null;
  }
  try {
    const usersCollectionRef = db.collection("users");
    const q = usersCollectionRef.where("matricula", "==", matricula.trim()).limit(1);
    const querySnapshot = await q.get();
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as AppUser;
      return userData.authEmail || null; 
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching user authEmail by matricula from Firestore:", error.message, `(Code: ${error.code})`);
    if (error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes("permission"))) {
        throw new Error(`Falha ao verificar matrícula: Permissão negada para consultar dados de usuário (${matricula}). Verifique as regras de segurança do Firestore.`);
    }
    if (error.message && error.message.toLowerCase().includes("offline")) {
        throw new Error(`Falha ao buscar email do usuário pela matrícula: cliente offline. (Matrícula: ${matricula})`);
    }
    throw error;
  }
};


export const fbSignInUser = async (
  email: string, 
  senha: string, 
): Promise<{ user: FirebaseUser, profile: AppUser }> => {
  if (FULLY_SIMULATED_MODE) {
    console.log(`Simulating login for email: ${email}`); 
    await new Promise(resolve => setTimeout(resolve, 300));

    const simulatedUser = MOCK_USER_SEED_DATA.find(u => u.authEmail.toLowerCase() === email.toLowerCase().trim());
    if (simulatedUser && senha === MOCK_LOGIN_PASSWORD) { 
        return { 
            user: { uid: simulatedUser.id, email: simulatedUser.authEmail } as FirebaseUser, 
            profile: simulatedUser 
        };
    } else {
        throw new Error("Email ou senha inválida (simulado).");
    }
  } else {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email.trim(), senha);
      if (!userCredential.user) {
        throw new Error("Falha no login, usuário não retornado.");
      }
      let profile: AppUser | null = null;
      try {
        profile = await fbFetchAppUserProfile(userCredential.user.uid);
      } catch (profileError: any) {
        if (profileError.code === 'permission-denied' || (profileError.message && profileError.message.toLowerCase().includes("permission"))) {
            console.warn(`User ${userCredential.user.uid} authenticated but profile fetch failed due to permissions. Signing out.`);
            await auth.signOut(); 
            throw new Error(`Login autenticado para ${email}, mas acesso ao perfil do usuário (UID: ${userCredential.user.uid}) foi negado. Verifique as permissões no Firestore.`);
        }
        throw profileError; 
      }
      
      if (!profile) {
        console.warn(`User ${userCredential.user.uid} authenticated but no Firestore profile found.`);
        await auth.signOut(); 
        throw new Error("Autenticação bem-sucedida, mas o perfil de usuário não foi encontrado no sistema. Contate o suporte.");
      }
      return { user: userCredential.user, profile };
    } catch (error: any) {
      console.error("Firebase login error:", error.message, `(Code: ${error.code})`);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-email') {
        throw new Error("Email ou senha inválida.");
      }
      if (error.message && (
          error.message.startsWith("Login autenticado, mas acesso ao perfil do usuário") ||
          error.message.startsWith("Autenticação bem-sucedida, mas o perfil de usuário não foi encontrado")
         )) {
          throw error; 
      }
      if (error.message && error.message.toLowerCase().includes("offline")) { 
         throw new Error("Falha ao conectar ao banco de dados (cliente offline). Verifique sua conexão e a configuração do Firebase, ou tente mais tarde.");
      }
      if (error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes("permission"))) {
          throw new Error(`Erro de permissão durante o login (${error.code || 'sem código'}). Verifique as regras de segurança do Firestore ou contate o suporte. Detalhes: ${error.message}`);
      }
      throw new Error(`Falha no login. Verifique suas credenciais ou tente mais tarde. Erro: ${error.message}`);
    }
  }
};

export const fbFetchAppUserProfile = async (uid: string): Promise<AppUser | null> => {
  if (FULLY_SIMULATED_MODE) {
    return MOCK_USER_SEED_DATA.find(u => u.id === uid) || null;
  }
  try {
    const userDocRef = db.collection("users").doc(uid);
    const userDocSnap = await userDocRef.get();
    if (userDocSnap.exists) {
      return userDocSnap.data() as AppUser;
    } else {
      console.log(`No profile document found in Firestore for UID: ${uid}`);
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching user profile from Firestore:", error.message, `(Code: ${error.code})`);
    if (error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes("permission"))) { 
        throw new Error(`Falha ao buscar perfil do usuário (UID: ${uid}): Permissão negada. Verifique as regras de segurança do Firestore.`);
    }
    if (error.message && error.message.toLowerCase().includes("offline")) {
        throw new Error(`Falha ao buscar perfil do usuário: cliente offline. (UID: ${uid})`);
    }
    throw error; 
  }
};

export const fbFetchAllAppUserProfiles = async (): Promise<AppUser[]> => {
  if (FULLY_SIMULATED_MODE) {
    return MOCK_USER_SEED_DATA;
  }
  try {
    const usersCollectionRef = db.collection("users");
    const querySnapshot = await usersCollectionRef.get();
    const profiles: AppUser[] = [];
    querySnapshot.forEach((docSnap) => {
      profiles.push(docSnap.data() as AppUser);
    });
    return profiles;
  } catch (error: any) {
    console.error("Error fetching all user profiles from Firestore:", error.message, `(Code: ${error.code})`);
     if (error.message && error.message.toLowerCase().includes("offline")) {
        throw new Error("Falha ao buscar todos os perfis: cliente offline.");
    }
    throw error;
  }
};


export const fbSignOutUser = async (): Promise<void> => {
  if (FULLY_SIMULATED_MODE) {
    console.log("Simulating sign out.");
    return;
  }
  try {
    await auth.signOut();
  } catch (error: any) {
    console.error("Firebase sign out error:", error.message, `(Code: ${error.code})`);
    throw error;
  }
};

export const fbReauthenticateUser = async (currentPassword: string): Promise<void> => {
  if (FULLY_SIMULATED_MODE) {
    console.log("Simulating re-authentication.");
    if (currentPassword === MOCK_LOGIN_PASSWORD) {
        return;
    } else {
        throw new Error("Simulated: Senha atual incorreta para reautenticação.");
    }
  }
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("Nenhum usuário autenticado ou email do usuário não disponível para reautenticação.");
  }
  const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
  try {
    await user.reauthenticateWithCredential(credential);
  } catch (error: any) {
    console.error("Firebase re-authentication error:", error.message, `(Code: ${error.code})`);
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error("Senha atual incorreta. Reautenticação falhou.");
    }
    throw new Error("Falha na reautenticação. Tente novamente.");
  }
};


export const fbUpdateUserPassword = async (newPasswordPlain: string): Promise<void> => {
  if (FULLY_SIMULATED_MODE) {
    console.log("Simulating password update.");
    return;
  }
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Nenhum usuário autenticado para atualizar a senha.");
  }
  try {
    await user.updatePassword(newPasswordPlain);
  } catch (error: any) {
    console.error("Firebase password update error:", error.message, `(Code: ${error.code})`);
    if (error.code === 'auth/requires-recent-login') {
      throw new Error("Esta operação é sensível e requer autenticação recente. Por favor, faça login novamente e tente de novo, ou reautentique-se.");
    }
    throw new Error("Falha ao atualizar a senha.");
  }
};

export const fbUpdateUserAuthEmail = async (newEmail: string): Promise<void> => {
  if (FULLY_SIMULATED_MODE) {
    console.log(`Simulating email update to: ${newEmail}.`);
    return;
  }
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Nenhum usuário autenticado para atualizar o email.");
  }
  try {
    await user.updateEmail(newEmail);
  } catch (error: any) {
    console.error("Firebase email update error:", error.message, `(Code: ${error.code})`);
    if (error.code === 'auth/requires-recent-login') {
      throw new Error("Esta operação é sensível e requer autenticação recente. Por favor, reautentique-se e tente novamente.");
    } else if (error.code === 'auth/email-already-in-use') {
      throw new Error("Este email já está em uso por outra conta.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("O novo email fornecido não é válido.");
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error("Falha de rede ao tentar atualizar o email. Verifique sua conexão e tente novamente.");
    } else if (error.code === 'auth/user-disabled') {
      throw new Error("A conta deste usuário foi desabilitada e o email não pode ser alterado.");
    } else if (error.code === 'auth/user-not-found') {
      throw new Error("Usuário não encontrado. A conta pode ter sido removida recentemente.");
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error("Foram feitas muitas tentativas de alteração de email recentemente. Por favor, tente novamente mais tarde.");
    }
    throw new Error("Falha ao atualizar o email.");
  }
};


export const fbSaveUserProfile = async (profileData: AppUser): Promise<void> => {
  if (FULLY_SIMULATED_MODE) {
    console.log("Simulating save user profile:", profileData);
    const userIndex = MOCK_USER_SEED_DATA.findIndex(u => u.id === profileData.id);
    if (userIndex > -1) {
        MOCK_USER_SEED_DATA[userIndex] = { ...MOCK_USER_SEED_DATA[userIndex], ...profileData };
    }
    return;
  }
  if (!profileData.id) {
    throw new Error("User profile must have an ID to be saved.");
  }
  try {
    const userDocRef = db.collection("users").doc(profileData.id);
    await userDocRef.set(profileData, { merge: true }); 
  } catch (error: any) {
      console.error("Error saving user profile to Firestore:", error.message, `(Code: ${error.code})`);
     if (error.message && error.message.toLowerCase().includes("offline")) {
        throw new Error("Falha ao salvar perfil: cliente offline.");
    }
    throw error;
  }
};

export const fbDeleteUserProfile = async (userId: string): Promise<void> => {
  if (FULLY_SIMULATED_MODE) {
    console.log(`Simulating delete user profile for userId: ${userId}`);
    return;
  }
  if (!userId) {
    throw new Error("User ID must be provided to delete a profile.");
  }
  try {
    const userDocRef = db.collection("users").doc(userId);
    await userDocRef.delete();
    console.log(`User profile ${userId} successfully deleted from Firestore.`);
  } catch (error: any) {
    console.error(`Error deleting user profile ${userId} from Firestore:`, error.message, `(Code: ${error.code})`);
    if (error.message && error.message.toLowerCase().includes("offline")) {
        throw new Error(`Falha ao excluir perfil: cliente offline. (UID: ${userId})`);
    }
    throw new Error(`Falha ao excluir perfil do usuário ${userId}.`);
  }
};


export const fbSendPasswordReset = async (email: string): Promise<{ emailSentTo: string }> => { 
  if (FULLY_SIMULATED_MODE) {
      console.log(`Simulating password reset request for email: ${email}`);
      const user = MOCK_USER_SEED_DATA.find(u => u.authEmail.toLowerCase() === email.trim().toLowerCase());
      if (user) { 
          return { emailSentTo: user.authEmail }; 
      } else {
          throw new Error("Email pessoal associado à matrícula não encontrado no sistema simulado.");
      }
  }
  try {
    await auth.sendPasswordResetEmail(email.trim());
    return { emailSentTo: email.trim() };
  } catch (error: any) {
    console.error("Firebase password reset error:", error.message, `(Code: ${error.code})`);
    if (error.code === 'auth/user-not-found') {
      throw new Error("Email pessoal associado à matrícula não encontrado no sistema de autenticação.");
    } else if (error.code === 'auth/invalid-email') {
       throw new Error(`O email pessoal fornecido ("${email}") não é válido para o sistema de autenticação.`);
    }
    throw new Error("Falha ao solicitar redefinição de senha. Tente novamente mais tarde.");
  }
};

// --- Metadata Service Functions ---
export const fbEnsureMetadataExists = async (): Promise<Omit<UnitMetadata, 'locations'>> => { // locations removed from return type
  const initialMetadata: Omit<UnitMetadata, 'locations'> = { // locations removed
      // locations: INITIAL_LOCATIONS, // Removed
      checklistItems: INITIAL_CHECKLIST_ITEMS 
  };
  if (FULLY_SIMULATED_MODE) {
      console.log("Simulating ensure metadata exists. Returning initial constants (without locations).");
      return initialMetadata;
  }
  const metadataDocRef = db.collection("metadata").doc("global_settings");
  try {
      const docSnap = await metadataDocRef.get();
      if (docSnap.exists) {
          const data = docSnap.data() as UnitMetadata;
          // data is already of type UnitMetadata which doesn't have 'locations'
          return data;
      } else {
          console.log("No global_settings metadata found in Firestore. Creating with initial values (without locations).");
          await metadataDocRef.set(initialMetadata);
          return initialMetadata;
      }
  } catch (error: any) {
      console.error("Error ensuring metadata exists in Firestore:", error.message);
      if (error.message && error.message.toLowerCase().includes("offline")) {
          console.warn("Client is offline. Returning initial metadata constants as fallback (without locations).");
          return initialMetadata; 
      }
      throw new Error("Falha ao carregar ou criar configurações da unidade.");
  }
};

export const fbUpdateMetadata = async (metadata: Omit<UnitMetadata, 'locations'>): Promise<void> => { // locations removed from param type
  if (FULLY_SIMULATED_MODE) {
      console.log("Simulating update metadata (without locations):", metadata);
      return;
  }
  const metadataDocRef = db.collection("metadata").doc("global_settings");
  try {
      // Ensure 'locations' field is explicitly removed or not set if it's no longer part of UnitMetadata
      const dataToSave: any = { ...metadata };
      delete dataToSave.locations; // Explicitly remove if it might still exist from old types

      await metadataDocRef.set(dataToSave, { merge: true }); 
  } catch (error: any) {
      console.error("Error updating metadata in Firestore:", error.message);
      if (error.message && error.message.toLowerCase().includes("offline")) {
          throw new Error("Falha ao atualizar configurações: cliente offline.");
      }
      throw new Error("Falha ao atualizar configurações da unidade.");
  }
};


// --- Vehicle Service Functions ---
export const fbListenToAllVehicles = (
  onUpdate: (vehicles: Vehicle[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  if (FULLY_SIMULATED_MODE) {
    console.log("Simulating real-time listener for vehicles. Providing initial mock data.");
    setTimeout(() => onUpdate(MOCK_VEHICLES), 0); // Simulate async fetch
    return () => console.log("Simulated vehicles listener unsubscribed."); // Dummy unsubscribe
  }
  
  const vehiclesCollectionRef = db.collection("vehicles");
  const q = vehiclesCollectionRef.orderBy("prefixo"); // Optional: order by prefixo or another field

  return q.onSnapshot( 
    (querySnapshot) => {
      const fetchedVehicles: Vehicle[] = [];
      querySnapshot.forEach((docSnap) => {
        const rawData = docSnap.data();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { localizacao, ...vehicleDataWithoutLocalizacao } = rawData; // Destructure from rawData
        fetchedVehicles.push({ id: docSnap.id, ...vehicleDataWithoutLocalizacao } as Vehicle);
      });
      onUpdate(fetchedVehicles);
    },
    (error: Error) => {
      console.error("Error listening to vehicles collection:", error);
      onError(error);
    }
  );
};

export const fbSaveVehicle = async (vehicleData: Vehicle): Promise<void> => {
  if (FULLY_SIMULATED_MODE) {
    console.log("Simulating save vehicle:", vehicleData);
    // vehicleData is already of type Vehicle and should not have localizacao
    const simData = vehicleData;
    const index = MOCK_VEHICLES.findIndex(v => v.id === simData.id);
    if (index > -1) {
        MOCK_VEHICLES[index] = simData;
    } else {
        MOCK_VEHICLES.push(simData);
    }
    return;
  }
  if (!vehicleData.id) throw new Error("Vehicle data must have an ID to be saved.");
  try {
    const vehicleDocRef = db.collection("vehicles").doc(vehicleData.id);
    // vehicleData is already of type Vehicle and should not have localizacao
    const dataToSave = vehicleData;
    await vehicleDocRef.set(dataToSave, { merge: true });
  } catch (error: any) {
    console.error("Error saving vehicle to Firestore:", error);
    if (error.message && error.message.toLowerCase().includes("offline")) {
        throw new Error("Falha ao salvar viatura: cliente offline.");
    }
    throw error;
  }
};

export const fbDeleteVehicle = async (vehicleId: string): Promise<void> => {
  if (FULLY_SIMULATED_MODE) {
    console.log(`Simulating delete vehicle: ${vehicleId}`);
    const index = MOCK_VEHICLES.findIndex(v => v.id === vehicleId);
    if (index > -1) {
        MOCK_VEHICLES.splice(index, 1);
    }
    return;
  }
  try {
    const vehicleDocRef = db.collection("vehicles").doc(vehicleId);
    await vehicleDocRef.delete();
  } catch (error: any) {
    console.error("Error deleting vehicle from Firestore:", error);
    if (error.message && error.message.toLowerCase().includes("offline")) {
        throw new Error("Falha ao excluir viatura: cliente offline.");
    }
    throw error;
  }
};

// --- Request Service Functions ---
export const fbListenToAllRequests = (
  onUpdate: (requests: CautelaRequest[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  if (FULLY_SIMULATED_MODE) {
    console.log("Simulating real-time listener for requests. Providing initial mock data.");
    setTimeout(() => onUpdate(MOCK_REQUESTS), 0); // Simulate async fetch
    return () => console.log("Simulated requests listener unsubscribed."); // Dummy unsubscribe
  }

  const requestsCollectionRef = db.collection("requests");
  const q = requestsCollectionRef.orderBy("requestTimestamp", "desc");


  return q.onSnapshot(
    (querySnapshot) => {
      const fetchedRequests: CautelaRequest[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedRequests.push({ id: docSnap.id, ...docSnap.data() } as CautelaRequest);
      });
      onUpdate(fetchedRequests);
    },
    (error: Error) => {
      console.error("Error listening to requests collection:", error);
      onError(error);
    }
  );
};


export const fbSaveRequest = async (requestData: CautelaRequest): Promise<void> => {
  if (FULLY_SIMULATED_MODE) {
    console.log("Simulating save request:", requestData);
    const index = MOCK_REQUESTS.findIndex(r => r.id === requestData.id);
    if (index > -1) {
        MOCK_REQUESTS[index] = requestData;
    } else {
        MOCK_REQUESTS.unshift(requestData); // Add to beginning like new requests
    }
    return;
  }
  if (!requestData.id) throw new Error("Request data must have an ID to be saved.");
  try {
    const requestDocRef = db.collection("requests").doc(requestData.id);
    await requestDocRef.set(requestData, { merge: true });
  } catch (error: any) {
    console.error("Error saving request to Firestore:", error);
    if (error.message && error.message.toLowerCase().includes("offline")) {
        throw new Error("Falha ao salvar solicitação: cliente offline.");
    }
    throw error;
  }
};

// --- History Log Service Function ---
export const fbAddHistoryLog = async (logData: Omit<HistoryLog, 'id' | 'timestamp'>): Promise<void> => {
  if (FULLY_SIMULATED_MODE) {
    const simulatedLog = {
      ...logData,
      id: `hist_mock_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
      timestamp: new Date().toISOString(), 
    };
    MOCK_HISTORY_LOGS.unshift(simulatedLog);
    console.log("Simulating Add History Log:", simulatedLog);
    return;
  }
  try {
    const historyCollectionRef = db.collection("history_logs");
    await historyCollectionRef.add({
      ...logData,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(), 
    });
  } catch (error: any) {
    console.error("Error adding history log to Firestore:", error.message, `(Code: ${error.code})`);
  }
};

export const fbFetchHistoryLogs = async (): Promise<HistoryLog[]> => {
  if (FULLY_SIMULATED_MODE) {
    return [...MOCK_HISTORY_LOGS].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  try {
    const historyCollectionRef = db.collection("history_logs");
    const q = historyCollectionRef.orderBy("timestamp", "desc");
    const querySnapshot = await q.get();
    const logs: HistoryLog[] = [];
    querySnapshot.forEach((docSnap) => {
      logs.push({ id: docSnap.id, ...docSnap.data() } as HistoryLog);
    });
    return logs;
  } catch (error: any) {
    console.error("Error fetching history logs from Firestore:", error);
    if (error.message && error.message.toLowerCase().includes("offline")) {
        throw new Error("Falha ao buscar histórico: cliente offline.");
    }
    throw error;
  }
};
