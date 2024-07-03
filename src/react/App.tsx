import { CheckOutlined, CloseOutlined, DangerousOutlined } from '@mui/icons-material';

import { CssBaseline, PaletteMode, createTheme, useMediaQuery, ThemeProvider, Modal, Slide, Paper, Snackbar, Alert, Grid } from '@mui/material'
import { useState, useRef } from 'react'
import { Localization, enUS } from '@mui/material/locale';
import { useTranslation } from "react-i18next";

import type { Locale } from './Lib/Localization';
import type { Calendar, TimeZone } from './Lib/DateTime';
import { ConfigurationContext, ConfigurationData, ConfigurationStorableData } from './ConfigurationContext';
import { Home } from './Pages/Home';
import { getLocale, getReactLocale } from './Lib/helpers';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import type { configAPI } from '../Electron/Configuration/renderer/configAPI';
import { RendererDbAPI } from '../Electron/Database/handleDbRendererEvents';
import { User } from '../Electron/Database/Models/User';
import { AuthContext } from './Lib/AuthContext';
import { NavigationContext } from './Lib/NavigationContext';
import { AccessControl } from 'accesscontrol';
import { LoginForm } from './LoginForm';
import { Result, ResultContext } from './ResultContext';
import AppControls from './AppControls';

// Create rtl cache
const rtlCache = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

const ltrCache = createCache({
    key: 'mui',
});

export function App() {
    const [content, setContent] = useState(<Home />)

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
            console.log('hasFetchedConfig-readConfig', 'start');
            (window as typeof window & { configAPI: configAPI }).configAPI.readConfig()
                .then((c) => {
                    if (c && c.configuration) {
                        i18n.changeLanguage(c.configuration.locale.code)
                        document.dir = c.configuration.locale.direction
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
        finally { hasFetchedConfig.current = true; console.log('hasFetchedConfig-readConfig', 'end') }
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
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true)
    const [auth, setAuth] = useState<{ user: User | undefined, ac: AccessControl | undefined }>({ user: undefined, ac: undefined })

    const getAccessControl = async (): Promise<AccessControl | undefined> => {
        try {
            console.log('getAccessControl', 'start')
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getPrivileges()
            console.log('getAccessControl', 'res', res)
            if (res.code !== 200)
                return undefined

            return new AccessControl(res.data)
        } catch (error) {
            console.error(error)
            throw error
        } finally {
            console.log('getAccessControl', 'end')
        }
    }
    const fetchUser = async (): Promise<User | undefined> => {
        try {
            console.log('fetchUser', 'start')
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getAuthenticatedUser()
            console.log('fetchUser', 'res', res)
            if (res.code !== 200)
                return undefined

            return res.data
        } catch (error) {
            console.error(error)
            throw error
        } finally {
            console.log('fetchUser', 'end')
        }
    }
    const login = async (username: string, password: string) => {
        try {
            console.log('login', 'username', username)
            console.log('login', 'password', password)
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.login(username, password)
            console.log('login', 'res', res)
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

            await init()
        } catch (error) {
            console.error(error)

            setResult({
                severity: 'error',
                message: t('failedToAuthenticate'),
            })
        } finally {
            console.log('login', 'end')
        }
    }
    const logout = async () => {
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.logout()
            console.log('logout', 'res', res)
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

            setAuth({ user: undefined, ac: undefined })
            setContent(<Home />)
            setResult({
                severity: 'success',
                message: t('successfullyToLogout'),
            })
        } catch (error) {
            console.error(error)

            setResult({
                severity: 'error',
                message: t('failedToLogout'),
            })
        } finally {
            console.log('logout', 'end')
        }
    }

    const [result, setResult] = useState<Result | null>(null)

    const init = async () => {
        try {
            console.log('init', 'start')
            const u = await fetchUser()
            if (!u) {
                if (isAuthLoading)
                    setIsAuthLoading(false)
                setResult({
                    severity: 'error',
                    message: t('failedToAuthenticate')
                })
            }

            const accessControl = await getAccessControl()
            if (!accessControl) {
                if (isAuthLoading)
                    setIsAuthLoading(false)
                setResult({
                    severity: 'error',
                    message: t('failedToAuthenticate')
                })
            }

            if (isAuthLoading)
                setIsAuthLoading(false)
            setAuth({ user: u, ac: accessControl })
        } catch (error) {
            console.error('error', error)

            if (isAuthLoading)
                setIsAuthLoading(false)
            setResult({
                severity: 'error',
                message: t('failedToAuthenticate')
            })
        } finally { console.log('init', 'end') }
    }

    const hasInit = useRef<boolean>(false)

    if (!hasInit.current) {
        hasInit.current = true
        init()
    }

    console.log('App', { configuration, auth, isAuthLoading })

    return (
        <>
            <ResultContext.Provider value={{ result, setResult }}>
                <NavigationContext.Provider value={{ goHome: () => setContent(<Home />) }}>
                    <ConfigurationContext.Provider value={{ get: configuration, set: { updateTheme, updateLocale, updateTimeZone } }}>
                        <CacheProvider value={configuration.locale.direction === 'rtl' ? rtlCache : ltrCache}>
                            <ThemeProvider theme={configuration.theme}>
                                <AuthContext.Provider value={{ user: auth.user, logout, fetchUser: async () => { await fetchUser() }, accessControl: auth.ac }}>
                                    <CssBaseline enableColorScheme />

                                    <AppControls authLoading={isAuthLoading} setContent={setContent}>
                                        {/* MenuBar ==> 2rem, AppBar ==> 3rem */}
                                        <Grid item xs={12} sx={{ height: 'calc(100% - 5rem)', overflowY: 'auto' }}>
                                            {auth.user && content}
                                        </Grid>
                                    </AppControls>

                                    <Modal open={!isAuthLoading && (!auth.user || !auth.ac)} closeAfterTransition disableEscapeKeyDown disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                                        <Slide direction={!isAuthLoading && (!auth.user || !auth.ac) ? 'up' : 'down'} in={!isAuthLoading && (!auth.user || !auth.ac)} timeout={250}>
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
                                            icon={result?.severity === 'success' ? <CheckOutlined fontSize="inherit" /> : (result?.severity === 'error' ? <CloseOutlined fontSize="inherit" /> : (result?.severity === 'warning' ? <DangerousOutlined fontSize="inherit" /> : null))}
                                            severity={result?.severity}
                                        >
                                            {result?.message}
                                        </Alert>
                                    </Snackbar>
                                </AuthContext.Provider>
                            </ThemeProvider >
                        </CacheProvider>
                    </ConfigurationContext.Provider>
                </NavigationContext.Provider>
            </ResultContext.Provider >
        </>
    )
}

