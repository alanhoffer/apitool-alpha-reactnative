export interface ITask {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    due_date?: string;
    user_id: number;
    apiary_id?: number;
    created_at: string;
    updated_at: string;
}

export interface ITaskCreate {
    title: string;
    description?: string;
    due_date?: string;
    apiary_id?: number;
}

export interface ITaskUpdate {
    title?: string;
    description?: string;
    completed?: boolean;
    due_date?: string;
    apiary_id?: number;
}
