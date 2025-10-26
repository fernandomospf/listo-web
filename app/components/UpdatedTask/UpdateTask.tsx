import { Box, Button, Dialog, IconButton, TextField, Typography, MenuItem, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import CloseIcon from '@mui/icons-material/Close';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToastContainer, toast } from 'react-toastify';
import styles from './UpdateTask.module.css';
import { taskApi } from '@/app/api/taskApi';
import { useStore } from '@/app/store/useStore';
import { updateTaskSchema } from './schemaUpdateTask';
import { FormData, UpdateTaskProps } from './types';
import Loading from './fragments/Loading';

function UpdateTask({ open, handleClose, onTaskCreated }: UpdateTaskProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [initialValues, setInitialValues] = useState<FormData | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    const { setRefetch, taskSelected } = useStore();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        setValue,
        watch,
        control,
        getValues
    } = useForm<FormData>({
        resolver: zodResolver(updateTaskSchema) as any,
        mode: 'onChange',
        defaultValues: {
            title: '',
            description: '',
            priority: 'medium',
            due_date: '',
            source_url: '',
            status: 'new',
        }
    });

    const formValues = watch();

    useEffect(() => {
        if (initialValues) {
            const currentValues = getValues();
            const changed = Object.keys(currentValues).some(key => {
                const currentValue = currentValues[key as keyof FormData];
                const initialValue = initialValues[key as keyof FormData];

                return String(currentValue || '') !== String(initialValue || '');
            });

            setHasChanges(changed);
        } else {
            setHasChanges(false);
        }
    }, [formValues, initialValues, getValues]);

    const getTask = async () => {
        setIsLoading(true);
        if (!taskSelected || taskSelected.trim() === '') {
            console.error('❌ TaskSelected está vazio ou inválido');
            return;
        }

        try {
            const response = await taskApi.getById(taskSelected);

            const statusMapReverse: Record<string, "new" | "in_progress" | "done"> = {
                'new': 'new',
                'in_progress': 'in_progress',
                'done': 'done'
            };

            const mappedStatus = statusMapReverse[response.status] || 'new';

            const priorityMapReverse: Record<number, "low" | "medium" | "high" | "urgent"> = {
                1: 'low',
                2: 'medium',
                3: 'high',
                4: 'urgent'
            };

            const mappedPriority = priorityMapReverse[response.priority] || 'medium';

            const formData = {
                title: response.title,
                description: response.description || '',
                status: mappedStatus,
                priority: mappedPriority,
                due_date: response.due_date ? new Date(response.due_date).toISOString().slice(0, 16) : '',
                source_url: response.source_url || ''
            };

            setValue('title', formData.title);
            setValue('description', formData.description);
            setValue('status', formData.status);
            setValue('priority', formData.priority);
            setValue('due_date', formData.due_date);
            setValue('source_url', formData.source_url);

            setInitialValues(formData);

        } catch (error) {
            console.error(`[UPDATE TASK] - ${error}`);
            toast.error('Erro ao carregar tarefa');
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (open && taskSelected) {
            getTask();
            setHasChanges(false);
        }
    }, [open, taskSelected]);

    useEffect(() => {
        if (!open) {
            reset();
            setInitialValues(null);
            setHasChanges(false);
        }
    }, [open]);

    const onSubmit = async (data: FormData) => {
        if (!hasChanges) {
            toast.info('Nenhuma alteração foi feita na tarefa.');
            return;
        }

        setIsLoading(true);
        try {
            let priorityNumber: number;
            switch (data.priority) {
                case 'low':
                    priorityNumber = 1;
                    break;
                case 'medium':
                    priorityNumber = 2;
                    break;
                case 'high':
                    priorityNumber = 3;
                    break;
                case 'urgent':
                    priorityNumber = 4;
                    break;
                default:
                    priorityNumber = 2;
                    console.warn('⚠️ Priority não reconhecida, usando medium como fallback');
            }

            console.log('🔢 Priority convertida para número:', priorityNumber);

            const taskData = {
                title: data.title,
                description: data.description,
                status: data.status,
                priority: priorityNumber,
                due_date: data.due_date && data.due_date.trim() !== '' ? data.due_date : null,
                source_url: data.source_url && data.source_url.trim() !== '' ? data.source_url : null
            };

            const updatedTask = await taskApi.updatedTask(taskData, taskSelected as string);

            toast.success('Atividade atualizada com sucesso!');

            setTimeout(() => {
                reset();
                handleClose(false);
                setRefetch();
                setHasChanges(false);
            }, 1000)

            if (onTaskCreated) {
                onTaskCreated(updatedTask);
            }

        } catch (error) {
            console.error('❌ Erro ao atualizar tarefa:', error);

            let errorMessage = 'Erro ao atualizar tarefa';

            if (error instanceof Error) {
                if (error.message.includes('Unauthorized')) {
                    errorMessage = 'Sessão expirada. Faça login novamente.';
                    window.dispatchEvent(new Event('unauthorized'));
                } else if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
                    errorMessage = 'Erro de conexão. Verifique sua internet.';
                } else {
                    errorMessage = error.message;
                }
            }

            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
            });

        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        if (!isLoading) {
            reset();
            setInitialValues(null);
            setHasChanges(false);
            handleClose(false);
        }
    };

    const statusMapper = {
        'new': 'Novo',
        'in_progress': 'Em progresso',
        'done': 'Concluída'
    }

    return (
        <Dialog
            open={open}
            onClose={handleCloseModal}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="sm"
            fullWidth
        >
            <Box className={styles.dialogContainer}>
                <Box className={styles['action-close']}>
                    <IconButton
                        onClick={handleCloseModal}
                        disabled={isLoading}
                        className={styles.closeButton}
                        size="large"
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box>
                    <Typography variant="h5" className={styles.title}>
                        Atualizar tarefa
                    </Typography>
                </Box>
            </Box>

            {
                isLoading ? (<Loading />) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Box className={styles.formContainer}>
                            <TextField
                                label="Título *"
                                variant="outlined"
                                className={styles.textField}
                                {...register("title")}
                                value={watch('title')}
                                autoComplete="off"
                                error={!!errors.title}
                                helperText={errors.title?.message}
                                disabled={isLoading}
                                fullWidth
                            />

                            <TextField
                                label="Descrição *"
                                variant="outlined"
                                className={styles.textField}
                                multiline
                                rows={3}
                                {...register("description")}
                                value={watch('description')}
                                autoComplete="off"
                                error={!!errors.description}
                                helperText={errors.description?.message}
                                disabled={isLoading}
                                fullWidth
                            />

                            <Box className={styles['row-container']}>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <FormControl
                                            className={styles.formControl}
                                            error={!!fieldState.error}
                                            disabled={isLoading}
                                            fullWidth
                                        >
                                            <InputLabel>Status</InputLabel>
                                            <Select
                                                {...field}
                                                label="Status"
                                                value={field.value || 'new'}
                                            >
                                                <MenuItem value="new">{statusMapper['new']}</MenuItem>
                                                <MenuItem value="in_progress">{statusMapper['in_progress']}</MenuItem>
                                                <MenuItem value="done">{statusMapper['done']}</MenuItem>
                                            </Select>
                                            {fieldState.error && (
                                                <Typography variant="caption" color="error">
                                                    {fieldState.error.message}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    )}
                                />

                                <Controller
                                    name="priority"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <FormControl
                                            className={styles.formControl}
                                            error={!!fieldState.error}
                                            disabled={isLoading}
                                            fullWidth
                                        >
                                            <InputLabel>Prioridade</InputLabel>
                                            <Select
                                                {...field}
                                                label="Prioridade"
                                                value={field.value || 'medium'}
                                            >
                                                <MenuItem value="low">Baixa</MenuItem>
                                                <MenuItem value="medium">Média</MenuItem>
                                                <MenuItem value="high">Alta</MenuItem>
                                                <MenuItem value="urgent">Urgente</MenuItem>
                                            </Select>
                                            {fieldState.error && (
                                                <Typography variant="caption" color="error">
                                                    {fieldState.error.message}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Box>

                            <TextField
                                label="Data limite"
                                variant="outlined"
                                className={styles.textField}
                                type="datetime-local"
                                slotProps={{
                                    inputLabel: {
                                        shrink: true
                                    }
                                }}
                                {...register("due_date")}
                                value={watch('due_date')}
                                autoComplete="off"
                                disabled={isLoading}
                                fullWidth
                            />

                            <TextField
                                label="URL da fonte"
                                variant="outlined"
                                className={styles.textField}
                                {...register("source_url")}
                                value={watch('source_url')}
                                autoComplete="off"
                                error={!!errors.source_url}
                                helperText={errors.source_url?.message}
                                disabled={isLoading}
                                fullWidth
                                placeholder="https://exemplo.com"
                            />
                        </Box>

                        <Box className={styles.buttonsContainer}>
                            <Button
                                variant="outlined"
                                onClick={handleCloseModal}
                                disabled={isLoading}
                                className={styles.button}
                                size="large"
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={!isValid || isLoading || !hasChanges}
                                startIcon={isLoading ? <CircularProgress size={20} /> : null}
                                className={styles.button}
                                size="large"
                            >
                                {isLoading ? 'Atualizando...' : 'Atualizar Tarefa'}
                            </Button>
                        </Box>
                    </form>
                )
            }

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </Dialog>
    )
}

export default UpdateTask;