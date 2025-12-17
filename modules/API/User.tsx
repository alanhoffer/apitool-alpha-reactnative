import axios from 'axios';
import { getToken as getSecureToken } from '../../helpers/storage';
import { BASE_URL } from '../../constants/api';


const getToken = async () => {
    const token = await getSecureToken();
    if (!token) throw new Error('No token found');
    return token;
};

export const getProfile = async () => {
    try {
        const token = await getToken();
        const response = await axios.get(`${BASE_URL}users`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
};




export default getProfile;
