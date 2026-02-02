import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { getTasks, updateTask, deleteTask } from '../../modules/API/Tasks';
import { ITask } from '../../constants/interfaces/Task/ITask';
import { TasksScreenProps } from '../../types/navigation';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

const TasksScreen = ({ navigation }: TasksScreenProps) => {
    const insets = useSafeAreaInsets();
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'pending' | 'completed'>('pending');

    const [category, setCategory] = useState<'general' | 'apiary'>('general');

    const fetchTasks = async () => {
        try {
            let fetchedTasks = await getTasks() || [];

            if (fetchedTasks) {
                // Sort by due date (ascending) and then created_at (descending)
                fetchedTasks.sort((a, b) => {
                    if (a.completed !== b.completed) return a.completed ? 1 : -1;
                    if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });
                setTasks(fetchedTasks);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchTasks();
    };

    const handleToggleComplete = async (task: ITask) => {
        // Optimistic update
        const updatedTasks = tasks.map(t => 
            t.id === task.id ? { ...t, completed: !t.completed } : t
        );
        setTasks(updatedTasks);

        const result = await updateTask(task.id, { completed: !task.completed });
        if (!result) {
            // Revert if failed
            Alert.alert('Error', 'No se pudo actualizar la tarea');
            fetchTasks();
        }
    };

    const handleDeleteTask = (task: ITask) => {
        Alert.alert(
            'Eliminar Tarea',
            '¿Estás seguro de que quieres eliminar esta tarea?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteTask(task.id);
                        if (success) {
                            setTasks(tasks.filter(t => t.id !== task.id));
                        } else {
                            Alert.alert('Error', 'No se pudo eliminar la tarea');
                        }
                    }
                }
            ]
        );
    };

    const filteredTasks = tasks.filter(task => {
        // Filter by category
        if (category === 'general' && task.apiary_id) return false;
        if (category === 'apiary' && !task.apiary_id) return false;

        // Filter by status
        if (filter === 'pending') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
    });

    const renderItem = ({ item }: { item: ITask }) => (
        <TouchableOpacity 
            style={styles.taskCard} 
            onPress={() => navigation.navigate('TaskAddScreen', { task: item })}
            activeOpacity={0.7}
        >
            <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={() => handleToggleComplete(item)}
            >
                <Ionicons 
                    name={item.completed ? "checkbox" : "square-outline"} 
                    size={24} 
                    color={item.completed ? colors.YELLOW : colors.GREY} 
                />
            </TouchableOpacity>
            
            <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, item.completed && styles.taskCompleted]}>
                    {item.title}
                </Text>
                {item.due_date && (
                    <View style={styles.dateContainer}>
                         <Ionicons name="calendar-outline" size={14} color={colors.GREY} />
                         <Text style={styles.dateText}>
                            {new Date(item.due_date).toLocaleDateString()}
                         </Text>
                    </View>
                )}
            </View>

            <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleDeleteTask(item)}
            >
                <Ionicons name="trash-outline" size={20} color={colors.RED} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={[styles.header, { marginTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.BLACK} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tareas</Text>
                <View style={{ width: 24 }} /> 
            </View>

            {/* Main Category Tabs */}
            <View style={styles.categoryTabs}>
                <TouchableOpacity 
                    style={[styles.categoryTab, category === 'general' && styles.categoryTabActive]}
                    onPress={() => setCategory('general')}
                >
                    <Text style={[styles.categoryText, category === 'general' && styles.categoryTextActive]}>Generales</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.categoryTab, category === 'apiary' && styles.categoryTabActive]}
                    onPress={() => setCategory('apiary')}
                >
                    <Text style={[styles.categoryText, category === 'apiary' && styles.categoryTextActive]}>Apiarios</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity 
                    style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]} 
                    onPress={() => setFilter('pending')}
                >
                    <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>Pendientes</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]} 
                    onPress={() => setFilter('completed')}
                >
                    <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>Completadas</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.YELLOW} />
                </View>
            ) : (
                <FlatList
                    data={filteredTasks}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.YELLOW} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="checkmark-done-circle-outline" size={80} color={colors.GREY_LIGHT} />
                            <Text style={styles.emptyText}>No hay tareas {category === 'general' ? 'generales' : 'de apiarios'}</Text>
                            <Text style={styles.emptySubText}>Crea una nueva tarea para comenzar</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity 
                style={[styles.fab, { bottom: insets.bottom + 20 }]} 
                onPress={() => navigation.navigate('TaskAddScreen', {})}
            >
                <Ionicons name="add" size={30} color={colors.BLACK} />
            </TouchableOpacity>
        </View>
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: colors.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.BLACK,
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: colors.WHITE,
        gap: 10,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    filterButtonActive: {
        backgroundColor: colors.YELLOW,
        borderColor: colors.YELLOW,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.GREY,
    },
    filterTextActive: {
        color: colors.BLACK,
    },
    listContent: {
        padding: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        opacity: 0.8,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.BLACK_LIGHT,
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 16,
        color: colors.GREY,
        marginTop: 8,
    },
    taskCard: {
        flexDirection: 'row',
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    checkboxContainer: {
        marginRight: 15,
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.BLACK_LIGHT,
        marginBottom: 4,
    },
    taskCompleted: {
        textDecorationLine: 'line-through',
        color: colors.GREY,
    },
    taskDescription: {
        fontSize: 14,
        color: colors.GREY,
        marginBottom: 6,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 12,
        color: colors.GREY,
    },
    deleteButton: {
        padding: 10,
    },
    fab: {
        position: 'absolute',
        right: 20,
        backgroundColor: colors.YELLOW,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    categoryTabs: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingTop: 15,
        gap: 15,
        backgroundColor: colors.WHITE,
    },
    categoryTab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    categoryTabActive: {
        borderBottomColor: colors.YELLOW,
    },
    categoryText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.GREY,
    },
    categoryTextActive: {
        color: colors.BLACK,
        fontWeight: 'bold',
    },
});

export default TasksScreen;
