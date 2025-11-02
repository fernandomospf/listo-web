'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { CircularProgress, Box, Typography, Button } from '@mui/material';

export default function withAuth(WrappedComponent: React.ComponentType<any>) {
  return function AuthenticatedComponent(props: any) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          console.log('🔐 Verificando autenticação...', { path: pathname });
          
          const token = localStorage.getItem('access_token');
          if (!token) {
            await handleUnauthorized();
            return;
          }

          const { data: { session }, error } = await supabase.auth.getSession();
          
          console.log('Sessão:', session ? '✅ Ativa' : '❌ Inativa');
          
          if (error) {
            console.error('Erro ao verificar sessão:', error);
            await handleUnauthorized(error.message);
            return;
          }

          if (!session) {
            console.log('Nenhuma sessão válida encontrada');
            await handleUnauthorized();
            return;
          }

          if (session.access_token !== token) {
            localStorage.setItem('access_token', session.access_token);
          }

          console.log('✅ Usuário autenticado:', session.user?.email);
          setIsAuthenticated(true);
          
        } catch (error) {
          console.error('Erro na verificação de autenticação:', error);
          await handleUnauthorized();
        } finally {
          setIsLoading(false);
        }
      };

      const handleUnauthorized = async (errorMessage?: string) => {
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('access_token');
        
        console.log('🔐 Redirecionando para login...');
        
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.log('Erro ao fazer signOut:', signOutError);
        }

        const returnUrl = encodeURIComponent(pathname);
        const errorParam = errorMessage ? `&error=${encodeURIComponent(errorMessage)}` : '';
        router.push(`/?returnUrl=${returnUrl}${errorParam}`);
      };

      checkAuth();
    }, [router, pathname, retryCount]);

    useEffect(() => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 Usuário deslogado, redirecionando...');
          setIsAuthenticated(false);
          localStorage.removeItem('access_token');
          router.push('/');
        } else if (event === 'SIGNED_IN' && session) {
          console.log('👋 Usuário logado, atualizando token...');
          localStorage.setItem('access_token', session.access_token);
          setIsAuthenticated(true);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token atualizado');
          if (session) {
            localStorage.setItem('access_token', session.access_token);
          }
        }
      });

      return () => subscription.unsubscribe();
    }, [router]);

    const handleRetry = () => {
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
    };

    if (isLoading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          gap: 2,
          padding: 3
        }}>
          <CircularProgress size={40} />
          <Typography variant="body1" color="text.secondary" align="center">
            Verificando autenticação...
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {retryCount > 0 && `Tentativa ${retryCount + 1}`}
          </Typography>
        </Box>
      );
    }

    if (!isAuthenticated) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          gap: 3,
          padding: 3
        }}>
          <Typography variant="h6" color="error" align="center">
            Falha na autenticação
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Não foi possível verificar sua autenticação. 
            {retryCount < 3 ? ' Tente novamente.' : ' Por favor, faça login novamente.'}
          </Typography>
          
          {retryCount < 3 ? (
            <Button 
              variant="contained" 
              onClick={handleRetry}
              sx={{ mt: 2 }}
            >
              Tentar Novamente
            </Button>
          ) : (
            <Button 
              variant="outlined" 
              onClick={() => router.push('/')}
              sx={{ mt: 2 }}
            >
              Ir para Login
            </Button>
          )}
        </Box>
      );
    }

    return <WrappedComponent {...props} />;
  };
}