import { HomeOutlined, PersonOutlined, MasksOutlined, AccessTimeOutlined, DisplaySettingsOutlined, StorageOutlined, FormatPaintOutlined, DarkModeOutlined, LightModeOutlined, LoginOutlined, LogoutOutlined, MenuOutlined, SettingsBackupRestoreOutlined } from '@mui/icons-material';
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
    const readsMedicalHistories = auth.accessControl && auth.user && auth.accessControl.can(auth.user.roleName).read(resources.MEDICAL_HISTORY).granted

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

    const activeColor = theme.palette.primary[theme.palette.mode]

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
                        <List sx={{ overflow: 'auto', height: '100%' }}>
                            <Box sx={{ mb: 8 }} />

                            <ListItemButton sx={{ pr: 8 }} onClick={() => moveTo('/')}>
                                <ListItemIcon sx={{ color: window.location.pathname !== '/' ? 'white' : activeColor }} >
                                    <HomeOutlined />
                                </ListItemIcon>
                                <ListItemText sx={{ color: window.location.pathname !== '/' ? 'white' : activeColor }} primary={t('Navigation.home')} />
                            </ListItemButton>

                            <Box sx={{ mb: 8 }} />

                            {readsUsers &&
                                <ListItemButton sx={{ pr: 8 }} onClick={() => moveTo('/Users')} >
                                    <ListItemIcon sx={{ color: window.location.pathname !== '/Users' ? 'white' : activeColor }}>
                                        <PersonOutlined />
                                    </ListItemIcon>
                                    <ListItemText sx={{ color: window.location.pathname !== '/Users' ? 'white' : activeColor }} primary={t('Navigation.users')} />
                                </ListItemButton>}

                            <Box sx={{ mb: 2 }} />

                            {readsPatients &&
                                <ListItemButton sx={{ pr: 8 }} onClick={() => moveTo('/Patients')} >
                                    <ListItemIcon sx={{ color: window.location.pathname !== '/Patients' ? 'white' : activeColor }}>
                                        <MasksOutlined />
                                    </ListItemIcon>
                                    <ListItemText sx={{ color: window.location.pathname !== '/Patients' ? 'white' : activeColor }} primary={t('Navigation.patients')} />
                                </ListItemButton>}

                            <Box sx={{ mb: 2 }} />

                            {readsVisits &&
                                <ListItemButton sx={{ pr: 8 }} onClick={() => moveTo('/Visits')} >
                                    <ListItemIcon sx={{ color: window.location.pathname !== '/Visits' ? 'white' : activeColor }}>
                                        <AccessTimeOutlined />
                                    </ListItemIcon>
                                    <ListItemText sx={{ color: window.location.pathname !== '/Visits' ? 'white' : activeColor }} primary={t('Navigation.visits')} />
                                </ListItemButton>}

                            <Box sx={{ mb: 2 }} />

                            {readsMedicalHistories &&
                                <ListItemButton sx={{ pr: 8 }} onClick={() => moveTo('/MedicalHistories')} >
                                    <ListItemIcon sx={{ color: window.location.pathname !== '/MedicalHistories' ? 'white' : activeColor }}>
                                        <SettingsBackupRestoreOutlined />
                                    </ListItemIcon>
                                    <ListItemText sx={{ color: window.location.pathname !== '/MedicalHistories' ? 'white' : activeColor }} primary={t('Navigation.MedicalHistories')} />
                                </ListItemButton>}

                            <Box sx={{ mb: 8 }} />

                            <ListItemButton sx={{ pr: 8 }} onClick={() => moveTo('/General')} >
                                <ListItemIcon sx={{ color: window.location.pathname !== '/General' ? 'white' : activeColor }}>
                                    <DisplaySettingsOutlined />
                                </ListItemIcon>
                                <ListItemText sx={{ color: window.location.pathname !== '/General' ? 'white' : activeColor }} primary={t("Navigation.general")} />
                            </ListItemButton>

                            <ListItemButton sx={{ pr: 8 }} onClick={() => moveTo('/ThemeSettings')} >
                                <ListItemIcon sx={{ color: window.location.pathname !== '/ThemeSettings' ? 'white' : activeColor }}>
                                    <FormatPaintOutlined />
                                </ListItemIcon>
                                <ListItemText sx={{ color: window.location.pathname !== '/ThemeSettings' ? 'white' : activeColor }} primary={t("Navigation.Theme")} />
                            </ListItemButton>

                            <Box sx={{ mb: 8 }} />

                            <ListItemButton sx={{ pr: 8 }} onClick={() => moveTo('/DbSettings')} >
                                <ListItemIcon sx={{ color: window.location.pathname !== '/DbSettings' ? 'white' : activeColor }}>
                                    <StorageOutlined />
                                </ListItemIcon>
                                <ListItemText sx={{ color: window.location.pathname !== '/DbSettings' ? 'white' : activeColor }} primary={t("Navigation.Db")} />
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
