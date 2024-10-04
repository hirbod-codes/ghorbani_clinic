import { HomeOutlined, PersonOutlined, MasksOutlined, AccessTimeOutlined, DisplaySettingsOutlined, StorageOutlined, FormatPaintOutlined, DarkModeOutlined, LightModeOutlined, LoginOutlined, LogoutOutlined, MenuOutlined } from '@mui/icons-material';
import { alpha, darken, lighten, Drawer, Stack, List, ListItemButton, ListItemIcon, ListItemText, CircularProgress, useTheme, Box, AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import { t } from 'i18next';
import { useContext, useState } from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import { ConfigurationContext } from '../Contexts/ConfigurationContext';
import { resources } from '../../Electron/Database/Repositories/Auth/resources';
import { getReactLocale } from '../Lib/helpers';
import { useNavigate } from 'react-router-dom';


export function Navigation() {
    const navigate = useNavigate();

    const auth = useContext(AuthContext)
    const theme = useTheme()
    const configuration = useContext(ConfigurationContext)

    // Navigation
    const [openDrawer, setOpenDrawer] = useState(false)

    const readsUsers = auth.accessControl && auth.user && auth.accessControl.can(auth.user.roleName).read(resources.USER).granted
    const readsPatients = auth.accessControl && auth.user && auth.accessControl.can(auth.user.roleName).read(resources.PATIENT).granted
    const readsVisits = auth.accessControl && auth.user && auth.accessControl.can(auth.user.roleName).read(resources.VISIT).granted

    console.log('App', { auth, theme, configuration })

    const appBarBorderColor = theme.palette.mode === 'dark' ? '#fff' : '#000'
    const appBarGradientColor = alpha(theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black, 0.7)
    const drawerGradientColor = theme.palette.mode === 'dark' ? darken(theme.palette.common.white, 0.7) : lighten(theme.palette.common.black, 0.7)

    const moveTo = (destination: string) => {
        setOpenDrawer(false)

        setTimeout(() => {
            navigate(destination)
        }, 50)
    }

    return (
        <>
            <Box sx={{ background: `radial-gradient(ellipse farthest-side at top, ${appBarGradientColor}, 5%, transparent)` }}>
                <Drawer
                    open={openDrawer}
                    onClose={() => setOpenDrawer(false)}
                    transitionDuration={250}
                    PaperProps={{ sx: { background: theme.palette.background.default, boxShadow: '0' } }}
                    componentsProps={{ backdrop: { sx: { background: 'transparent' } } }}
                >
                    <Stack direction={'row'} alignItems='center' sx={{ height: '100%', background: `linear-gradient(90deg, ${drawerGradientColor}, 50%, transparent)` }}>
                        <List sx={{ pt: 3, pr: 4, overflow: 'auto', height: '100%' }}>
                            <Box sx={{ mb: 8 }} />

                            <ListItemButton onClick={() => moveTo('/')}>
                                <ListItemIcon>
                                    <HomeOutlined />
                                </ListItemIcon>
                                <ListItemText color='white' primary={t('home')} />
                            </ListItemButton>

                            <Box sx={{ mb: 8 }} />

                            {readsUsers &&
                                <ListItemButton onClick={() => moveTo('Users')}>
                                    <ListItemIcon>
                                        <PersonOutlined />
                                    </ListItemIcon>
                                    <ListItemText color='white' primary={t('users')} />
                                </ListItemButton>}

                            <Box sx={{ mb: 2 }} />

                            {readsPatients &&
                                <ListItemButton onClick={() => moveTo('/Patients')}>
                                    <ListItemIcon>
                                        <MasksOutlined />
                                    </ListItemIcon>
                                    <ListItemText color='white' primary={t('patients')} />
                                </ListItemButton>}

                            <Box sx={{ mb: 2 }} />

                            {readsVisits &&
                                <ListItemButton onClick={() => moveTo('/Visits')}>
                                    <ListItemIcon>
                                        <AccessTimeOutlined />
                                    </ListItemIcon>
                                    <ListItemText color='white' primary={t('visits')} />
                                </ListItemButton>}

                            <Box sx={{ mb: 8 }} />

                            <ListItemButton onClick={() => moveTo('/General')}>
                                <ListItemIcon>
                                    <DisplaySettingsOutlined />
                                </ListItemIcon>
                                <ListItemText color='white' primary={t("general")} />
                            </ListItemButton>

                            <ListItemButton onClick={() => moveTo('/ThemeSettings')}>
                                <ListItemIcon>
                                    <FormatPaintOutlined />
                                </ListItemIcon>
                                <ListItemText color='white' primary={t("Theme")} />
                            </ListItemButton>

                            <Box sx={{ mb: 8 }} />

                            <ListItemButton onClick={() => moveTo('/DbSettings')}>
                                <ListItemIcon>
                                    <StorageOutlined />
                                </ListItemIcon>
                                <ListItemText color='white' primary={t("Db")} />
                            </ListItemButton>
                        </List>
                        <Box sx={{ height: '100%', width: '2px', background: `radial-gradient(ellipse farthest-side at center, ${appBarBorderColor}, transparent)` }} />
                    </Stack>
                </Drawer>

                {/* top margin is 2rem, because menu bar has a height of 2rem and is positioned fixed */}
                <Box sx={{ height: '2rem' }} />

                <AppBar position='relative' sx={{ borderBottom: 0, boxShadow: '0', background: '#00000000' }}>
                    <Toolbar>
                        <IconButton size='medium' onClick={() => setOpenDrawer(true)} sx={{ mr: 2 }}>
                            <MenuOutlined fontSize='inherit' />
                        </IconButton>
                        <Typography color={theme.palette.text.primary} variant='h6' component='div' sx={{ flexGrow: 1 }}>
                            {/* Title */}
                            {auth.user?.username}
                        </Typography>
                        {
                            auth.user &&
                            <IconButton size='medium' onClick={async () => await auth.logout()}>
                                {
                                    auth?.isAuthLoading
                                        ? <CircularProgress size='small' />
                                        : <LogoutOutlined fontSize='inherit' />
                                }
                            </IconButton>
                        }
                        {
                            !auth.isAuthLoading && !auth.user &&
                            <IconButton size='medium' onClick={() => auth.showModal()}>
                                {
                                    auth?.isAuthLoading
                                        ? <CircularProgress size='small' />
                                        : <LoginOutlined fontSize='inherit' />
                                }
                            </IconButton>
                        }
                        <IconButton size='medium' onClick={() => configuration.set.updateTheme(theme.palette.mode == 'dark' ? 'light' : 'dark', configuration.get.locale.direction, getReactLocale(configuration.get.locale.code))}>
                            {theme.palette.mode == 'light' ? <LightModeOutlined fontSize='inherit' /> : <DarkModeOutlined fontSize='inherit' />}
                        </IconButton>
                    </Toolbar>
                </AppBar>
            </Box >

            <div style={{ height: '2px', background: `radial-gradient(ellipse farthest-side at center, ${appBarBorderColor}, transparent)`, margin: '0 1rem' }} />
        </>
    );
}
