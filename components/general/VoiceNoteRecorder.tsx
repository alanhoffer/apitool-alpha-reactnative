import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import logger from '../../helpers/logger';
import { Audio } from 'expo-av'; // Used for permissions

interface VoiceNoteRecorderProps {
    onTranscription: (text: string) => void;
    placeholder?: string;
}

export const VoiceNoteRecorder = ({ onTranscription, placeholder = "Grabar nota" }: VoiceNoteRecorderProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [permissionResponse, requestPermission] = Audio.usePermissions();

    useEffect(() => {
        // Setting up listeners
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;

        return () => {
            // Destroy listeners on unmount
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    const onSpeechStart = (e: any) => {
        console.log('Voice - onSpeechStart: ', e);
        setIsRecording(true);
    };

    const onSpeechEnd = (e: any) => {
        console.log('Voice - onSpeechEnd: ', e);
        setIsRecording(false);
    };

    const onSpeechError = (e: SpeechErrorEvent) => {
        console.log('Voice - onSpeechError: ', e);
        setIsRecording(false);
        if (e.error?.message) {
             // Optional: Handle no speech detected specifically to avoid annoying alerts
             if (e.error.message.includes('7') || e.error.message.includes('No match')) {
                 // No match found
             } else {
                 Alert.alert('Error de voz', e.error.message);
             }
        }
    };

    const onSpeechResults = (e: SpeechResultsEvent) => {
        console.log('Voice - onSpeechResults: ', e);
        if (e.value && e.value[0]) {
            onTranscription(e.value[0]);
        }
    };

    async function startRecording() {
        try {
            if (permissionResponse?.status !== 'granted') {
                console.log('Requesting permission..');
                const permission = await requestPermission();
                if (permission.status !== 'granted') {
                    Alert.alert('Permiso denegado', 'Se necesita acceso al micrófono para grabar notas de voz.');
                    return;
                }
            }

            // Start voice recognition
            await Voice.start('es-ES');
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    async function stopRecording() {
        try {
            await Voice.stop();
        } catch (err) {
            console.error('Failed to stop recording', err);
        }
    }

    const handlePress = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.recordButton,
                    isRecording && styles.recordingButton
                ]}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                {isRecording ? (
                    <Ionicons 
                        name="mic" 
                        size={24} 
                        color={colors.WHITE} 
                    />
                ) : (
                    <Ionicons 
                        name="mic-outline" 
                        size={24} 
                        color={colors.GREY} 
                    />
                )}
            </TouchableOpacity>
            {isRecording && <Text style={styles.recordingText}>Escuchando...</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    recordingButton: {
        backgroundColor: colors.RED,
        borderColor: colors.RED,
        transform: [{ scale: 1.1 }],
    },
    recordingText: {
        position: 'absolute',
        bottom: -20,
        fontSize: 10,
        color: colors.RED,
        fontWeight: 'bold',
    }
});
