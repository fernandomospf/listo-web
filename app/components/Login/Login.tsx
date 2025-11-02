'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styles from './Login.module.css';
import { Typography, Checkbox, FormGroup, FormControlLabel } from '@mui/material';
import { Box } from '@mui/system';
import GoogleIcon from '@mui/icons-material/Google';
import ListoIcon from '../../../public/listo-icon.png';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import CoverPageLogin from '@/public/coverPageLogin.svg';
import { InputLogin, InputPassword, LoginButton } from './Login.style';
import Register from '../register/Register';
import { toast, ToastContainer } from 'react-toastify';

export const Login: React.FC = () => {
    const { handleSubmit, watch, setValue, formState: { errors }, control } = useForm({
        defaultValues: {
            email: '',
            password: ''
        }
    });
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [registerNewUser, setRegisterNewUser] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const error = searchParams.get('error');
        if (error === 'oauth_failed') {
            setServerError('Falha na autenticação com Google. Tente novamente.');
        }

        const checkExistingAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.access_token) {
                    saveAuthToken(session.access_token);
                    router.push('/dashboard');
                }
            } catch (error) {
                console.error('Erro ao verificar sessão:', error);
            }
        };

        checkExistingAuth();

        if (isMounted) {
            const savedEmail = localStorage.getItem('email');
            if (savedEmail) {
                setValue('email', savedEmail);
                setRememberMe(true);
            }
        }
    }, [setValue, router, searchParams, isMounted]);

    const saveAuthToken = (accessToken: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', accessToken);
        }
    };

    const clearAuthTokens = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            sessionStorage.removeItem('access_token');
            localStorage.removeItem('user_email');
        }
    };

    const handleGoogleLogin = async () => {
        setSocialLoading(true);
        setServerError(null);

        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (error) {
                throw new Error(error.message);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao conectar com Google';
            setServerError(errorMessage);
            clearAuthTokens();
            toast.error('Erro ao conectar com Google. Tente novamente.');
        } finally {
            setSocialLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setServerError(null);

        try {
            if (rememberMe && data.email) {
                localStorage.setItem('email', data.email);
            } else {
                localStorage.removeItem('email');
            }

            const loginIdentifier = data.email.trim();
            const password = data.password;

            if (!loginIdentifier || !password) {
                throw new Error('Preencha todos os campos');
            }

            const isEmail = loginIdentifier.includes('@');
            let emailToUse = loginIdentifier;

            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: emailToUse,
                password: password
            });

            if (authError) {
                if (authError.message === 'Invalid login credentials') {
                    throw new Error('Email ou senha incorretos');
                } else if (authError.message === 'Email not confirmed') {
                    throw new Error('Email não confirmado. Verifique sua caixa de entrada.');
                } else {
                    throw new Error(authError.message);
                }
            }

            if (authData.session?.access_token) {
                saveAuthToken(authData.session.access_token);

                if (authData.user?.email) {
                    localStorage.setItem('user_email', authData.user.email);
                }
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Login realizado com sucesso!');
            router.push('/dashboard');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setServerError(errorMessage);

            if (errorMessage.includes('Email ou senha incorretos')) {
                toast.error('Email ou senha incorretos. Verifique suas credenciais.');
            } else if (errorMessage.includes('Email não confirmado')) {
                toast.warning('Email não confirmado. Verifique sua caixa de entrada.');
            } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network')) {
                toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
            } else {
                toast.error('Erro ao realizar login. Tente novamente.');
            }

            clearAuthTokens();
        } finally {
            setIsLoading(false);
        }
    };

    const handleRememberMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setRememberMe(isChecked);

        const currentEmail = watch('email');

        if (isChecked && currentEmail) {
            localStorage.setItem('email', currentEmail);
        } else {
            localStorage.removeItem('email');
        }
    };

    const clearErrorOnType = () => {
        if (serverError) {
            setServerError(null);
        }
    };

    return (
        <Suspense fallback={
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography>Carregando...</Typography>
            </Box>
        }>
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
                theme="light"
            />
            <Box className={styles['main-container']}>
                <Box className={styles['image-container']}>
                    <Image
                        src={CoverPageLogin}
                        width={1000}
                        height={1000}
                        alt="Cover Page Login"
                        style={{ userSelect: 'none' }}
                    />
                </Box>
                <Box className={styles['login-container']}>
                    <Box className={styles['modal-login']}>
                        <Box className={styles['brand-container']}>
                            <Image
                                src={ListoIcon}
                                width={150}
                                height={150}
                                alt='Listo image brand'
                            />
                        </Box>
                        {
                            registerNewUser ? (
                                <Register 
                                    styles={styles} 
                                    setRegisterNewUser={() => setRegisterNewUser(false)}
                                />
                            ) : (
                                <React.Fragment>
                                    <Box className={styles['box-login']}>
                                        <form
                                            onSubmit={handleSubmit(onSubmit)}
                                            className={styles['form-login']}
                                        >
                                            <Controller
                                                name="email"
                                                control={control}
                                                rules={{
                                                    required: "Email é obrigatório",
                                                    pattern: {
                                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                        message: "Email inválido"
                                                    }
                                                }}
                                                render={({ field }) => (
                                                    <InputLogin
                                                        {...field}
                                                        label="Email"
                                                        variant="outlined"
                                                        error={!!errors.email}
                                                        helperText={errors.email?.message as string}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            clearErrorOnType();
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                backgroundColor: 'transparent !important',
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    border: '1px solid #1F2937 !important',
                                                                    backgroundColor: 'transparent !important',
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#1F2937 !important',
                                                                    backgroundColor: 'transparent !important',
                                                                },
                                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#1F2937 !important',
                                                                    borderWidth: '2px !important',
                                                                    backgroundColor: 'transparent !important',
                                                                },
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                color: '#1F2937 !important',
                                                                backgroundColor: 'transparent !important',
                                                                fontFamily: 'var(--font-poppins) !important',
                                                            },
                                                            '& .MuiInputLabel-root': {
                                                                color: '#1F2937 !important',
                                                                backgroundColor: 'transparent !important',
                                                                fontFamily: 'var(--font-poppins) !important',
                                                                '&.Mui-focused': {
                                                                    color: '#1F2937 !important',
                                                                    backgroundColor: 'transparent !important',
                                                                },
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                            <Controller
                                                name="password"
                                                control={control}
                                                rules={{
                                                    required: "Senha é obrigatória",
                                                    minLength: {
                                                        value: 6,
                                                        message: "Senha deve ter pelo menos 6 caracteres"
                                                    }
                                                }}
                                                render={({ field }) => (
                                                    <InputPassword
                                                        {...field}
                                                        label="Senha"
                                                        autoComplete='off'
                                                        type="password"
                                                        variant="outlined"
                                                        error={!!errors.password}
                                                        helperText={errors.password?.message as string}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                backgroundColor: 'transparent !important',
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    border: '1px solid #1F2937 !important',
                                                                    backgroundColor: 'transparent !important',
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#1F2937 !important',
                                                                    backgroundColor: 'transparent !important',
                                                                },
                                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#1F2937 !important',
                                                                    borderWidth: '2px !important',
                                                                    backgroundColor: 'transparent !important',
                                                                },
                                                            },
                                                            '& .MuiInputBase-input': {
                                                                color: '#1F2937 !important',
                                                                backgroundColor: 'transparent !important',
                                                                fontFamily: 'var(--font-poppins) !important',
                                                            },
                                                            '& .MuiInputLabel-root': {
                                                                color: '#1F2937 !important',
                                                                backgroundColor: 'transparent !important',
                                                                fontFamily: 'var(--font-poppins) !important',
                                                                '&.Mui-focused': {
                                                                    color: '#1F2937 !important',
                                                                    backgroundColor: 'transparent !important',
                                                                },
                                                            },
                                                        }}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            clearErrorOnType();
                                                        }}
                                                    />
                                                )}
                                            />

                                            <FormGroup>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={rememberMe}
                                                            onChange={handleRememberMeChange}
                                                            sx={{
                                                                '& .MuiSvgIcon-root': {
                                                                    fontSize: '22px',
                                                                    borderRadius: '4px',
                                                                },
                                                                color: '#1F2937',
                                                                '&.Mui-checked': {
                                                                    color: '#1F2937',
                                                                },
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(59, 130, 246, 0.04)',
                                                                },
                                                            }}
                                                        />
                                                    }
                                                    label="Lembrar de mim?"
                                                    sx={{
                                                        '& .MuiFormControlLabel-label': {
                                                            fontSize: '16px',
                                                            color: '#1F2937',
                                                            fontWeight: 400,
                                                            fontFamily: 'var(--font-poppins) !important',
                                                        },
                                                    }}
                                                />
                                            </FormGroup>
                                            <hr className={styles.horizontalLine} />
                                            <Box className={styles['button-container']}>
                                                <LoginButton
                                                    type="submit"
                                                    variant="contained"
                                                    color="primary"
                                                    className={styles.buttonLogin}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? 'ENTRANDO...' : 'ENTRAR'}
                                                </LoginButton>

                                                <LoginButton
                                                    variant="contained"
                                                    color="primary"
                                                    className={styles.googleButton}
                                                    onClick={handleGoogleLogin}
                                                    disabled={socialLoading}
                                                    startIcon={<GoogleIcon />}
                                                >
                                                    {socialLoading ? 'CONECTANDO...' : 'CONTINUAR COM GOOGLE'}
                                                </LoginButton>
                                            </Box>
                                        </form>
                                    </Box>
                                    <Box className={styles['register-link']} onClick={() => setRegisterNewUser(true)}>
                                            Registre-se
                                    </Box>
                                </React.Fragment>
                            )
                        }
                    </Box>
                </Box>
            </Box>
        </Suspense>
    );
};