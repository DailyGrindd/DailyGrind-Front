import { instanceAxios } from "../api/axios";
import type {
    GlobalRankingResponse,
    MyGlobalPositionResponse,
    ZoneRankingResponse,
    MyZonePositionResponse
} from "../types/ranking";

export const getGlobalRanking = async (page: number = 1, limit: number = 20): Promise<GlobalRankingResponse> => {
    try {
        const { data } = await instanceAxios.get<GlobalRankingResponse>('/ranking/global', {
            params: { page, limit }
        });
        return data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.error || "Error al obtener el ranking global"
        );
    }
};

export const getMyGlobalPosition = async (email: string): Promise<MyGlobalPositionResponse> => {
    try {
        const { data } = await instanceAxios.get<MyGlobalPositionResponse>(`/ranking/global/${email}`);
        return data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.error || "Error al obtener tu posición global"
        );
    }
};

export const getZoneRanking = async (zone: string, page: number = 1, limit: number = 50): Promise<ZoneRankingResponse> => {
    try {
        const { data } = await instanceAxios.get<ZoneRankingResponse>(`/ranking/zone/${zone}`, {
            params: { page, limit }
        });
        return data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.error || "Error al obtener el ranking de zona"
        );
    }
};

export const getMyZonePosition = async (zone: string, email: string): Promise<MyZonePositionResponse> => {
    try {
        const { data } = await instanceAxios.get<MyZonePositionResponse>(`/ranking/zone/${zone}/${email}`);
        return data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.error || "Error al obtener tu posición en la zona"
        );
    }
};