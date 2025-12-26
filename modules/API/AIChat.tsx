import axios from 'axios';

const AI_API_URL = 'https://api.serenitystar.ai/api/v2/agent/robertaso/execute';
const AI_API_KEY = '84b7e0de-9d49-4395-ba0e-337a4b805c07';

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
  chatId?: string
): Promise<AIChatResponse> => {
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

    const response = await axios.post(
      AI_API_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': AI_API_KEY,
        },
        timeout: 30000, // 30 segundos para respuestas de IA
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
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      }
    });
    
    // Extraer mensaje de error más específico
    let errorMessage = 'Error al comunicarse con la IA';
    
    if (error.response?.data) {
      const errorData = error.response.data;
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (Array.isArray(errorData) && errorData.length > 0) {
        const errorItem = errorData.find((item: any) => item.key === 'error' || item.key === 'message');
        if (errorItem) {
          errorMessage = errorItem.value;
        }
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

