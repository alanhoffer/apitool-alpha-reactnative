import apiClient from './client';
import logger from '../../helpers/logger';

export interface INews {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  source?: string | null;
  date: string;
  image?: string | null;
}

// Noticia por defecto: se muestra mientras el backend no tenga noticias propias.
// Cuando el backend devuelve noticias reales, estas reemplazan a la default.
const DEFAULT_NEWS: INews[] = [
  {
    id: -1,
    title: 'Cómo proteger tus colmenas del ácaro Varroa este otoño',
    content: 'Monitoreá la carga de Varroa y aplicá tratamientos a tiempo antes de la invernada para mantener colonias fuertes.',
    category: 'Sanidad',
    source: 'Apitool',
    date: new Date().toISOString(),
    image: null,
  },
];

export interface INewsInput {
  title: string;
  content: string;
  category?: string | null;
  source?: string | null;
  image?: string | null;
}

/** GET /news — lista de noticias (ordenadas por fecha desc desde el backend). */
export const getNews = async (): Promise<INews[]> => {
  try {
    const response = await apiClient.get<any>('news');
    const data = Array.isArray(response.data)
      ? response.data
      : (response.data?.data || response.data?.news || response.data?.items || []);
    const list = data as INews[];
    return list && list.length > 0 ? list : DEFAULT_NEWS;
  } catch (error) {
    logger.warn('[getNews] No se pudieron cargar las noticias:', error);
    return DEFAULT_NEWS;
  }
};

/** GET /news sin fallback — para el panel de administración (lista real, puede ser vacía). */
export const getAllNewsAdmin = async (): Promise<INews[]> => {
  const response = await apiClient.get<any>('news');
  const data = Array.isArray(response.data)
    ? response.data
    : (response.data?.data || response.data?.news || response.data?.items || []);
  return (data || []) as INews[];
};

/** POST /news — crear (requiere rol admin). */
export const createNews = async (input: INewsInput): Promise<INews> => {
  const response = await apiClient.post<INews>('news', input);
  return response.data;
};

/** PUT /news/:id — actualizar (requiere rol admin). */
export const updateNews = async (id: number, input: INewsInput): Promise<INews> => {
  const response = await apiClient.put<INews>(`news/${id}`, input);
  return response.data;
};

/** DELETE /news/:id — eliminar (requiere rol admin). */
export const deleteNews = async (id: number): Promise<boolean> => {
  const response = await apiClient.delete(`news/${id}`);
  return response.status >= 200 && response.status < 300;
};
