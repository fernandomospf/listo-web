'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Box, CircularProgress, Typography } from '@mui/material';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                console.log('🔄 Processando callback OAuth...');

                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('❌ Erro ao obter sessão:', error);
                    throw error;
                }

                if (!session) {
                    const { data: hashData, error: hashError } = await supabase.auth.getUser();

                    if (hashError) {
                        console.error('❌ Erro ao processar hash:', hashError);
                        throw hashError;
                    }

                    if (!hashData.user) {
                        throw new Error('Usuário não autenticado');
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 1000));

                const { data: { session: currentSession } } = await supabase.auth.getSession();

                if (currentSession?.access_token) {
                    localStorage.setItem('access_token', currentSession.access_token);
                    console.log('✅ Access token salvo no localStorage');
                }

                if (currentSession?.user?.email) {
                    localStorage.setItem('user_email', currentSession.user.email);
                    console.log('✅ Email do usuário salvo');
                }

                console.log('✅ Login OAuth bem-sucedido, redirecionando...');
                router.push('/dashboard');

            } catch (error) {
                console.error('❌ Erro no callback OAuth:', error);

                localStorage.removeItem('access_token');
                localStorage.removeItem('user_email');

                router.push('/login?error=oauth_failed');
            }
        };

        handleAuthCallback();
    }, [router, searchParams]);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh'
        }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3 }}>
                Processando autenticação...
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Aguarde enquanto conectamos com sua conta Google
            </Typography>
        </Box>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh'
            }}>
                <CircularProgress size={40} />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Iniciando autenticação...
                </Typography>
            </Box>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}