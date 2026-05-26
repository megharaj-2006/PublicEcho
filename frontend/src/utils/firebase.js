import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAbUHGmjVQ82WbFM0_Ge31mtw51fHzpNco",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dbms-59dbf.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dbms-59dbf",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dbms-59dbf.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1010071159513",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1010071159513:web:f2b6a5798da5a73c6974c8",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-H9S6E0ZFR1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
// Set custom parameters to force account selection dialog (makes testing very easy)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
