import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { sendAIMessage, AIChatMessage } from '../../modules/API/AIChat';
import colors from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAT_ID_STORAGE_KEY = 'ai_chat_id';
const CHAT_HISTORY_STORAGE_KEY = 'ai_chat_history';

const AIChatScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    // Scroll al final cuando hay nuevos mensajes
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const savedChatId = await AsyncStorage.getItem(CHAT_ID_STORAGE_KEY);
      const savedHistory = await AsyncStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      
      // Solo cargar chatId si parece ser un instanceId válido de la API
      // Los instanceIds de la API suelen tener un formato específico
      if (savedChatId && !savedChatId.startsWith('chat_')) {
        setChatId(savedChatId);
      } else if (savedChatId && savedChatId.startsWith('chat_')) {
        // Si es un chatId generado por nosotros, limpiarlo
        console.log('[AIChatScreen] ChatId inválido detectado, limpiando...');
        await AsyncStorage.removeItem(CHAT_ID_STORAGE_KEY);
        setChatId(null);
      }
      
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setMessages(history);
      }
    } catch (error) {
      console.error('[AIChatScreen] Error cargando historial:', error);
    }
  };

  const saveChatHistory = async (newMessages: AIChatMessage[], currentChatId: string) => {
    try {
      await AsyncStorage.setItem(CHAT_ID_STORAGE_KEY, currentChatId);
      await AsyncStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(newMessages));
    } catch (error) {
      console.error('[AIChatScreen] Error guardando historial:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: AIChatMessage = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const messageToSend = inputText.trim();
    setInputText('');
    setLoading(true);

    try {
      // Usar el chatId solo si existe y NO fue generado por nosotros
      // Si el chatId empieza con "chat_", significa que lo generamos nosotros y no es válido
      let currentChatId = chatId;
      if (currentChatId && currentChatId.startsWith('chat_')) {
        console.log('[AIChatScreen] ChatId inválido detectado, iniciando nueva conversación');
        currentChatId = undefined; // Forzar nuevo inicio
        setChatId(null);
      }

      console.log('[AIChatScreen] Enviando mensaje. Tiene chatId válido:', !!currentChatId);
      const response = await sendAIMessage(messageToSend, currentChatId);
      
      const assistantMessage: AIChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      
      // Guardar el chatId SOLO si viene de la API (no empieza con "chat_")
      if (response.chatId && !response.chatId.startsWith('chat_')) {
        console.log('[AIChatScreen] Guardando chatId válido de la API:', response.chatId);
        setChatId(response.chatId);
        await saveChatHistory(updatedMessages, response.chatId);
      } else if (response.chatId) {
        // Si la API devolvió un chatId, usarlo aunque no lo guardemos
        setChatId(response.chatId);
        await saveChatHistory(updatedMessages, response.chatId);
      } else {
        // Si no hay chatId en la respuesta, guardar sin chatId
        await saveChatHistory(updatedMessages, '');
      }
    } catch (error: any) {
      console.error('[AIChatScreen] Error completo:', error);
      
      // Si el error es de chatId inválido, limpiar y reintentar
      if (error.message?.includes('ChatId') || error.message?.includes('chat_id')) {
        console.log('[AIChatScreen] Error de chatId inválido, limpiando y reintentando...');
        setChatId(null);
        await AsyncStorage.removeItem(CHAT_ID_STORAGE_KEY);
        
        Alert.alert(
          'Error',
          'El chat anterior expiró. Por favor, envía el mensaje de nuevo para iniciar una nueva conversación.'
        );
      } else {
        Alert.alert(
          'Error',
          error.message || 'No se pudo enviar el mensaje. Por favor, intenta de nuevo.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Limpiar Chat',
      '¿Estás seguro de que quieres limpiar el historial de conversación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            setMessages([]);
            setChatId(null);
            await AsyncStorage.removeItem(CHAT_ID_STORAGE_KEY);
            await AsyncStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
          },
        },
      ]
    );
  };

  // Limpiar chatId inválido al cargar
  useEffect(() => {
    const cleanupInvalidChatId = async () => {
      try {
        const savedChatId = await AsyncStorage.getItem(CHAT_ID_STORAGE_KEY);
        // Si el chatId empieza con "chat_", fue generado por nosotros y no es válido
        if (savedChatId && savedChatId.startsWith('chat_')) {
          console.log('[AIChatScreen] Limpiando chatId inválido:', savedChatId);
          await AsyncStorage.removeItem(CHAT_ID_STORAGE_KEY);
          setChatId(null);
        }
      } catch (error) {
        console.error('[AIChatScreen] Error limpiando chatId:', error);
      }
    };
    cleanupInvalidChatId();
  }, []);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.BLACK} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="sparkles" size={20} color={colors.WHITE} />
          </View>
          <Text style={styles.headerTitle}>Asistente IA</Text>
        </View>
        <TouchableOpacity onPress={handleClearChat} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={22} color={colors.BLACK} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[styles.messagesContent, { paddingBottom: Math.max(insets.bottom, 20) }]}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="chatbubbles" size={80} color={colors.YELLOW} />
            </View>
            <Text style={styles.emptyTitle}>¡Hola! 👋</Text>
            <Text style={styles.emptyText}>
              Soy tu asistente de IA especializado en apicultura
            </Text>
            <Text style={styles.emptySubtext}>
              Puedo ayudarte con preguntas sobre tus apiarios, colmenas, tratamientos y más. ¿En qué puedo ayudarte?
            </Text>
          </View>
        ) : (
          messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageWrapper,
                message.role === 'user' ? styles.userWrapper : styles.assistantWrapper,
              ]}
            >
              {message.role === 'assistant' && (
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Ionicons name="sparkles" size={16} color={colors.WHITE} />
                  </View>
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userMessage : styles.assistantMessage,
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
                ]}>
                  {message.content}
                </Text>
                <Text style={[
                  styles.messageTime,
                  message.role === 'user' ? styles.userMessageTime : styles.assistantMessageTime
                ]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
              {message.role === 'user' && (
                <View style={styles.userAvatarContainer}>
                  <View style={styles.userAvatar}>
                    <Ionicons name="person" size={16} color={colors.WHITE} />
                  </View>
                </View>
              )}
            </View>
          ))
        )}
        {loading && (
          <View style={[styles.messageWrapper, styles.assistantWrapper]}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="sparkles" size={16} color={colors.WHITE} />
              </View>
            </View>
            <View style={[styles.messageBubble, styles.assistantMessage, styles.typingBubble]}>
              <ActivityIndicator size="small" color={colors.BLACK_TRANSPARENT} />
              <Text style={styles.typingText}>Escribiendo...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor={colors.BLACK_TRANSPARENT}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.WHITE} />
            ) : (
              <Ionicons name="send" size={18} color={colors.WHITE} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE_DARK,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.GREY_LIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.YELLOW,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.BLACK,
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: colors.WHITE_DARK,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.YELLOW + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.BLACK,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.BLACK,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: colors.BLACK_TRANSPARENT,
    textAlign: 'center',
    lineHeight: 22,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  assistantWrapper: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.YELLOW,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarContainer: {
    marginLeft: 8,
    marginBottom: 4,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.BLACK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  userMessage: {
    backgroundColor: colors.BLACK,
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: colors.WHITE,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.GREY_LIGHT,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.WHITE,
    fontWeight: '500',
  },
  assistantMessageText: {
    color: colors.BLACK,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: colors.WHITE + 'CC',
  },
  assistantMessageTime: {
    color: colors.BLACK_TRANSPARENT,
  },
  typingText: {
    fontSize: 14,
    color: colors.BLACK_TRANSPARENT,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: colors.GREY_LIGHT,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.WHITE_DARK,
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.GREY_LIGHT,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.BLACK,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.YELLOW,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    shadowColor: colors.YELLOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    opacity: 0.4,
    backgroundColor: colors.GREY_LIGHT,
  },
});

export default AIChatScreen;

