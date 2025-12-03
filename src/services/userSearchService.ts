import { instanceAxios } from "../api/axios";

// buscar usuarios publicos
export const searchPublicProfile = async (query: string) => {
    const response = await instanceAxios.get(`/profile/search/public?query=${query}`);
    return response.data.users || response.data;
};

// obtener perfil publico
export const getPublicProfile = async ( userName: string)=>{
    const response = await instanceAxios.get(`/profile/public/${userName}`);
    return response.data;   
};