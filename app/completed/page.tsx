'use client';
import { useEffect, useState } from 'react';
import withAuth from '../components/AuthGuard/AuthGuard'
import Header from '../components/Header/Header';
import { taskApi } from '../api/taskApi';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Task } from '../store/types';

function Completed() {
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>();

  const getAllCompletedTask = async () => {
    setIsLoading(true);
    try {
      const response = await taskApi.getAllTaskComplete();
      setTasks(response);
    } catch (error) {
      console.error(`[COMPLETED PAGE] - ${error}`)
    }
  }

  useEffect(() => {
    getAllCompletedTask();
  }, [])


  const headerTable = [
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
    <div style={{ color: 'black' }}>
      <Header />
      <Box>
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
              {tasks?.map((task) => {
                return (
                  <TableRow
                    key={task.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
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
    </div>
  )
}

export default withAuth(Completed)
