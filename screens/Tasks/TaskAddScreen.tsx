import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { createTask, updateTask } from '../../modules/API/Tasks';
import { getApiarys } from '../../modules/API/Apiarys';
import { TaskAddScreenProps } from '../../types/navigation';
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';

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
            <View style={[styles.header, { marginTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={colors.BLACK} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{task ? 'Editar Tarea' : 'Nueva Tarea'}</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.YELLOW} />
                    ) : (
                        <Text style={styles.saveText}>Guardar</Text>
                    )}
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
        backgroundColor: colors.WHITE,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.BLACK,
    },
    saveText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.YELLOW,
    },
    content: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 25,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.BLACK_LIGHT,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9F9F9',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        color: colors.BLACK,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    textArea: {
        minHeight: 100,
    },
    chipsContainer: {
        flexDirection: 'row',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    chipActive: {
        backgroundColor: colors.YELLOW,
        borderColor: colors.YELLOW,
    },
    chipText: {
        fontSize: 14,
        color: colors.GREY,
    },
    chipTextActive: {
        color: colors.BLACK,
        fontWeight: '600',
    },
});

export default TaskAddScreen;
