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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { sendAIMessage, sendAIAudio, AIChatMessage } from '../../modules/API/AIChat';
import colors from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../../helpers/logger';
import { useSubscription } from '../../contexts/SubscriptionContext';

const CHAT_ID_STORAGE_KEY = 'ai_chat_id';
const CHAT_HISTORY_STORAGE_KEY = 'ai_chat_history';

const AIChatScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { canUseAI } = useSubscription();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

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
        logger.debug('[AIChatScreen] ChatId inválido detectado, limpiando...');
        await AsyncStorage.removeItem(CHAT_ID_STORAGE_KEY);
        setChatId(null);
      }

      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setMessages(history);
      }
    } catch (error) {
      logger.error('[AIChatScreen] Error cargando historial:', error);
    }
  };

  const saveChatHistory = async (newMessages: AIChatMessage[], currentChatId: string) => {
    try {
      await AsyncStorage.setItem(CHAT_ID_STORAGE_KEY, currentChatId);
      await AsyncStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(newMessages));
    } catch (error) {
      logger.error('[AIChatScreen] Error guardando historial:', error);
    }
  };

  /** Envía un mensaje de texto a Robertaso (usado por texto escrito y por transcripción de voz) */
  const sendMessageToAPI = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMessage: AIChatMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);
    try {
      let currentChatId: string | undefined = chatId ?? undefined;
      if (currentChatId && currentChatId.startsWith('chat_')) {
        currentChatId = undefined;
        setChatId(null);
      }
      const response = await sendAIMessage(text.trim(), currentChatId);
      const assistantMessage: AIChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      if (response.chatId && !response.chatId.startsWith('chat_')) {
        setChatId(response.chatId);
        await saveChatHistory(updatedMessages, response.chatId);
      } else if (response.chatId) {
        setChatId(response.chatId);
        await saveChatHistory(updatedMessages, response.chatId);
      } else {
        await saveChatHistory(updatedMessages, '');
      }
    } catch (error: any) {
      logger.error('[AIChatScreen] Error:', error);
      if (error.message?.includes('ChatId') || error.message?.includes('chat_id')) {
        setChatId(null);
        await AsyncStorage.removeItem(CHAT_ID_STORAGE_KEY);
        Alert.alert('Error', 'El chat anterior expiró. Envía el mensaje de nuevo.');
      } else {
        Alert.alert('Error', error.message || 'No se pudo enviar. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;
    const messageToSend = inputText.trim();
    setInputText('');
    await sendMessageToAPI(messageToSend);
  };

  const ensureMicPermission = async (): Promise<boolean> => {
    if (permissionResponse?.status === 'granted') return true;
    const { status } = await requestPermission();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita el micrófono para enviar audios.');
      return false;
    }
    return true;
  };

  const startAudioRecording = async () => {
    if (loading || isRecordingAudio || transcribing) return;
    const ok = await ensureMicPermission();
    if (!ok) return;
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecordingAudio(true);
    } catch (err: any) {
      logger.error('[AIChatScreen] Error al iniciar grabación:', err);
      Alert.alert('Error', 'No se pudo iniciar la grabación.');
    }
  };

  const stopAudioRecordingAndSend = async () => {
    const recording = recordingRef.current;
    if (!recording || !isRecordingAudio) return;
    try {
      await recording.stopAndUnloadAsync();
      recordingRef.current = null;
      const uri = recording.getURI();
      setIsRecordingAudio(false);
      if (!uri) {
        Alert.alert('Error', 'No se obtuvo el audio.');
        return;
      }
      setTranscribing(true);
      try {
        let currentChatId: string | undefined = chatId ?? undefined;
        if (currentChatId && currentChatId.startsWith('chat_')) {
          currentChatId = undefined;
          setChatId(null);
        }

        const aiResponse = await sendAIAudio(uri, currentChatId);
        const transcript = (aiResponse.transcript || '').trim();
        const userText = transcript.length ? transcript : 'Audio';

        const userMessage: AIChatMessage = {
          role: 'user',
          content: userText,
          timestamp: new Date(),
        };
        const assistantMessage: AIChatMessage = {
          role: 'assistant',
          content: aiResponse.response,
          timestamp: new Date(),
        };
        const updatedMessages = [...messages, userMessage, assistantMessage];
        setMessages(updatedMessages);

        if (aiResponse.chatId && !aiResponse.chatId.startsWith('chat_')) {
          setChatId(aiResponse.chatId);
          await saveChatHistory(updatedMessages, aiResponse.chatId);
        } else if (aiResponse.chatId) {
          setChatId(aiResponse.chatId);
          await saveChatHistory(updatedMessages, aiResponse.chatId);
        } else {
          await saveChatHistory(updatedMessages, '');
        }
      } catch (err: any) {
        Alert.alert('Error', err.message || 'No se pudo procesar el audio.');
      } finally {
        setTranscribing(false);
      }
} catch (err: any) {
      logger.error('[AIChatScreen] Error al procesar audio:', err);
      setIsRecordingAudio(false);
      recordingRef.current = null;
      Alert.alert('Error', 'No se pudo procesar el audio.');
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
          logger.debug('[AIChatScreen] Limpiando chatId inválido');
          await AsyncStorage.removeItem(CHAT_ID_STORAGE_KEY);
          setChatId(null);
        }
      } catch (error) {
        logger.error('[AIChatScreen] Error limpiando chatId:', error);
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

  if (!canUseAI()) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <View style={{ paddingTop: insets.top }} />
        <Ionicons name="lock-closed" size={56} color={colors.YELLOW} style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.TEXT_PRIMARY, textAlign: 'center', marginBottom: 8 }}>
          Asistente IA
        </Text>
        <Text style={{ fontSize: 15, color: colors.TEXT_SECONDARY, textAlign: 'center', marginBottom: 28 }}>
          El asistente IA está disponible desde el plan Apicultor. Actualizá tu suscripción para acceder.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: colors.YELLOW, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 }}
          onPress={() => navigation.navigate('Profile', { screen: 'SubscriptionScreen' })}
        >
          <Text style={{ color: colors.WHITE, fontWeight: '700', fontSize: 16 }}>Ver planes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 16 }} onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.TEXT_SECONDARY, fontSize: 14 }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.SLATE[900]} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIconWrapper}>
            <View style={styles.headerIconInner}>
              <Image
                source={require('../../assets/images/ia/logo.png')}
                style={styles.headerLogo}
                resizeMode="cover"
              />
            </View>
          </View>
          <View>
            <Text style={styles.headerTitle}>Robertaso</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>En línea</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleClearChat} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={20} color={colors.SLATE[400]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[styles.messagesContent, { paddingBottom: 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <View style={styles.emptyIconInner}>
                <Image
                  source={require('../../assets/images/ia/logo.png')}
                  style={styles.emptyLogo}
                  resizeMode="cover"
                />
              </View>
            </View>
            <Text style={styles.emptyTitle}>¡Hola! Soy Robertaso</Text>
            <Text style={styles.emptyText}>
              Tu experto en apicultura. Pregúntame sobre enfermedades, manejo de colmenas o cualquier duda técnica. 🐝
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
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarInner}>
                    <Image
                      source={require('../../assets/images/ia/logo.png')}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
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
            </View>
          ))
        )}
        {(loading || transcribing) && (
          <View style={[styles.messageWrapper, styles.assistantWrapper]}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarInner}>
                <Image
                  source={require('../../assets/images/ia/logo.png')}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
            </View>
            <View style={[styles.messageBubble, styles.assistantMessage, styles.typingBubble]}>
              <ActivityIndicator size="small" color={colors.SLATE[400]} />
              <Text style={styles.typingText}>{transcribing ? 'Transcribiendo...' : 'Pensando...'}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
        {isRecordingAudio ? (
          <View style={styles.recordingBar}>
            <View style={styles.recordingPulse} />
            <Text style={styles.recordingLabel}>Grabando...</Text>
            <TouchableOpacity style={styles.stopRecordButton} onPress={stopAudioRecordingAndSend}>
              <Ionicons name="stop" size={20} color={colors.WHITE} />
              <Text style={styles.stopRecordText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputWrapper}>
            <TouchableOpacity
              style={[styles.micButton, (loading || transcribing) && styles.micButtonDisabled]}
              onPress={startAudioRecording}
              disabled={loading || transcribing}
            >
              <Ionicons name="mic" size={22} color={colors.SLATE[600]} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor={colors.SLATE[400]}
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
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaf9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 2,
    marginRight: 12,
  },
  headerIconInner: {
    flex: 1,
    backgroundColor: colors.WHITE,
    borderRadius: 18,
    overflow: 'hidden',
  },
  headerLogo: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.SLATE[900],
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 4,
    marginBottom: 24,
  },
  emptyIconInner: {
    flex: 1,
    backgroundColor: colors.WHITE,
    borderRadius: 56,
    overflow: 'hidden',
  },
  emptyLogo: {
    width: '100%',
    height: '100%',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.SLATE[900],
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: colors.SLATE[600],
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
    maxWidth: '85%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  assistantWrapper: {
    alignSelf: 'flex-start',
  },
  avatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 2,
    marginRight: 10,
    alignSelf: 'flex-end',
  },
  avatarInner: {
    flex: 1,
    backgroundColor: colors.WHITE,
    borderRadius: 14,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessage: {
    backgroundColor: colors.SLATE[900],
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: colors.WHITE,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.WHITE,
  },
  assistantMessageText: {
    color: colors.SLATE[800],
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  assistantMessageTime: {
    color: colors.SLATE[400],
  },
  typingText: {
    fontSize: 13,
    color: colors.SLATE[400],
    marginLeft: 8,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.SLATE[900],
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.HONEY[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.HONEY[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sendButtonDisabled: {
    backgroundColor: colors.SLATE[200],
    shadowOpacity: 0,
  },
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.SLATE[900],
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  recordingPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 10,
  },
  recordingLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.WHITE,
    fontWeight: '500',
  },
  stopRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.HONEY[600],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  stopRecordText: {
    color: colors.WHITE,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default AIChatScreen;

