// firebase.ts
import firebase from "firebase/compat/app"; // Use compat layer
import "firebase/compat/analytics"; // If analytics is to be used in the future

// Define a type for the config for better type safety
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string; // Optional
}

// Configuration for 'gerente12bpm'
const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyCo0o-H1Kc1c_ujQ7_y5b_HAAdBscy5ETA",
  authDomain: "gestao12bpm.xyz", // Updated
  projectId: "gerente12bpm",
  storageBucket: "gerente12bpm.firebasestorage.app",
  messagingSenderId: "496525546915",
  appId: "1:496525546915:web:7c29182b8397d8a7027616",
  measurementId: "G-96RSG7EG50"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const app: firebase.app.App = firebase.app(); // Default app instance
const analytics = firebase.apps.length ? firebase.analytics(app) : null;


export { app, analytics, firebase }; // Export firebase itself for v8-style usage
