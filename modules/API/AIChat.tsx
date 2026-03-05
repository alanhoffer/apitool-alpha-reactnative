import axios from 'axios';
import { getApiErrorMessage } from '../../helpers/apiErrors';

const AI_API_URL = 'https://api.serenitystar.ai/api/v2/agent/robertaso/execute';
const AI_TRANSCRIBE_URL = 'https://api.serenitystar.ai/api/v2/Audio/transcribe?culture=es';
const AI_API_KEY = '84b7e0de-9d49-4395-ba0e-337a4b805c07';
const AI_TRANSCRIBE_API_KEY = 'AE6EB64D-0DE4-41AC-B2D8-CB6E9D735922';

export interface TranscribeResponse {
  transcript?: string;
  instanceId?: string;
  metadata?: { language?: string; duration?: string };
  [key: string]: any;
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIChatResponse {
  response: string;
  chatId?: string;
}

/**
 * Envía un mensaje al chat de IA
 * 
 * IMPORTANTE: 
 * - El primer mensaje NO debe incluir chatId (solo message)
 * - La respuesta del primer mensaje devuelve un instanceId que se usa como chatId en mensajes siguientes
 */
export const sendAIMessage = async (
  message: string,
  chatId?: string,
  retryCount: number = 0
): Promise<AIChatResponse> => {
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 1000; // 1 segundo

  try {
    let payload: Array<{ key: string; value: string }>;
    
    if (chatId) {
      // Mensajes siguientes: incluir chatId y message
      console.log('[AIChat API] Continuando conversación con chatId:', chatId);
      payload = [
        {
          key: 'chatId',
          value: chatId,
        },
        {
          key: 'message',
          value: message,
        },
      ];
    } else {
      // Primer mensaje: solo message (sin chatId)
      console.log('[AIChat API] Iniciando nueva conversación');
      payload = [
        {
          key: 'message',
          value: message,
        },
      ];
    }

    console.log('[AIChat API] Payload:', JSON.stringify(payload, null, 2));
    console.log('[AIChat API] URL:', AI_API_URL);
    console.log('[AIChat API] Intento:', retryCount + 1, 'de', MAX_RETRIES + 1);

    const response = await axios.post(
      AI_API_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': AI_API_KEY,
          'Accept': 'application/json',
        },
        timeout: 30000, // 30 segundos para respuestas de IA
        validateStatus: (status) => status < 500, // Aceptar errores 4xx para manejarlos mejor
      }
    );

    console.log('[AIChat API] Respuesta completa:', JSON.stringify(response.data, null, 2));
    console.log('[AIChat API] Headers de respuesta:', response.headers);

    const responseData = response.data;
    
    // Extraer la respuesta y el instanceId
    let responseText = 'No se pudo obtener respuesta';
    let instanceId: string | undefined = chatId; // Mantener el chatId si ya existe
    
    // Buscar instanceId en headers primero (algunas APIs lo envían ahí)
    if (!chatId && response.headers) {
      const headerInstanceId = response.headers['x-instance-id'] || 
                                response.headers['instance-id'] ||
                                response.headers['chat-id'];
      if (headerInstanceId) {
        instanceId = headerInstanceId;
        console.log('[AIChat API] InstanceId encontrado en headers:', instanceId);
      }
    }
    
    if (Array.isArray(responseData)) {
      // Si la respuesta es un array de objetos {key, value}
      console.log('[AIChat API] Respuesta es un array, buscando items...');
      
      // Buscar todos los items para debug
      responseData.forEach((item: any, index: number) => {
        console.log(`[AIChat API] Item ${index}:`, item);
      });
      
      const messageItem = responseData.find((item: any) => 
        item.key === 'response' || 
        item.key === 'message' || 
        item.key === 'text' ||
        item.key === 'output' ||
        item.key === 'answer'
      );
      if (messageItem) {
        responseText = messageItem.value;
        console.log('[AIChat API] Mensaje encontrado en item:', messageItem.key);
      }
      
      // Buscar el instanceId en la respuesta (solo en el primer mensaje)
      if (!chatId && !instanceId) {
        const instanceItem = responseData.find((item: any) => 
          item.key === 'instanceId' || 
          item.key === 'chatId' ||
          item.key === 'id' ||
          item.key === 'instance_id' ||
          item.key === 'conversationId'
        );
        if (instanceItem) {
          instanceId = instanceItem.value;
          console.log('[AIChat API] InstanceId encontrado en array:', instanceItem.key, instanceId);
        }
      }
    } else if (typeof responseData === 'object' && responseData !== null) {
      // Si la respuesta es un objeto
      console.log('[AIChat API] Respuesta es un objeto, buscando campos...');
      console.log('[AIChat API] Keys del objeto:', Object.keys(responseData));
      
      responseText = responseData.response || 
                     responseData.message || 
                     responseData.text || 
                     responseData.output ||
                     responseData.data ||
                     responseData.answer ||
                     responseData.content ||
                     'No se pudo obtener respuesta';
      
      // Buscar instanceId en la respuesta
      if (!chatId && !instanceId) {
        instanceId = responseData.instanceId || 
                     responseData.chatId || 
                     responseData.id ||
                     responseData.instance_id ||
                     responseData.conversationId ||
                     responseData.instanceId ||
                     undefined;
        
        if (instanceId) {
          console.log('[AIChat API] InstanceId encontrado en objeto:', instanceId);
        }
      }
    } else if (typeof responseData === 'string') {
      responseText = responseData;
      console.log('[AIChat API] Respuesta es un string');
    }
    
