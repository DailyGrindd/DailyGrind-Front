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

// Resquest upload
export interface UploadUserRequest {
    userName?: string;
    email?: string;
    password?: string;
    displayName?: string;
    zone?: string;
    isPublic?: boolean;
    role?: string;
    level?: number;
}

export interface UploadUserResponse {
    message: string;
    user: GetUserResponse;
}

// Estructura del usuario en respuesta exitosa
export interface AuthUser {
    _id?: string;
    email: string;
    role: string;
    name?: string;
    userName?: string;
    level: number;
    displayName?: string;
    totalPoints?: number;
    avatarUrl?: string;
    zone?: string;
}

// Response get user
export interface GetUserResponse {
    _id: string;
    userName: string;
    email: string;
    password: string;
    role: string;
    level: number;
    lastActive: string;
    isActive: boolean;

    // Profile 
    profile: {
        displayName: string;
        avatarUrl?: string;
        isPublic: boolean;
        zone: string;
    };

    // Stats 
    stats: {
        totalPoints: number;
        weeklyPoints: number;
        totalCompleted: number;
        currentStreak: number;
    };
}

// Response get users
export interface GetUsersResponse {
    id: string;
    userName: string;
    email: string;
    password: string;
    role: string;
    level: number;
    lastActive: string;
    isActive: boolean;
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

// Search User interface
export interface SearchUser {
    _id: string;
    userName: string;
    level: number;
    profile?: {
        displayName?: string;
        avatar?: string;
    };
    lastActive: string;
}

export interface zoneInfo {
    zone: string;
    count: number;
}

export interface provinceInfo {
    totalProvinces: number;
    data: zoneInfo[];
}