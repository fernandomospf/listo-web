'use client';
import { Box } from '@mui/system';
import withAuth from '../components/AuthGuard/AuthGuard';
import Header from '../components/Header/Header';
import Painel from '../components/Painel/Painel';
import Board from '../components/Board/Board';

function Dashboard() {
    return (
        <Box sx={{ color: 'black' }}>
            <Header />
            <Box sx={{ display: 'flex', gap: '24px', padding: '30px'}}>
                <Painel />
                <Board />
            </Box>
        </Box>
    )
}

export default withAuth(Dashboard);