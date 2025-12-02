import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validar que todas las variables estén presentes
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    console.error("Firebase configuration is missing. Please check your .env.local file");
    console.log("Current config:", {
        apiKey: firebaseConfig.apiKey ? "✓" : "✗",
        authDomain: firebaseConfig.authDomain ? "✓" : "✗",
        projectId: firebaseConfig.projectId ? "✓" : "✗",
        storageBucket: firebaseConfig.storageBucket ? "✓" : "✗",
        messagingSenderId: firebaseConfig.messagingSenderId ? "✓" : "✗",
        appId: firebaseConfig.appId ? "✓" : "✗"
    });
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configuración adicional del provider de Google
googleProvider.setCustomParameters({
    prompt: 'select_account'
});
