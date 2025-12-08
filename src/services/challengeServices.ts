import { instanceAxios } from "../api/axios";
import type { CategoryStatsResponse, Challenge, CreateChallengeAdminRequest, CreateChallengeRequest, UpdateChallengeRequest, UpdateChallengeAdminRequest } from "../types/challenge";

// Obtener todos los desafíos con filtros opcionales
export const getAllChallenges = async (filters?: {
    type?: "global" | "personal";
    category?: string;
    difficulty?: number;
    isActive?: boolean;
}): Promise<Challenge[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.difficulty) params.append("difficulty", filters.difficulty.toString());
    if (filters?.isActive !== undefined) params.append("isActive", filters.isActive.toString());

    const response = await instanceAxios.get(`/challenges?${params.toString()}`);
    return response.data;
};

// Obtener desafío por ID
export const getChallengeById = async (id: string): Promise<Challenge> => {
    const response = await instanceAxios.get(`/challenges/${id}`);
    return response.data;
};

// Crear nuevo desafío personal
export const createChallenge = async (data: CreateChallengeRequest): Promise<{ message: string; challenge: Challenge }> => {
    const response = await instanceAxios.post("/challenges", data);
    return response.data;
};

// Actualizar desafío
export const updateChallenge = async (id: string, data: UpdateChallengeRequest): Promise<{ message: string; challenge: Challenge }> => {
    const response = await instanceAxios.put(`/challenges/${id}`, data);
    return response.data;
};

// Crear nuevo desafío global
export const createChallengeAdmin = async (data: CreateChallengeAdminRequest): Promise<{ message: string; challenge: Challenge }> => {
    const response = await instanceAxios.post("/challenges", data);
    return response.data;
};

// Actualizar desafío
export const updateChallengeAdmin = async (id: string, data: UpdateChallengeAdminRequest): Promise<{ message: string; challenge: Challenge }> => {
    const response = await instanceAxios.put(`/challenges/${id}`, data);
    return response.data;
};

// Desactivar desafío (solo owner o admin)
export const deleteChallenge = async (id: string): Promise<{ message: string; challenge: Challenge }> => {
    const response = await instanceAxios.delete(`/challenges/${id}`);
    return response.data;
};

// Reactivar desafío (solo owner o admin)
export const reactivateChallenge = async (id: string): Promise<{ message: string; challenge: Challenge }> => {
    const response = await instanceAxios.patch(`/challenges/${id}/reactivate`);
    return response.data;
};

// Obtener desafíos por categoría
export const getChallengesByCategory = async (category: string): Promise<Challenge[]> => {
    const response = await instanceAxios.get(`/challenges/category/${category}`);
    return response.data;
};

// Obtener desafíos random
export const getRandomChallenges = async (count: number = 3, type?: string, userLevel?: number): Promise<Challenge[]> => {
    const params = new URLSearchParams();
    params.append("count", count.toString());
    if (type) params.append("type", type);
    if (userLevel) params.append("userLevel", userLevel.toString());

    const response = await instanceAxios.get(`/challenges/random?${params.toString()}`);
    return response.data;
};

// Incrementar contador de asignaciones
export const incrementAssigned = async (id: string): Promise<{ message: string; challenge: Challenge }> => {
    const response = await instanceAxios.patch(`/challenges/${id}/assign`);
    return response.data;
};

// Marcar desafío como completado
export const completeChallenge = async (id: string): Promise<{ message: string; challenge: Challenge }> => {
    const response = await instanceAxios.patch(`/challenges/${id}/complete`);
    return response.data;
};

// Obtener estadísticas de desafíos
export const getChallengeStats = async (): Promise<any> => {
    const response = await instanceAxios.get("/challenges/stats");
    return response.data;
};

// Obtener estadísticas por categoría
export const getCategoryStats = async (): Promise<CategoryStatsResponse> => {
    try {
        const { data } = await instanceAxios.get<CategoryStatsResponse>(`/challenges/stats-admin`);
        return data;
    } catch (error: any) {
        console.error("Service error:", error.response || error); // Debug
        throw new Error(
            error.response?.data?.message || 
            error.response?.data?.error ||
            "Error al obtener las estadísticas por categoría"
        );
    }
};
