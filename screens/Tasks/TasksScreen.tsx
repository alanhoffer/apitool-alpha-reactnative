import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { getTasks, updateTask, deleteTask } from '../../modules/API/Tasks';
import { ITask } from '../../constants/interfaces/Task/ITask';
import { TasksScreenProps } from '../../types/navigation';
import colors from '../../constants/colors';
import { palette, fonts, radius, shadow } from '../../constants/theme';
import { ChevronLeft, Plus } from '../../components/v2/icons';

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
        <View style={styles.wrapper}>
            {/* Header navy */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
                    <ChevronLeft size={20} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTitleBlock}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{isApiaryScoped ? 'Tareas del apiario' : 'Tareas'}</Text>
                    {isApiaryScoped && apiaryName ? (
                        <Text style={styles.headerSubtitle} numberOfLines={1}>{apiaryName}</Text>
                    ) : pendingCount > 0 ? (
                        <Text style={styles.headerSubtitle}>{pendingCount} pendiente{pendingCount === 1 ? '' : 's'}</Text>
                    ) : null}
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('TaskAddScreen', isApiaryScoped ? { apiaryId } : {})} activeOpacity={0.85}>
                    <Plus size={18} color={palette.navy} />
                </TouchableOpacity>
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
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
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

        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: palette.mist,
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
        paddingHorizontal: 18,
        paddingBottom: 18,
        backgroundColor: palette.navy,
        borderBottomLeftRadius: radius.header,
        borderBottomRightRadius: radius.header,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: palette.onNavy10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: palette.honey,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleBlock: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    headerTitle: {
        fontSize: 19,
        fontFamily: fonts.soraBold,
        color: '#fff',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 12,
        color: palette.steel,
        fontFamily: fonts.manropeSemiBold,
        textAlign: 'center',
        marginTop: 3,
    },
    categoryRow: {
        flexDirection: 'row',
        paddingHorizontal: 18,
        paddingTop: 16,
        gap: 10,
    },
    categoryTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 11,
        borderRadius: 12,
        backgroundColor: palette.white,
        ...shadow.soft,
    },
    categoryTabActive: {
        backgroundColor: palette.honeyBg,
    },
    categoryText: {
        fontSize: 13,
        fontFamily: fonts.manropeSemiBold,
        color: palette.slate,
    },
    categoryTextActive: {
        color: palette.honeyText,
        fontFamily: fonts.manropeBold,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 18,
        paddingTop: 14,
        gap: 8,
    },
    filterPill: {
        paddingVertical: 7,
        paddingHorizontal: 16,
        borderRadius: radius.pill,
        backgroundColor: palette.white,
        ...shadow.soft,
    },
    filterPillActive: {
        backgroundColor: palette.navy,
    },
    filterText: {
        fontSize: 13,
        fontFamily: fonts.manropeSemiBold,
        color: palette.inkMuted,
    },
    filterTextActive: {
        color: '#fff',
        fontFamily: fonts.manropeBold,
    },
    listContent: {
        padding: 18,
        gap: 10,
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: palette.white,
        borderRadius: radius.lg,
        padding: 16,
        ...shadow.soft,
    },
    checkbox: {
        marginRight: 14,
    },
    checkboxInner: {
        width: 22,
        height: 22,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: palette.border,
        backgroundColor: palette.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: palette.good,
        borderColor: palette.good,
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 15,
        fontFamily: fonts.soraSemiBold,
        color: palette.ink,
        marginBottom: 4,
    },
    taskTitleCompleted: {
        textDecorationLine: 'line-through',
        color: palette.slate,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    dateText: {
        fontSize: 12,
        color: palette.slate,
        fontFamily: fonts.manrope,
    },
    deleteBtn: {
        width: 34,
        height: 34,
        borderRadius: 11,
        backgroundColor: palette.fieldBg,
        alignItems: 'center',
        justifyContent: 'center',
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
        backgroundColor: palette.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        ...shadow.soft,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: fonts.soraBold,
        color: palette.ink,
        marginBottom: 6,
    },
    emptySubText: {
        fontSize: 13,
        color: palette.slate,
        fontFamily: fonts.manrope,
        textAlign: 'center',
    },
});

export default TasksScreen;
