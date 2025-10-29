import { Controller, useForm } from 'react-hook-form';
import { registerSchema, RegisterSchema } from './schemaRegister';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, CircularProgress } from '@mui/material';
import { InputLogin, LoginButton } from '../Login/Login.style';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface RegisterProps {
    styles: {
        readonly [key: string]: string;
    },
    setRegisterNewUser: () => void;
}

function Register({
    styles,
    setRegisterNewUser
}: RegisterProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const {
        handleSubmit,
        control,
        formState: { errors, isValid }
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        },
        mode: 'onChange'
    });

    const onSubmit = async (data: RegisterSchema) => {
        setIsLoading(true);
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

        try {
            const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
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
            toast.success('Cadastro realizado com sucesso!!');
            setTimeout(() => {
                setRegisterNewUser()
            }, 2000);
        } catch (error) {
            console.error('Erro no registro:', error);
            toast.error(error instanceof Error ? error.message : 'Erro no cadastro');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box className={styles['box-login']}>
            <ToastContainer />
            <form
                className={styles['form-login']}
                onSubmit={handleSubmit(onSubmit)}
            >
                <Controller
                    name='name'
                    control={control}
                    render={({ field }) => (
                        <InputLogin
                            {...field}
                            label="Nome completo"
                            variant='outlined'
                            autoComplete='off'
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            disabled={isLoading}
                        />
                    )}
                />
                <Controller
                    name='email'
                    control={control}
                    render={({ field }) => (
                        <InputLogin
                            {...field}
                            label="Email"
                            variant='outlined'
                            autoComplete='off'
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            disabled={isLoading}
                        />
                    )}
                />
                <Controller
                    name='password'
                    control={control}
                    render={({ field }) => (
                        <InputLogin
                            {...field}
                            label="Senha"
                            type="password"
                            variant='outlined'
                            autoComplete='off'
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            disabled={isLoading}
                        />
                    )}
                />
                <Controller
                    name='confirmPassword'
                    control={control}
                    render={({ field }) => (
                        <InputLogin
                            {...field}
                            label="Confirme sua senha"
                            type="password"
                            variant='outlined'
                            autoComplete='off'
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            disabled={isLoading}
                        />
                    )}
                />
                <Box className={styles['button-container']}>
                    <LoginButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={styles.buttonLogin}
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Cadastrar'
                        )}
                    </LoginButton>
                    <LoginButton
                        variant="contained"
                        color="primary"
                        className={styles.buttonLogin}
                        onClick={setRegisterNewUser}
                        disabled={isLoading}
                    >
                        Voltar
                    </LoginButton>
                </Box>
            </form>
        </Box>
    )
}

export default Register