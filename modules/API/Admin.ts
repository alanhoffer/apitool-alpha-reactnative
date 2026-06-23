import apiClient from './client';

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
