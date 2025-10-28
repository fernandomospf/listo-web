import { Suspense } from 'react';
import { Login } from "./components/Login/Login";
import { Box, CircularProgress, Typography } from '@mui/material';

export default function Home() {
  return (
    <Suspense fallback={
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          margin: '0px', 
          padding: '0px'
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Carregando...
        </Typography>
      </Box>
    }>
      <main style={{ margin: '0px', padding: '0px'}}>
        <Login />
      </main>
    </Suspense>
  );
}