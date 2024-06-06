import { CssBaseline, Modal, PaletteMode, Paper, createTheme, useMediaQuery, AppBar, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Slide, ThemeProvider, Collapse, CircularProgress, Snackbar, Alert } from '@mui/material'
import { useRef, useState } from 'react'
import { Home } from './routes/Home'
import { MenuBar } from './components/MenuBar'
import { LoginForm } from './LoginForm'
import { AuthContext } from '../Electron/Auth/renderer/AuthContext'
import type { authAPI } from '../Electron/Auth/renderer/authAPI'
import type { Calendar, Locale, TimeZone } from './components/Localization/types'
import { Localization, enUS } from '@mui/material/locale';
import { getLocale, getReactLocale } from './components/Localization/types'
import { useTranslation } from "react-i18next";
import { ConfigurationContext } from './ConfigurationContext'
import { Database } from './routes/Settings/Database'
import { General } from './routes/Settings/General'
import { collectionName as patientsCollectionName } from '../Electron/Database/Models/Patient';
import { collectionName as visitsCollectionName } from '../Electron/Database/Models/Visit';
import { Patients } from './routes/Patients'
import { Visits } from './routes/Visits'

import HomeIcon from '@mui/icons-material/HomeOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import MenuIcon from '@mui/icons-material/MenuOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StorageIcon from '@mui/icons-material/StorageOutlined';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettingsOutlined';
import CheckIcon from '@mui/icons-material/CheckOutlined';
import CloseIcon from '@mui/icons-material/CloseOutlined';
import DangerIcon from '@mui/icons-material/DangerousOutlined';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export function App() {
    // Localization
    const { t, i18n } = useTranslation();
    const getInitialMode: PaletteMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'
    const getInitialLocale: Locale = ({ calendar: 'Persian', i18n, t, zone: 'Asia/Tehran', reactLocale: enUS, direction: 'ltr', getLocale, getReactLocale })
    const [configuration, setConfiguration] = useState({
        locale: getInitialLocale,
        theme: createTheme(
            {
                palette: {
                    mode: getInitialMode,
                },
                direction: getInitialLocale.direction
            },
            getInitialLocale.getReactLocale(getInitialLocale.i18n)
        ),
        privileges: []
    })

    const updateTheme = (mode: PaletteMode, direction: 'rtl' | 'ltr', locale: Localization) => {
        setConfiguration(
            {
                ...configuration,
                theme: createTheme(
                    {
                        palette: {
                            mode: mode,
                        },
                        direction: direction
                    },
                    locale
                )
            }
        )
        document.dir = direction
    }
    const updateLocale = (calendar: Calendar, direction: 'rtl' | 'ltr', reactLocale: Localization) => {
        setConfiguration({
            ...configuration,
            locale: {
                ...configuration.locale,
                direction,
                reactLocale,
                calendar,
            },
            theme: createTheme(
                {
                    palette: {
                        mode: configuration.theme.palette.mode,
                    },
                    direction: direction
                },
                configuration.locale.reactLocale
            )
        })
        configuration.locale.i18n.changeLanguage(getLocale(reactLocale))
        document.dir = direction
    }
    const updateTimeZone = (zone: TimeZone) => setConfiguration(
        {
            ...configuration,
            locale: {
                ...configuration.locale,
                zone: zone
            }
        })

    const updateConfiguration = {
        updateTheme,
        updateLocale,
        updateTimeZone
    }

    // Authentication
    const [loggingOut, setLoggingOut] = useState(false)
    const isCalled = useRef(false)
    const [user, setUser] = useState<{ username: string, roleName: string, privileges: string[] }>(null);
    const [authFetched, setAuthFetched] = useState(false);
    (window as typeof window & { authAPI: authAPI }).authAPI.getAuthenticatedUser().then(async (u) => {
        if (!isCalled.current && u != null && user == null) {
            isCalled.current = true

            setUser({
                ...u,
                privileges: await (window as typeof window & { authAPI: authAPI }).authAPI.getAuthenticatedUserPrivileges()
            })
        }

        setAuthFetched(true)
    })

    const logout = async () => {
        setLoggingOut(true)
        if (await (window as typeof window & { authAPI: authAPI }).authAPI.logout()) {
            setResult({
                severity: 'success',
                message: 'successful',
            })
        }
        setLoggingOut(false)

        setUser(null)
    }

    // Navigation
    const [openDrawer, setOpenDrawer] = useState(false)
    const [openSettingsList, setOpenSettingsList] = useState(false)
    const [content, setContent] = useState(<Home />)

    const [result, setResult] = useState(null)

    return (
        <>
            <ConfigurationContext.Provider value={{ get: configuration, set: updateConfiguration }}>
                <ThemeProvider theme={configuration.theme}>
                    <AuthContext.Provider value={{ user, setUser }}>
                        <CssBaseline />
                        <MenuBar />
                        {authFetched &&
                            <>
                                {
                                    user &&
                                    <>
                                        <AppBar position='relative'>
                                            <Toolbar variant="dense">
                                                <IconButton size='large' color='inherit' onClick={() => setOpenDrawer(true)} sx={{ mr: 2 }}>
                                                    <MenuIcon fontSize='inherit' />
                                                </IconButton>
                                                <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                                                    {user.username}
                                                </Typography>
                                                <IconButton size='medium' color='inherit' onClick={() => updateConfiguration.updateTheme(configuration.theme.palette.mode == 'dark' ? 'light' : 'dark', configuration.locale.direction, configuration.locale.reactLocale)}>
                                                    {configuration.theme.palette.mode == 'light' ? <LightModeIcon fontSize='inherit' /> : <DarkModeIcon fontSize='inherit' />}
                                                </IconButton>
                                                {user &&
                                                    <IconButton size='medium' color='inherit' onClick={() => logout()}>
                                                        {loggingOut
                                                            ? <CircularProgress />
                                                            : <LogoutIcon fontSize='inherit' />
                                                        }
                                                    </IconButton>
                                                }
                                            </Toolbar>
                                        </AppBar>
                                        <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
                                            <List>
                                                <ListItemButton onClick={() => { setContent(<Home />); setOpenDrawer(false) }}>
                                                    <ListItemIcon>
                                                        <HomeIcon />
                                                    </ListItemIcon>
                                                    <ListItemText primary={'Home'} />
                                                </ListItemButton>
                                                {user?.privileges?.includes(`read.${patientsCollectionName}`) && user?.privileges?.includes(`read.${visitsCollectionName}`) &&
                                                    <ListItemButton onClick={() => { setContent(<Patients />); setOpenDrawer(false) }}>
                                                        <ListItemIcon>
                                                            <PersonIcon />
                                                        </ListItemIcon>
                                                        <ListItemText primary={'Patients'} />
                                                    </ListItemButton>
                                                }
                                                {user?.privileges?.includes(`read.${visitsCollectionName}`) &&
                                                    <ListItemButton onClick={() => { setContent(<Visits />); setOpenDrawer(false) }}>
                                                        <ListItemIcon>
                                                            <AccessTimeIcon />
                                                        </ListItemIcon>
                                                        <ListItemText primary={'Visits'} />
                                                    </ListItemButton>
                                                }
                                                <ListItemButton onClick={() => setOpenSettingsList(!openSettingsList)}>
                                                    <ListItemIcon>
                                                        <SettingsIcon />
                                                    </ListItemIcon>
                                                    <ListItemText primary={'Settings'} />
                                                    {openSettingsList ? <ExpandLess /> : <ExpandMore />}
                                                </ListItemButton>
                                                <Collapse in={openSettingsList} timeout="auto" unmountOnExit>
                                                    <List component="div" disablePadding>
                                                        <ListItemButton sx={{ pl: 4 }} onClick={() => { setContent(<General />); setOpenDrawer(false) }}>
                                                            <ListItemIcon>
                                                                <DisplaySettingsIcon />
                                                            </ListItemIcon>
                                                            <ListItemText primary="General" />
                                                        </ListItemButton>
                                                        {user?.privileges?.includes(`read.DbConfig`) &&
                                                            <ListItemButton sx={{ pl: 4 }} onClick={() => { setContent(<Database />); setOpenDrawer(false) }}>
                                                                <ListItemIcon>
                                                                    <StorageIcon />
                                                                </ListItemIcon>
                                                                <ListItemText primary="Database" />
                                                            </ListItemButton>
                                                        }
                                                    </List>
                                                </Collapse>
                                            </List>
                                        </Drawer>
                                    </>
                                }

                                {content}

                                <Modal open={user == null} closeAfterTransition disableEscapeKeyDown disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                                    <Slide direction={user == null ? 'up' : 'down'} in={user == null} timeout={250}>
                                        <Paper sx={{ width: '60%', padding: '0.5rem 2rem' }}>
                                            <LoginForm />
                                        </Paper>
                                    </Slide>
                                </Modal>
                            </>
                        }

                        <Snackbar
                            open={result !== null}
                            autoHideDuration={7000}
                            onClose={() => setResult(null)}
                            action={result?.action}
                        >
                            <Alert
                                icon={result?.severity === 'success' ? <CheckIcon fontSize="inherit" /> : (result?.severity === 'error' ? <CloseIcon fontSize="inherit" /> : (result?.severity === 'warning' ? <DangerIcon fontSize="inherit" /> : null))}
                                severity={result?.severity}
                            >
                                {result?.message}
                            </Alert>
                        </Snackbar>
                    </AuthContext.Provider>
                </ThemeProvider >
            </ConfigurationContext.Provider>
        </>
    )
}
