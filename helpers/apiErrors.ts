export const getApiErrorMessage = (error: any, fallback: string = 'Error inesperado'): string => {
  const data = error?.response?.data;

  if (typeof data?.detail === 'string' && data.detail.trim()) {
    return data.detail;
  }

  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    const firstError = data.detail[0];
    if (typeof firstError === 'string') {
      return firstError;
    }
    if (firstError?.msg) {
      return firstError.msg;
    }
  }

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (typeof data?.error === 'string' && data.error.trim()) {
    return data.error;
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
