import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, FirebaseRegisterRequest, FirebaseAuthResponse } from "../types/user";
import { instanceAxios } from "../api/axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
        const { data } = await instanceAxios.post<LoginResponse>("/users/login", credentials);
        return data;
    } catch (error: any) {
        const message =
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Credenciales inválidas o error de servidor";
        throw new Error(message);
    }
};

export const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
    try {
        const { data } = await instanceAxios.post<RegisterResponse>("/users/register", userData);
        return data;
    } catch (error: any) {
        const message =
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Error al registrar usuario";
        throw new Error(message);
    }
};

export const checkAvailability = async (email: string, userName: string) => {
    try {
        const { data } = await instanceAxios.get("/users/check-availability", {
            params: { email, userName }
        });
        return data;
    } catch (error: any) {
        const message =
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Error al verificar disponibilidad";
        throw new Error(message);
    }
};

export const logoutRequest = async (): Promise<void> => {
  try {
    await instanceAxios.post("/users/logout");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};

export const checkSession = async () => {
  try {
    const { data } = await instanceAxios.get("/users/access/user",
      { withCredentials: true }
    );

    return {
      email: data.email,
      role: data.role,
      name: data.name,
      level: data.level,
      displayName: data.displayName,
      totalPoints: data.totalPoints
    };

  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Sin sesión activa o error al verificar sesión";
    throw new Error(message);
  }
};

export const loginWithGoogle = async (): Promise<LoginResponse> => {
    try {
        // Iniciar sesión con Google usando Firebase
        const result = await signInWithPopup(auth, googleProvider);
        
        // Obtener el token ID de Firebase
        const idToken = await result.user.getIdToken();
        
        // Enviar el token al backend para login
        const { data } = await instanceAxios.post<FirebaseAuthResponse>("/users/firebase-login", {
            idToken
        });
        
        // Limpiar token temporal si existe
        sessionStorage.removeItem('firebase_temp_token');
        
        return {
            message: data.message,
            user: data.user
        };
    } catch (error: any) {
        // Si el usuario cerró el popup o canceló
        if (error.code === 'auth/popup-closed-by-user' || 
            error.code === 'auth/cancelled-popup-request' ||
            error.code === 'auth/popup-blocked' ||
            error.message?.includes('popup') ||
            error.message?.includes('cancelled') ||
            error.message?.includes('closed')) {
            throw new Error('POPUP_CANCELLED');
        }
        
        // Si el error es que el usuario no existe, guardar el token para el registro
        if (error.response?.status === 404 || 
            error.response?.data?.error?.includes('Usuario no encontrado') ||
            error.response?.data?.error?.includes('Debes registrarte')) {
            
            // Obtener el usuario actual de Firebase
            const currentUser = auth.currentUser;
            if (currentUser) {
                const idToken = await currentUser.getIdToken();
                sessionStorage.setItem('firebase_temp_token', idToken);
            }
        }
        
        const message =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Error al hacer login con Google";
        throw new Error(message);
    }
};

export const registerWithGoogle = async (userData: Omit<FirebaseRegisterRequest, 'idToken'>): Promise<RegisterResponse> => {
    try {
        let idToken: string;
        
        // Verificar si hay un token temporal guardado (viene del login fallido)
        const tempToken = sessionStorage.getItem('firebase_temp_token');
        
        if (tempToken) {
            // Usar el token guardado
            idToken = tempToken;
            sessionStorage.removeItem('firebase_temp_token');
        } else {
            // Si no hay token temporal, abrir popup de Google
            const result = await signInWithPopup(auth, googleProvider);
            idToken = await result.user.getIdToken();
        }
        
        // Enviar el token y datos del usuario al backend para registro
        const { data } = await instanceAxios.post<FirebaseAuthResponse>("/users/firebase-register", {
            idToken,
            ...userData
        });
        
        return {
            message: data.message,
            user: data.user
        };
    } catch (error: any) {
        // Si el usuario cerró el popup o canceló
        if (error.code === 'auth/popup-closed-by-user' || 
            error.code === 'auth/cancelled-popup-request' ||
            error.message?.includes('popup') ||
            error.message?.includes('cancelled')) {
            throw new Error('POPUP_CANCELLED');
        }
        
        const message =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Error al registrar con Google";
        throw new Error(message);
    }
};