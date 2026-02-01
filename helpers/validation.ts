/**
 * Utilidades de validación para formularios
 */

/**
 * Valida un email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida coordenadas geográficas
 */
export const isValidCoordinate = (lat: number, lon: number): boolean => {
  if (lat === undefined || lat === null || lon === undefined || lon === null) {
    return false;
  }
  if (isNaN(lat) || isNaN(lon)) {
    return false;
  }
  if (lat === 0 && lon === 0) {
    return false;
  }
  // Latitud debe estar entre -90 y 90
  if (lat < -90 || lat > 90) {
    return false;
  }
  // Longitud debe estar entre -180 y 180
  if (lon < -180 || lon > 180) {
    return false;
  }
  return true;
};

/**
 * Valida que un string no esté vacío
 */
export const isNotEmpty = (value: string | null | undefined): boolean => {
  return value !== null && value !== undefined && value.trim().length > 0;
};

/**
 * Valida longitud de string
 */
export const isValidLength = (value: string, min: number, max: number): boolean => {
  return value.length >= min && value.length <= max;
};

/**
 * Valida que un número esté en un rango
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Valida que un número sea positivo
 */
export const isPositive = (value: number): boolean => {
  return value >= 0;
};

/**
 * Valida formato de código de barras (XX-XXXXXXXX-X)
 */
export const isValidBarcode = (barcode: string): boolean => {
  const barcodeRegex = /^\d{2}-\d{8}-\d{1}$/;
  return barcodeRegex.test(barcode);
};

/**
 * Sanitiza un string para prevenir XSS
 */
export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Eliminar < y >
    .trim();
};

