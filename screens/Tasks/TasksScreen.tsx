import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { getTasks, updateTask, deleteTask } from '../../modules/API/Tasks';
import { ITask } from '../../constants/interfaces/Task/ITask';
import { TasksScreenProps } from '../../types/navigation';
import colors from '../../constants/colors';

const TasksScreen = ({ navigation, route }: TasksScreenProps) => {
    const insets = useSafeAreaInsets();
    const apiaryId = route.params?.apiaryId;
    const apiaryName = route.params?.apiaryName;
    const isApiaryScoped = typeof apiaryId === 'number';
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'pending' | 'completed'>('pending');
    const [category, setCategory] = useState<'general' | 'apiary'>(isApiaryScoped ? 'apiary' : 'general');

    const fetchTasks = async () => {
        try {
            const params = isApiaryScoped ? { apiary_id: apiaryId } : {};
            let fetchedTasks = await getTasks(params) || [];
            if (fetchedTasks) {
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
        }, [apiaryId])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchTasks();
    };

    const handleToggleComplete = async (task: ITask) => {
        const updatedTasks = tasks.map(t =>
            t.id === task.id ? { ...t, completed: !t.completed } : t
        );
        setTasks(updatedTasks);
        const result = await updateTask(task.id, { completed: !task.completed });
        if (!result) {
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
        if (isApiaryScoped && task.apiary_id !== apiaryId) return false;
        if (category === 'general' && task.apiary_id) return false;
        if (category === 'apiary' && !task.apiary_id) return false;
        if (filter === 'pending') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
    });

    const pendingCount = tasks.filter(t => {
        if (isApiaryScoped && t.apiary_id !== apiaryId) return false;
        if (t.completed) return false;
        return category === 'general' ? !t.apiary_id : !!t.apiary_id;
    }).length;

    const renderItem = ({ item }: { item: ITask }) => (
        <TouchableOpacity
            style={styles.taskCard}
            onPress={() => navigation.navigate('TaskAddScreen', { task: item, apiaryId: item.apiary_id ?? apiaryId })}
            activeOpacity={0.7}
        >
            <TouchableOpacity
                style={styles.checkbox}
                onPress={() => handleToggleComplete(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.checkboxInner, item.completed && styles.checkboxChecked]}>
                    {item.completed && <FontAwesome5 name="check" size={10} color={colors.WHITE} />}
                </View>
            </TouchableOpacity>

            <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
                    {item.title}
                </Text>
                {item.due_date && (
                    <View style={styles.dateRow}>
                        <FontAwesome5 name="calendar-alt" size={11} color={colors.TEXT_TERTIARY} />
                        <Text style={styles.dateText}>
                            {new Date(item.due_date).toLocaleDateString()}
                        </Text>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteTask(item)}
                activeOpacity={0.7}
            >
                <FontAwesome5 name="trash" size={14} color={colors.TEXT_TERTIARY} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.wrapper, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
                    <FontAwesome5 name="arrow-left" size={16} color={colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{isApiaryScoped ? 'Tareas del apiario' : 'Tareas'}</Text>
                    {isApiaryScoped && apiaryName ? (
                        <Text style={styles.headerSubtitle}>{apiaryName}</Text>
                    ) : pendingCount > 0 ? (
                        <Text style={styles.headerSubtitle}>{pendingCount} pendiente{pendingCount === 1 ? '' : 's'}</Text>
                    ) : null}
                </View>
                <View style={{ width: 36 }} />
            </View>

            {/* Category Tabs */}
            {!isApiaryScoped && (
                <View style={styles.categoryRow}>
                    <TouchableOpacity
                        style={[styles.categoryTab, category === 'general' && styles.categoryTabActive]}
                        onPress={() => setCategory('general')}
                        activeOpacity={0.7}
                    >
                        <FontAwesome5
                            name="list-ul"
                            size={12}
                            color={category === 'general' ? colors.TEXT_PRIMARY : colors.TEXT_TERTIARY}
                            style={{ marginRight: 6 }}
                        />
                        <Text style={[styles.categoryText, category === 'general' && styles.categoryTextActive]}>
                            Generales
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.categoryTab, category === 'apiary' && styles.categoryTabActive]}
                        onPress={() => setCategory('apiary')}
                        activeOpacity={0.7}
                    >
                        <FontAwesome5
                            name="database"
                            size={12}
                            color={category === 'apiary' ? colors.TEXT_PRIMARY : colors.TEXT_TERTIARY}
                            style={{ marginRight: 6 }}
                        />
                        <Text style={[styles.categoryText, category === 'apiary' && styles.categoryTextActive]}>
                            Apiarios
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Filter Pills */}
            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={[styles.filterPill, filter === 'pending' && styles.filterPillActive]}
                    onPress={() => setFilter('pending')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
                        Pendientes
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterPill, filter === 'completed' && styles.filterPillActive]}
                    onPress={() => setFilter('completed')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
                        Completadas
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.WARNING_COLOR} />
                </View>
            ) : (
                <FlatList
                    data={filteredTasks}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.WARNING_COLOR} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <FontAwesome5 name="check-circle" size={32} color={colors.BORDER} />
                            </View>
                            <Text style={styles.emptyText}>Sin tareas {filter === 'pending' ? 'pendientes' : 'completadas'}</Text>
                            <Text style={styles.emptySubText}>
                                {filter === 'pending' ? 'Crea una nueva tarea para empezar' : 'Todavía no completaste ninguna'}
                            </Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={[styles.fab, { bottom: insets.bottom + 20 }]}
                onPress={() => navigation.navigate('TaskAddScreen', isApiaryScoped ? { apiaryId } : {})}
                activeOpacity={0.85}
            >
                <FontAwesome5 name="plus" size={18} color={colors.TEXT_PRIMARY} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: colors.BG_APP,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: colors.BG_INPUT,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.BG_CARD,
        borderWidth: 1,
        borderColor: colors.BORDER,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.TEXT_PRIMARY,
        textAlign: 'center',
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 12,
        color: colors.TEXT_TERTIARY,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 2,
    },
    categoryRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 14,
        gap: 10,
        backgroundColor: colors.WHITE,
    },
    categoryTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: colors.BG_CARD,
        borderWidth: 1,
        borderColor: colors.BORDER,
    },
    categoryTabActive: {
        backgroundColor: colors.HONEY[100],
        borderColor: colors.WARNING_COLOR,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.TEXT_TERTIARY,
    },
    categoryTextActive: {
        color: colors.TEXT_PRIMARY,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 14,
        gap: 8,
        backgroundColor: colors.WHITE,
    },
    filterPill: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: colors.BG_INPUT,
        borderWidth: 1,
        borderColor: colors.BORDER,
    },
    filterPillActive: {
        backgroundColor: colors.TEXT_PRIMARY,
        borderColor: colors.TEXT_PRIMARY,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.TEXT_SECONDARY,
    },
    filterTextActive: {
        color: colors.WHITE,
    },
    listContent: {
        padding: 20,
        gap: 10,
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.BORDER,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    checkbox: {
        marginRight: 14,
    },
    checkboxInner: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: colors.BORDER_MEDIUM,
        backgroundColor: colors.BG_CARD,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.SUCCESS,
        borderColor: colors.SUCCESS,
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.TEXT_PRIMARY,
        marginBottom: 4,
    },
    taskTitleCompleted: {
        textDecorationLine: 'line-through',
        color: colors.TEXT_TERTIARY,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    dateText: {
        fontSize: 12,
        color: colors.TEXT_TERTIARY,
        fontWeight: '500',
    },
    deleteBtn: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: colors.BG_CARD,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.BORDER,
        marginLeft: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyIcon: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: colors.BG_CARD,
        borderWidth: 1,
        borderColor: colors.BORDER,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.TEXT_PRIMARY,
        marginBottom: 6,
    },
    emptySubText: {
        fontSize: 13,
        color: colors.TEXT_TERTIARY,
        fontWeight: '500',
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: 20,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.WARNING_COLOR,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.WARNING_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
});

export default TasksScreen;
