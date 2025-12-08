import { instanceAxios } from "../api/axios";
import type {
    DailyQuest,
    AssignPersonalChallengeRequest,
    HistoryResponse,
    CompleteMissionResponse,
    StatsPerDay,
    MissionsTypeStats
} from "../types/dailyQuest";

// Inicializar DailyQuest del día (genera 3 misiones globales)
export const initializeDailyQuest = async (): Promise<{ message?: string; dailyQuest: DailyQuest }> => {
    const response = await instanceAxios.get("/daily-quests/initialize");
    return response.data;
};

// Obtener DailyQuest del día actual
export const getMyDailyQuest = async (): Promise<DailyQuest> => {
    const response = await instanceAxios.get("/daily-quests/my-daily");
    return response.data;
};

// Obtener historial (últimos 30 días por defecto)
export const getMyHistory = async (days: number = 30): Promise<HistoryResponse> => {
    const response = await instanceAxios.get(`/daily-quests/history?days=${days}`);
    return response.data;
};

// Asignar desafío personal (slots 4 y 5)
export const assignPersonalChallenge = async (
    data: AssignPersonalChallengeRequest
): Promise<{ message: string; dailyQuest: DailyQuest; assignedMission: any }> => {
    const response = await instanceAxios.post("/daily-quests/assign-personal", data);
    return response.data;
};

// Desasignar desafío personal (slots 4 y 5)
export const unassignPersonalChallenge = async (
    slot: number
): Promise<{ message: string; dailyQuest: DailyQuest }> => {
    const response = await instanceAxios.delete(`/daily-quests/unassign-personal/${slot}`);
    return response.data;
};

// Reroll de una misión global (slots 1, 2, 3)
export const rerollGlobalMission = async (
    slot: number
): Promise<{ message: string; dailyQuest: DailyQuest; rerollsRemaining: number; newMission: any }> => {
    const response = await instanceAxios.patch(`/daily-quests/reroll/${slot}`);
    return response.data;
};

// Completar una misión
export const completeMission = async (slot: number): Promise<CompleteMissionResponse> => {
    const response = await instanceAxios.patch(`/daily-quests/complete/${slot}`);
    return response.data;
};

// Skipear una misión
export const skipMission = async (slot: number): Promise<{ message: string; dailyQuest: DailyQuest }> => {
    const response = await instanceAxios.patch(`/daily-quests/skip/${slot}`);
    return response.data;
};

// Obtener estadisiticas diarias de misiones
export const getDailyStats = async (): Promise<StatsPerDay> => {
    try {
        const { data } = await instanceAxios.get<StatsPerDay>(`/daily-quests/mission-state`);
        return data;
    } catch (error: any) {
        console.error("Service error:", error.response || error); // Debug
        throw new Error(
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Error al obtener las estadísticas diarias de misiones"
        );
    }
}

// Obtener estadisticas de cada tipo de mision
export const getMissionsTypeStats = async (): Promise<MissionsTypeStats> => {
    try {
        const { data } = await instanceAxios.get<MissionsTypeStats>(`/daily-quests/mission-typestats`);
        return data;
    } catch (error: any) {
        console.error("Service error:", error.response || error); // Debug
        throw new Error(
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Error al obtener las estadísticas de misiones"
        );
    }
}
