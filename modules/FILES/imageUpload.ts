import * as FileSystem from 'expo-file-system/legacy';

import logger from '../../helpers/logger';

const OFFLINE_IMAGE_DIR = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}offline-apiary-images/`
  : null;

const sanitizeFileName = (value: string) =>
  value
    .trim()
    .replace(/[^\w.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const extensionFromMime = (mimeType?: string | null): string | null => {
  const normalized = mimeType?.toLowerCase();
  if (!normalized) return null;
  if (normalized.includes('png')) return 'png';
  if (normalized.includes('webp')) return 'webp';
  if (normalized.includes('gif')) return 'gif';
  if (normalized.includes('heic')) return 'heic';
  if (normalized.includes('jpeg') || normalized.includes('jpg')) return 'jpg';
  return null;
};

const extensionFromUri = (uri?: string | null): string | null => {
  if (!uri) return null;
  const withoutQuery = uri.split('?')[0] || '';
  const match = withoutQuery.match(/\.([a-zA-Z0-9]{2,5})$/);
  return match?.[1]?.toLowerCase() || null;
};

const mimeFromExtension = (extension: string) => {
  switch (extension.toLowerCase()) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'heic':
      return 'image/heic';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
};

const getImageExtension = (image: any): string => {
  return (
    extensionFromMime(image?.mimeType || image?.type) ||
    extensionFromUri(image?.fileName || image?.name) ||
    extensionFromUri(image?.uri) ||
    'jpg'
  );
};

const getImageFileName = (image: any, fallbackBaseName: string): string => {
  const extension = getImageExtension(image);
  const originalName = image?.fileName || image?.name;
  const safeOriginalName = typeof originalName === 'string' ? sanitizeFileName(originalName) : '';

  if (safeOriginalName && safeOriginalName.includes('.')) {
    return safeOriginalName;
  }

  const safeBaseName = sanitizeFileName(safeOriginalName || fallbackBaseName) || 'apiary-image';
  return `${safeBaseName}.${extension}`;
};

export const buildApiaryImageUpload = (image: any, fallbackBaseName: string) => {
  if (!image?.uri) {
    return null;
  }

  const name = getImageFileName(image, fallbackBaseName);
  const extension = getImageExtension({ ...image, name });

  return {
    uri: image.uri,
    name,
    type: image?.mimeType || image?.type || mimeFromExtension(extension),
  };
};

export const persistImageForOfflineQueue = async (image: any) => {
  if (!image?.uri || typeof image.uri !== 'string' || !OFFLINE_IMAGE_DIR) {
    return image;
  }

  if (image.uri.startsWith(OFFLINE_IMAGE_DIR)) {
    return image;
  }

  try {
    await FileSystem.makeDirectoryAsync(OFFLINE_IMAGE_DIR, { intermediates: true });
    const extension = getImageExtension(image);
    const destination = `${OFFLINE_IMAGE_DIR}${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}.${extension}`;

    await FileSystem.copyAsync({ from: image.uri, to: destination });

    return {
      ...image,
      uri: destination,
      fileName: getImageFileName(image, `apiary-${Date.now()}`),
      offlineUri: destination,
    };
  } catch (error) {
    logger.warn('[imageUpload] No se pudo persistir la imagen para modo offline', error);
    return image;
  }
};

export const cleanupOfflineQueuedImage = async (image: any) => {
  const uri = image?.offlineUri || image?.uri;
  if (!uri || typeof uri !== 'string' || !OFFLINE_IMAGE_DIR || !uri.startsWith(OFFLINE_IMAGE_DIR)) {
    return;
  }

  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (error) {
    logger.warn('[imageUpload] No se pudo limpiar la imagen offline sincronizada', error);
  }
};
