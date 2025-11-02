'use client';
import { supabase } from '@/lib/supabaseClient';
import { Button, IconButton, InputAdornment, InputBase, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import styles from './Painel.module.css';
import IconLoading from '@/public/check-box.gif';
import Image from 'next/image';
import CreateTask from '../CreateTask/CreateTask';
import { useStore } from '@/app/store/useStore';
import { taskApi } from '@/app/api/taskApi';
import UpdateTask from '../UpdatedTask/UpdateTask';
import SearchIcon from '@mui/icons-material/Search';

function Painel() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const { filter, filteredList, taskSelected, setRefetch, refetch, selectedTasks, searchInput } = useStore();

    useEffect(() => {
        setIsMounted(true);

        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user || null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        selectedTasks('')
    }, [refetch])

    if (!isMounted || loading) {
        return (
            <Box className={`${styles.container} ${styles['container-loading']}`}>
                <Image src={IconLoading} width={150} alt="Icon loading" />
                <Typography>Carregando informações...</Typography>
            </Box>
        );
    }

    const handleDelete = async () => {
        await taskApi.deleteTask(taskSelected as string)
        setRefetch();
    }

    const handleCompletedTask = async () => {
        await taskApi.completedTask(taskSelected as string)
        setRefetch();
    }

    return (
        <Box className={styles.container}>
            <CreateTask open={openCreateModal} handleClose={setOpenCreateModal} />
            <UpdateTask open={openUpdateModal} handleClose={setOpenUpdateModal} />
            <Box className={styles['container-action']}>
                <Button
                    variant='contained'
                    className={styles.button}
                    onClick={() => setOpenCreateModal(true)}
                >
                    Criar atividade
                </Button>
                <Button
                    variant='contained'
                    className={styles.button}
                    disabled={!taskSelected || taskSelected.length === 0}
                    onClick={() => setOpenUpdateModal(true)}
                >
                    Alterar atividade
                </Button>
                <Button
                    variant='contained'
                    className={styles.button}
                    disabled={!taskSelected || taskSelected.length === 0}
                    onClick={() => handleCompletedTask()}
                >

                    Concluir atividade
                </Button>
                <Button
                    variant='contained'
                    className={`${styles.button} ${styles['button-delete']} `}
                    disabled={!taskSelected || taskSelected.length === 0}
                    onClick={handleDelete}
                >
                    Deletar atividade
                </Button>

                <InputBase
                    sx={{
                        border: '1px solid #6986973f',
                        borderRadius: '10px',
                        padding: '8px',
                        width: '45%',
                        marginLeft: '70px'
                    }}
                    onChange={(evt) => filter(evt)}
                    placeholder="Busque pelo titulo da atividade..."
                    inputProps={{ 'aria-label': 'search google maps' }}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton type="button" aria-label="search">
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    }
                />
            </Box>
        </Box>
    );
}

export default Painel;