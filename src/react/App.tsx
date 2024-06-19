import HomeIcon from '@mui/icons-material/HomeOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import MenuIcon from '@mui/icons-material/MenuOutlined';
import CheckIcon from '@mui/icons-material/CheckOutlined';
import CloseIcon from '@mui/icons-material/CloseOutlined';
import DangerousIcon from '@mui/icons-material/DangerousOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettingsOutlined';

import { CssBaseline, PaletteMode, createTheme, useMediaQuery, AppBar, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, ThemeProvider, Collapse, CircularProgress, Stack, Box, Modal, Slide, Paper, Snackbar, Alert, AlertColor, AlertPropsColorOverrides, TextField, Button } from '@mui/material'
import { useState, useRef, useEffect, ReactNode } from 'react'
import { Localization, enUS } from '@mui/material/locale';
import { useTranslation } from "react-i18next";

import type { Locale } from './Lib/Localization';
import type { Calendar, TimeZone } from './Lib/DateTime';
import { MenuBar } from './Components/MenuBar';
import { ConfigurationContext, ConfigurationData, ConfigurationStorableData } from './ConfigurationContext';
import { General } from './Pages/Settings/General';
import { Home } from './Pages/Home';
import { getLocale, getReactLocale } from './Lib/helpers';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import type { configAPI } from '../Electron/Configuration/renderer/configAPI';
import { RendererDbAPI } from '../Electron/Database/handleDbRendererEvents';
import { Users } from './Pages/Users';
import { User } from '../Electron/Database/Models/User';
import { OverridableStringUnion } from "@mui/types"
import { AuthContext } from './Lib/AuthContext';
import { t } from 'i18next';
import { AccessControl } from 'accesscontrol';
import { resources } from '../Electron/Database/Repositories/Auth/dev-permissions';

// Create rtl cache
const rtlCache = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

const ltrCache = createCache({
    key: 'mui',
});

