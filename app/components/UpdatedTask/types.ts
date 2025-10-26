export interface FormData {
    title: string;
    description: string;
    status: 'new' | 'in_progress' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string | null;  
    source_url?: string | null;
}

export interface UpdateTaskProps {
    open: boolean;
    handleClose: (open: boolean) => void;
    onTaskCreated?: (task?: any) => void;
}