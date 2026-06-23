import apiClient from './client';
import logger from '../../helpers/logger';
import { APICULTURE_GUIDES, GuideItem } from '../../constants/guides';

// Forma del backend (tabla guide)
interface BackendGuide {
  id: number;
  title: string;
  description?: string | null;
  content: string;
  category?: string | null;
  readTime?: string | null;
  icon?: string | null;
  color?: string | null;
  featured?: boolean;
}

export interface IGuideInput {
  title: string;
  content: string;
  description?: string | null;
  category?: string | null;
  readTime?: string | null;
  icon?: string | null;
  color?: string | null;
  featured?: boolean;
}

const toGuideItem = (g: BackendGuide): GuideItem => ({
  id: String(g.id),
  title: g.title,
  description: g.description || '',
  category: g.category || 'General',
  readTime: g.readTime || '',
  icon: g.icon || 'book-outline',
  color: g.color || '#C8881A',
  markdown: g.content,
  featured: !!g.featured,
});

/** GET /guides — guías del backend; si está vacío/falla, usa las hardcodeadas. */
export const getGuides = async (): Promise<GuideItem[]> => {
  try {
    const res = await apiClient.get<any>('guides');
    const data = (Array.isArray(res.data) ? res.data : (res.data?.data || [])) as BackendGuide[];
    if (data && data.length > 0) return data.map(toGuideItem);
    return APICULTURE_GUIDES;
  } catch (error) {
    logger.warn('[getGuides] usando guías locales:', error);
    return APICULTURE_GUIDES;
  }
};

/** GET /guides sin fallback — para el panel admin (lista real del backend). */
export const getGuidesAdmin = async (): Promise<GuideItem[]> => {
  const res = await apiClient.get<any>('guides');
  const data = (Array.isArray(res.data) ? res.data : (res.data?.data || [])) as BackendGuide[];
  return (data || []).map(toGuideItem);
};

export const createGuide = async (input: IGuideInput): Promise<GuideItem> => {
  const res = await apiClient.post<BackendGuide>('guides', input);
  return toGuideItem(res.data);
};

export const updateGuide = async (id: string | number, input: IGuideInput): Promise<GuideItem> => {
  const res = await apiClient.put<BackendGuide>(`guides/${id}`, input);
  return toGuideItem(res.data);
};

export const deleteGuide = async (id: string | number): Promise<boolean> => {
  const res = await apiClient.delete(`guides/${id}`);
  return res.status >= 200 && res.status < 300;
};
