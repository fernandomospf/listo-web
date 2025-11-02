export interface Task {
    archived_at: string | null;
    completed_at: string | null;
    created_at: string;
    deleted_at: string | null;
    description: string;
    due_date: string | null;
    id: string;
    priority: number;
    source_url: string | null;
    status: 'new' | 'in_progress' | 'done';
    title: string;
    updated_at: string;
    user_id: string;
}

export type CreateTaskData = {
    title: string;
    description: string;
    status: string;
    priority: number;
    due_date?: string | null;
    source_url?: string | null;
};

export interface StoreState {
    tasks: Task[];
    filteredList: Task[];
    taskSelected: string | null;
    refetch: boolean;
    searchInput: string;
}
interface StoreActions {
    addTask: (tasks: Task[]) => void;
    ApiGetAllTask: (setLoading: (status: boolean) => void) => void;
    selectedTasks: (id: string) => void;
    setRefetch: () => void;
    setSearchInput: (input: string) => void; 
    filter: (evt: any) => void;
}

export interface UseStoreInterface extends StoreActions, StoreState {}