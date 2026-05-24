import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbUHGmjVQ82WbFM0_Ge31mtw51fHzpNco",
  authDomain: "dbms-59dbf.firebaseapp.com",
  projectId: "dbms-59dbf",
  storageBucket: "dbms-59dbf.firebasestorage.app",
  messagingSenderId: "1010071159513",
  appId: "1:1010071159513:web:f2b6a5798da5a73c6974c8",
  measurementId: "G-H9S6E0ZFR1"
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
