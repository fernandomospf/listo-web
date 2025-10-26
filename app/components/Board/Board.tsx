'use client';

import { Box } from "@mui/system";
import styles from './Board.module.css';
import { useCallback, useEffect, useState } from 'react';
import {
    Checkbox,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import { useStore } from '@/app/store/useStore';
import CheckLoading from '@/public/check-box.gif';
import Image from "next/image";

function Board() {
    const { tasks, taskSelected, ApiGetAllTask, selectedTasks, refetch } = useStore();
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(() => {
        ApiGetAllTask(setLoading);
    }, []);

    useEffect(() => {
        selectedTasks('')
        fetchData();
    }, [fetchData]);
    const [dots, setDots] = useState('');

    useEffect(() => {
        fetchData();
    }, [refetch])

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => {
                if (prev === '...') return '';
                if (prev === '..') return '...';
                if (prev === '.') return '..';
                return '.';
            });
        }, 300);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Box className={styles.container}>
                <Box sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    textAlign: 'center'
                }}>
                    <Image
                        src={CheckLoading}
                        width={150}
                        height={150}
                        alt="Carregando tasks"
                        style={{
                            margin: '0px',
                            padding: '0px'
                        }}
                        priority
                    />
                    <Typography
                        variant="h6"
                        sx={{
                            textAlign: 'center',
                            color: 'text.secondary',
                            minHeight: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            marginLeft: '30px'
                        }}
                    >
                        Carregando suas tasks
                        <Box component="span" sx={{ minWidth: '30px', textAlign: 'left' }}>
                            {dots}
                        </Box>
                    </Typography>
                </Box>
            </Box>
        );
    }

    const headerTable = [
        {
            key: 'header_check',
            title: 'Check'
        },
        {
            key: 'header_status',
            title: 'Status'
        },
        {
            key: 'header_priority',
            title: 'Prioridade'
        },
        {
            key: 'header_title',
            title: 'Titulo'
        },
        {
            key: 'header_description',
            title: 'Descrição'
        },
        {
            key: 'header_create_at',
            title: 'Data de criação'
        },
        {
            key: 'header_created_at',
            title: 'Criada em'
        },
        {
            key: 'header_updated_at',
            title: 'Ultima atualização'
        },
        {
            key: 'header_limit_date',
            title: 'Data Limite'
        },
        {
            key: 'header_archived_at',
            title: 'Concluída em'
        }
    ];

    const statusMapper = {
        'new': 'Novo',
        'in_progress': 'Em progresso',
        'done': 'Concluído',
        'archived': 'Concluído'
    }
    
    const priorityMapper = {
        '1': 'Baixa',
        '2': 'Médio',
        '3': 'Alta',
        '4': 'Urgente'
    }

    return (
        <Box className={styles.container}>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="tabela de tasks">
                    <TableHead>
                        <TableRow>
                            {headerTable.map((item) => (
                                <TableCell key={item.key} align="center">
                                    <strong>{item.title}</strong>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasks.map((task) => {
                            const isSelected = taskSelected === task.id;
                            const isDisabled = taskSelected !== task.id && taskSelected !== '';
                            return (
                                <TableRow
                                    key={task.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell padding="checkbox" align="center">
                                        <Checkbox
                                            id={task.id}
                                            disabled={isDisabled}
                                            checked={isSelected}
                                            onClick={(evt) => selectedTasks(evt.currentTarget.id)}
                                            onChange={() => {
                                                if (!isSelected) {
                                                    selectedTasks(task.id);
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {statusMapper[task.status as keyof typeof statusMapper]}
                                    </TableCell>
                                    <TableCell align="center">
                                        {priorityMapper[task.priority.toString() as keyof typeof priorityMapper]}
                                    </TableCell>
                                    <TableCell align="center">
                                        {task.title}
                                    </TableCell>
                                    <TableCell align="center">
                                        {task.description}
                                    </TableCell>
                                    <TableCell align="center">
                                        {new Date(task.created_at).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell align="center">
                                        {task.created_at ? new Date(task.created_at).toLocaleDateString('pt-BR') : '-'}
                                    </TableCell>
                                    <TableCell align="center">
                                        {task.updated_at ? new Date(task.updated_at).toLocaleDateString('pt-BR') : '-'}
                                    </TableCell>
                                    <TableCell align="center">
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : '-'}
                                    </TableCell>
                                    <TableCell align="center">
                                        {task.archived_at ? new Date(task.archived_at).toLocaleDateString('pt-BR') : '-'}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default Board;