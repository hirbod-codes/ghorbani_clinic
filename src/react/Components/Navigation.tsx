import { HomeOutlined, PersonOutlined, MasksOutlined, AccessTimeOutlined, SettingsOutlined, ExpandLess, ExpandMore, DisplaySettingsOutlined, StorageOutlined, RepeatOutlined, DeleteOutline, FormatPaintOutlined, DarkModeOutlined, LightModeOutlined, LoginOutlined, LogoutOutlined, MenuOutlined } from '@mui/icons-material';
import { alpha, darken, lighten, Drawer, Stack, List, ListItemButton, ListItemIcon, ListItemText, Collapse, colors, Dialog, DialogTitle, DialogActions, Button, CircularProgress, useTheme, Box, AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import { t } from 'i18next';
import { useContext, useState } from 'react';
import { dbAPI } from 'src/Electron/Database/dbAPI';
import { AuthContext } from '../Contexts/AuthContext';
import { ConfigurationContext } from '../Contexts/ConfigurationContext';
import { NavigationContext } from '../Contexts/NavigationContext';
import { RESULT_EVENT_NAME } from '../Contexts/ResultWrapper';
import { publish } from '../Lib/Events';
import { resources } from '../../Electron/Database/Repositories/Auth/resources';
import { getReactLocale } from '../Lib/helpers';
import { useNavigate } from 'react-router-dom';


export function Navigation() {
    const navigate = useNavigate();

    const nav = useContext(NavigationContext)
    const auth = useContext(AuthContext)
    const theme = useTheme()
    const configuration = useContext(ConfigurationContext)
    const setContent = useContext(NavigationContext)?.setContent ?? ((o: any) => { })

    // Navigation
    const [openDrawer, setOpenDrawer] = useState(false)
    const [openSettingsList, setOpenSettingsList] = useState(false)
    const [openDbList, setOpenDbList] = useState(false)

    // DB Questions
    const [openSeedQuestion, setOpenSeedQuestion] = useState<boolean>(false)
    const [openTruncateDbQuestion, setOpenTruncateDbQuestion] = useState<boolean>(false)

    const [seeding, setSeeding] = useState<boolean>(false)
    const [truncating, setTruncating] = useState<boolean>(false)

    const readsUsers = auth.accessControl && auth.user && auth.accessControl.can(auth.user.roleName).read(resources.USER).granted
    const readsPatients = auth.accessControl && auth.user && auth.accessControl.can(auth.user.roleName).read(resources.PATIENT).granted
    const readsVisits = auth.accessControl && auth.user && auth.accessControl.can(auth.user.roleName).read(resources.VISIT).granted

    console.log('App', { nav, auth, theme, configuration, setContent, openDrawer, openSettingsList })

    const appBarBorderColor = theme.palette.mode === 'dark' ? '#fff' : '#000'
    const appBarGradientColor = alpha(theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black, 0.5)
    const drawerGradientColor1 = theme.palette.mode === 'dark' ? darken(theme.palette.common.white, 0.7) : lighten(theme.palette.common.black, 0.3)
    const drawerGradientColor2 = theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.common.white
    const backDropColor = alpha(theme.palette.mode === 'dark' ? '#000' : '#fff', 0.3)

    return (
        <>
            <Box sx={{ background: `radial-gradient(ellipse farthest-side at top, ${appBarGradientColor}, 1%, transparent)` }}>
                <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)} PaperProps={{ sx: { background: 'transparent', boxShadow: '0' } }}>
                    <Stack direction={'row'} alignItems='center' sx={{ height: '100%', background: `linear-gradient(90deg, ${drawerGradientColor1}, 50%, transparent)` }}>
                        <List sx={{ pt: 3, overflow: 'auto', height: '60%' }}>
                            <ListItemButton onClick={() => {
                                navigate('/')
                                setOpenDrawer(false)
                            }} sx={{ mb: 4 }}>
                                <ListItemIcon>
                                    <HomeOutlined />
                                </ListItemIcon>
                                <ListItemText primary={t('home')} />
                            </ListItemButton>
                            {readsUsers &&
                                <ListItemButton onClick={() => {
                                    navigate('Users')
                                    setOpenDrawer(false)
                                }} sx={{ mb: 4 }}>
                                    <ListItemIcon>
                                        <PersonOutlined />
                                    </ListItemIcon>
                                    <ListItemText primary={t('users')} />
                                </ListItemButton>}
                            {readsPatients &&
                                <ListItemButton onClick={() => {
                                    navigate('/Patients')
                                    setOpenDrawer(false)
                                }} sx={{ mb: 4 }}>
                                    <ListItemIcon>
                                        <MasksOutlined />
                                    </ListItemIcon>
                                    <ListItemText primary={t('patients')} />
                                </ListItemButton>}
                            {readsVisits &&
                                <ListItemButton onClick={() => {
                                    navigate('/Visits')
                                    setOpenDrawer(false)
                                }} sx={{ mb: 4 }}>
                                    <ListItemIcon>
                                        <AccessTimeOutlined />
                                    </ListItemIcon>
                                    <ListItemText primary={t('visits')} />
                                </ListItemButton>}
                            <ListItemButton onClick={() => setOpenSettingsList(!openSettingsList)} sx={{ mb: 4 }}>
                                <ListItemIcon>
                                    <SettingsOutlined />
                                </ListItemIcon>
                                <ListItemText primary={t('settings')} />
                                {openSettingsList ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                            <Collapse in={openSettingsList} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <ListItemButton sx={{ pl: 4 }} onClick={() => {
                                        navigate('/General')
                                        setOpenDrawer(false)
                                    }}>
                                        <ListItemIcon>
                                            <DisplaySettingsOutlined />
                                        </ListItemIcon>
                                        <ListItemText primary={t("general")} />
                                    </ListItemButton>
                                    <ListItemButton sx={{ pl: 4 }} onClick={() => { setOpenDbList(!openDbList); }}>
                                        <ListItemIcon>
                                            <StorageOutlined />
                                        </ListItemIcon>
                                        <ListItemText primary={t("Db")} />
                                        {openDbList ? <ExpandLess /> : <ExpandMore />}
                                    </ListItemButton>
                                    <Collapse in={openDbList} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            <ListItemButton sx={{ pl: 8 }} onClick={() => {
                                                navigate('/DbSettings')
                                                setOpenDrawer(false)
                                            }}>
                                                <ListItemIcon>
                                                    <SettingsOutlined />
                                                </ListItemIcon>
                                                <ListItemText primary={t("Settings")} />
                                            </ListItemButton>
                                            <ListItemButton sx={{ pl: 8 }} onClick={() => setOpenSeedQuestion(true)}>
                                                <ListItemIcon>
                                                    <RepeatOutlined />
                                                </ListItemIcon>
                                                <ListItemText primary={t("Seed")} />
                                            </ListItemButton>
                                            <ListItemButton sx={{ pl: 8, color: colors.red[400] }} onClick={() => setOpenTruncateDbQuestion(true)}>
                                                <ListItemIcon>
                                                    <DeleteOutline />
                                                </ListItemIcon>
                                                <ListItemText primary={t("Truncate")} />
                                            </ListItemButton>
                                        </List>
                                    </Collapse>
                                    <ListItemButton sx={{ pl: 4 }} onClick={() => {
                                        navigate('/ThemeSettings')
                                        setOpenDrawer(false)
                                    }}>
                                        <ListItemIcon>
                                            <FormatPaintOutlined />
                                        </ListItemIcon>
                                        <ListItemText primary={t("Theme")} />
                                    </ListItemButton>
                                </List>
                            </Collapse>
                        </List>
                        <Box sx={{ height: '100%', width: '2px', background: `radial-gradient(ellipse farthest-side at center, ${appBarBorderColor}, transparent)` }} />
                    </Stack>
                </Drawer>

                <Dialog
                    open={openSeedQuestion}
                    onClose={() => setOpenSeedQuestion(false)}
                >
                    <DialogTitle>
                        {t('doYouWantToSeedDB')}
                    </DialogTitle>
                    <DialogActions>
                        <Button
                            onClick={async () => {
                                try {
                                    setSeeding(true);
                                    const result = await (window as typeof window & { dbAPI: dbAPI; }).dbAPI.seed();
                                    setSeeding(false);

                                    if (result === true)
                                        setOpenSeedQuestion(false);

                                    else
                                        publish(RESULT_EVENT_NAME, {
                                            severity: 'error',
                                            message: t('failedToSeedDB')
                                        });
                                } catch (error) {
                                    console.error(error);
                                    setSeeding(false);
                                }
                            }}
                        >
                            {seeding ? <CircularProgress size={35} /> : t('yes')}
                        </Button>
                        <Button onClick={() => setOpenSeedQuestion(false)}>{t('no')}</Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={openTruncateDbQuestion}
                    onClose={() => setOpenTruncateDbQuestion(false)}
                >
                    <DialogTitle>
                        {t('doYouWantToTruncateDB')}
                    </DialogTitle>
                    <DialogActions>
                        <Button color='error' onClick={async () => {
                            try {
                                setTruncating(true);
                                const result = await (window as typeof window & { dbAPI: dbAPI; }).dbAPI.truncate();
                                setTruncating(false);

                                if (result === true) {
                                    setOpenTruncateDbQuestion(false);
                                    await auth.logout();
                                    window.location.reload();
                                }

                                else
                                    publish(RESULT_EVENT_NAME, {
                                        severity: 'error',
                                        message: t('failedToSeedDB')
                                    });
                            } catch (error) {
                                console.error(error);
                                setTruncating(false);
                            }
                        }}>
                            {truncating ? <CircularProgress size={35} /> : t('yes')}
                        </Button>
                        <Button onClick={() => setOpenTruncateDbQuestion(false)}>{t('no')}</Button>
                    </DialogActions>
                </Dialog>

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
            </Box>

            <div style={{ height: '2px', background: `radial-gradient(ellipse farthest-side at center, ${appBarBorderColor}, transparent)`, margin: '0 1rem' }} />
        </>
    );
}
