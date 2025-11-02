import { create } from 'zustand';
import { Task, UseStoreInterface } from './types';
import { taskApi } from '@/app/api/taskApi';

const initialState = {
    tasks: [],
    taskSelected: '',
    refetch: false,
    filteredList: [],
    searchInput: '',
};

export const useStore = create<UseStoreInterface>((set, get) => ({
    ...initialState,
    addTask: (tasks: Task[]) => {
        set(() => ({
            tasks: [...tasks]
        }));
    },
    ApiGetAllTask: async (setLoading: (status: boolean) => void) => {
        setLoading(true);
        try {
            const response = await taskApi.getAllTask();
            get().addTask(response)
            set({ filteredList: response })
            setLoading(false);
        } catch (error) {
            console.log(`[API - GetAllTask] - ${error}`)
        }
    },
    selectedTasks: (id: string) => {
        set((state) => {
            if (state.taskSelected === id) {
                return {
                    taskSelected: null
                };
            }

            return {
                taskSelected: id
            };
        });
    },
    setRefetch: () => {
        set((state) => {
            return {
                ...state,
                refetch: !state.refetch
            }
        })
    },
    setSearchInput: (input: string) => set({ searchInput: input }),
    filter: (evt: React.ChangeEvent<HTMLInputElement>) => {
        const state = get();
        const inputSearch = evt.target.value.toLowerCase().trim();

        const response = state.tasks.filter(task =>
            task.title?.toLowerCase().includes(inputSearch) ||
            task.description?.toLowerCase().includes(inputSearch)
        );

        set({ filteredList: response });
    }
}));