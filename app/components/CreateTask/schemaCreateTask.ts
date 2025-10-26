import { z } from 'zod';

export const createTaskSchema = z.object({
    title: z.string()
        .min(3, 'O título deve ter pelo menos 3 caracteres')
        .max(100, 'O título deve ter no máximo 100 caracteres'),
    description: z.string()
        .min(10, 'A descrição deve ter pelo menos 10 caracteres')
        .max(500, 'A descrição deve ter no máximo 500 caracteres')
        .default(''),
    status: z.enum(['new', 'in_progress', 'done'])
        .default('new'),
    priority: z.enum(['low', 'medium', 'high', 'urgent'])
        .default('medium'),
    due_date: z.string().default(''),
    source_url: z.string().default('')
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;