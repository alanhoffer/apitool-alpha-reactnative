import { getApiErrorMessage } from '../../helpers/apiErrors';
import apiClient from './client';

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIChatResponse {
  response: string;
  chatId?: string;
}

export interface AIAudioResponse {
  response: string;
  chatId?: string;
  transcript?: string;
}

/**
 * Envia un mensaje de texto al chat de IA del backend.
 */
export const sendAIMessage = async (
  message: string,
  chatId?: string
): Promise<AIChatResponse> => {
  try {
    const response = await apiClient.post('api/ai/chat', {
      message,
      chatId,
    });

    return {
      response: response.data?.text ?? 'No se pudo obtener respuesta',
      chatId: response.data?.chatId,
    };
  } catch (error: any) {
    let errorMessage = 'Error al comunicarse con la IA';

    if (error.response?.status === 401) {
      errorMessage = 'Sesion expirada o no autorizada.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Acceso denegado. Verifica tus permisos.';
    } else if (error.response?.status === 404) {
      errorMessage = 'El endpoint de la API no fue encontrado.';
    } else if (error.response?.status === 429) {
      errorMessage = 'Demasiadas solicitudes. Por favor, espera un momento.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Error del servidor. Por favor, intenta mas tarde.';
    } else if (error.response?.data || error.message) {
      errorMessage = getApiErrorMessage(error, errorMessage);
    }

    throw new Error(errorMessage);
  }
};

/**
 * Envia audio al backend y recibe respuesta de la IA.
 */
export const sendAIAudio = async (
  audioUri: string,
  chatId?: string
): Promise<AIAudioResponse> => {
  const extension = audioUri.split('.').pop()?.toLowerCase() || 'm4a';
  const mimeType =
    extension === 'webm'
      ? 'audio/webm'
      : extension === 'mp3'
      ? 'audio/mpeg'
      : extension === 'wav'
      ? 'audio/wav'
      : extension === '3gp'
      ? 'audio/3gpp'
      : 'audio/m4a';

  const formData = new FormData();
  formData.append('audio', {
    uri: audioUri,
    name: `audio.${extension}`,
    type: mimeType,
  } as any);
  if (chatId) {
    formData.append('chatId', chatId);
  }

  try {
    const response = await apiClient.post('api/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    return {
      response: response.data?.text ?? 'No se pudo obtener respuesta',
      chatId: response.data?.chatId,
      transcript: response.data?.transcript,
    };
  } catch (error: any) {
    let errorMessage = 'Error al enviar el audio';
    if (error.response?.status === 413) {
      errorMessage = 'El audio es demasiado grande.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Sesion expirada o no autorizada.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Error del servidor. Por favor, intenta mas tarde.';
    } else if (error.response?.data || error.message) {
      errorMessage = getApiErrorMessage(error, errorMessage);
    }
    throw new Error(errorMessage);
  }
};
