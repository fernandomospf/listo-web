'use client';
import React from 'react';
import { Box } from '@mui/system';
import withAuth from '../components/AuthGuard/AuthGuard';
import Header from '../components/Header/Header';

function Dashboard() {
    return (
        <Box sx={{ color: 'black'}}>
            <Header/>
            <Box>
                Dashboard
            </Box>
        </Box>
    )
}

export default withAuth(Dashboard);