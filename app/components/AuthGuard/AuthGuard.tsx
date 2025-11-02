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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!mounted) return;

      const checkAuth = async () => {
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            router.push('/');
            return;
          }

          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error || !session) {
            localStorage.removeItem('access_token');
            router.push('/');
            return;
          }

          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('access_token');
          router.push('/');
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, [mounted, router]);

    if (!mounted || isLoading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh'
        }}>
          <CircularProgress size={40} />
        </Box>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}