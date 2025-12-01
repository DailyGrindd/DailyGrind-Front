// Request login
export interface LoginRequest {
    email: string;
    password: string;
}

// Request register
export interface RegisterRequest {
    userName: string;
    email: string;
    password: string;
    displayName: string;
    zone: string;
    isPublic: boolean;
    avatarUrl?: string;
}

// Estructura del usuario en respuesta exitosa
export interface AuthUser {
    email: string;
    role: string;
    name?: string;
    userName?: string;
    level: number;
    displayName?: string;
    totalPoints?: number;
}

// Response login
export interface LoginResponse {
    message: string;
    user: AuthUser;
}

// Response register
export interface RegisterResponse {
    message: string;
    user: AuthUser;
}

// Request Firebase login
export interface FirebaseLoginRequest {
    idToken: string;
}

// Request Firebase register
export interface FirebaseRegisterRequest {
    idToken: string;
    userName: string;
    displayName: string;
    avatarUrl?: string;
    isPublic: boolean;
    zone: string;
}

// Response Firebase auth
export interface FirebaseAuthResponse {
    message: string;
    user: AuthUser;
}