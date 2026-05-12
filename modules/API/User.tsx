import apiClient from './client';
import logger from '../../helpers/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DashboardSummary {
    id: number;
    name: string;
    surname: string;
    role: string;
    apiaryCount: number;
    hiveCount: number;
    harvestedApiaryCount: number;
    pendingTaskCount: number;
    overdueTaskCount: number;
    dueTodayTaskCount: number;
    completedTaskCount: number;
    completionRate: number;
    unreadNotificationCount: number;
    totalHoneyKg: number;
    totalSugarKg: number;
    totalLevudexKg: number;
    totalHarvestBoxes: number;
    recentHarvestBoxesToday: number;
    weakHiveCount: number;
    queenIssueHiveCount: number;
    swarmingHiveCount: number;
    staleInspectionHiveCount: number;
    attentionHiveCount: number;
}

export type StatisticsPeriod = 'day' | 'week' | 'month' | 'year';

export interface HarvestSeriesPoint {
    label: string;
    startDate: string;
    endDate: string;
    box: number;
    boxMedium: number;
    boxSmall: number;
    total: number;
}

export interface StatisticsOverview extends DashboardSummary {
    period: StatisticsPeriod;
    generatedAt: string;
    periodHarvestBoxes: number;
    apiaryStatusCounts: Record<string, number>;
    hiveStrengthCounts: Record<string, number>;
    harvestSeries: HarvestSeriesPoint[];
}

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

export const getDashboardSummary = async (): Promise<DashboardSummary | null> => {
    try {
        const response = await apiClient.get<DashboardSummary>('users/dashboard-summary');
        if (response.data) {
            try {
                await AsyncStorage.setItem('@dashboard_summary_cache', JSON.stringify(response.data));
            } catch (e) { }
        }
        return response.data;
    } catch (error: any) {
        if (!error.response) {
            try {
                const cached = await AsyncStorage.getItem('@dashboard_summary_cache');
                if (cached) {
                    logger.info('[getDashboardSummary] Obteniendo resumen desde cachÃ© offline');
                    return JSON.parse(cached);
                }
            } catch (e) { }
        }
        logger.error('Error fetching dashboard summary:', error);
        return null;
    }
};

export const getStatisticsOverview = async (period: StatisticsPeriod): Promise<StatisticsOverview | null> => {
    try {
        const response = await apiClient.get<StatisticsOverview>('users/statistics-overview', {
            params: { period },
        });
        if (response.data) {
            try {
                await AsyncStorage.setItem(`@statistics_overview_${period}`, JSON.stringify(response.data));
            } catch (e) { }
        }
        return response.data;
    } catch (error: any) {
        if (!error.response) {
            try {
                const cached = await AsyncStorage.getItem(`@statistics_overview_${period}`);
                if (cached) {
                    logger.info(`[getStatisticsOverview] Obteniendo estadisticas ${period} desde cache offline`);
                    return JSON.parse(cached);
                }
            } catch (e) { }
        }
        logger.error('Error fetching statistics overview:', error);
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
    currentPassword: string;
    newPassword: string;
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

export interface DeleteAccountData {
    currentPassword: string;
}

export const deleteMyAccount = async (data: DeleteAccountData): Promise<boolean> => {
    try {
        const response = await apiClient.delete('users/me', { data });
        return response.status === 200 || response.status === 204;
    } catch (error) {
        logger.error('Error deleting account:', error);
        return false;
    }
};

export default getProfile;
