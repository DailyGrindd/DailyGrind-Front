import { instanceAxios } from "../api/axios";
import type { UserProfile, EditProfileForm } from "../types/profile";



 // Obtener el perfil del usuario autenticado por email
 
export const getMyProfile = async (email: string): Promise<UserProfile> => {
  const response = await instanceAxios.get(`/profile/${email}`);
  return response.data;
};


 // Actualizar el perfil del usuario autenticado
 
export const updateProfile = async (
  email: string,
  profileData: EditProfileForm
): Promise<UserProfile> => {
  const response = await instanceAxios.put(`/profile/${email}`, profileData);
  return response.data;
};

 //Obtener perfil público de otro usuario por ID

export const getPublicProfile = async (userId: string): Promise<UserProfile> => {
  const response = await instanceAxios.get(`/profile/public/${userId}`);
  return response.data;
};
