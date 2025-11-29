// Request login
export interface LoginRequest {
    email: string;
    password: string;
}

// Estructura del usuario en respuesta exitosa
export interface AuthUser {
    email: string;
    role: string;
    name: string;
    level: number;
    displayName: string;
    totalPoints: number;
}

// Response login
export interface LoginResponse {
    message: string;
    user: AuthUser;
}