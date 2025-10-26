import IconCheck from '@/public/check-box.gif'
import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import Image from 'next/image'
import { useEffect, useState } from 'react';

function Loading() {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => {
                if (prev === '...') return '.';
                if (prev === '..') return '...';
                if (prev === '.') return '..';
                return '.';
            });
        }, 300);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => {
                if (prev === '...') return '.';
                if (prev === '.') return '..';
                if (prev === '..') return '...';
                return '.';
            });
        }, 300);

        return () => clearInterval(interval);
    }, []);
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: '40px'
        }}>
            <Image src={IconCheck} width={150} alt='Loading icon' />
            <Typography>
                {`Carregando os dados da atividade${dots}`}
            </Typography>
        </Box>
    )
}

export default Loading
