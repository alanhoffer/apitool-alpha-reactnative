import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { createTask, updateTask } from '../../modules/API/Tasks';
import { getApiarys } from '../../modules/API/Apiarys';
import { TaskAddScreenProps } from '../../types/navigation';
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';
import { palette, fonts, radius, shadow } from '../../constants/theme';
import { Close } from '../../components/v2/icons';

const TaskAddScreen = ({ navigation, route }: TaskAddScreenProps) => {
    const insets = useSafeAreaInsets();
    const task = route.params?.task;
    const initialApiaryId = route.params?.apiaryId;

    const [title, setTitle] = useState(task?.title || '');
    // const [description, setDescription] = useState(task?.description || ''); // Removed description
    const [apiaryId, setApiaryId] = useState<number | undefined>(task?.apiary_id || initialApiaryId);
    
    const [apiaries, setApiaries] = useState<IApiary[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingApiaries, setLoadingApiaries] = useState(true);

    useEffect(() => {
        const loadApiaries = async () => {
            const data = await getApiarys();
            if (data) {
                setApiaries(data);
            }
            setLoadingApiaries(false);
        };
        loadApiaries();
    }, []);

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'El título es obligatorio');
            return;
        }

        setLoading(true);
        let result;

        if (task) {
            // Update
            result = await updateTask(task.id, {
                title,
                // description, // Removed
                apiary_id: apiaryId
            });
        } else {
            // Create
            result = await createTask({
                title,
                // description, // Removed
                apiary_id: apiaryId,
                due_date: new Date().toISOString() // Default to today/now for simplicity or can be null
            });
        }

        setLoading(false);

        if (result) {
            navigation.goBack();
        } else {
            Alert.alert('Error', 'No se pudo guardar la tarea');
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
                    <Close size={18} color={palette.navy} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{task ? 'Editar Tarea' : 'Nueva Tarea'}</Text>
                <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.6 }]} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
                    {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Guardar</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Título</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Ej: Revisar colmena 5"
                        placeholderTextColor={colors.GREY_LIGHT}
                    />
                </View>

                {/* Description field removed */}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Apiario (Opcional)</Text>
                    {loadingApiaries ? (
                        <ActivityIndicator size="small" color={colors.YELLOW} style={{ alignSelf: 'flex-start' }} />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
                            <TouchableOpacity
                                style={[styles.chip, !apiaryId && styles.chipActive]}
                                onPress={() => setApiaryId(undefined)}
                            >
                                <Text style={[styles.chipText, !apiaryId && styles.chipTextActive]}>Ninguno</Text>
                            </TouchableOpacity>
                            {apiaries.map(apiary => (
                                <TouchableOpacity
                                    key={apiary.id}
                                    style={[styles.chip, apiaryId === apiary.id && styles.chipActive]}
                                    onPress={() => setApiaryId(apiary.id)}
                                >
                                    <Text style={[styles.chipText, apiaryId === apiary.id && styles.chipTextActive]}>
                                        {apiary.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.cream,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingBottom: 14,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: palette.white,
        borderWidth: 1,
        borderColor: palette.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: fonts.soraBold,
        color: palette.ink,
    },
    saveBtn: {
        backgroundColor: palette.navy,
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 12,
        minWidth: 92,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: fonts.soraBold,
    },
    content: {
        padding: 22,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontFamily: fonts.soraBold,
        color: palette.ink,
        marginBottom: 10,
    },
    input: {
        backgroundColor: palette.white,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 15,
        fontSize: 15,
        fontFamily: fonts.manrope,
        color: palette.ink,
        borderWidth: 1,
        borderColor: palette.border,
    },
    textArea: {
        minHeight: 100,
    },
    chipsContainer: {
        flexDirection: 'row',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: radius.pill,
        backgroundColor: palette.white,
        marginRight: 10,
        borderWidth: 1,
        borderColor: palette.border,
    },
    chipActive: {
        backgroundColor: palette.honey,
        borderColor: palette.honey,
    },
    chipText: {
        fontSize: 14,
        fontFamily: fonts.manropeSemiBold,
        color: palette.inkMuted,
    },
    chipTextActive: {
        color: palette.navy,
        fontFamily: fonts.manropeBold,
    },
});

export default TaskAddScreen;
