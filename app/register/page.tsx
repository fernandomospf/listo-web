'use client';

import { useState } from 'react';
import { Backdrop, Button, CircularProgress, TextField } from '@mui/material';
import { Box } from '@mui/system';
import ListoIcon from '@/public/listo-icon.png';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Register.module.css';
import { useForm } from 'react-hook-form';
import { RegisterSchema, registerSchema } from './schemaRegister';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import CheckGif from '@/public/check-box.gif';

export default function Register() {
    const [isLoading, setIsLoading] = useState(false);
    const [isFinish, setIsFinish] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            username: '',
            password: '',
            confirmPassword: ''
        },
        mode: 'onChange'
    });
    const router = useRouter();

        const onSubmit = async (data: RegisterSchema) => {
            setIsLoading(true);
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL
            try {
                const response = await fetch(`${BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: data.username,
                        name: data.name,
                        email: data.email,
                        password: data.password
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();

                    let errorMessage = 'Erro no registro';

                    if (typeof errorData.message === 'string') {
                        errorMessage = errorData.message;
                    } else if (Array.isArray(errorData.message)) {
                        errorMessage = errorData.message.join(', ');
                    }

                    throw new Error(errorMessage);
                }

                const result = await response.json();
                setIsFinish(true)
                toast('Cadastro realizado com sucesso!!');
                setTimeout(() => {
                    router.push('/');
                }, 2000)
            } catch (error) {
                console.error('Erro no registro:', error);
                toast.error(error instanceof Error ? error.message : 'Erro no cadastro');
            } finally {
                setIsLoading(false);
            }
        };

    return (
        <Box className={styles.formRegister}>
            <ToastContainer />
            <Box className={styles.loginFormContainer}>
                <Backdrop
                    className={styles.backdrop}
                    open={isLoading}
                >
                    <Image src={CheckGif} width={300} height={300} alt="check box gif"/>
                </Backdrop>
                
                <Image
                    src={ListoIcon}
                    alt="Listo Icon"
                    width={200}
                    height={200}
                    style={{ maxWidth: '100%', height: 'auto' }}
                />
                
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <Box className={styles.fieldsContainer}>
                        <TextField
                            label="Name"
                            variant='outlined'
                            className={styles.textField}
                            {...register('name')}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            autoComplete="off"
                            disabled={isLoading}
                        />

                        <TextField
                            label="Username"
                            variant="outlined"
                            className={styles.textField}
                            {...register('username')}
                            error={!!errors.username}
                            helperText={errors.username?.message}
                            disabled={isLoading}
                        />

                        <TextField
                            label="Email"
                            variant="outlined"
                            className={styles.textField}
                            {...register('email')}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            disabled={isLoading}
                        />

                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            className={styles.textField}
                            {...register('password')}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            disabled={isLoading}
                        />
                        
                        <TextField
                            label="Confirm Password"
                            type="password"
                            variant="outlined"
                            className={styles.textField}
                            {...register('confirmPassword')}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            disabled={isLoading}
                        />
                    </Box>
                    
                    <Box className={styles.buttonsContainer}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            className={styles.registerButton}
                            disabled={!isValid || isFinish || isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} /> : null}
                        >
                            {isLoading ? 'CADASTRANDO...' : 'CADASTRAR'}
                        </Button>

                        <Button
                            variant="outlined"
                            color="primary"
                            className={styles.backButton}
                            disabled={isFinish || isLoading}
                            component={Link}
                            href="/"
                        >
                            VOLTAR
                        </Button>
                    </Box>
                </form>
            </Box>
        </Box>
    )
}