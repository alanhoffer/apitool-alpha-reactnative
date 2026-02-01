import apiClient from './client';
import logger from '../../helpers/logger';

export const getProfile = async () => {
    try {
        const response = await apiClient.get('users');
        return response.data;
    } catch (error) {
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

export default getProfile;
