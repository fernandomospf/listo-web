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
    const { register, handleSubmit, watch, setValue } = useForm();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isCheckboxLoaded, setIsCheckboxLoaded] = useState(false); // ✅ Novo state

    // ✅ Detecta quando está no cliente
    useEffect(() => {
        setIsClient(true);

        if (typeof window !== 'undefined') {
            const savedEmail = localStorage.getItem('email');
            if (savedEmail) {
                setValue('email', savedEmail);
                setRememberMe(true);
            }
            setIsCheckboxLoaded(true); // ✅ Marca que o checkbox pode ser renderizado
        }
    }, [setValue]);

    const handleGoogleLogin = async () => {
        setSocialLoading(true);
        setServerError(null);

        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) {
                throw new Error(error.message);
            }

            console.log('Login com Google iniciado:', data);

        } catch (error) {
            console.error('Erro no login com Google:', error);
            setServerError(error instanceof Error ? error.message : 'Erro ao conectar com Google');
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

            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);

        } catch (error) {
            console.error('❌ Erro no login:', error);
            setServerError(error instanceof Error ? error.message : 'Erro desconhecido');
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

    // ✅ Evita renderização no servidor que causa hydration
    if (!isClient) {
        return (
            <div className={styles['login-form-container']}>
                <Image
                    src={ListoIcon}
                    alt="Listo Icon"
                    width={200}
                    height={200}
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
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
                    zIndex: (theme) => theme.zIndex.drawer + 1
                }}
                open={isLoading || socialLoading}
            >
                <Image src={CheckBox} width={150} height={150} alt="Icon checkbox loading" />
            </Backdrop>

            <form onSubmit={handleSubmit(onSubmit)} className={styles['login-form-container']}>
                <Image
                    src={ListoIcon}
                    alt="Listo Icon"
                    width={200}
                    height={200}
                />

                {serverError && (
                    <Typography color="error" variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                        {serverError}
                    </Typography>
                )}

                <Box className={styles['login-fields-user']}>
                    <TextField
                        {...register("email", {
                            required: "Email é obrigatório",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Email inválido"
                            }
                        })}
                        label="Email"
                        variant="outlined"
                        fullWidth
                    />
                    <TextField
                        {...register("password")}
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                    />

                    {/* ✅ Só renderiza o checkbox quando estiver carregado */}
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
                                sx={{
                                    '& .MuiFormControlLabel-label': {
                                        fontSize: '14px',
                                        color: '#374151',
                                        fontWeight: 400,
                                        fontFamily: "'Inter', sans-serif",
                                    },
                                    marginLeft: '-4px',
                                }}
                            />
                        </FormGroup>
                    )}
                </Box>

                <Box sx={{ width: '45%', display: 'flex', gap: '15px', flexDirection: 'column' }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={styles['button-login']}
                        disabled={isLoading}
                        fullWidth
                    >
                        {isLoading ? 'Entrando...' : 'Login'}
                    </Button>

                    <Button
                        variant="outlined"
                        color="primary"
                        className={styles['button-login']}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={handleGoogleLogin}
                        disabled={socialLoading}
                        fullWidth
                    >
                        <GoogleIcon />
                        {socialLoading ? 'Conectando...' : 'Continuar com Google'}
                    </Button>
                </Box>

                <hr style={{ width: '60%', margin: '20px auto', color: '#a1d5f3' }} />

                <Link href="/register" passHref style={{ width: '45%' }}>
                    <Button variant="outlined" color="primary" fullWidth>
                        Cadastro
                    </Button>
                </Link>
            </form>
        </>
    );
};