'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    throw error;
                }

                if (session) {
                    if (session.access_token) {
                        localStorage.setItem('access_token', session.access_token);
                    } else {
                        console.warn('⚠️ Access token não encontrado na sessão');
                    }

                    if (session.user?.email) {
                        localStorage.setItem('user_email', session.user.email);
                    }

                    router.push('/dashboard');
                } else {
                    router.push('/');
                }
            } catch (error) {
                console.error('Erro no callback:', error);
                
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_email');
                
                router.push('/login?error=auth_failed');
            }
        };

        handleAuthCallback();
    }, [router]);

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh' 
        }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
                Processando login...
            </Typography>
        </Box>
    );
}