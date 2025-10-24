'use client';

import React, { useState } from 'react';
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
    const [serverError, setServerError] = useState<string | null>(null);
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
        setServerError(null);
        try {
            const response = await fetch('http://localhost:8080/auth/register', {
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
            setServerError(error instanceof Error ? error.message : 'Erro desconhecido');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box className={styles['form-register']}>
            <ToastContainer />
            <Box className={styles['login-form-container']}>
                <Backdrop
                    sx={{
                        color: '#fff',
                        zIndex: (theme) => theme.zIndex.drawer + 1
                    }}
                    open={isLoading}
                >
                    <Image src={CheckGif} width={300} height={300} alt="check box gif"/>
                </Backdrop>
                <Image
                    src={ListoIcon}
                    alt="Listo Icon"
                    width={200}
                    height={200}
                />
                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>

                    <TextField
                        label="Name"
                        variant='outlined'
                        fullWidth
                        {...register('name')}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        autoComplete="off"
                    />

                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        {...register('username')}
                        error={!!errors.username}
                        helperText={errors.username?.message}
                    />

                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        {...register('email')}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        {...register('password')}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />
                    <TextField
                        label="Confirm Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        {...register('confirmPassword')}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                    />
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        marginTop: '1rem',
                        alignItems: 'center'
                    }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            className={styles['button-login']}
                            disabled={!isValid || isFinish}
                        >
                            Cadastrar
                        </Button>

                        <Link href='/' passHref className={styles['button-login']}>
                            <Button
                                variant="outlined"
                                color="primary"
                                fullWidth
                                disabled={isFinish}
                            >
                                Voltar
                            </Button>
                        </Link>
                    </Box>
                </form>
            </Box>
        </Box>
    )
}