export function App() {
    // Navigation
    const [openDrawer, setOpenDrawer] = useState(false)
    const [openSettingsList, setOpenSettingsList] = useState(false)
    const [content, setContent] = useState(<Users />)

    // Localization
    const { t, i18n } = useTranslation();

    const initialThemeMode: PaletteMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'
    const getInitialLocale: Locale = ({ calendar: 'Persian', zone: 'Asia/Tehran', code: getLocale(enUS), direction: 'ltr' })
    const defaultConfiguration: ConfigurationData = {
        locale: getInitialLocale,
        themeMode: initialThemeMode,
        theme: createTheme(
            {
                palette: {
                    mode: initialThemeMode,
                },
                direction: getInitialLocale.direction
            },
            getReactLocale(i18n)
        )
    }

    const [configuration, setConfiguration] = useState<ConfigurationData>(defaultConfiguration)

    const hasFetchedConfig = useRef(false)
    if (!hasFetchedConfig.current) {
        try {
            (window as typeof window & { configAPI: configAPI }).configAPI.readConfig()
                .then((c) => {
                    if (c && c.configuration) {
                        setConfiguration({
                            ...c.configuration,
                            theme: createTheme(
                                {
                                    palette: {
                                        mode: c.configuration.themeMode,
                                    },
                                    direction: c.configuration.locale.direction
                                },
                                getReactLocale(c.configuration.locale.code)
                            )
                        })
                        i18n.changeLanguage(c.configuration.locale.code)
                        document.dir = c.configuration.locale.direction
                    }
                    else {
                        setConfiguration(defaultConfiguration)
                        persistConfigurationData({ locale: defaultConfiguration.locale, themeMode: defaultConfiguration.themeMode })
                    }
                })
                .catch((err) => {
                    setConfiguration(defaultConfiguration)
                    persistConfigurationData({ locale: defaultConfiguration.locale, themeMode: defaultConfiguration.themeMode })
                })
        }
        finally { hasFetchedConfig.current = true }
    }

    const persistConfigurationData = async (data: ConfigurationStorableData) => {
        const config = await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig();
        (window as typeof window & { configAPI: configAPI }).configAPI.writeConfig({ ...config, configuration: data })
    }
    const updateTheme = (mode: PaletteMode, direction: 'rtl' | 'ltr', locale: Localization) => {
        setConfiguration({
            ...configuration,
            themeMode: mode,
            theme: createTheme(
                {
                    palette: {
                        mode: mode,
                    },
                    direction: direction
                },
                locale
            )
        })
        persistConfigurationData({ locale: configuration.locale, themeMode: mode })
        document.dir = direction
    }
    const updateLocale = (calendar: Calendar, direction: 'rtl' | 'ltr', reactLocale: Localization) => {
        const conf = {
            ...configuration,
            locale: {
                ...configuration.locale,
                direction,
                code: getLocale(reactLocale),
                calendar,
            },
            themeMode: configuration.theme.palette.mode,
            theme: createTheme(
                {
                    palette: {
                        mode: configuration.theme.palette.mode,
                    },
                    direction: direction
                },
                reactLocale
            )
        }
        setConfiguration(conf)
        i18n.changeLanguage(getLocale(reactLocale))
        document.dir = direction
        persistConfigurationData({ locale: conf.locale, themeMode: conf.themeMode })
    }
    const updateTimeZone = (zone: TimeZone) => {
        setConfiguration(
            {
                ...configuration,
                locale: {
                    ...configuration.locale,
                    zone: zone
                }
            });
        persistConfigurationData({ locale: { ...configuration.locale, zone: configuration.locale.zone }, themeMode: configuration.themeMode })
    }

    // Authentication
    const [authLoading, setAuthLoading] = useState(false)
    const [user, setUser] = useState<User>(null);
    const [ac, setAccessControl] = useState<AccessControl | null>(null);
    const getPrivileges = async () => {
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getPrivileges()
            if (res.code !== 200) {
                setResult({
                    severity: 'error',
                    message: t('failedToAuthenticate'),
                })
                return
            }

            setAccessControl(res.data as AccessControl)
            setResult({
                severity: 'success',
                message: t('successfullyAuthenticated'),
            })
        } catch (error) {
            console.error(error)

            setResult({
                severity: 'error',
                message: t('failedToAuthenticate'),
            })
        }
    }
    const fetchUser = async () => {
        try {
            setAuthLoading(true)
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getAuthenticatedUser()
            setAuthLoading(false)
            if (res.code !== 200) {
                setResult({
                    severity: 'error',
                    message: t('failedToAuthenticate'),
                })
                return
            }

            setUser(res.data)
            setResult({
                severity: 'success',
                message: t('successfullyAuthenticated'),
            })
        } catch (error) {
            console.error(error)

            setResult({
                severity: 'error',
                message: t('failedToAuthenticate'),
            })
        }
    }
    const login = async (username: string, password: string) => {
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.login(username, password)
            if (res.code !== 200 || res.data !== true) {
                setResult({
                    severity: 'error',
                    message: t('failedToAuthenticate'),
                })
                return
            }

            setResult({
                severity: 'success',
                message: t('successfullyAuthenticated'),
            })

            await fetchUser()
        } catch (error) {
            console.error(error)

            setResult({
                severity: 'error',
                message: t('failedToAuthenticate'),
            })
        }
    }
    const logout = async () => {
        try {
            setAuthLoading(true)
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.logout()
            setAuthLoading(false)
            if (res.code !== 200) {
                setResult({
                    severity: 'error',
                    message: t('failedToLogout'),
                })
                return
            }


            if (res.data !== true) {
                setResult({
                    severity: 'error',
                    message: t('failedToLogout'),
                })
                return
            }

            setResult({
                severity: 'success',
                message: t('successfullyToLogout'),
            })

            setUser(null)

            setContent(<Home />)
        } catch (error) {
            console.error(error)

            setResult({
                severity: 'error',
                message: t('failedToLogout'),
            })
        }
    }

    const [result, setResult] = useState<{ message: string, severity: OverridableStringUnion<AlertColor, AlertPropsColorOverrides>, action?: ReactNode } | null>(null)

    useEffect(() => { fetchUser() }, [])

    if (!configuration)
        return (
            <>
                <Stack
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ border: '1px solid black', minHeight: '100vh' }}
                >
                    <CircularProgress />
                </Stack>
            </>
        )

    return (
        <>
            <AuthContext.Provider value={{ user: user, setUser: setUser, accessControl: ac }}>
                <ConfigurationContext.Provider value={{ get: configuration, set: { updateTheme, updateLocale, updateTimeZone } }}>
                    <CacheProvider value={configuration.locale.direction === 'rtl' ? rtlCache : ltrCache}>
                        <ThemeProvider theme={configuration.theme}>
                            <CssBaseline enableColorScheme />

                            <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
                                <List>
                                    <ListItemButton onClick={() => { setContent(<Home />); setOpenDrawer(false) }}>
                                        <ListItemIcon>
                                            <HomeIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={t('home')} />
                                    </ListItemButton>
                                    {
                                        ac && user && ac.can(user.roleName).read(resources.USER).granted &&
                                        <ListItemButton onClick={() => { setContent(<Users />); setOpenDrawer(false) }}>
                                            <ListItemIcon>
                                                <PersonIcon />
                                            </ListItemIcon>
                                            <ListItemText primary={t('users')} />
                                        </ListItemButton>
                                    }
                                    <ListItemButton onClick={() => setOpenSettingsList(!openSettingsList)}>
                                        <ListItemIcon>
                                            <SettingsIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={t('settings')} />
                                        {openSettingsList ? <ExpandLess /> : <ExpandMore />}
                                    </ListItemButton>
                                    <Collapse in={openSettingsList} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            <ListItemButton sx={{ pl: 4 }} onClick={() => { setContent(<General />); setOpenDrawer(false) }}>
                                                <ListItemIcon>
                                                    <DisplaySettingsIcon />
                                                </ListItemIcon>
                                                <ListItemText primary={t("general")} />
                                            </ListItemButton>
                                        </List>
                                    </Collapse>
                                </List>
                            </Drawer>

                            <Stack direction='column' height={'100%'} alignItems='stretch' justifyContent='flex-start'>
                                <MenuBar backgroundColor={configuration.theme.palette.background.default} />

                                <AppBar position='relative'>
                                    <Toolbar variant="dense">
                                        <IconButton size='large' color='inherit' onClick={() => setOpenDrawer(true)} sx={{ mr: 2 }}>
                                            <MenuIcon fontSize='inherit' />
                                        </IconButton>
                                        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                                            {/* Title */}
                                            {user && user?.username}
                                        </Typography>
                                        {
                                            user &&
                                            <IconButton size='medium' color='inherit' onClick={async () => { await logout(); }}>
                                                {
                                                    authLoading
                                                        ? <CircularProgress size='small' />
                                                        : <LogoutIcon />
                                                }
                                            </IconButton>
                                        }
                                        <IconButton size='medium' color='inherit' onClick={() => updateTheme(configuration.theme.palette.mode == 'dark' ? 'light' : 'dark', configuration.locale.direction, getReactLocale(configuration.locale.code))}>
                                            {configuration.theme.palette.mode == 'light' ? <LightModeIcon fontSize='inherit' /> : <DarkModeIcon fontSize='inherit' />}
                                        </IconButton>
                                    </Toolbar>
                                </AppBar>

                                <Box flexGrow={1}>
                                    {user && content}
                                </Box>
                            </Stack>

                            <Modal open={!authLoading && user === null} closeAfterTransition disableEscapeKeyDown disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                                <Slide direction={user == null ? 'up' : 'down'} in={user == null} timeout={250}>
                                    <Paper sx={{ width: '60%', padding: '0.5rem 2rem' }}>
                                        <LoginForm onFinish={login} />
                                    </Paper>
                                </Slide>
                            </Modal>

                            <Snackbar
                                open={result !== null}
                                autoHideDuration={7000}
                                onClose={() => setResult(null)}
                                action={result?.action}
                            >
                                <Alert
                                    icon={result?.severity === 'success' ? <CheckIcon fontSize="inherit" /> : (result?.severity === 'error' ? <CloseIcon fontSize="inherit" /> : (result?.severity === 'warning' ? <DangerousIcon fontSize="inherit" /> : null))}
                                    severity={result?.severity}
                                >
                                    {result?.message}
                                </Alert>
                            </Snackbar>
                        </ThemeProvider >
                    </CacheProvider>
                </ConfigurationContext.Provider>
            </AuthContext.Provider>
        </>
    )
}

function LoginForm({ onFinish }: { onFinish: (username: string, password: string) => void | Promise<void> }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    return (
        <>
            <Stack direction='column' spacing={2}>
                <TextField variant='standard' type='text' value={username} onChange={(e) => setUsername(e.target.value)} label={t('username')} />
                <TextField variant='standard' type='password' value={password} onChange={(e) => setPassword(e.target.value)} label={t('password')} />
                <Button onClick={() => onFinish(username, password)}>
                    {t('login')}
                </Button>
            </Stack>
        </>
    )
}