    console.log('[AIChat API] Respuesta extraída:', { 
      responseText: responseText.substring(0, 100) + '...', 
      instanceId,
      tieneChatId: !!chatId
    });
    
    return {
      response: responseText,
      chatId: instanceId,
    };
  } catch (error: any) {
    console.error('[AIChat API] Error completo:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      code: error.code, // Código de error de axios (ECONNABORTED, ENOTFOUND, etc.)
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: error.config?.headers,
      }
    });
    
    // Extraer mensaje de error más específico
    let errorMessage = 'Error al comunicarse con la IA';
    
    // Manejar diferentes tipos de errores de red
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'La solicitud tardó demasiado. Por favor, intenta de nuevo.';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    } else if (error.message === 'Network Error') {
      errorMessage = 'Error de red. Verifica tu conexión a internet o intenta más tarde.';
    } else if (error.response?.status === 401) {
      errorMessage = 'API Key inválida o expirada.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Acceso denegado. Verifica tus permisos.';
    } else if (error.response?.status === 404) {
      errorMessage = 'El endpoint de la API no fue encontrado.';
    } else if (error.response?.status === 429) {
      errorMessage = 'Demasiadas solicitudes. Por favor, espera un momento.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
    } else if (error.response?.data || error.message) {
      errorMessage = getApiErrorMessage(error, errorMessage);
    }
    
    // Retry automático para errores de red
    if (
      (error.code === 'ERR_NETWORK' || error.message === 'Network Error') &&
      retryCount < MAX_RETRIES
    ) {
      console.log(`[AIChat API] Reintentando en ${RETRY_DELAY}ms... (intento ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1))); // Backoff exponencial
      return sendAIMessage(message, chatId, retryCount + 1);
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Transcribe un archivo de audio a texto (API Serenity Star).
 * POST /api/v2/Audio/transcribe?culture=es
 * Body: multipart/form-data con campo "File".
 * Devuelve el texto transcrito para enviar a Robertaso.
 */
export const transcribeAudio = async (audioUri: string): Promise<string> => {
  const extension = audioUri.split('.').pop()?.toLowerCase() || 'm4a';
  const mimeType = extension === 'webm' ? 'audio/webm' : extension === 'mp3' ? 'audio/mpeg' : extension === 'wav' ? 'audio/wav' : 'audio/m4a';
  const formData = new FormData();
  formData.append('File', {
    uri: audioUri,
    name: `audio.${extension}`,
    type: mimeType,
  } as any);

  const response = await fetch(AI_TRANSCRIBE_URL, {
    method: 'POST',
    headers: {
      'X-API-KEY': AI_TRANSCRIBE_API_KEY,
      'Accept': 'application/json',
    },
    body: formData,
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errMsg = 'Error al transcribir el audio';
    try {
      const data = JSON.parse(responseText);
      errMsg = data.message || data.error || errMsg;
    } catch {
      if (responseText.startsWith('<')) {
        errMsg = 'El servidor devolvió una página en lugar de JSON. Revisa la URL o la API key.';
      } else if (responseText) errMsg = responseText;
    }
    throw new Error(errMsg);
  }

  let data: TranscribeResponse;
  try {
    data = JSON.parse(responseText);
  } catch {
    if (responseText.trim().startsWith('<')) {
      throw new Error('La respuesta del servidor no es JSON válido.');
    }
    throw new Error('Respuesta de transcripción no es JSON válido.');
  }

  const transcript = data.transcript ?? '';
  return transcript.trim();
};
