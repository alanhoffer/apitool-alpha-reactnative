import apiClient from './client';

export const getProfile = async () => {
    try {
        const response = await apiClient.get('users');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
};

export default getProfile;
