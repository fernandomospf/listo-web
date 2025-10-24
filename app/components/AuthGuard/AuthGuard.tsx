'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { CircularProgress, Box, Typography } from '@mui/material';

export default function withAuth(WrappedComponent: React.ComponentType<any>) {
  return function AuthenticatedComponent(props: any) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          console.log('🔐 Verificando autenticação...');
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          console.log('Sessão:', session);
          console.log('Erro:', error);

          if (error) {
            console.error('Erro ao verificar sessão:', error);
            router.push('/');
            return;
          }

          if (!session) {
            console.log('❌ Nenhuma sessão encontrada, redirecionando...');
            router.push('/');
            return;
          }

          console.log('✅ Usuário autenticado:', session.user.email);
          setIsAuthenticated(true);
          
        } catch (error) {
          console.error('❌ Erro na verificação de autenticação:', error);
          router.push('/');
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, [router]);

    // Loading enquanto verifica autenticação
    if (isLoading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          gap: 2
        }}>
          <CircularProgress size={40} />
          <Typography variant="body1" color="text.secondary">
            Verificando autenticação...
          </Typography>
        </Box>
      );
    }

    // Se não estiver autenticado, não renderiza nada (já redirecionou)
    if (!isAuthenticated) {
      return null;
    }

    // Renderiza o componente protegido
    return <WrappedComponent {...props} />;
  };
}