import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../types/user";
import { instanceAxios } from "../api/axios";

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