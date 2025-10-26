'use client';
import React, { useState } from 'react'
import SunnyIcon from '@mui/icons-material/Sunny';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import { Box } from '@mui/system';
import styles from './Header.module.css';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import IconHeader from '@/public/icon-header.png';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

function Header() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [userTheme, setUserTheme] = useState('ligth');
    const open = Boolean(anchorEl);
    const router = useRouter();
    const pathname = usePathname();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const changeTheme = () => {
        if (userTheme === 'ligth') {
            setUserTheme('dark')
            return;
        }

        setUserTheme('ligth');
    }

    const themeIcon = () => {
        return userTheme === 'ligth' ? <SunnyIcon /> : <BedtimeIcon />
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/completed', label: 'Concluídas' },
    ];


    return (
        <Box className={styles['header-nav']}>
            <Box>
                <Image src={IconHeader} width={100} height={60} alt='Icon Listo' />
            </Box>
            <Box>
                <ul className={styles['nav-list']}>
                    {menuItems.map((item) => (
                        <Link href={item.path} key={item.path}>
                            <li
                                className={`${styles['nav-item']} ${pathname === item.path ? styles['nav-item-active'] : ''
                                    }`}
                            >
                                {item.label}
                            </li>
                        </Link>
                    ))}
                </ul>
            </Box>
            <Box>
                <Tooltip title="Configurações">
                    <IconButton
                        onClick={handleClick}
                        sx={{
                            color: '#72c0ecff',
                            '&:hover': {
                                color: '#72c0ecff',
                            }
                        }}
                    >
                        <SettingsIcon />
                    </IconButton>
                </Tooltip>
                <Menu
                    id="demo-positioned-menu"
                    aria-labelledby="demo-positioned-button"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    sx={{ marginTop: '25px', marginLeft: '10px' }}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <MenuItem
                        onClick={changeTheme}
                        className={styles['menu-item']}
                    >
                        {themeIcon()} {userTheme}
                    </MenuItem>
                    <MenuItem
                        onClick={handleClose}
                        className={styles['menu-item']}
                    >
                        <PersonIcon /> Conta
                    </MenuItem>

                    <MenuItem
                        onClick={handleLogout}
                        className={styles['menu-item']}
                    >
                        <LogoutIcon /> Sair
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    )
}

export default Header
