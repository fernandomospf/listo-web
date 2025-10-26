import { Box, Button, Dialog, IconButton, TextField, Typography, MenuItem, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { useState } from 'react'
import { useForm } from 'react-hook-form';
import CloseIcon from '@mui/icons-material/Close';
import { createTaskSchema } from './schemaCreateTask';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTaskProps, FormData } from './types';
import { ToastContainer, toast } from 'react-toastify';
import styles from './CreateTask.module.css';
import { taskApi } from '@/app/api/taskApi';
import { useStore } from '@/app/store/useStore';

function CreateTask({ open, handleClose, onTaskCreated }: CreateTaskProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { setRefetch } = useStore();
    const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm<FormData>({
        resolver: zodResolver(createTaskSchema) as any,
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

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const taskData = {
                title: data.title,
                description: data.description,
                status: data.status,
                priority: data.priority === 'low' ? 1 :
                    data.priority === 'medium' ? 2 :
                        data.priority === 'high' ? 3 :
                            data.priority === 'urgent' ? 4 : 2,
                due_date: data.due_date && data.due_date.trim() !== '' ? data.due_date : null,
                source_url: data.source_url && data.source_url.trim() !== '' ? data.source_url : null
            };

            const newTask = await taskApi.createTask(taskData);


            toast.success('Tarefa criada com sucesso!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            reset();
            handleClose(false);
            setRefetch();

            if (onTaskCreated) {
                onTaskCreated(newTask);
            }

        } catch (error) {
            let errorMessage = 'Erro ao criar tarefa';

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
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        if (!isLoading) {
            reset();
            handleClose(false);
        }
    };

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
                <IconButton
                    onClick={handleCloseModal}
                    disabled={isLoading}
                    className={styles.closeButton}
                    size="large"
                >
                    <CloseIcon />
                </IconButton>

                <Typography variant="h5" className={styles.title}>
                    Criar nova tarefa
                </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Box className={styles.formContainer}>
                    <TextField
                        label="Título *"
                        variant="outlined"
                        className={styles.textField}
                        {...register("title")}
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
                        autoComplete="off"
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        disabled={isLoading}
                        fullWidth
                    />

                    <Box className={styles.rowContainer}>
                        <FormControl
                            className={styles.formControl}
                            error={!!errors.status}
                            disabled={isLoading}
                            fullWidth
                        >
                            <InputLabel>Status</InputLabel>
                            <Select
                                label="Status"
                                {...register("status")}
                                defaultValue="pending"
                            >
                                <MenuItem value="new">Novo</MenuItem>
                                <MenuItem value="in_progress">Em Andamento</MenuItem>
                                <MenuItem value="done">Concluída</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl
                            className={styles.formControl}
                            error={!!errors.priority}
                            disabled={isLoading}
                            fullWidth
                        >
                            <InputLabel>Prioridade</InputLabel>
                            <Select
                                label="Prioridade"
                                {...register("priority")}
                                defaultValue="medium"
                            >
                                <MenuItem value="low">Baixa</MenuItem>
                                <MenuItem value="medium">Média</MenuItem>
                                <MenuItem value="high">Alta</MenuItem>
                                <MenuItem value="urgent">Urgente</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <TextField
                        label="Data limite"
                        variant="outlined"
                        className={styles.textField}
                        type="datetime-local"
                        InputLabelProps={{ shrink: true }}
                        {...register("due_date")}
                        autoComplete="off"
                        disabled={isLoading}
                        fullWidth
                    />

                    <TextField
                        label="URL da fonte"
                        variant="outlined"
                        className={styles.textField}
                        {...register("source_url")}
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
                        disabled={!isValid || isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} /> : null}
                        className={styles.button}
                        size="large"
                    >
                        {isLoading ? 'Criando...' : 'Criar Tarefa'}
                    </Button>
                </Box>
            </form>

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

export default CreateTask;