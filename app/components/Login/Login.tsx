'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styles from './Login.module.css';
import { Typography, Checkbox, FormGroup, FormControlLabel } from '@mui/material';
import { Box } from '@mui/system';
import GoogleIcon from '@mui/icons-material/Google';
import ListoIcon from '../../../public/listo-icon.png';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import CoverPageLogin from '@/public/coverPageLogin.svg';
import { InputLogin, LoginButton } from './Login.style';

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
                    console.log('✅ Sessão existente encontrada, redirecionando...');
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
            console.log('🔄 Iniciando login com Google...');

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
                console.error('❌ Erro do Supabase:', error);
                throw new Error(error.message);
            }

            console.log('✅ Fluxo OAuth iniciado com sucesso:', data);


        } catch (error) {
            console.error('❌ Erro no login com Google:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro ao conectar com Google';
            setServerError(errorMessage);
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

    return (
        <Suspense fallback={
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography>Carregando...</Typography>
            </Box>
        }>
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
                                        <InputLogin
                                            {...field}
                                            label="Senha"
                                            type="password"
                                            variant="outlined"
                                            error={!!errors.password}
                                            helperText={errors.password?.message as string}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                clearErrorOnType();
                                            }}
                                        />
                                    )}
                                />
                                {/* TODO: Implementar o esqueceu sua senha */}
                                {/* <Typography
                                className={styles['forget-password']}
                                variant="body1"
                            >
                                Esqueceu sua senha?{' '}
                                <Link
                                    href="/forget-password"
                                    className={styles['forget-password-link']}
                                >
                                    Clique aqui
                                </Link>
                            </Typography> */}

                                {/* Checkbox sempre renderizado, mas com verificação de montagem */}
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={rememberMe}
                                                onChange={handleRememberMeChange}
                                                className={isMounted ? styles['rememberMe'] : ''}
                                                sx={
                                                    isMounted ? undefined : {
                                                        padding: '12px',
                                                        '& .MuiSvgIcon-root': {
                                                            fontSize: '16px',
                                                            borderRadius: '4px',
                                                        },
                                                        color: '#1F2937',
                                                        '&.Mui-checked': {
                                                            color: '#3B82F6',
                                                        },
                                                    }
                                                }
                                            />
                                        }
                                        label="Lembrar de mim?"
                                        className={isMounted ? styles.checkboxContainer : ''}
                                        sx={
                                            isMounted ? undefined : {
                                                '& .MuiFormControlLabel-label': {
                                                    fontSize: '16px',
                                                    color: '#1F2937',
                                                    fontWeight: 400,
                                                    fontFamily: "'Inter', sans-serif",
                                                },
                                            }
                                        }
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
                        <Box className={styles['register-link']}>
                            <Link href="/register" passHref>
                                Registre-se
                            </Link>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Suspense>
    );
};