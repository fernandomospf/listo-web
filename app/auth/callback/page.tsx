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
                    router.push('/dashboard');
                } else {
                    router.push('/');
                }
            } catch (error) {
                console.error('Erro no callback:', error);
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