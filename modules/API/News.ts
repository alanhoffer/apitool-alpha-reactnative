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
