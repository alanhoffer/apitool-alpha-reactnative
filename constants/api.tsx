import Constants from 'expo-constants';

type ExtraConfig = {
  apiBaseUrl?: string;
  apiaryImageBaseUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

const normalizeBaseUrl = (url: string) => (url.endsWith('/') ? url : `${url}/`);

const DEFAULT_BASE_URL = 'http://192.99.145.170:7757/';

const BASE_URL = normalizeBaseUrl(extra.apiBaseUrl || DEFAULT_BASE_URL);
const APIARY_IMG_URL = extra.apiaryImageBaseUrl
  ? normalizeBaseUrl(extra.apiaryImageBaseUrl)
  : `${BASE_URL}apiarys/profile/image/`;

const isPublicUrl = (value?: string | null) => Boolean(value && /^https?:\/\//i.test(value));

const resolveApiaryImageUrl = (image?: string | null, imageUrl?: string | null) => {
  if (isPublicUrl(imageUrl)) {
    return imageUrl;
  }

  if (isPublicUrl(image)) {
    return image;
  }

  if (!image) {
    return null;
  }

  return `${APIARY_IMG_URL}${image}`;
};

export { BASE_URL, APIARY_IMG_URL, resolveApiaryImageUrl };
