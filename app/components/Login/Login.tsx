'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styles from './Login.module.css';
import { Button, TextField, Typography, Backdrop, Checkbox, FormGroup, FormControlLabel } from '@mui/material';
import { Box } from '@mui/system';
import GoogleIcon from '@mui/icons-material/Google';
import ListoIcon from '../../../public/listo-icon.png';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import CheckBox from '@/public/check-box.gif';

export const Login: React.FC = () => {
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isCheckboxLoaded, setIsCheckboxLoaded] = useState(false);

    useEffect(() => {
        setIsClient(true);

        const checkExistingAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.access_token) {
                    saveAuthToken(session.access_token);
                    console.log('✅ Sessão existente encontrada, redirecionando...');
                    router.push('/dashboard');
                }
            } catch (error) {
                console.error('Erro ao verificar sessão:', error);
            }
        };

        checkExistingAuth();

        if (typeof window !== 'undefined') {
            const savedEmail = localStorage.getItem('email');
            if (savedEmail) {
                setValue('email', savedEmail);
                setRememberMe(true);
            }
            setIsCheckboxLoaded(true); 
        }
    }, [setValue, router]);

    const saveAuthToken = (accessToken: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', accessToken);
            console.log('✅ Access token salvo no localStorage');
        }
    };

    const clearAuthTokens = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            sessionStorage.removeItem('access_token');
            localStorage.removeItem('user_email');
            console.log('🔐 Tokens removidos');
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

            console.log('Login com Google iniciado:', data);

        } catch (error) {
            console.error('Erro no login com Google:', error);
            setServerError(error instanceof Error ? error.message : 'Erro ao conectar com Google');
            clearAuthTokens();
        } finally {
            setSocialLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setServerError(null);

        try {
            console.log('Tentando login:', data);

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

            if (!isEmail) {
                console.log('Buscando email para username:', loginIdentifier);

                const { data: userData, error: userError } = await supabase
                    .from('user_profile')
                    .select('email')
                    .eq('username', loginIdentifier)
                    .single();

                if (userError) {
                    if (userError.code === 'PGRST116') {
                        throw new Error('Username não encontrado');
                    }
                    throw new Error('Erro ao buscar usuário');
                }

                if (!userData?.email) {
                    throw new Error('Email não encontrado para este username');
                }

                emailToUse = userData.email;
                console.log('Email encontrado:', emailToUse);
            }

            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: emailToUse,
                password: password
            });

            if (authError) {
                if (authError.message === 'Invalid login credentials') {
                    throw new Error('Email/Username ou senha incorretos');
                } else if (authError.message === 'Email not confirmed') {
                    throw new Error('Email não confirmado. Verifique sua caixa de entrada.');
                } else {
                    throw new Error(authError.message);
                }
            }

            console.log('✅ Login bem-sucedido:', authData);

            if (authData.session?.access_token) {
                saveAuthToken(authData.session.access_token);
                console.log('🎯 Access Token salvo');
                
                if (authData.user?.email) {
                    localStorage.setItem('user_email', authData.user.email);
                }
            } else {
                console.warn('⚠️ Access token não encontrado na resposta');
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            router.push('/dashboard');

        } catch (error) {
            console.error('❌ Erro no login:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setServerError(errorMessage);
            
            clearAuthTokens();
            
            if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network')) {
                setServerError('Erro de conexão. Verifique sua internet e tente novamente.');
            }
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

    if (!isClient) {
        return (
            <div className={styles.loginFormContainer}>
                <div className={styles.logoContainer}>
                    <Image
                        src={ListoIcon}
                        alt="Listo Icon"
                        width={200}
                        height={200}
                        priority
                    />
                </div>
                <Box className={styles.buttonsContainer}>
                    <Image src={CheckBox} width={150} height={150} alt="Icon checkbox loading" />
                </Box>
            </div>
        );
    }

    return (
        <>
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)'
                }}
                open={isLoading || socialLoading}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <Image src={CheckBox} width={150} height={150} alt="Icon checkbox loading" />
                    <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
                        {isLoading ? 'Entrando...' : 'Conectando...'}
                    </Typography>
                </Box>
            </Backdrop>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.loginFormContainer}>
                <div className={styles.logoContainer}>
                    <Image
                        src={ListoIcon}
                        alt="Listo Icon"
                        width={200}
                        height={200}
                        priority
                    />
                </div>

                {serverError && (
                    <Typography 
                        color="error" 
                        variant="body2" 
                        sx={{ 
                            mb: 2, 
                            textAlign: 'center',
                            padding: '8px 12px',
                            backgroundColor: 'rgba(211, 47, 47, 0.1)',
                            borderRadius: '4px',
                            border: '1px solid rgba(211, 47, 47, 0.3)'
                        }}
                    >
                        {serverError}
                    </Typography>
                )}

                <Box className={styles.loginFieldsUser}>
                    <TextField
                        {...register("email", {
                            required: "Email é obrigatório",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Email inválido"
                            }
                        })}
                        label="Email ou Username"
                        variant="outlined"
                        fullWidth
                        error={!!errors.email}
                        helperText={errors.email?.message as string}
                        onChange={clearErrorOnType}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        {...register("password", {
                            required: "Senha é obrigatória",
                            minLength: {
                                value: 6,
                                message: "Senha deve ter pelo menos 6 caracteres"
                            }
                        })}
                        label="Senha"
                        type="password"
                        variant="outlined"
                        fullWidth
                        error={!!errors.password}
                        helperText={errors.password?.message as string}
                        onChange={clearErrorOnType}
                        sx={{ mb: 2 }}
                    />

                    {isCheckboxLoaded && (
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={rememberMe}
                                        onChange={handleRememberMeChange}
                                        sx={{
                                            color: '#CBD5E1',
                                            '&.Mui-checked': {
                                                color: '#3B82F6',
                                            },
                                            '&:hover': {
                                                backgroundColor: 'rgba(59, 130, 246, 0.04)',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                fontSize: 30,
                                                borderRadius: '4px',
                                            },
                                        }}
                                    />
                                }
                                label="Lembrar de mim?"
                                className={styles.checkboxContainer}
                                sx={{
                                    '& .MuiFormControlLabel-label': {
                                        fontSize: '14px',
                                        color: '#374151',
                                        fontWeight: 400,
                                        fontFamily: "'Inter', sans-serif",
                                    },
                                }}
                            />
                        </FormGroup>
                    )}
                </Box>

                <Box className={styles.buttonsContainer}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={styles.buttonLogin}
                        disabled={isLoading}
                        fullWidth
                        sx={{
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 600,
                            mb: 2
                        }}
                    >
                        {isLoading ? 'ENTRANDO...' : 'ENTRAR'}
                    </Button>

                    <Button
                        variant="outlined"
                        color="primary"
                        className={styles.googleButton}
                        onClick={handleGoogleLogin}
                        disabled={socialLoading}
                        fullWidth
                        sx={{
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 600,
                            borderColor: '#4285F4',
                            color: '#4285F4',
                            '&:hover': {
                                borderColor: '#3367D6',
                                backgroundColor: 'rgba(66, 133, 244, 0.04)'
                            }
                        }}
                        startIcon={<GoogleIcon />}
                    >
                        {socialLoading ? 'CONECTANDO...' : 'CONTINUAR COM GOOGLE'}
                    </Button>
                </Box>

                <hr className={styles.horizontalLine} />

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2, color: '#6B7280' }}>
                        Não tem uma conta?
                    </Typography>
                    <Link href="/register" passHref>
                        <Button 
                            variant="outlined" 
                            color="secondary"
                            fullWidth
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600
                            }}
                        >
                            CRIAR CONTA
                        </Button>
                    </Link>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Link href="/forgot-password" passHref>
                        <Button 
                            variant="text" 
                            color="primary"
                            size="small"
                        >
                            Esqueci minha senha
                        </Button>
                    </Link>
                </Box>
            </form>
        </>
    );
};