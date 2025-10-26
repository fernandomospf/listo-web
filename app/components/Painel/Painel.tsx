'use client';
import { supabase } from '@/lib/supabaseClient';
import { Button, Typography } from '@mui/material';
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

function Painel() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const { taskSelected, setRefetch, refetch, selectedTasks } = useStore();

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
            <UpdateTask open={openUpdateModal} handleClose={setOpenUpdateModal}/>
            <Box className={styles['container-title']}>
                <Typography variant='h5' className={styles.title}>
                    Bem-vindo, {user?.user_metadata?.name || user?.email || 'Usuário'}
                </Typography>
                <hr className={styles['horizontal-line']} />
            </Box>
            <Box className={styles['container-action']}>
                <Button
                    variant='contained'
                    className={styles.button}
                    onClick={() => setOpenCreateModal(true)}
                >
                    Criar nova atividade
                </Button>
                <Button
                    variant='contained'
                    className={styles.button}
                    disabled={!taskSelected || taskSelected.length === 0}
                    onClick={() => setOpenUpdateModal(true)}
                >
                    Alterar uma atividade
                </Button>
                <Button
                    variant='contained'
                    className={styles.button}
                    disabled={!taskSelected || taskSelected.length === 0}
                    onClick={() => handleCompletedTask()}
                >
           
                    Concluir uma atividade
                </Button>
                <Button
                    variant='contained'
                    className={`${styles.button} ${styles['button-delete']} `}
                    disabled={!taskSelected || taskSelected.length === 0}
                    onClick={handleDelete}
                >
                    Deletar uma atividade
                </Button>
            </Box>
        </Box>
    );
}

export default Painel;