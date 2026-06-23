import apiClient from './client';
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';

// ─── Usuarios (admin) ──────────────────────────────────────────────────────────
export interface IAdminUser {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  apiaryCount: number;
  hiveCount: number;
}

export const ADMIN_ROLES = ['apicultor', 'apicultor_premium', 'moderador', 'admin'];

/** GET /admin/users — lista todos los usuarios (admin). */
export const getUsers = async (): Promise<IAdminUser[]> => {
  const res = await apiClient.get<IAdminUser[]>('admin/users');
  return res.data || [];
};

/** GET /admin/users/:id/apiaries — apiarios de un usuario (admin). */
export const getUserApiaries = async (userId: number): Promise<IApiary[]> => {
  const res = await apiClient.get<any>(`admin/users/${userId}/apiaries`);
  return (Array.isArray(res.data) ? res.data : (res.data?.data || [])) as IApiary[];
};

/** PUT /admin/users/:id/role — cambiar rol (admin). */
export const updateUserRole = async (userId: number, role: string): Promise<IAdminUser> => {
  const res = await apiClient.put<IAdminUser>(`admin/users/${userId}/role`, { role });
  return res.data;
};

/** DELETE /admin/users/:id — eliminar usuario y sus datos (admin). */
export const deleteUser = async (userId: number): Promise<boolean> => {
  const res = await apiClient.delete(`admin/users/${userId}`);
  return res.status >= 200 && res.status < 300;
};

// ─── Recomendaciones / Tips estacionales ──────────────────────────────────────
export interface ISeasonalTip {
  id: number;
  title: string;
  content: string;
  season?: string | null;
  months?: string | null;
  category: string;
  isActive: boolean;
}

export interface ISeasonalTipInput {
  title: string;
  content: string;
  season?: string | null;
  months?: string | null;
  category?: string;
  isActive?: boolean;
}

export interface IRecommendations {
  current_season: string;
  current_month: number;
  tips: ISeasonalTip[];
}

/** GET /recommendations — temporada actual + tips (público). */
export const getRecommendations = async (): Promise<IRecommendations | null> => {
  try {
    const res = await apiClient.get<IRecommendations>('recommendations');
    return res.data;
  } catch {
    return null;
  }
};

/** POST /recommendations — crear tip (admin). */
export const createSeasonalTip = async (input: ISeasonalTipInput): Promise<ISeasonalTip> => {
  const res = await apiClient.post<ISeasonalTip>('recommendations', {
    category: 'General',
    isActive: true,
    ...input,
  });
  return res.data;
};

// ─── Métricas globales + broadcast ─────────────────────────────────────────────
export interface IAdminStats {
  users: number;
  apiaries: number;
  hives: number;
  news: number;
  guides: number;
  tasks: number;
}

/** GET /admin/stats — métricas globales (admin). */
export const getAdminStats = async (): Promise<IAdminStats | null> => {
  try {
    const res = await apiClient.get<IAdminStats>('admin/stats');
    return res.data;
  } catch {
    return null;
  }
};

/** POST /admin/broadcast — aviso a todos los usuarios (admin). */
export const sendBroadcast = async (title: string, message: string, type: string = 'INFO'): Promise<{ recipients: number; pushed: number }> => {
  const res = await apiClient.post<{ recipients: number; pushed: number }>('admin/broadcast', { title, message, type });
  return res.data;
};

// ─── Mantenimiento / Cache ─────────────────────────────────────────────────────
/** GET /cache/stats — métricas del caché (admin). */
export const getCacheStats = async (): Promise<Record<string, any> | null> => {
  try {
    const res = await apiClient.get<Record<string, any>>('cache/stats');
    return res.data;
  } catch {
    return null;
  }
};

/** DELETE /cache — limpiar todo el caché (admin). */
export const clearCache = async (): Promise<boolean> => {
  const res = await apiClient.delete('cache');
  return res.status >= 200 && res.status < 300;
};

/** POST /cache/cleanup — purgar entradas vencidas (admin). */
export const cleanupCache = async (): Promise<boolean> => {
  const res = await apiClient.post('cache/cleanup');
  return res.status >= 200 && res.status < 300;
};
