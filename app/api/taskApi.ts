import { CreateTaskData, Task } from "../store/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';


class TaskApi {
    private baseUrl: string

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    private getAccessToken(): string | null {
        return localStorage.getItem('access_token') ||
            sessionStorage.getItem('access_token') ||
            null;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}/${endpoint}`;
        const token = this.getAccessToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config: RequestInit = {
            headers,
            ...options,
        };


        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                throw new Error('[TASK:API] - Unauthorized - Please login again');
            }

            if (!response.ok) {
                throw new Error(`[TASK:API] - HTTP error! status ${response.status}`)
            }

            if (response.status === 204) {
                return {} as T;
            }

            return await response.json();
        } catch (error) {
            console.error(`[TASK:API] - API request failed: ${error}`);
            throw error;
        }
    }

    async createTask(taskData: CreateTaskData): Promise<Task> {
        return this.request<Task>('api/v1/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        })
    }

    async getById(taskId: string): Promise<Task> {
        return this.request(`api/v1/tasks${taskId}`, {
            method: 'GET'
        })
    }

    async updatedTask(taskData: CreateTaskData, taskId: string): Promise<Task> {
        return this.request<Task>(`api/v1/tasks${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(taskData)
        });
    }

    async getAllTask(): Promise<Task[]> {
        return this.request<Task[]>('api/v1/tasks/list', {
            method: 'GET'
        })
    }

    async getAllTaskComplete(): Promise<Task[]> {
        return this.request<Task[]>('api/v1/tasks/list/completed', {
            method: 'GET'
        })
    }


    async completedTask(taskId: string): Promise<Task> {
        return this.request<Task>(`api/v1/tasks/completed/${taskId}`, {
            method: 'PUT'
        })
    }

    async deleteTask(taskId: string) {
        return await this.request(`api/v1/tasks/delete/${taskId}`, {
            method: 'DELETE'
        });

    }
}

export const taskApi = new TaskApi();