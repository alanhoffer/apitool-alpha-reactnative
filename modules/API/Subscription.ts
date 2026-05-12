import apiClient from './client';

export interface SubscriptionInfo {
    id: number;
    userId: number;
    tier: 'aprendiz' | 'apicultor' | 'maestro';
    status: string;
    expiresAt: string | null;
    createdAt: string;
    apiaryLimit: number | null;
    aiAccess: boolean;
    aiMonthlyLimit: number | null;
}

export async function getMySubscription(): Promise<SubscriptionInfo | null> {
    try {
        const response = await apiClient.get('subscription/me');
        return response.data;
    } catch (error) {
        return null;
    }
}
