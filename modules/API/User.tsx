import apiClient from './client';
import logger from '../../helpers/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getProfile = async () => {
    try {
        const response = await apiClient.get('users');
        if (response.data) {
            try {
                await AsyncStorage.setItem('@profile_cache', JSON.stringify(response.data));
            } catch (e) { }
        }
        return response.data;
    } catch (error: any) {
        if (!error.response) {
            try {
                const cached = await AsyncStorage.getItem('@profile_cache');
                if (cached) {
                    logger.info('[getProfile] Obteniendo perfil desde caché offline');
                    return JSON.parse(cached);
                }
            } catch (e) { }
        }
        logger.error('Error fetching profile:', error);
        return null;
    }
};

export interface UpdateProfileData {
    name?: string;
    email?: string;
}

export const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
    try {
        const response = await apiClient.put('users/profile', data);
        return response.status === 200 || response.status === 201;
    } catch (error) {
        logger.error('Error updating profile:', error);
        return false;
    }
};

export interface ChangePasswordData {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

export const changePassword = async (data: ChangePasswordData): Promise<boolean> => {
    try {
        const response = await apiClient.put('users/password', data);
        return response.status === 200 || response.status === 201;
    } catch (error) {
        logger.error('Error changing password:', error);
        return false;
    }
};

export default getProfile;
